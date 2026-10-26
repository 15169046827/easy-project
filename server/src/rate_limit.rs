//! Bounded authentication admission; forwarded addresses are never authentication.
use axum::http::HeaderMap;
use std::collections::HashMap;
use std::net::IpAddr;
use std::time::{Duration, Instant};

#[derive(Clone, Copy, Default, Debug, PartialEq, Eq)]
pub enum ProxyPolicy {
    #[default]
    None,
    TailscaleLoopback,
}

impl ProxyPolicy {
    pub fn parse(value: Option<&str>) -> Result<Self, &'static str> {
        match value {
            None | Some("none") => Ok(Self::None),
            Some("tailscale-loopback") => Ok(Self::TailscaleLoopback),
            _ => Err("Unsupported EASYPROJECT_TRUSTED_PROXY policy"),
        }
    }

    pub fn client_ip(self, peer: IpAddr, headers: &HeaderMap, authority: &str) -> IpAddr {
        let forwarded = (self == Self::TailscaleLoopback && peer.is_loopback())
            .then(|| {
                if single(headers, "x-forwarded-proto")? != "https"
                    || !single(headers, "x-forwarded-host")?.eq_ignore_ascii_case(authority)
                {
                    return None;
                }
                single(headers, "x-forwarded-for")?.parse::<IpAddr>().ok()
            })
            .flatten();
        canonical(forwarded.unwrap_or(peer))
    }
}

fn single<'a>(headers: &'a HeaderMap, name: &str) -> Option<&'a str> {
    let mut values = headers.get_all(name).iter();
    let first = values.next()?.to_str().ok()?;
    values.next().is_none().then_some(first)
}

fn canonical(address: IpAddr) -> IpAddr {
    match address {
        IpAddr::V6(value) => value.to_ipv4_mapped().map(IpAddr::V4).unwrap_or(address),
        _ => address,
    }
}

#[derive(Clone, Copy, Hash, PartialEq, Eq)]
pub enum Operation {
    Login,
    Register,
    Reset,
}

impl Operation {
    fn limits(self) -> (u32, u32, Duration, usize) {
        match self {
            Self::Login => (30, 300, Duration::from_secs(900), 0),
            Self::Register => (10, 100, Duration::from_secs(3600), 1),
            Self::Reset => (10, 100, Duration::from_secs(900), 2),
        }
    }
}

#[derive(Default)]
pub struct AuthLimiter {
    clients: HashMap<(Operation, IpAddr), (Instant, u32)>,
    global: [Option<(Instant, u32)>; 3],
}

impl AuthLimiter {
    pub fn admit(&mut self, operation: Operation, client: IpAddr) -> bool {
        self.admit_at(operation, canonical(client), Instant::now())
    }

