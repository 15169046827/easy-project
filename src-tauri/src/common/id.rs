//! Canonical IDs shared by desktop, HTTP and MCP entry points.
pub fn new_id(prefix: &str) -> String {
    format!("{prefix}:{}", uuid::Uuid::new_v4().simple())
}

pub fn valid_id(value: &str, prefix: &str) -> bool {
    value
        .strip_prefix(&format!("{prefix}:"))
        .is_some_and(|suffix| {
            suffix.len() == 32
                && suffix
                    .bytes()
                    .all(|b| b.is_ascii_hexdigit() && !b.is_ascii_uppercase())
        })
}
