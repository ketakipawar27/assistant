pub mod agent;
pub mod tools;
pub mod state;

use tauri::{State, Emitter, AppHandle, Manager};
use crate::agent::models::{AgentResponse, AgentEvent, Command, Task, TaskStatus, TaskStep, StepStatus, PermissionLevel, Observation, LoopMetadata, Goal};
use crate::agent::parser::Parser;
use crate::agent::executor::Executor;
use crate::agent::planner::Planner;
use crate::agent::replanner::Replanner;
use crate::state::task_manager::TaskManager;
use crate::state::context_manager::ContextManager;
use crate::state::trigger_manager::TriggerManager;
use crate::state::goal_manager::GoalManager;
use crate::tools::registry::ToolRegistry;
use crate::tools::sensor::SensorTool;
use std::sync::Arc;
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH, Duration};

pub struct AppState {
    pub task_manager: Arc<TaskManager>,
    pub context_manager: Arc<ContextManager>,
    pub goal_manager: Arc<GoalManager>,
    pub tool_registry: Arc<ToolRegistry>,
}

#[tauri::command]
pub async fn run_agent(
    input: String,
    state: State<'_, AppState>,
    app: AppHandle
) -> Result<AgentResponse, String> {
    process_agent_input(input, &state, Some(app)).await
}

pub async fn process_agent_input(
    input: String,
    state: &AppState,
    app: Option<AppHandle>
) -> Result<AgentResponse, String> {
    println!("[Agent] Received input: {}", input);

    let task_id = format!("task_{}", SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs());
    let context_summary = state.context_manager.get_context_summary();

    let steps = match Planner::generate_plan(&input, &context_summary, &state.tool_registry).await {
        Ok(s) => {
            println!("[Agent] AI Planner successfully generated {} steps", s.len());
            s
        },
        Err(e) => {
            println!("[Agent] AI Planner failed: {}. Falling back to Rule-based Parser.", e);
            let commands = Parser::parse_input(&input);
            commands.into_iter().map(|cmd| {
                let (tool, action, _) = Executor::get_command_info(&cmd);
                let name = format!("{}: {}", tool, action);
                TaskStep {
                    name,
                    status: StepStatus::Pending,
                    command: cmd,
                    result: None
                }
            }).collect::<Vec<TaskStep>>()
        }
    };

    let mut is_loop = false;
    let mut loop_interval = None;
    for step in &steps {
        if let Command::Loop { interval_ms, .. } = step.command {
            is_loop = true;
            loop_interval = Some(interval_ms);
            break;
        }
    }

    let task = Task {
        id: task_id.clone(),
        input: input.clone(),
        status: TaskStatus::Running,
        steps,
        current_step_index: 0,
        result: None,
        created_at: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
        cancelled: false,
        requires_confirmation: false,
        confirmation_message: None,
        context_buffer: HashMap::new(),
        is_loop,
        loop_interval,
        loop_metadata: None,
        trigger: None,
    };

    state.task_manager.add_task(task.clone());
    if let Some(ref h) = app {
        h.emit("agent_event", AgentEvent::TaskStarted { task_id: task_id.clone() }).unwrap();
    }

    spawn_task_execution(
        task_id,
        input,
        Arc::clone(&state.task_manager),
        Arc::clone(&state.context_manager),
        Arc::clone(&state.tool_registry),
        app
    );

    Ok(AgentResponse {
        task_id: task_id.clone(),
        status: "running".to_string(),
    })
}

