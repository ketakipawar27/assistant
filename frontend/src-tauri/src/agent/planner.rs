use crate::agent::models::{Command, TaskStep, StepStatus, PermissionLevel};
use crate::tools::registry::ToolRegistry;
use crate::agent::command_factory::{CommandFactory, LLMPlanStep};
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Serialize)]
struct ToolMetadata {
    name: String,
    description: String,
    example_usage: String,
    permission_level: PermissionLevel,
    actions: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct CriticResponse {
    valid: bool,
    feedback: Option<String>,
}

pub struct Planner;

impl Planner {
    pub async fn generate_plan(input: &str, context_summary: &str, registry: &ToolRegistry) -> Result<Vec<TaskStep>, String> {
        let tools_meta: Vec<ToolMetadata> = registry.tools.values().map(|t| ToolMetadata {
            name: t.name().to_string(),
            description: t.description().to_string(),
            example_usage: t.example_usage().to_string(),
            permission_level: t.permission_level(""),
            actions: t.actions().into_iter().map(|s| s.to_string()).collect(),
        }).collect();

        let mut error_feedback = String::new();
        let mut attempts = 0;

        while attempts < 3 {
            println!("[Planner] Generating plan attempt {}...", attempts + 1);
            match Self::call_llm(input, context_summary, &tools_meta, &error_feedback).await {
                Ok(raw_steps) => {
                    // 1. Static Validation (Registry Check via CommandFactory)
                    match Self::validate_plan(raw_steps.clone(), registry) {
                        Ok(steps) => {
                            // 2. Intelligent Validation (Critic Layer)
                            println!("[Planner] Calling Critic for attempt {}...", attempts + 1);
                            match Self::call_critic(input, &raw_steps).await {
                                Ok(true) => {
                                    println!("[Planner] Critic APPROVED plan.");
                                    return Ok(steps);
                                },
                                Ok(false) | Err(_) => {
                                    let feedback = match Self::call_critic(input, &raw_steps).await {
                                        Err(e) => format!("Critic system error: {}", e),
                                        Ok(_) => "Critic REJECTED the plan as inefficient or unsafe.".to_string(),
                                    };
                                    println!("[Planner] Critic REJECTED plan: {}", feedback);
                                    error_feedback = format!("\nCRITIC FEEDBACK: {}. Please generate a better, safer, or more accurate plan.", feedback);
                                }
                            }
                        },
                        Err(err) => {
                            println!("[Planner] Static Validation failed: {}", err);
                            error_feedback = format!("\nSTATIC VALIDATION ERROR: {}. You MUST follow the Tool Registry rules.", err);
                        }
                    }
                },
                Err(e) => {
                    println!("[Planner] LLM call failed: {}", e);
                    error_feedback = format!("\nLLM ERROR: {}. Ensure output is valid JSON.", e);
                }
            }
            attempts += 1;
        }

        Err("Failed to generate a verified plan after 3 attempts.".to_string())
    }

    async fn call_llm(input: &str, context_summary: &str, tools: &[ToolMetadata], error_feedback: &str) -> Result<Vec<LLMPlanStep>, String> {
        let api_key = env::var("OPENAI_API_KEY")
            .map_err(|_| "OPENAI_API_KEY not found in environment".to_string())?;

        let client = reqwest::Client::new();
        let tools_json = serde_json::to_string_pretty(tools).unwrap();

        let prompt = format!(
            "You are the Titan.OS AI Planner. Convert user intent into a precise, step-by-step technical plan.

            ### TOOL REGISTRY (API CONTRACT)
            {}

            ### RULES & CONSTRAINTS
            - Output: JSON object with \"steps\" key containing an array of steps.
            - Variable Flow: Use {{step_1}}, {{step_2}}, or {{last_result}}.
            - Meta Tools: 'system:if' and 'system:loop' are allowed if logic requires it.

            ### ARGUMENTS FORMAT:
            - Most tools take a simple string as 'args'.
            - 'system:if' takes args: {{ \"condition\": {{ ... }}, \"then_steps\": [...], \"else_steps\": [...] }}
            - 'system:loop' takes args: {{ \"interval_ms\": 5000, \"steps\": [...] }}

            ### CONTEXT
            {}

            ### PREVIOUS FEEDBACK (If any)
            {}

            ### USER INTENT
            '{}'",
            tools_json,
            context_summary,
            error_feedback,
            input
        );

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

        Ok(raw_steps)
    }

    async fn call_critic(input: &str, steps: &[LLMPlanStep]) -> Result<bool, String> {
        let api_key = env::var("OPENAI_API_KEY")
            .map_err(|_| "OPENAI_API_KEY not found in environment".to_string())?;

        let client = reqwest::Client::new();
        let steps_json = serde_json::to_string_pretty(steps).unwrap();

        let prompt = format!(
            "You are the Titan.OS Plan Critic. Your job is to verify if a generated task plan is safe, accurate, and efficient.

            User Intent: '{}'
            Proposed Plan:
            {}

            Return ONLY a JSON object: {{ \"valid\": true/false, \"feedback\": \"reasoning if invalid\" }}",
            input,
            steps_json
        );

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
        let res: CriticResponse = serde_json::from_str(content).map_err(|e| e.to_string())?;

        Ok(res.valid)
    }

    fn validate_plan(raw_steps: Vec<LLMPlanStep>, registry: &ToolRegistry) -> Result<Vec<TaskStep>, String> {
        let mut steps = Vec::new();
        for s in raw_steps {
            let command = CommandFactory::build_command(s.clone(), registry)?;

            steps.push(TaskStep {
                name: format!("{}: {}", s.tool, s.action),
                status: StepStatus::Pending,
                command,
                result: None,
            });
        }
        Ok(steps)
    }
}
