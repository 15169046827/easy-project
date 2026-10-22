use crate::auth::{self, User};
use base64::{engine::general_purpose::STANDARD, Engine};
use rusqlite::{params, Connection};

pub fn update(
    db: &Connection,
    user: &User,
    username: &str,
    avatar: &str,
    password: &str,
) -> Result<User, String> {
    if !(3..=48).contains(&username.len())
        || !username
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b"_-".contains(&b))
    {
        return Err("Username must be 3-48 ASCII letters, digits, _ or -".into());
    }
    if username != user.username {
        if !(6..=31).contains(&password.chars().count()) {
            return Err("Invalid current password".into());
        }
        let hash: String = db
            .query_row(
                "SELECT password_hash FROM account WHERE id=?1",
                [&user.id],
                |r| r.get(0),
            )
            .map_err(|_| "Account unavailable")?;
        if !auth::verify(password, &hash) {
            return Err("Invalid current password".into());
        }
    }
    let avatar = validate_avatar(avatar)?;
    db.execute(
        "UPDATE account SET username=?1,avatar=?2 WHERE id=?3",
        params![username, avatar, user.id],
    )
    .map_err(|_| "Profile update failed (possibly duplicate username)")?;
    let mut updated = user.clone();
    updated.username = username.into();
    updated.avatar = avatar;
    Ok(updated)
}

fn validate_avatar(value: &str) -> Result<String, String> {
    if value.is_empty() {
        return Ok(String::new());
    }
    if value.len() > 180_000 {
        return Err("Avatar is too large".into());
    }
    let encoded = value
        .strip_prefix("data:image/png;base64,")
        .ok_or("Avatar must be a square PNG")?;
    let bytes = STANDARD
        .decode(encoded)
        .map_err(|_| "Invalid avatar encoding")?;
    if bytes.len() > 128 * 1024 {
        return Err("Avatar is too large".into());
    }
    let mut decoder = png::Decoder::new(std::io::Cursor::new(bytes));
    decoder.set_limits(png::Limits {
        bytes: 2 * 1024 * 1024,
    });
    decoder.set_ignore_text_chunk(true);
    decoder.set_ignore_iccp_chunk(true);
    let mut reader = decoder.read_info().map_err(|_| "Invalid avatar image")?;
    let info = reader.info();
    if info.width != 128
        || info.height != 128
        || info.animation_control.is_some()
        || info.bit_depth != png::BitDepth::Eight
        || !matches!(info.color_type, png::ColorType::Rgb | png::ColorType::Rgba)
    {
        return Err("Avatar must be a static 128x128 RGB PNG".into());
    }
    let mut pixels = vec![0; reader.output_buffer_size()];
    let frame = reader
        .next_frame(&mut pixels)
        .map_err(|_| "Invalid avatar pixels")?;
    reader.finish().map_err(|_| "Invalid avatar image")?;
    // Re-encode pixels to remove input metadata, trailing content and hidden chunks.
    let mut clean = Vec::new();
    {
        let mut encoder = png::Encoder::new(&mut clean, 128, 128);
        encoder.set_color(frame.color_type);
        encoder.set_depth(png::BitDepth::Eight);
        encoder.set_compression(png::Compression::Best);
        encoder
            .write_header()
            .map_err(|_| "Avatar processing failed")?
            .write_image_data(&pixels[..frame.buffer_size()])
            .map_err(|_| "Avatar processing failed")?;
    }
    if clean.len() > 128 * 1024 {
        return Err("Compressed avatar is too large".into());
    }
    Ok(format!("data:image/png;base64,{}", STANDARD.encode(clean)))
}
