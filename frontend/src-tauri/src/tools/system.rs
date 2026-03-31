use crate::tools::tool::Tool;
use crate::agent::models::PermissionLevel;
use async_trait::async_trait;

pub struct SystemTool;

#[async_trait]
impl Tool for SystemTool {
    fn name(&self) -> &str { "system" }
    fn description(&self) -> &str { "Provides system hardware and OS information" }
    fn example_usage(&self) -> &str { "system:info() - Retrieves current OS and architecture" }
    fn actions(&self) -> Vec<&str> { vec!["info"] }

    fn permission_level(&self, _action: &str) -> PermissionLevel {
        PermissionLevel::Safe
    }

    async fn execute(&self, action: String, _args: String) -> Result<String, String> {
        if action != "info" {
            return Err(format!("Unknown action for system: {}", action));
        }

        println!("[SystemTool] Gathering system info...");
        let info = format!(
            "Titan.OS Core | OS: {} | Arch: {}",
            std::env::consts::OS,
            std::env::consts::ARCH
        );

        Ok(info)
    }
}