    fn admit_at(&mut self, operation: Operation, client: IpAddr, now: Instant) -> bool {
        self.clients.retain(|(kind, _), (start, _)| {
            now.saturating_duration_since(*start) < kind.limits().2
        });
        let (per_client, total, window, index) = operation.limits();
        let global = self.global[index].get_or_insert((now, 0));
        if now.saturating_duration_since(global.0) >= window {
            *global = (now, 0);
        }
        if global.1 >= total
            || self
                .clients
                .get(&(operation, client))
                .is_some_and(|v| v.1 >= per_client)
            || (!self.clients.contains_key(&(operation, client)) && self.clients.len() >= 1024)
        {
            return false;
        }
        self.clients
            .entry((operation, client))
            .or_insert((now, 0))
            .1 += 1;
        global.1 += 1;
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn forwarded() -> HeaderMap {
        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", "203.0.113.10".parse().unwrap());
        headers.insert("x-forwarded-host", "example.test".parse().unwrap());
        headers.insert("x-forwarded-proto", "https".parse().unwrap());
        headers
    }

    #[test]
    fn default_and_non_loopback_peers_never_trust_forwarded_headers() {
        let peer = "127.0.0.1".parse().unwrap();
        assert_eq!(
            ProxyPolicy::None.client_ip(peer, &forwarded(), "example.test"),
            peer
        );
        let remote = "192.0.2.1".parse().unwrap();
        assert_eq!(
            ProxyPolicy::TailscaleLoopback.client_ip(remote, &forwarded(), "example.test"),
            remote
        );
        assert_eq!(ProxyPolicy::parse(None).unwrap(), ProxyPolicy::None);
        assert!(ProxyPolicy::parse(Some("all")).is_err());
    }

    #[test]
    fn explicit_loopback_proxy_uses_single_verified_address() {
        let peer = "127.0.0.1".parse().unwrap();
        assert_eq!(
            ProxyPolicy::TailscaleLoopback.client_ip(peer, &forwarded(), "EXAMPLE.TEST"),
            "203.0.113.10".parse::<IpAddr>().unwrap()
        );
        let mut headers = forwarded();
        headers.insert("x-forwarded-for", "::ffff:203.0.113.10".parse().unwrap());
        assert_eq!(
            ProxyPolicy::TailscaleLoopback.client_ip(peer, &headers, "example.test"),
            "203.0.113.10".parse::<IpAddr>().unwrap()
        );
    }

    #[test]
    fn malformed_chain_duplicate_or_inconsistent_headers_fall_back_to_peer() {
        let peer = "127.0.0.1".parse().unwrap();
        for (name, value) in [
            ("x-forwarded-for", "203.0.113.1, 203.0.113.2"),
            ("x-forwarded-for", "not-an-ip"),
            ("x-forwarded-proto", "http"),
            ("x-forwarded-host", "evil.test"),
        ] {
            let mut headers = forwarded();
            headers.insert(name, value.parse().unwrap());
            assert_eq!(
                ProxyPolicy::TailscaleLoopback.client_ip(peer, &headers, "example.test"),
                peer
            );
        }
        for name in ["x-forwarded-for", "x-forwarded-host", "x-forwarded-proto"] {
            let mut headers = forwarded();
            headers.append(name, headers.get(name).unwrap().clone());
            assert_eq!(
                ProxyPolicy::TailscaleLoopback.client_ip(peer, &headers, "example.test"),
                peer
            );
            headers.remove(name);
            assert_eq!(
                ProxyPolicy::TailscaleLoopback.client_ip(peer, &headers, "example.test"),
                peer
            );
        }
    }

    #[test]
    fn per_client_limits_are_independent_and_expire_at_window_boundary() {
        let mut limiter = AuthLimiter::default();
        let now = Instant::now();
        let first = "203.0.113.1".parse().unwrap();
        let second = "203.0.113.2".parse().unwrap();
        for _ in 0..30 {
            assert!(limiter.admit_at(Operation::Login, first, now));
        }
        assert!(!limiter.admit_at(Operation::Login, first, now));
        assert!(limiter.admit_at(Operation::Login, second, now));
        assert!(limiter.admit_at(Operation::Login, first, now + Duration::from_secs(900)));
        for _ in 0..10 {
            assert!(limiter.admit_at(Operation::Register, first, now));
        }
        assert!(!limiter.admit_at(Operation::Register, first, now));
        for _ in 0..10 {
            assert!(limiter.admit_at(Operation::Reset, first, now));
        }
        assert!(!limiter.admit_at(Operation::Reset, first, now));
    }

    #[test]
    fn global_budget_cannot_be_bypassed_by_rotating_addresses() {
        let now = Instant::now();
        for operation in [Operation::Login, Operation::Register, Operation::Reset] {
            let mut limiter = AuthLimiter::default();
            let (_, total, window, _) = operation.limits();
            for index in 0..total {
                let address = IpAddr::V4(std::net::Ipv4Addr::new(
                    203,
                    0,
                    (index / 256) as u8,
                    (index % 256) as u8,
                ));
                assert!(limiter.admit_at(operation, address, now));
            }
            let client = "192.0.2.20".parse().unwrap();
            assert!(!limiter.admit_at(operation, client, now));
            assert!(limiter.admit_at(operation, client, now + window));
        }
    }

    #[test]
    fn full_identity_map_preserves_existing_clients_and_rejects_new_keys() {
        let now = Instant::now();
        let mut limiter = AuthLimiter::default();
        for index in 0..1024u16 {
            let address = IpAddr::V4(std::net::Ipv4Addr::new(
                10,
                0,
                (index / 256) as u8,
                (index % 256) as u8,
            ));
            limiter
                .clients
                .insert((Operation::Register, address), (now, 1));
        }
        assert!(!limiter.admit_at(Operation::Register, "192.0.2.1".parse().unwrap(), now));
        assert!(limiter.admit_at(Operation::Register, "10.0.0.1".parse().unwrap(), now));
        assert_eq!(limiter.clients.len(), 1024);
    }
}
