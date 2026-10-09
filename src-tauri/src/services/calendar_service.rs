use crate::common::db_state::DbState;
use crate::models::common::ApiResponse;
use serde_json::{json, Value};
use std::io::Read;
use std::net::{IpAddr, SocketAddr, ToSocketAddrs};
use std::time::Duration;

const MAX_CALENDAR_BYTES: u64 = 5 * 1024 * 1024;
const MAX_REDIRECTS: usize = 5;

fn is_private_address(address: IpAddr) -> bool {
    match address {
        IpAddr::V4(value) => {
            let [a, b, c, _] = value.octets();
            value.is_private()
                || value.is_loopback()
                || value.is_link_local()
                || a == 0
                || (a == 100 && (64..=127).contains(&b))
                || (a == 192 && b == 0 && c == 0)
                || (a == 192 && b == 0 && c == 2)
                || (a == 198 && (b == 18 || b == 19 || (b == 51 && c == 100)))
                || (a == 203 && b == 0 && c == 113)
                || a >= 224
        }
        IpAddr::V6(value) => {
            if let Some(mapped) = value.to_ipv4_mapped() {
                return is_private_address(IpAddr::V4(mapped));
            }
            let segments = value.segments();
            value.is_loopback()
                || value.is_unspecified()
                || value.is_multicast()
                || value.is_unique_local()
                || value.is_unicast_link_local()
                || (segments[0] & 0xe000) != 0x2000
                || segments[0] == 0x2002
                || (segments[0] == 0x2001 && segments[1] == 0)
                || (segments[0] == 0x2001 && segments[1] == 0x0db8)
        }
    }
}

fn validate_remote_url(url: &reqwest::Url) -> Result<(String, Vec<SocketAddr>), String> {
    if !matches!(url.scheme(), "https" | "http") {
        return Err("Calendar URL must use HTTPS or HTTP".to_string());
    }
    if !url.username().is_empty() || url.password().is_some() {
        return Err("Calendar URL must not contain embedded credentials".to_string());
    }
    let host = url
        .host_str()
        .ok_or("Calendar URL is missing a host")?
        .trim_start_matches('[')
        .trim_end_matches(']');
    if host.eq_ignore_ascii_case("localhost") || host.ends_with(".localhost") {
        return Err("Calendar URL must not target this device".to_string());
    }
    let port = url
        .port_or_known_default()
        .ok_or("Calendar URL has no valid port")?;
    let addresses = (host, port)
        .to_socket_addrs()
        .map_err(|_| "Calendar host could not be resolved".to_string())?
        .collect::<Vec<_>>();
    if addresses.is_empty() || addresses.iter().any(|item| is_private_address(item.ip())) {
        return Err("Calendar URL must use a public internet address".to_string());
    }
    Ok((host.to_string(), addresses))
}

fn read_limited<R: Read>(reader: R) -> Result<String, String> {
    let mut bytes = Vec::new();
    reader
        .take(MAX_CALENDAR_BYTES + 1)
        .read_to_end(&mut bytes)
        .map_err(|error| format!("Cannot read calendar: {error}"))?;
    if bytes.len() as u64 > MAX_CALENDAR_BYTES {
        return Err("Calendar response exceeds 5 MB".to_string());
    }
    String::from_utf8(bytes).map_err(|error| format!("Cannot decode calendar: {error}"))
}

fn fetch_ics_text(raw_url: &str) -> Result<String, String> {
    let mut url =
        reqwest::Url::parse(raw_url).map_err(|_| "Calendar URL is invalid".to_string())?;
    for redirect_count in 0..=MAX_REDIRECTS {
        // Pin each checked DNS answer to the actual connection, including every redirect.
        let (host, addresses) = validate_remote_url(&url)?;
        let client = reqwest::blocking::Client::builder()
            .timeout(Duration::from_secs(15))
            .user_agent("EasyProject/0.1 calendar-sync")
            .redirect(reqwest::redirect::Policy::none())
            .no_proxy()
            .resolve_to_addrs(&host, &addresses)
            .build()
            .map_err(|error| format!("Calendar client failed: {error}"))?;
        let response = client
            .get(url.clone())
            .send()
            .map_err(|error| format!("Calendar request failed: {}", error.without_url()))?;
        if response.status().is_redirection() {
            if redirect_count == MAX_REDIRECTS {
                return Err("Too many calendar redirects".to_string());
            }
            let location = response
                .headers()
                .get(reqwest::header::LOCATION)
                .and_then(|value| value.to_str().ok())
                .ok_or("Calendar redirect is missing a valid location")?;
            url = url
                .join(location)
                .map_err(|_| "Calendar redirect URL is invalid".to_string())?;
            continue;
        }
        if !response.status().is_success() {
            return Err(format!("Calendar server returned {}", response.status()));
        }
        if response
            .content_length()
            .is_some_and(|size| size > MAX_CALENDAR_BYTES)
        {
            return Err("Calendar response exceeds 5 MB".to_string());
        }
        let text = read_limited(response)?;
        if !text.to_uppercase().contains("BEGIN:VCALENDAR") {
            return Err("The URL did not return an ICS calendar".to_string());
        }
        return Ok(text);
    }
    unreachable!("bounded redirect loop must return")
}

pub fn handle_action(
    _db: &DbState,
    action: String,
    data: Value,
) -> Result<ApiResponse<Value>, String> {
    match action.as_str() {
        "fetch_ics" => {
            let raw_url = data.get("url").and_then(Value::as_str).unwrap_or("");
            match fetch_ics_text(raw_url) {
                Ok(text) => ApiResponse::ok(Some(json!({ "text": text }))),
                Err(error) => ApiResponse::err(&error),
            }
        }
        _ => ApiResponse::err("Unsupported action for calendar"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_local_and_private_calendar_targets() {
        for value in [
            "http://localhost/calendar.ics",
            "http://127.0.0.1/calendar.ics",
            "http://192.168.1.5/calendar.ics",
            "http://[::1]/calendar.ics",
        ] {
            let url = reqwest::Url::parse(value).unwrap();
            assert!(
                validate_remote_url(&url).is_err(),
                "{value} should be rejected"
            );
        }
    }

    #[test]
    fn rejects_embedded_calendar_credentials() {
        let url = reqwest::Url::parse("https://user:secret@example.com/calendar.ics").unwrap();
        assert!(validate_remote_url(&url).is_err());
    }

    #[test]
    fn rejects_ipv4_mapped_private_addresses() {
        assert!(is_private_address("::ffff:127.0.0.1".parse().unwrap()));
        assert!(is_private_address("::ffff:192.168.1.5".parse().unwrap()));
    }

    #[test]
    fn rejects_other_non_public_address_ranges() {
        for address in [
            "100.64.0.1",
            "198.18.0.1",
            "203.0.113.10",
            "2001:db8::1",
            "2002:c0a8:0101::1",
        ] {
            assert!(is_private_address(address.parse().unwrap()), "{address}");
        }
        assert!(!is_private_address("8.8.8.8".parse().unwrap()));
        assert!(!is_private_address("2606:4700:4700::1111".parse().unwrap()));
    }

    #[test]
    fn rejects_redirect_to_private_target() {
        let source = reqwest::Url::parse("https://example.com/calendar.ics").unwrap();
        let redirected = source.join("http://127.0.0.1/admin").unwrap();
        assert!(validate_remote_url(&redirected).is_err());
    }

    #[test]
    fn response_read_is_bounded_even_without_content_length() {
        assert_eq!(read_limited(&b"ok"[..]).unwrap(), "ok");
        assert!(read_limited(std::io::repeat(b'x')).is_err());
    }
}
