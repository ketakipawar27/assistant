use crate::tools::tool::Tool;
use crate::agent::models::PermissionLevel;
use async_trait::async_trait;
use std::fs;
use std::path::Path;

pub struct FsTool;

#[async_trait]
impl Tool for FsTool {
    fn name(&self) -> &str { "fs" }
    fn description(&self) -> &str { "Manage files and directories on the local system" }
    fn example_usage(&self) -> &str { "fs:list(C:\\), fs:read(C:\\test.txt), fs:delete(C:\\temp.log), fs:exists(C:\\test.txt)" }
    fn actions(&self) -> Vec<&str> { vec!["list", "read", "delete", "exists"] }

    fn permission_level(&self, action: &str) -> PermissionLevel {
        match action {
            "list" => PermissionLevel::Safe,
            "read" => PermissionLevel::Safe,
            "exists" => PermissionLevel::Safe,
            "delete" => PermissionLevel::Medium,
            _ => PermissionLevel::Dangerous,
        }
    }

    async fn execute(&self, action: String, args: String) -> Result<String, String> {
        match action.as_str() {
            "list" => {
                let p = if args.is_empty() { ".".to_string() } else { args };
                let entries = fs::read_dir(&p).map_err(|e| format!("Failed to read directory {}: {}", p, e))?;
                let mut files = Vec::new();
                for entry in entries {
                    if let Ok(entry) = entry {
                        if let Some(name) = entry.file_name().to_str() {
                            files.push(name.to_string());
                        }
                    }
                }
                Ok(format!("Files ({}): {}", files.len(), files.join(", ")))
            },
            "read" => {
                 fs::read_to_string(&args).map_err(|e| format!("Failed to read file {}: {}", args, e))
            },
            "delete" => {
                fs::remove_file(&args).map(|_| format!("File {} deleted successfully", args)).map_err(|e| format!("Failed to delete file {}: {}", args, e))
            },
            "exists" => {
                let exists = Path::new(&args).exists();
                Ok(exists.to_string())
            },
            _ => Err(format!("Unknown action for fs: {}", action)),
        }
    }
}
