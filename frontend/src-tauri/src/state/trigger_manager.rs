use crate::agent::models::{Trigger, TaskStatus, AgentEvent};
use crate::AppState;
use tauri::{AppHandle, Manager, Emitter};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH, Duration};
use crate::process_agent_input;

pub struct TriggerManager;

impl TriggerManager {
    pub fn start_watcher(app: AppHandle) {
        tauri::async_runtime::spawn(async move {
            loop {
                let state = app.state::<AppState>();
                let tasks = state.task_manager.list_tasks();
                let context = state.context_manager.context.lock().unwrap().clone();

                for task in tasks {
                    if let Some(trigger) = &task.trigger {
                        if task.status != TaskStatus::Idle {
                            continue; // Only trigger tasks that are in Idle status
                        }

                        let should_fire = match trigger {
                            Trigger::Interval(secs) => {
                                let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
                                let last_run = task.loop_metadata.as_ref().map(|m| m.last_run).unwrap_or(0);
                                now >= last_run + secs
                            }
                            Trigger::SystemCondition(condition) => {
                                // Simple evaluation logic: "cpu > 80"
                                if let Some(sys_state) = &context.system_state {
                                    Self::evaluate_system_condition(condition, sys_state)
                                } else {
                                    false
                                }
                            }
                            Trigger::FileWatch(path) => {
                                // Check if file exists/was modified
                                std::path::Path::new(path).exists()
                            }
                        };

                        if should_fire {
                            println!("[TriggerManager] Firing task: {} (Trigger: {:?})", task.id, trigger);

                            app.emit("agent_event", AgentEvent::TriggerFired {
                                task_id: task.id.clone(),
                                trigger_type: format!("{:?}", trigger)
                            }).unwrap();

                            // Execute the task
                            let state_clone = app.state::<AppState>();
                            let task_input = task.input.clone();
                            let app_handle = app.clone();

                            // Use process_agent_input but we need to avoid creating a NEW task
                            // For now, let's re-run the input which creates a new instance of the automation
                            tauri::async_runtime::spawn(async move {
                                let _ = process_agent_input(task_input, &state_clone, Some(app_handle)).await;
                            });

                            // Update last run to prevent immediate double-fire
                            let mut t = state.task_manager.get_task(&task.id).unwrap();
                            t.loop_metadata = Some(crate::agent::models::LoopMetadata {
                                iteration: t.loop_metadata.as_ref().map(|m| m.iteration).unwrap_or(0) + 1,
                                last_run: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
                            });
                            state.task_manager.add_task(t);
                        }
                    }
                }

                tokio::time::sleep(Duration::from_secs(5)).await;
            }
        });
    }

    fn evaluate_system_condition(condition: &str, sys_state: &serde_json::Value) -> bool {
        let parts: Vec<&str> = condition.split_whitespace().collect();
        if parts.len() != 3 { return false; }

        let metric = parts[0];
        let op = parts[1];
        let value: f32 = parts[2].parse().unwrap_or(0.0);

        let current_value = match metric {
            "cpu" => sys_state["cpu_percent"].as_f64().unwrap_or(0.0) as f32,
            "ram" => sys_state["ram_percent"].as_f64().unwrap_or(0.0) as f32,
            _ => 0.0,
        };

        match op {
            ">" => current_value > value,
            "<" => current_value < value,
            "==" => (current_value - value).abs() < 0.1,
            _ => false,
        }
    }
}
