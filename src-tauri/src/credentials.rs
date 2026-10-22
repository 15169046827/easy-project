//! Explicit opt-in, current-Windows-user DPAPI storage, outside business exports.
use serde::{Deserialize, Serialize};
use tauri::WebviewWindow;

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SavedCredentials {
    pub username: String,
    pub password: String,
}

#[cfg(windows)]
fn crypt(bytes: &mut [u8], encrypt: bool) -> Result<Vec<u8>, String> {
    use windows_sys::Win32::{
        Foundation::LocalFree,
        Security::Cryptography::{
            CryptProtectData, CryptUnprotectData, CRYPTPROTECT_UI_FORBIDDEN, CRYPT_INTEGER_BLOB,
        },
    };
    let input = CRYPT_INTEGER_BLOB {
        cbData: bytes
            .len()
            .try_into()
            .map_err(|_| "Credential size invalid")?,
        pbData: bytes.as_mut_ptr(),
    };
    let mut entropy_bytes = b"EasyProject/desktop-login/v1".to_vec();
    let entropy = CRYPT_INTEGER_BLOB {
        cbData: entropy_bytes.len() as u32,
        pbData: entropy_bytes.as_mut_ptr(),
    };
    let mut output = CRYPT_INTEGER_BLOB {
        cbData: 0,
        pbData: std::ptr::null_mut(),
    };
    // No machine-wide key or interactive prompt. DPAPI also authenticates ciphertext.
    let ok = unsafe {
        if encrypt {
            CryptProtectData(
                &input,
                std::ptr::null(),
                &entropy,
                std::ptr::null(),
                std::ptr::null(),
                CRYPTPROTECT_UI_FORBIDDEN,
                &mut output,
            )
        } else {
            CryptUnprotectData(
                &input,
                std::ptr::null_mut(),
                &entropy,
                std::ptr::null(),
                std::ptr::null(),
                CRYPTPROTECT_UI_FORBIDDEN,
                &mut output,
            )
        }
    };
    if ok == 0 {
        return Err("Windows could not protect or unlock saved credentials".into());
    }
    if output.pbData.is_null() || output.cbData == 0 {
        if !output.pbData.is_null() {
            unsafe {
                LocalFree(output.pbData.cast());
            }
        }
        return Err("Invalid protected credential content".into());
    }
    let result =
        unsafe { std::slice::from_raw_parts(output.pbData, output.cbData as usize).to_vec() };
    unsafe {
        std::ptr::write_bytes(output.pbData, 0, output.cbData as usize);
        LocalFree(output.pbData.cast());
    }
    Ok(result)
}

#[tauri::command]
pub fn desktop_credentials(
    window: WebviewWindow,
    action: String,
    credentials: Option<SavedCredentials>,
) -> Result<Option<SavedCredentials>, String> {
    if window.label() != "main" {
        return Err("Credentials are restricted to the main window".into());
    }
    #[cfg(not(windows))]
    {
        let _ = (action, credentials);
        Err("Password saving is available on Windows only".into())
    }
    #[cfg(windows)]
    {
        let root = crate::storage::installation_directory(
            &std::env::current_exe().map_err(|_| "Install directory unavailable")?,
        )?;
        credential_file(&root, action, credentials)
    }
}

