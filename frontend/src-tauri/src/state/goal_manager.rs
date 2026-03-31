use crate::agent::models::{Goal, AgentEvent, Task, TaskStatus, TaskStep, StepStatus, Command, LoopMetadata};
use crate::agent::planner::Planner;
use crate::agent::executor::Executor;
use crate::AppState;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH, Duration};
use tauri::{AppHandle, Manager, Emitter};

pub struct GoalManager {
    pub goals: Arc<Mutex<HashMap<String, Goal>>>,
    pub active_tasks: Arc<Mutex<HashMap<String, String>>>, // goal_id -> task_id
    pub storage_path: Option<PathBuf>,
}

impl GoalManager {
    pub fn new(storage_path: Option<PathBuf>) -> Self {
        let mut goals = HashMap::new();

        if let Some(ref path) = storage_path {
            if path.exists() {
                if let Ok(content) = fs::read_to_string(path) {
                    if let Ok(loaded_goals) = serde_json::from_str::<HashMap<String, Goal>>(&content) {
                        goals = loaded_goals;
                        println!("[GoalManager] Loaded {} goals", goals.len());
                    }
                }
            }
        }

        Self {
            goals: Arc::new(Mutex::new(goals)),
            active_tasks: Arc::new(Mutex::new(HashMap::new())),
            storage_path,
        }
    }

    pub fn save_to_disk(&self) {
        if let Some(ref path) = self.storage_path {
            let goals = self.goals.lock().unwrap();
            if let Ok(content) = serde_json::to_string_pretty(&*goals) {
                if let Err(e) = fs::write(path, content) {
                    eprintln!("[GoalManager] Failed to save goals: {}", e);
                }
            }
        }
    }

    pub fn add_goal(&self, goal: Goal, app: Option<&AppHandle>) {
        let mut goals = self.goals.lock().unwrap();
        if let Some(h) = app {
            h.emit("agent_event", AgentEvent::GoalCreated {
                goal_id: goal.id.clone(),
                description: goal.description.clone()
            }).unwrap();
        }
        goals.insert(goal.id.clone(), goal);
        drop(goals);
        self.save_to_disk();
    }

    pub fn get_goals(&self) -> Vec<Goal> {
        let goals = self.goals.lock().unwrap();
        goals.values().cloned().collect()
    }

    pub fn set_active_task(&self, goal_id: String, task_id: String) {
        let mut active = self.active_tasks.lock().unwrap();
        active.insert(goal_id, task_id);
    }

    pub fn remove_active_task(&self, goal_id: &str) {
        let mut active = self.active_tasks.lock().unwrap();
        active.remove(goal_id);
    }

    pub fn is_task_running(&self, goal_id: &str) -> bool {
        let active = self.active_tasks.lock().unwrap();
        active.contains_key(goal_id)
    }
}

pub fn start_evaluation_loop(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        loop {
            let state = app.state::<AppState>();
            let goals = state.goal_manager.get_goals();
            let context_summary = state.context_manager.get_context_summary();

            for goal in goals {
                if !goal.active { continue; }

                // Skip if there's already an active task for this goal
                if state.goal_manager.is_task_running(&goal.id) {
                    // Check if the task is still running in TaskManager
                    let active_tasks = state.goal_manager.active_tasks.lock().unwrap();
                    if let Some(tid) = active_tasks.get(&goal.id) {
                        if let Some(task) = state.task_manager.get_task(tid) {
                            if task.status == TaskStatus::Running || task.status == TaskStatus::Confirming {
                                continue;
                            }
                        }
                    }
                    drop(active_tasks);
                    state.goal_manager.remove_active_task(&goal.id);
                }

                println!("[GoalManager] Evaluating goal: {}", goal.description);
                app.emit("agent_event", AgentEvent::GoalTriggered { goal_id: goal.id.clone() }).unwrap();

                let goal_id = goal.id.clone();
                let goal_desc = goal.description.clone();
                let target_state = goal.target_state.clone();
                let state_clone = app.state::<AppState>();
                let app_clone = app.clone();
                let context_summary_clone = context_summary.clone();

                tauri::async_runtime::spawn(async move {
                    // 1. Generate corrective plan
                    let planner_input = format!(
                        "GOAL: {}\nTARGET STATE: {}\nCURRENT CONTEXT: {}\n\nDetermine if corrective action is needed. If yes, generate steps to fix the system. If goal is already satisfied, return 0 steps.",
                        goal_desc, target_state, context_summary_clone
                    );

                    match Planner::generate_plan(&planner_input, &context_summary_clone, &state_clone.tool_registry).await {
                        Ok(steps) if !steps.is_empty() => {
                            let tid = format!("goal_task_{}_{}", goal_id, SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs());
                            state_clone.goal_manager.set_active_task(goal_id.clone(), tid.clone());

                            let task = Task {
                                id: tid.clone(),
                                input: planner_input.clone(),
                                status: TaskStatus::Running,
                                steps,
                                current_step_index: 0,
                                result: None,
                                created_at: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
                                cancelled: false,
                                requires_confirmation: false,
                                confirmation_message: None,
                                context_buffer: HashMap::new(),
                                is_loop: false,
                                loop_interval: None,
                                loop_metadata: None,
                                trigger: None,
                            };

                            state_clone.task_manager.add_task(task);
                            app_clone.emit("agent_event", AgentEvent::TaskStarted { task_id: tid.clone() }).unwrap();

                            crate::spawn_task_execution(
                                tid,
                                planner_input,
                                Arc::clone(&state_clone.task_manager),
                                Arc::clone(&state_clone.context_manager),
                                Arc::clone(&state_clone.tool_registry),
                                Some(app_clone.clone())
                            );
                        }
                        Ok(_) => {
                            println!("[GoalManager] Goal '{}' satisfied.", goal_desc);
                            app_clone.emit("agent_event", AgentEvent::GoalSatisfied { goal_id: goal_id.clone() }).unwrap();
                        }
                        Err(e) => {
                            println!("[GoalManager] Planning failed for goal '{}': {}", goal_desc, e);
                            app_clone.emit("agent_event", AgentEvent::GoalFailed { goal_id: goal_id.clone(), error: e }).unwrap();
                        }
                    }
                });
            }

            tokio::time::sleep(Duration::from_secs(10)).await;
        }
    });
}
