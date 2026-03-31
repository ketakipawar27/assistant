use async_trait::async_trait;
use crate::agent::models::PermissionLevel;

#[async_trait]
pub trait Tool: Send + Sync {
    fn name(&self) -> &str;
    fn description(&self) -> &str;
    fn example_usage(&self) -> &str;
    fn actions(&self) -> Vec<&str>;
    fn permission_level(&self, action: &str) -> PermissionLevel;
    async fn execute(&self, action: String, args: String) -> Result<String, String>;
}