#[cfg(windows)]
fn credential_file(
    root: &std::path::Path,
    action: String,
    credentials: Option<SavedCredentials>,
) -> Result<Option<SavedCredentials>, String> {
    crate::storage::validate_directory(root)?;
    let path = root.join("easyproject-login.dpapi");
    match std::fs::symlink_metadata(&path) {
        Ok(meta) if !meta.is_file() || meta.file_type().is_symlink() => {
            return Err("Unsafe credential file".into())
        }
        Err(error) if error.kind() != std::io::ErrorKind::NotFound => {
            return Err("Credential file unavailable".into())
        }
        _ => {}
    }
    match action.as_str() {
        "read" => {
            if !path.exists() {
                return Ok(None);
            }
            if std::fs::metadata(&path)
                .map_err(|_| "Credential file unavailable")?
                .len()
                > 8192
            {
                return Err("Invalid credential file".into());
            }
            let mut encrypted = std::fs::read(&path).map_err(|_| "Credential file unavailable")?;
            let mut plain = crypt(&mut encrypted, false)?;
            let result = serde_json::from_slice(&plain).map_err(|_| "Invalid saved credentials");
            plain.fill(0);
            result.map(Some).map_err(str::to_owned)
        }
        "save" => {
            let value = credentials.ok_or("Credentials required")?;
            if value.username.len() > 48 || !(6..=31).contains(&value.password.chars().count()) {
                return Err("Invalid credentials".into());
            }
            let mut plain = serde_json::to_vec(&value).map_err(|_| "Credential encoding failed")?;
            let encrypted = crypt(&mut plain, true);
            plain.fill(0);
            let encrypted = encrypted?;
            let temporary = root.join(format!(
                ".easyproject-login-{}.tmp",
                uuid::Uuid::new_v4().simple()
            ));
            use std::io::Write;
            let mut file = std::fs::OpenOptions::new()
                .write(true)
                .create_new(true)
                .open(&temporary)
                .map_err(|_| "Cannot save protected credentials")?;
            let result = (|| {
                file.write_all(&encrypted)
                    .map_err(|_| "Cannot save protected credentials")?;
                file.sync_all()
                    .map_err(|_| "Cannot save protected credentials")?;
                drop(file);
                std::fs::rename(&temporary, &path)
                    .map_err(|_| "Cannot replace protected credentials")
            })();
            if result.is_err() {
                let _ = std::fs::remove_file(&temporary);
            }
            result?;
            Ok(None)
        }
        "clear" => {
            match std::fs::remove_file(&path) {
                Ok(()) => {}
                Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
                Err(_) => return Err("Cannot remove saved credentials".into()),
            };
            Ok(None)
        }
        _ => Err("Unsupported credential operation".into()),
    }
}

#[cfg(all(test, windows))]
mod tests {
    use super::crypt;
    #[test]
    fn dpapi_roundtrip_and_corruption_fail_closed_without_plaintext_storage() {
        let original = b"{\"username\":\"synthetic\",\"password\":\"test-secret\"}";
        let mut input = original.to_vec();
        let mut encrypted = crypt(&mut input, true).unwrap();
        assert_ne!(encrypted, original);
        assert!(!encrypted
            .windows(b"test-secret".len())
            .any(|w| w == b"test-secret"));
        assert_eq!(crypt(&mut encrypted, false).unwrap(), original);
        encrypted[0] ^= 0xff;
        assert!(crypt(&mut encrypted, false).is_err());
    }

    #[test]
    fn protected_file_can_be_saved_replaced_read_cleared_and_rejects_corruption() {
        use super::{credential_file, SavedCredentials};
        let root =
            std::env::temp_dir().join(format!("credential-file-{}", uuid::Uuid::new_v4().simple()));
        std::fs::create_dir_all(&root).unwrap();
        assert!(credential_file(&root, "read".into(), None)
            .unwrap()
            .is_none());
        for name in ["first_user", "second_user"] {
            credential_file(
                &root,
                "save".into(),
                Some(SavedCredentials {
                    username: name.into(),
                    password: "abc123".into(),
                }),
            )
            .unwrap();
            let saved = credential_file(&root, "read".into(), None)
                .unwrap()
                .unwrap();
            assert_eq!(saved.username, name);
            assert_eq!(saved.password, "abc123");
            let data = std::fs::read(root.join("easyproject-login.dpapi")).unwrap();
            assert!(!data.windows(6).any(|bytes| bytes == b"abc123"));
        }
        std::fs::write(root.join("easyproject-login.dpapi"), b"invalid ciphertext").unwrap();
        assert!(credential_file(&root, "read".into(), None).is_err());
        credential_file(&root, "clear".into(), None).unwrap();
        assert!(!root.join("easyproject-login.dpapi").exists());
        assert!(credential_file(&root, "read".into(), None)
            .unwrap()
            .is_none());
    }
}