pub fn spawn_task_execution(
    tid: String,
    input_clone: String,
    task_manager_clone: Arc<TaskManager>,
    context_manager_clone: Arc<ContextManager>,
    tool_registry_clone: Arc<ToolRegistry>,
    app_clone: Option<AppHandle>
) {
    tauri::async_runtime::spawn(async move {
        let mut step_results: HashMap<String, String> = HashMap::new();
        let mut last_output = String::new();

        loop {
            let current_task_opt = task_manager_clone.get_task(&tid);
            if current_task_opt.is_none() { break; }
            let mut current_task = current_task_opt.unwrap();

            if current_task.current_step_index >= current_task.steps.len() {
                break;
            }

            let step_idx = current_task.current_step_index;
            let mut step = current_task.steps[step_idx].clone();

            if task_manager_clone.is_cancelled(&tid) {
                if let Some(ref h) = app_clone {
                    h.emit("agent_event", AgentEvent::TaskCancelled { task_id: tid.clone() }).unwrap();
                }
                return;
            }

            // --- 1. Handle Loop Logic ---
            if let Command::Loop { interval_ms, steps } = step.command {
                let mut iteration = current_task.loop_metadata.as_ref().map(|m| m.iteration).unwrap_or(0);

                if let Some(ref h) = app_clone {
                    if iteration == 0 {
                        h.emit("agent_event", AgentEvent::LoopStarted { task_id: tid.clone(), interval_ms }).unwrap();
                    } else {
                        h.emit("agent_event", AgentEvent::LoopRestored { task_id: tid.clone(), interval_ms }).unwrap();
                    }
                }

                loop {
                    if task_manager_clone.is_cancelled(&tid) {
                        if let Some(ref h) = app_clone {
                            h.emit("agent_event", AgentEvent::LoopStopped { task_id: tid.clone() }).unwrap();
                        }
                        return;
                    }

                    iteration += 1;
                    if let Some(ref h) = app_clone {
                        h.emit("agent_event", AgentEvent::LoopIteration { task_id: tid.clone(), iteration }).unwrap();
                    }

                    // Update loop metadata in state
                    let mut t = task_manager_clone.get_task(&tid).unwrap();
                    t.loop_metadata = Some(LoopMetadata {
                        iteration,
                        last_run: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
                    });
                    t.is_loop = true;
                    t.status = TaskStatus::Running;
                    task_manager_clone.add_task(t);

                    // Execute loop steps sequentially
                    for (i, cmd) in steps.iter().enumerate() {
                        let mut loop_step = TaskStep {
                            name: format!("Loop Iter {} - Step {}", iteration, i + 1),
                            status: StepStatus::Running,
                            command: cmd.clone(),
                            result: None,
                        };

                        // Resolve placeholders for this loop iteration
                        loop_step.command = Executor::resolve_placeholders(loop_step.command, &step_results).unwrap_or(cmd.clone());

                        let _ = Executor::execute_step(&loop_step, &loop_step.command, &tool_registry_clone).await;
                    }

                    tokio::time::sleep(Duration::from_millis(interval_ms)).await;
                }
            }

            // --- 2. Handle Conditional Branching ---
            if let Command::If { condition, then_steps, else_steps } = step.command {
                let resolved_if = Executor::resolve_placeholders(
                    Command::If { condition: condition.clone(), then_steps: then_steps.clone(), else_steps: else_steps.clone() },
                    &step_results
                ).unwrap();

                if let Command::If { condition: res_cond, .. } = resolved_if {
                    let cond_res = Executor::evaluate_condition(&res_cond, &tool_registry_clone).await.unwrap_or(false);

                    if let Some(ref h) = app_clone {
                        h.emit("agent_event", AgentEvent::ConditionEvaluated {
                            task_id: tid.clone(),
                            condition: format!("{:?}", res_cond),
                            result: cond_res
                        }).unwrap();
                    }

                    let branch = if cond_res { then_steps } else { else_steps };
                    let mut updated_task = task_manager_clone.get_task(&tid).unwrap();
                    let mut new_steps = updated_task.steps[..step_idx].to_vec();

                    for (i, cmd) in branch.into_iter().enumerate() {
                        let (tool, action, _) = Executor::get_command_info(&cmd);
                        new_steps.push(TaskStep {
                            name: format!("Branch {}: {}:{}", i+1, tool, action),
                            status: StepStatus::Pending,
                            command: cmd,
                            result: None
                        });
                    }

                    new_steps.extend(updated_task.steps[step_idx + 1..].to_vec());
                    updated_task.steps = new_steps;
                    task_manager_clone.add_task(updated_task);
                    continue;
                }
            }

            // --- 3. Resolve Placeholders ---
            match Executor::resolve_placeholders(step.command.clone(), &step_results) {
                Ok(resolved_cmd) => step.command = resolved_cmd,
                Err(e) => {
                    task_manager_clone.update_task_status(&tid, TaskStatus::Failed);
                    if let Some(ref h) = app_clone {
                        h.emit("agent_event", AgentEvent::TaskFailed { task_id: tid.clone(), error: e.clone() }).unwrap();
                    }
                    return;
                }
            }

            // --- 4. Permission Check ---
            let (tool_name, action, args) = Executor::get_command_info(&step.command);
            if let Some(tool) = tool_registry_clone.get_tool(tool_name) {
                let p_level = tool.permission_level(action);
                if p_level != PermissionLevel::Safe {
                    let msg = format!("PERMISSION REQUIRED [{:?}]\nTool: {}\nAction: {}\nArgs: {}", p_level, tool_name, action, args);

                    if let Some(ref h) = app_clone {
                        h.emit("agent_event", AgentEvent::ConfirmationRequired { task_id: tid.clone(), message: msg.clone(), level: p_level }).unwrap();
                    } else {
                        println!("\n⚠️  {}", msg);
                        print!("Confirm (y/n): ");
                        use std::io::{self, Write};
                        io::stdout().flush().unwrap();
                        let mut user_input = String::new();
                        io::stdin().read_line(&mut user_input).unwrap();
                        let _ = task_manager_clone.resolve_confirmation(&tid, user_input.trim().to_lowercase() == "y");
                    }

                    let rx = task_manager_clone.request_confirmation(&tid, msg);
                    let _ = rx.await;
                    if task_manager_clone.is_cancelled(&tid) { return; }
                }
            }

            // --- 5. Step Execution ---
            if let Some(ref h) = app_clone {
                h.emit("agent_event", AgentEvent::StepStarted { task_id: tid.clone(), step_index: step_idx, name: step.name.clone() }).unwrap();
            } else {
                println!("➔ Running Step {}: {}", step_idx + 1, step.name);
            }

            let result = Executor::execute_step(&step, &step.command, &tool_registry_clone).await;

            let (success, output) = match result {
                Ok(res) => {
                    let step_key = format!("step_{}", step_idx + 1);
                    step_results.insert(step_key, res.clone());
                    step_results.insert("last_result".to_string(), res.clone());
                    last_output = res.clone();
                    task_manager_clone.update_step_status(&tid, step_idx, StepStatus::Completed);
                    if let Some(ref h) = app_clone {
                        h.emit("agent_event", AgentEvent::StepCompleted { task_id: tid.clone(), step_index: step_idx, result: res.clone() }).unwrap();
                    }
                    (true, res)
                },
                Err(e) => {
                    task_manager_clone.update_step_status(&tid, step_idx, StepStatus::Failed);
                    last_output = e.clone();
                    (false, e)
                }
            };

            // --- 6. Observation & Replanning ---
            let observation = Observation {
                step_index: step_idx,
                output: output.clone(),
                success,
                metadata: None,
            };

            if let Some(ref h) = app_clone {
                h.emit("agent_event", AgentEvent::AgentObservation { task_id: tid.clone(), observation: observation.clone() }).unwrap();
            }

            let context_summary = context_manager_clone.get_context_summary();
            let remaining_steps = current_task.steps[step_idx + 1..].to_vec();

            match Replanner::replan(&input_clone, &context_summary, &observation, remaining_steps, &tool_registry_clone).await {
                Ok(new_remaining_steps) => {
                    let mut updated_task = task_manager_clone.get_task(&tid).unwrap();
                    let mut finished_steps = updated_task.steps[..=step_idx].to_vec();
                    finished_steps.extend(new_remaining_steps);
                    updated_task.steps = finished_steps;
                    updated_task.current_step_index = step_idx + 1;
                    task_manager_clone.add_task(updated_task);
                },
                Err(e) => {
                    println!("[Agent] Replanner failed: {}. Continuing with original plan.", e);
                    let mut updated_task = task_manager_clone.get_task(&tid).unwrap();
                    updated_task.current_step_index = step_idx + 1;
                    task_manager_clone.add_task(updated_task);
                }
            }

            if !success && task_manager_clone.get_task(&tid).unwrap().steps.len() <= step_idx + 1 {
                task_manager_clone.update_task_status(&tid, TaskStatus::Failed);
                if let Some(ref h) = app_clone {
                    h.emit("agent_event", AgentEvent::TaskFailed { task_id: tid.clone(), error: output.clone() }).unwrap();
                }
                context_manager_clone.push_history(input_clone.clone(), Some(format!("Error: {}", output)));
                return;
            }
        }

        task_manager_clone.update_task_status(&tid, TaskStatus::Completed);
        task_manager_clone.set_task_result(&tid, last_output.clone());
        if let Some(ref h) = app_clone {
            h.emit("agent_event", AgentEvent::TaskCompleted { task_id: tid.clone(), result: last_output.clone() }).unwrap();
        } else {
            println!("\n✅ Task Completed!\nResult: {}\n", last_output);
        }
        context_manager_clone.push_history(input_clone, Some(last_output));
    });
}

