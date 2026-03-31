use crate::agent::models::{Command, Condition};
use crate::tools::registry::ToolRegistry;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct LLMPlanStep {
    pub tool: String,
    pub action: String,
    pub args: Value,
    pub reasoning: String,
}

pub struct CommandFactory;

impl CommandFactory {
    pub fn build_command(step: LLMPlanStep, registry: &ToolRegistry) -> Result<Command, String> {
        // 1. Validate Tool Exists
        let tool = registry.get_tool(&step.tool)
            .ok_or_else(|| format!("Unknown tool: '{}'", step.tool))?;

        // 2. Validate Action Exists
        let actions = tool.actions();
        if !actions.contains(&step.action.as_str()) {
            return Err(format!("Tool '{}' does not support action '{}'", step.tool, step.action));
        }

        // 3. Map to Strongly Typed Command
        match step.tool.as_str() {
            "apps" => match step.action.as_str() {
                "open" => Ok(Command::OpenApp {
                    target: step.args.as_str().unwrap_or("").to_string()
                }),
                _ => Err(format!("Unsupported action for apps: {}", step.action))
            },
            "fs" => match step.action.as_str() {
                "list" => Ok(Command::ListFiles {
                    path: step.args.as_str().map(|s| s.to_string())
                }),
                "read" => Ok(Command::ReadFile {
                    path: step.args.as_str().unwrap_or("").to_string()
                }),
                "delete" => Ok(Command::DeleteFile {
                    path: step.args.as_str().unwrap_or("").to_string()
                }),
                _ => Err(format!("Unsupported action for fs: {}", step.action))
            },
            "system" => match step.action.as_str() {
                "info" => Ok(Command::SystemInfo),
                "if" => {
                    // Logic for 'if' inside 'system' or as a meta-tool
                    let condition = serde_json::from_value::<Condition>(step.args["condition"].clone())
                        .map_err(|e| format!("Invalid condition args: {}", e))?;
                    let then_steps = serde_json::from_value::<Vec<Command>>(step.args["then_steps"].clone())
                        .map_err(|e| format!("Invalid then_steps: {}", e))?;
                    let else_steps = serde_json::from_value::<Vec<Command>>(step.args["else_steps"].clone())
                        .map_err(|e| format!("Invalid else_steps: {}", e))?;

                    Ok(Command::If { condition, then_steps, else_steps })
                },
                "loop" => {
                    let interval_ms = step.args["interval_ms"].as_u64().unwrap_or(5000);
                    let steps = serde_json::from_value::<Vec<Command>>(step.args["steps"].clone())
                        .map_err(|e| format!("Invalid loop steps: {}", e))?;
                    Ok(Command::Loop { interval_ms, steps })
                },
                _ => Err(format!("Unsupported action for system: {}", step.action))
            },
            "shell" => match step.action.as_str() {
                "run" => Ok(Command::Shell {
                    script: step.args.as_str().unwrap_or("").to_string()
                }),
                _ => Err(format!("Unsupported action for shell: {}", step.action))
            },
            "web" => match step.action.as_str() {
                "search" => Ok(Command::WebSearch {
                    query: step.args.as_str().unwrap_or("").to_string()
                }),
                _ => Err(format!("Unsupported action for web: {}", step.action))
            },
            "sensor" => match step.action.as_str() {
                "get_status" => Ok(Command::SystemInfo), // Mapping sensor tool to info for now or add specific command
                _ => Err(format!("Unsupported action for sensor: {}", step.action))
            },
            _ => Err(format!("Tool '{}' implementation missing in CommandFactory", step.tool))
        }
    }
}
