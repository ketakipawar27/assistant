use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq)]
pub enum PermissionLevel {
    Safe,
    Medium,
    Dangerous,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Condition {
    FileExists(String),
    Contains { target: String, pattern: String },
    Equals { a: String, b: String },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "action", content = "args", rename_all = "snake_case")]
pub enum Command {
    OpenApp { target: String },
    ListFiles { path: Option<String> },
    ReadFile { path: String },
    DeleteFile { path: String },
    SystemInfo,
    Shell { script: String },
    WebSearch { query: String },
    If {
        condition: Condition,
        then_steps: Vec<Command>,
        else_steps: Vec<Command>
    },
    Loop {
        interval_ms: u64,
        steps: Vec<Command>,
    },
    Unknown { input: String },
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum TaskStatus {
    Idle,
    Running,
    Confirming,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum StepStatus {
    Pending,
    Running,
    Completed,
    Failed,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TaskStep {
    pub name: String,
    pub status: StepStatus,
    pub command: Command,
    pub result: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Trigger {
    Interval(u64),
    SystemCondition(String),
    FileWatch(String),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: String,
    pub input: String,
    pub status: TaskStatus,
    pub steps: Vec<TaskStep>,
    pub current_step_index: usize,
    pub result: Option<String>,
    pub created_at: u64,
    pub cancelled: bool,
    pub requires_confirmation: bool,
    pub confirmation_message: Option<String>,
    pub context_buffer: HashMap<String, String>,
    pub is_loop: bool,
    pub loop_interval: Option<u64>,
    pub loop_metadata: Option<LoopMetadata>,
    pub trigger: Option<Trigger>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LoopMetadata {
    pub iteration: u64,
    pub last_run: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Observation {
    pub step_index: usize,
    pub output: String,
    pub success: bool,
    pub metadata: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Goal {
    pub id: String,
    pub description: String,
    pub target_state: String,
    pub active: bool,
    pub last_evaluation: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "payload", rename_all = "snake_case")]
pub enum AgentEvent {
    TaskStarted { task_id: String },
    StepStarted { task_id: String, step_index: usize, name: String },
    StepCompleted { task_id: String, step_index: usize, result: String },
    AgentObservation { task_id: String, observation: Observation },
    ConditionEvaluated { task_id: String, condition: String, result: bool },
    LoopStarted { task_id: String, interval_ms: u64 },
    LoopRestored { task_id: String, interval_ms: u64 },
    LoopIteration { task_id: String, iteration: u64 },
    LoopStopped { task_id: String },
    TaskCompleted { task_id: String, result: String },
    TaskFailed { task_id: String, error: String },
    TaskCancelled { task_id: String },
    ConfirmationRequired { task_id: String, message: String, level: PermissionLevel },
    TriggerFired { task_id: String, trigger_type: String },
    GoalCreated { goal_id: String, description: String },
    GoalTriggered { goal_id: String },
    GoalSatisfied { goal_id: String },
    GoalFailed { goal_id: String, error: String },
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AgentResponse {
    pub task_id: String,
    pub status: String,
}
