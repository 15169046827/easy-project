//! Logical write-admission budgets, not OS hard quotas or automatic cleanup.
use std::fs;
use std::path::Path;
use std::time::{Duration, Instant};

const MIB: u64 = 1024 * 1024;
pub const CAPACITY_MESSAGE: &str =
    "Workspace storage budget reached; reads remain available. Contact the operator.";
pub const CHECK_MESSAGE: &str =
    "Workspace storage safety check unavailable; reads remain available. Contact the operator.";

#[derive(Clone, Copy)]
pub struct StorageBudget {
    pub workspace_bytes: u64,
    pub data_bytes: u64,
}

impl Default for StorageBudget {
    fn default() -> Self {
        Self {
            workspace_bytes: 512 * MIB,
            data_bytes: 8192 * MIB,
        }
    }
}

#[derive(Debug, PartialEq, Eq)]
pub enum BudgetError {
    Capacity,
    Check,
}

impl BudgetError {
    pub fn message(&self) -> &'static str {
        match self {
            Self::Capacity => CAPACITY_MESSAGE,
            Self::Check => CHECK_MESSAGE,
        }
    }
}

pub fn public_message(value: &str) -> Option<&'static str> {
    match value {
        CAPACITY_MESSAGE => Some(CAPACITY_MESSAGE),
        CHECK_MESSAGE => Some(CHECK_MESSAGE),
        _ => None,
    }
}

pub fn check_existing(root: &Path, budget: StorageBudget) -> Result<usize, BudgetError> {
    if !root.is_absolute()
        || root
            .ancestors()
            .any(|path| fs::symlink_metadata(path).map_or(true, |m| m.file_type().is_symlink()))
    {
        return Err(BudgetError::Check);
    }
    if !root.join("accounts.db").is_file() {
        return Err(BudgetError::Check);
    }
    let workspaces = root.join("workspaces");
    if !fs::symlink_metadata(&workspaces)
        .is_ok_and(|metadata| metadata.is_dir() && !metadata.file_type().is_symlink())
    {
        return Err(BudgetError::Check);
    }
    let mut count = 0;
    for entry in fs::read_dir(&workspaces).map_err(|_| BudgetError::Check)? {
        let entry = entry.map_err(|_| BudgetError::Check)?;
        let name = entry.file_name().to_string_lossy().into_owned();
        if name.len() != 32
            || !name.bytes().all(|value| value.is_ascii_hexdigit())
            || !entry.path().join("project_manager.db").is_file()
        {
            return Err(BudgetError::Check);
        }
        budget.check(root, &entry.path())?;
        count += 1;
    }
    if count == 0 {
        budget.check(root, &workspaces)?;
    }
    Ok(count)
}

