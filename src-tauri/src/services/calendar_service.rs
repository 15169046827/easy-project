use crate::common::db_state::DbState;
use crate::models::common::ApiResponse;
use serde_json::{json, Value};
use std::net::{IpAddr, ToSocketAddrs};
use std::time::Duration;
use tauri::State;

fn is_private_address(address: IpAddr) -> bool {
    match address {
        IpAddr::V4(value) => {
            value.is_private()
                || value.is_loopback()
                || value.is_link_local()
                || value.is_unspecified()
                || value.is_multicast()
                || value.octets()[0] == 0
        }
        IpAddr::V6(value) => {
            value.is_loopback()
                || value.is_unspecified()
                || value.is_multicast()
                || value.is_unique_local()
                || value.is_unicast_link_local()
        }
    }
}

fn validate_remote_url(url: &reqwest::Url) -> Result<(), String> {
    if !matches!(url.scheme(), "https" | "http") {
        return Err("Calendar URL must use HTTPS or HTTP".to_string());
    }
    if !url.username().is_empty() || url.password().is_some() {
        return Err("Calendar URL must not contain embedded credentials".to_string());
    }
    let host = url.host_str().ok_or("Calendar URL is missing a host")?;
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
    Ok(())
}

pub fn handle_action(
    _db: &State<DbState>,
    action: String,
    data: Value,
) -> Result<ApiResponse<Value>, String> {
    match action.as_str() {
        "fetch_ics" => {
            let raw_url = data.get("url").and_then(Value::as_str).unwrap_or("");
            let url = match reqwest::Url::parse(raw_url)
                .map_err(|_| "Calendar URL is invalid".to_string())
                .and_then(|value| {
                    validate_remote_url(&value)?;
                    Ok(value)
                }) {
                Ok(value) => value,
                Err(error) => return ApiResponse::err(&error),
            };
            let client = reqwest::blocking::Client::builder()
                .timeout(Duration::from_secs(15))
                .user_agent("EasyProject/0.1 calendar-sync")
                .redirect(reqwest::redirect::Policy::custom(|attempt| {
                    if attempt.previous().len() >= 5 {
                        return attempt.error("too many calendar redirects");
                    }
                    match validate_remote_url(attempt.url()) {
                        Ok(()) => attempt.follow(),
                        Err(_) => attempt.stop(),
                    }
                }))
                .build()
                .map_err(|error| error.to_string())?;
            let response = match client.get(url).send() {
                Ok(value) => value,
                Err(error) => {
                    return ApiResponse::err(&format!("Calendar request failed: {error}"))
                }
            };
            if !response.status().is_success() {
                return ApiResponse::err(&format!(
                    "Calendar server returned {}",
                    response.status()
                ));
            }
            if response
                .content_length()
                .is_some_and(|size| size > 5 * 1024 * 1024)
            {
                return ApiResponse::err("Calendar response exceeds 5 MB");
            }
            let text = match response.text() {
                Ok(value) if value.len() <= 5 * 1024 * 1024 => value,
                Ok(_) => return ApiResponse::err("Calendar response exceeds 5 MB"),
                Err(error) => return ApiResponse::err(&format!("Cannot read calendar: {error}")),
            };
            if !text.to_uppercase().contains("BEGIN:VCALENDAR") {
                return ApiResponse::err("The URL did not return an ICS calendar");
            }
            ApiResponse::ok(Some(json!({ "text": text })))
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
}
