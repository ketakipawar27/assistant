use crate::agent::models::{TaskStep, Observation, StepStatus, PermissionLevel};
use crate::tools::registry::ToolRegistry;
use crate::agent::command_factory::{CommandFactory, LLMPlanStep};
use serde::Serialize;
use std::env;

#[derive(Debug, Serialize)]
struct ToolMetadata {
    name: String,
    description: String,
    example_usage: String,
    permission_level: PermissionLevel,
    actions: Vec<String>,
}

pub struct Replanner;

impl Replanner {
    pub async fn replan(
        input: &str,
        context_summary: &str,
        observation: &Observation,
        remaining_steps: Vec<TaskStep>,
        registry: &ToolRegistry
    ) -> Result<Vec<TaskStep>, String> {
        let api_key = env::var("OPENAI_API_KEY")
            .map_err(|_| "OPENAI_API_KEY not found in environment".to_string())?;

        let tools_meta: Vec<ToolMetadata> = registry.tools.values().map(|t| ToolMetadata {
            name: t.name().to_string(),
            description: t.description().to_string(),
            example_usage: t.example_usage().to_string(),
            permission_level: t.permission_level(""),
            actions: t.actions().into_iter().map(|s| s.to_string()).collect(),
        }).collect();

        let remaining_json = serde_json::to_string_pretty(&remaining_steps).unwrap();
        let tools_json = serde_json::to_string_pretty(&tools_meta).unwrap();

        let prompt = format!(
            "You are the Titan.OS AI Replanner. A step has just finished. Evaluate the result and the original goal to decide the next steps.

            Original Intent: '{}'
            Context: {}

            Latest Observation:
            - Step Index: {}
            - Output: {}
            - Success: {}

            Current Remaining Plan:
            {}

            Available Tools:
            {}

            Rules:
            - If the observation implies the task is done, return an empty steps array [].
            - If the original plan is still valid, return the remaining steps as-is.
            - If you need to modify, add, or remove steps to achieve the goal, return a NEW steps array.
            - tools and actions must match the definitions above EXACTLY.
            - Variable Flow: Use {{step_1}}, {{step_2}}, or {{last_result}}.

            Return ONLY a JSON object: {{ \"steps\": [...] }}",
            input,
            context_summary,
            observation.step_index,
            observation.output,
            observation.success,
            remaining_json,
            tools_json
        );

        let client = reqwest::Client::new();
        let response = client
            .post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .json(&serde_json::json!({
                "model": "gpt-4o-mini",
                "messages": [{ "role": "system", "content": prompt }],
                "response_format": { "type": "json_object" },
                "temperature": 0.0
            }))
            .send()
            .await
            .map_err(|e| format!("HTTP request failed: {}", e))?;

        let json: serde_json::Value = response.json().await.map_err(|e| format!("JSON parse failed: {}", e))?;
        let content = json["choices"][0]["message"]["content"].as_str().ok_or("No content")?;

        let v: serde_json::Value = serde_json::from_str(content).map_err(|e| e.to_string())?;
        let raw_steps: Vec<LLMPlanStep> = serde_json::from_value(v["steps"].clone()).map_err(|e| e.to_string())?;

        let mut next_steps = Vec::new();
        for s in raw_steps {
            let command = CommandFactory::build_command(s.clone(), registry)?;

            next_steps.push(TaskStep {
                name: format!("{}: {}", s.tool, s.action),
                status: StepStatus::Pending,
                command,
                result: None,
            });
        }

        Ok(next_steps)
    }
}
