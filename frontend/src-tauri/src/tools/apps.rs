use crate::tools::tool::Tool;
use crate::agent::models::PermissionLevel;
use async_trait::async_trait;
use std::process::Command as StdCommand;

pub struct AppsTool;

#[async_trait]
impl Tool for AppsTool {
    fn name(&self) -> &str { "apps" }
    fn description(&self) -> &str { "Opens system applications like notepad or browser" }
    fn example_usage(&self) -> &str { "apps:open(notepad) - Opens the Windows Notepad" }
    fn actions(&self) -> Vec<&str> { vec!["open"] }

    fn permission_level(&self, _action: &str) -> PermissionLevel {
        PermissionLevel::Safe
    }

    async fn execute(&self, action: String, args: String) -> Result<String, String> {
        if action != "open" {
            return Err(format!("Unknown action for apps: {}", action));
        }

        #[cfg(target_os = "windows")]
        {
            let exe = match args.to_lowercase().as_str() {
                "notepad" => "notepad.exe",
                "browser" => "explorer",
                _ => return Err(format!("Unsupported app: {}", args)),
            };

            StdCommand::new(exe)
                .spawn()
                .map(|_| format!("{} opened successfully", args))
                .map_err(|e| format!("Failed to open {}: {}", args, e))
        }

        #[cfg(not(target_os = "windows"))]
        {
            Err("Apps tool is only fully implemented for Windows currently".to_string())
        }
    }
}