pub fn restore_loops(state: &AppState, app: Option<AppHandle>) {
    let tasks = state.task_manager.list_tasks();
    let mut restored_count = 0;

    for task in tasks {
        if task.is_loop && !task.cancelled && task.status != TaskStatus::Failed && task.status != TaskStatus::Completed {
            println!("[TaskManager] Restoring loop task: {}", task.id);
            spawn_task_execution(
                task.id.clone(),
                task.input.clone(),
                Arc::clone(&state.task_manager),
                Arc::clone(&state.context_manager),
                Arc::clone(&state.tool_registry),
                app.clone()
            );
            restored_count += 1;
        }
    }

    if restored_count > 0 {
        println!("[TaskManager] Successfully restored {} loop tasks", restored_count);
    }
}

#[tauri::command]
async fn respond_to_confirmation(task_id: String, confirmed: bool, state: State<'_, AppState>) -> Result<(), String> {
    state.task_manager.resolve_confirmation(&task_id, confirmed)
}

#[tauri::command]
async fn cancel_task(task_id: String, state: State<'_, AppState>, app: AppHandle) -> Result<(), String> {
    state.task_manager.cancel_task(&task_id);
    app.emit("agent_event", AgentEvent::TaskCancelled { task_id }).unwrap();
    Ok(())
}

