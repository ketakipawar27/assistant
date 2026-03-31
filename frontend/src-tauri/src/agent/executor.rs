use crate::agent::models::{Command, TaskStep, PermissionLevel, Condition};
use crate::tools::registry::ToolRegistry;
use std::collections::HashMap;
use std::time::Duration;
use serde_json::Value;

pub struct Executor;

impl Executor {
    pub fn resolve_placeholders(command: Command, context: &HashMap<String, String>) -> Result<Command, String> {
        match command {
            Command::ReadFile { path } => {
                let resolved_path = Self::replace_placeholders(path, context)?;
                Ok(Command::ReadFile { path: resolved_path })
            },
            Command::DeleteFile { path } => {
                let resolved_path = Self::replace_placeholders(path, context)?;
                Ok(Command::DeleteFile { path: resolved_path })
            },
            Command::Shell { script } => {
                let resolved_script = Self::replace_placeholders(script, context)?;
                Ok(Command::Shell { script: resolved_script })
            },
            Command::WebSearch { query } => {
                let resolved_query = Self::replace_placeholders(query, context)?;
                Ok(Command::WebSearch { query: resolved_query })
            },
            Command::ListFiles { path } => {
                match path {
                    Some(p) => {
                        let resolved_path = Self::replace_placeholders(p, context)?;
                        Ok(Command::ListFiles { path: Some(resolved_path) })
                    },
                    None => Ok(Command::ListFiles { path: None })
                }
            },
            Command::If { condition, then_steps, else_steps } => {
                let resolved_condition = match condition {
                    Condition::FileExists(p) => Condition::FileExists(Self::replace_placeholders(p, context)?),
                    Condition::Contains { target, pattern } => Condition::Contains {
                        target: Self::replace_placeholders(target, context)?,
                        pattern: Self::replace_placeholders(pattern, context)?
                    },
                    Condition::Equals { a, b } => Condition::Equals {
                        a: Self::replace_placeholders(a, context)?,
                        b: Self::replace_placeholders(b, context)?
                    },
                };

                let mut res_then = Vec::new();
                for cmd in then_steps {
                    res_then.push(Self::resolve_placeholders(cmd, context)?);
                }

                let mut res_else = Vec::new();
                for cmd in else_steps {
                    res_else.push(Self::resolve_placeholders(cmd, context)?);
                }

                Ok(Command::If {
                    condition: resolved_condition,
                    then_steps: res_then,
                    else_steps: res_else
                })
            },
            Command::Loop { interval_ms, steps } => {
                let mut res_steps = Vec::new();
                for cmd in steps {
                    res_steps.push(Self::resolve_placeholders(cmd, context)?);
                }
                Ok(Command::Loop { interval_ms, steps: res_steps })
            },
            _ => Ok(command)
        }
    }

    fn replace_placeholders(text: String, context: &HashMap<String, String>) -> Result<String, String> {
        let mut result = text.clone();
        let mut start = 0;

        while let Some(open) = result[start..].find("{{") {
            let open_idx = start + open;
            if let Some(close) = result[open_idx..].find("}}") {
                let close_idx = open_idx + close;
                let var_expression = &result[open_idx + 2..close_idx].trim();

                let resolved_value = Self::resolve_variable(var_expression, context)?;

                result.replace_range(open_idx..close_idx + 2, &resolved_value);
                start = open_idx + resolved_value.len();
            } else {
                break;
            }
        }
        Ok(result)
    }

    fn resolve_variable(expression: &str, context: &HashMap<String, String>) -> Result<String, String> {
        let (root_key, path) = if let Some(idx) = expression.find(|c| c == '.' || c == '[') {
            (&expression[..idx], &expression[idx..])
        } else {
            (expression, "")
        };

        let raw_value = context.get(root_key)
            .ok_or_else(|| format!("Variable '{}' not found in context", root_key))?;

        if path.is_empty() {
            return Ok(raw_value.clone());
        }

        let json: Value = serde_json::from_str(raw_value)
            .map_err(|_| format!("Variable '{}' is not valid JSON, cannot extract path '{}'", root_key, path))?;

        Self::extract_json_path(&json, path)
            .ok_or_else(|| format!("Path '{}' not found in variable '{}'", path, root_key))
    }

    fn extract_json_path(json: &Value, path: &str) -> Option<String> {
        let mut current = json;
        let mut remaining = path;

        while !remaining.is_empty() {
            if remaining.starts_with('.') {
                let end = remaining[1..].find(|c| c == '.' || c == '[').map(|i| i + 1).unwrap_or(remaining.len());
                let key = &remaining[1..end];
                current = current.get(key)?;
                remaining = &remaining[end..];
            } else if remaining.starts_with('[') {
                let close_bracket = remaining.find(']')?;
                let index_str = &remaining[1..close_bracket];
                let index = index_str.parse::<usize>().ok()?;
                current = current.get(index)?;
                remaining = &remaining[close_bracket + 1..];
            } else {
                return None;
            }
        }

        match current {
            Value::String(s) => Some(s.clone()),
            Value::Number(n) => Some(n.to_string()),
            Value::Bool(b) => Some(b.to_string()),
            Value::Null => Some("null".to_string()),
            _ => Some(current.to_string()),
        }
    }

    pub fn get_command_info(command: &Command) -> (&'static str, &'static str, String) {
        match command {
            Command::OpenApp { target } => ("apps", "open", target.clone()),
            Command::ListFiles { path } => ("fs", "list", path.clone().unwrap_or(".".to_string())),
            Command::ReadFile { path } => ("fs", "read", path.clone()),
            Command::DeleteFile { path } => ("fs", "delete", path.clone()),
            Command::SystemInfo => ("system", "info", "".to_string()),
            Command::Shell { script } => ("shell", "run", script.clone()),
            Command::WebSearch { query } => ("web", "search", query.clone()),
            Command::If { .. } => ("system", "if", "conditional".to_string()),
            Command::Loop { interval_ms, .. } => ("system", "loop", format!("{}ms", interval_ms)),
            Command::Unknown { input } => ("unknown", "unknown", input.clone()),
        }
    }

    pub async fn evaluate_condition(condition: &Condition, registry: &ToolRegistry) -> Result<bool, String> {
        match condition {
            Condition::FileExists(path) => {
                let tool = registry.get_tool("fs").ok_or("fs tool not found")?;
                let res = tool.execute("exists".to_string(), path.clone()).await?;
                Ok(res == "true")
            },
            Condition::Contains { target, pattern } => {
                Ok(target.contains(pattern))
            },
            Condition::Equals { a, b } => {
                Ok(a == b)
            }
        }
    }

    pub async fn execute_step(step: &TaskStep, command: &Command, registry: &ToolRegistry) -> Result<String, String> {
        println!("[Executor] Executing step: {} - Command: {:?}", step.name, command);

        tokio::time::sleep(Duration::from_millis(500)).await;

        let (tool_name, action, args) = Self::get_command_info(command);

        if let Some(tool) = registry.get_tool(tool_name) {
            println!("[Executor] Using Tool: {} for Action: {}", tool.name(), action);
            tool.execute(action.to_string(), args).await
        } else {
            Err(format!("Tool not found in registry: {}", tool_name))
        }
    }
}
