use crate::tools::tool::Tool;
use crate::agent::models::PermissionLevel;
use async_trait::async_trait;
use std::process::Command as StdCommand;

pub struct ShellTool;

#[async_trait]
impl Tool for ShellTool {
    fn name(&self) -> &str { "shell" }
    fn description(&self) -> &str { "Runs arbitrary shell scripts (PowerShell on Windows, Sh on POSIX)" }
    fn example_usage(&self) -> &str { "shell:run(echo hello) - Runs a command in the system shell" }
    fn actions(&self) -> Vec<&str> { vec!["run"] }

    fn permission_level(&self, _action: &str) -> PermissionLevel {
        PermissionLevel::Dangerous
    }

    async fn execute(&self, action: String, args: String) -> Result<String, String> {
        if action != "run" {
            return Err(format!("Unknown action for shell: {}", action));
        }

        #[cfg(target_os = "windows")]
        {
            StdCommand::new("powershell")
                .arg("-Command")
                .arg(&args)
                .output()
                .map(|output| {
                    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
                    if output.status.success() {
                        stdout
                    } else {
                        format!("Error: {}", stderr)
                    }
                })
                .map_err(|e| format!("Failed to execute powershell: {}", e))
        }

        #[cfg(not(target_os = "windows"))]
        {
            StdCommand::new("sh")
                .arg("-c")
                .arg(&args)
                .output()
                .map(|output| {
                    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
                    if output.status.success() {
                        stdout
                    } else {
                        format!("Error: {}", stderr)
                    }
                })
                .map_err(|e| format!("Failed to execute shell: {}", e))
        }
    }
}