#[tauri::command]
fn get_status(task_id: String, state: State<'_, AppState>) -> Option<Task> {
    state.task_manager.get_task(&task_id)
}

#[tauri::command]
fn list_tasks(state: State<'_, AppState>) -> Vec<Task> {
    state.task_manager.list_tasks()
}

#[tauri::command]
fn clear_context(state: State<'_, AppState>) -> Result<(), String> {
    state.context_manager.clear_context();
    Ok(())
}

#[tauri::command]
fn list_tools(state: State<'_, AppState>) -> Vec<(String, String)> {
    state.tool_registry.list_tools().into_iter().map(|(n, d)| (n.to_string(), d.to_string())).collect()
}

#[tauri::command]
fn add_goal(description: String, target_state: String, state: State<'_, AppState>, app: AppHandle) -> Result<(), String> {
    let goal = Goal {
        id: format!("goal_{}", SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs()),
        description,
        target_state,
        active: true,
        last_evaluation: 0,
    };
    state.goal_manager.add_goal(goal, Some(&app));
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let _ = dotenvy::dotenv();

  tauri::Builder::default()
    .setup(|app| {
      let data_path = app.path().app_data_dir().unwrap_or_else(|_| std::path::PathBuf::from("."));
      if !data_path.exists() {
          let _ = std::fs::create_dir_all(&data_path).unwrap();
      }
      let storage_path = data_path.join("tasks.json");
      let context_path = data_path.join("context.json");
      let goals_path = data_path.join("goals.json");

      let task_manager = Arc::new(TaskManager::new(Some(storage_path)));
      let context_manager = Arc::new(ContextManager::new(Some(context_path)));
      let goal_manager = Arc::new(GoalManager::new(Some(goals_path)));
      let tool_registry = Arc::new(ToolRegistry::new());

      let state = AppState {
          task_manager,
          context_manager,
          goal_manager,
          tool_registry
      };

      // Restore active loops
      restore_loops(&state, Some(app.handle().clone()));

      let context_manager_for_timer = Arc::clone(&state.context_manager);
      tauri::async_runtime::spawn(async move {
          loop {
              let snapshot = SensorTool::get_system_snapshot();
              context_manager_for_timer.update_system_state(snapshot);
              tokio::time::sleep(Duration::from_secs(5)).await;
          }
      });

      // Start Trigger Manager
      TriggerManager::start_watcher(app.handle().clone());

      // Start Goal Evaluation Loop
      crate::state::goal_manager::start_evaluation_loop(app.handle().clone());

      app.manage(state);

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        run_agent,
        get_status,
        list_tasks,
        cancel_task,
        respond_to_confirmation,
        clear_context,
        list_tools,
        add_goal
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
