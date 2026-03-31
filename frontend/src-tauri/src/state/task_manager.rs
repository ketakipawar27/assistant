use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::fs;
use std::path::PathBuf;
use crate::agent::models::{Task, TaskStatus, StepStatus};
use tokio::sync::oneshot;

pub struct TaskManager {
    pub tasks: Arc<Mutex<HashMap<String, Task>>>,
    pub confirmation_channels: Arc<Mutex<HashMap<String, oneshot::Sender<bool>>>>,
    pub storage_path: Option<PathBuf>,
}

impl TaskManager {
    pub fn new(storage_path: Option<PathBuf>) -> Self {
        let mut tasks = HashMap::new();

        // Load existing tasks if storage_path exists
        if let Some(ref path) = storage_path {
            if path.exists() {
                if let Ok(content) = fs::read_to_string(path) {
                    if let Ok(mut loaded_tasks) = serde_json::from_str::<HashMap<String, Task>>(&content) {
                        println!("[TaskManager] Loaded {} tasks from storage", loaded_tasks.len());
                        // Cleanup: Mark interrupted tasks as failed, EXCEPT loops which we will restore
                        for task in loaded_tasks.values_mut() {
                            if (task.status == TaskStatus::Running || task.status == TaskStatus::Confirming) && !task.is_loop {
                                println!("[TaskManager] Recovering task {}: Marking as Failed (interrupted)", task.id);
                                task.status = TaskStatus::Failed;
                                task.result = Some("System restart interrupted task".to_string());
                            }
                        }
                        tasks = loaded_tasks;
                    }
                }
            }
        }

        Self {
            tasks: Arc::new(Mutex::new(tasks)),
            confirmation_channels: Arc::new(Mutex::new(HashMap::new())),
            storage_path,
        }
    }

    pub fn save_to_disk(&self) {
        if let Some(ref path) = self.storage_path {
            let tasks = self.tasks.lock().unwrap();
            if let Ok(content) = serde_json::to_string_pretty(&*tasks) {
                if let Err(e) = fs::write(path, content) {
                    eprintln!("[TaskManager] Failed to save tasks to disk: {}", e);
                }
            }
        }
    }

    pub fn add_task(&self, task: Task) {
        let mut tasks = self.tasks.lock().unwrap();
        tasks.insert(task.id.clone(), task);
        drop(tasks);
        self.save_to_disk();
    }

    pub fn get_task(&self, id: &str) -> Option<Task> {
        let tasks = self.tasks.lock().unwrap();
        tasks.get(id).cloned()
    }

    pub fn list_tasks(&self) -> Vec<Task> {
        let tasks = self.tasks.lock().unwrap();
        let mut list: Vec<Task> = tasks.values().cloned().collect();
        // Sort by created_at descending
        list.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        list
    }

    pub fn update_task_status(&self, id: &str, status: TaskStatus) {
        let mut tasks = self.tasks.lock().unwrap();
        if let Some(task) = tasks.get_mut(id) {
            task.status = status;
        }
        drop(tasks);
        self.save_to_disk();
    }

    pub fn update_step_status(&self, id: &str, step_index: usize, status: StepStatus) {
        let mut tasks = self.tasks.lock().unwrap();
        if let Some(task) = tasks.get_mut(id) {
            if let Some(step) = task.steps.get_mut(step_index) {
                step.status = status;
                task.current_step_index = step_index;
            }
        }
        drop(tasks);
        self.save_to_disk();
    }

    pub fn set_task_result(&self, id: &str, result: String) {
        let mut tasks = self.tasks.lock().unwrap();
        if let Some(task) = tasks.get_mut(id) {
            task.result = Some(result);
        }
        drop(tasks);
        self.save_to_disk();
    }

    pub fn cancel_task(&self, id: &str) {
        let mut tasks = self.tasks.lock().unwrap();
        if let Some(task) = tasks.get_mut(id) {
            task.cancelled = true;
            task.status = TaskStatus::Cancelled;
        }
        drop(tasks);
        self.save_to_disk();
    }

    pub fn is_cancelled(&self, id: &str) -> bool {
        let tasks = self.tasks.lock().unwrap();
        tasks.get(id).map(|t| t.cancelled).unwrap_or(false)
    }

    pub fn request_confirmation(&self, id: &str, message: String) -> oneshot::Receiver<bool> {
        let (tx, rx) = oneshot::channel();

        let mut tasks = self.tasks.lock().unwrap();
        if let Some(task) = tasks.get_mut(id) {
            task.status = TaskStatus::Confirming;
            task.requires_confirmation = true;
            task.confirmation_message = Some(message);
        }
        drop(tasks);
        self.save_to_disk();

        let mut channels = self.confirmation_channels.lock().unwrap();
        channels.insert(id.to_string(), tx);

        rx
    }

    pub fn resolve_confirmation(&self, id: &str, confirmed: bool) -> Result<(), String> {
        let mut channels = self.confirmation_channels.lock().unwrap();
        if let Some(tx) = channels.remove(id) {
            tx.send(confirmed).map_err(|_| "Failed to send confirmation".to_string())?;

            let mut tasks = self.tasks.lock().unwrap();
            if let Some(task) = tasks.get_mut(id) {
                task.requires_confirmation = false;
                if !confirmed {
                    task.status = TaskStatus::Cancelled;
                    task.cancelled = true;
                } else {
                    task.status = TaskStatus::Running;
                }
            }
            drop(tasks);
            self.save_to_disk();
            Ok(())
        } else {
            Err("No pending confirmation found for this task".to_string())
        }
    }
}
