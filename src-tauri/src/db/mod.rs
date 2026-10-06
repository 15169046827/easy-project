pub mod member_db;
pub mod plan_baseline_db;
pub mod project_db;
pub mod project_member_db;
pub mod task_db;
pub mod task_dependency_db;

pub(crate) fn pagination_offset(page_index: u64, page_size: u64) -> u64 {
    page_index
        .saturating_sub(1)
        .saturating_mul(page_size)
        .min(i64::MAX as u64)
}

#[cfg(test)]
mod tests {
    use super::pagination_offset;

    #[test]
    fn pagination_offset_handles_zero_and_extreme_indices() {
        assert_eq!(pagination_offset(0, 20), 0);
        assert_eq!(pagination_offset(2, 20), 20);
        assert_eq!(pagination_offset(u64::MAX, 1000), i64::MAX as u64);
    }
}
