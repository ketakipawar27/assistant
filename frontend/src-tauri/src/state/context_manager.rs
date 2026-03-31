use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::{Arc, Mutex};
use std::fs;
use std::path::PathBuf;
use crate::state::context_compressor::ContextCompressor;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandHistory {
    pub input: String,
    pub result: Option<String>, // Legacy field, mapped to full_result for backward compat
    pub full_result: Option<String>,
    pub compressed_result: Option<String>,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Context {
    pub history: Vec<CommandHistory>,
    pub last_result: Option<String>,
    pub system_state: Option<Value>,
}

pub struct ContextManager {
    pub context: Arc<Mutex<Context>>,
    pub storage_path: Option<PathBuf>,
}

impl ContextManager {
    pub fn new(storage_path: Option<PathBuf>) -> Self {
        let mut context = Context {
            history: Vec::new(),
            last_result: None,
            system_state: None,
        };

        if let Some(ref path) = storage_path {
            if path.exists() {
                if let Ok(content) = fs::read_to_string(path) {
                    if let Ok(mut loaded_context) = serde_json::from_str::<Context>(&content) {
                        // Migration logic for old history entries
                        for entry in &mut loaded_context.history {
                            if entry.full_result.is_none() && entry.result.is_some() {
                                entry.full_result = entry.result.clone();
                                if entry.compressed_result.is_none() {
                                    entry.compressed_result = Some(ContextCompressor::compress(entry.result.clone().unwrap()));
                                }
                            }
                        }
                        context = loaded_context;
                        println!("[ContextManager] Loaded {} history entries", context.history.len());
                    }
                }
            }
        }

        Self {
            context: Arc::new(Mutex::new(context)),
            storage_path,
        }
    }

    fn save_to_disk(&self) {
        if let Some(ref path) = self.storage_path {
            let ctx = self.context.lock().unwrap();
            if let Ok(content) = serde_json::to_string_pretty(&*ctx) {
                if let Err(e) = fs::write(path, content) {
                    eprintln!("[ContextManager] Failed to save context: {}", e);
                }
            }
        }
    }

    pub fn push_history(&self, input: String, result: Option<String>) {
        let mut ctx = self.context.lock().unwrap();
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let compressed = result.clone().map(ContextCompressor::compress);

        ctx.history.push(CommandHistory {
            input,
            result: result.clone(), // Maintain legacy for now
            full_result: result.clone(),
            compressed_result: compressed,
            timestamp,
        });

        if ctx.history.len() > 20 {
            ctx.history.remove(0);
        }

        if result.is_some() {
            ctx.last_result = result;
        }

        drop(ctx);
        self.save_to_disk();
    }

    pub fn update_system_state(&self, state: Value) {
        let mut ctx = self.context.lock().unwrap();
        ctx.system_state = Some(state);
        drop(ctx);
        self.save_to_disk();
    }

    pub fn get_last_result(&self) -> Option<String> {
        let ctx = self.context.lock().unwrap();
        ctx.last_result.clone()
    }

    pub fn get_context_summary(&self) -> String {
        let ctx = self.context.lock().unwrap();
        let mut summary = String::from("### Recent History:\n");
        for h in &ctx.history {
            summary.push_str(&format!("- User: {}\n", h.input));

            // USE COMPRESSED RESULT for the summary/prompt
            if let Some(res) = &h.compressed_result {
                summary.push_str(&format!("  Assistant: {}\n", res));
            } else if let Some(res) = &h.full_result {
                // Fallback for missing compressed result
                let truncated = if res.len() > 200 { format!("{}...", &res[..200]) } else { res.clone() };
                summary.push_str(&format!("  Assistant: {}\n", truncated));
            }
        }

        if let Some(ref state) = ctx.system_state {
            summary.push_str("\n### Current System Environment:\n");
            summary.push_str(&serde_json::to_string_pretty(state).unwrap_or_else(|_| "Unavailable".to_string()));
        }

        if let Some(last) = &ctx.last_result {
            // Also compress last result if it's huge
            let compressed_last = ContextCompressor::compress(last.clone());
            summary.push_str(&format!("\n\n### Last Command Result:\n{}", compressed_last));
        }
        summary
    }

    pub fn clear_context(&self) {
        let mut ctx = self.context.lock().unwrap();
        ctx.history.clear();
        ctx.last_result = None;
        ctx.system_state = None;
        drop(ctx);
        self.save_to_disk();
    }
}