impl StorageBudget {
    pub fn from_settings(
        workspace: Option<&str>,
        data: Option<&str>,
    ) -> Result<Self, &'static str> {
        let default = Self::default();
        let parse = |value: Option<&str>, fallback| {
            value.map_or(Ok(fallback), |v| {
                v.parse::<u64>().map_err(|_| "Invalid storage budget")
            })
        };
        let budget = Self {
            workspace_bytes: parse(workspace, default.workspace_bytes)?,
            data_bytes: parse(data, default.data_bytes)?,
        };
        if budget.workspace_bytes < 64 * MIB
            || budget.workspace_bytes > 65536 * MIB
            || budget.data_bytes < budget.workspace_bytes
            || budget.data_bytes > 1048576 * MIB
        {
            return Err("Storage budgets require 64MiB to 64GiB per workspace and an equal/larger pool up to 1TiB");
        }
        Ok(budget)
    }

    pub fn check(self, root: &Path, workspace: &Path) -> Result<(), BudgetError> {
        if !root.is_absolute()
            || !workspace.starts_with(root)
            || workspace == root
            || !workspace.is_dir()
            || root
                .components()
                .chain(workspace.components())
                .any(|part| matches!(part, std::path::Component::ParentDir))
            || root
                .ancestors()
                .any(|path| fs::symlink_metadata(path).map_or(true, |m| m.file_type().is_symlink()))
        {
            return Err(BudgetError::Check);
        }
        let start = Instant::now();
        let mut directories = vec![root.to_path_buf()];
        let (mut total, mut scoped, mut largest, mut scoped_largest) = (0u64, 0u64, 0u64, 0u64);
        let mut entries = 0u32;
        while let Some(directory) = directories.pop() {
            for entry in fs::read_dir(directory).map_err(|_| BudgetError::Check)? {
                entries += 1;
                if entries > 200_000 || start.elapsed() > Duration::from_secs(5) {
                    return Err(BudgetError::Check);
                }
                let path = entry.map_err(|_| BudgetError::Check)?.path();
                let metadata = fs::symlink_metadata(&path).map_err(|_| BudgetError::Check)?;
                if metadata.file_type().is_symlink() {
                    return Err(BudgetError::Check);
                }
                if metadata.is_dir() {
                    directories.push(path);
                } else if metadata.is_file() {
                    total = total
                        .checked_add(metadata.len())
                        .ok_or(BudgetError::Check)?;
                    largest = largest.max(metadata.len());
                    if path.starts_with(workspace) {
                        scoped = scoped
                            .checked_add(metadata.len())
                            .ok_or(BudgetError::Check)?;
                        scoped_largest = scoped_largest.max(metadata.len());
                    }
                } else {
                    return Err(BudgetError::Check);
                }
            }
        }
        // Include recovery/restore headroom. Concurrent accounts and filesystem
        // changes can still overshoot admission thresholds; these are not hard quotas.
        let fits = |used: u64, file: u64, budget: u64| {
            used.checked_add(file.saturating_mul(2))
                .and_then(|v| v.checked_add(8 * MIB))
                .is_some_and(|required| required <= budget)
        };
        if !fits(scoped, scoped_largest, self.workspace_bytes)
            || !fits(total, largest, self.data_bytes)
        {
            return Err(BudgetError::Capacity);
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tree() -> (std::path::PathBuf, std::path::PathBuf) {
        let root =
            std::env::temp_dir().join(format!("ep-budget-{}", uuid::Uuid::new_v4().simple()));
        let workspace = root.join("workspaces").join("a".repeat(32));
        fs::create_dir_all(&workspace).unwrap();
        fs::write(workspace.join("project_manager.db"), b"synthetic").unwrap();
        (root, workspace)
    }

    #[test]
    fn configuration_is_bounded_and_does_not_offer_unlimited_mode() {
        assert_eq!(
            StorageBudget::from_settings(None, None)
                .unwrap()
                .workspace_bytes,
            512 * MIB
        );
        for value in ["0", "-1", "unlimited", "18446744073709551615"] {
            assert!(StorageBudget::from_settings(Some(value), None).is_err());
        }
        assert!(StorageBudget::from_settings(Some("134217728"), Some("67108864")).is_err());
    }

    #[test]
    fn includes_recovery_headroom_and_leaves_all_files_unchanged() {
        let (root, workspace) = tree();
        assert!(StorageBudget::default().check(&root, &workspace).is_ok());
        assert_eq!(
            StorageBudget {
                workspace_bytes: 8 * MIB,
                data_bytes: 8192 * MIB
            }
            .check(&root, &workspace),
            Err(BudgetError::Capacity)
        );
        assert_eq!(
            fs::read(workspace.join("project_manager.db")).unwrap(),
            b"synthetic"
        );
    }

    #[test]
    fn other_accounts_count_toward_pool_but_not_this_workspace() {
        let (root, workspace) = tree();
        let other = root.join("workspaces").join("b".repeat(32));
        fs::create_dir(&other).unwrap();
        fs::File::create(other.join("other.db"))
            .unwrap()
            .set_len(2 * MIB)
            .unwrap();
        assert_eq!(
            StorageBudget {
                workspace_bytes: 16 * MIB,
                data_bytes: 12 * MIB
            }
            .check(&root, &workspace),
            Err(BudgetError::Capacity)
        );
        assert!(StorageBudget {
            workspace_bytes: 16 * MIB,
            data_bytes: 32 * MIB
        }
        .check(&root, &workspace)
        .is_ok());
    }

    #[test]
    fn outside_scope_and_unknown_error_text_are_rejected() {
        let (root, workspace) = tree();
        assert_eq!(
            StorageBudget::default().check(&root, &root),
            Err(BudgetError::Check)
        );
        assert_eq!(
            StorageBudget::default().check(&workspace, &root),
            Err(BudgetError::Check)
        );
        assert!(public_message("private path or SQL").is_none());
        assert_eq!(public_message(CAPACITY_MESSAGE), Some(CAPACITY_MESSAGE));
    }

    #[test]
    fn deployment_preflight_requires_existing_workspace_files_without_creating_them() {
        let (root, workspace) = tree();
        fs::write(root.join("accounts.db"), b"synthetic").unwrap();
        assert_eq!(check_existing(&root, StorageBudget::default()).unwrap(), 1);
        fs::remove_file(workspace.join("project_manager.db")).unwrap();
        assert_eq!(
            check_existing(&root, StorageBudget::default()),
            Err(BudgetError::Check)
        );
        assert!(!workspace.join("project_manager.db").exists());
    }

    #[cfg(unix)]
    #[test]
    fn linked_files_are_not_followed_or_counted_as_safe() {
        let (root, workspace) = tree();
        std::os::unix::fs::symlink("/etc/passwd", root.join("escape")).unwrap();
        assert_eq!(
            StorageBudget::default().check(&root, &workspace),
            Err(BudgetError::Check)
        );
    }
}
