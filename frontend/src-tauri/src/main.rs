// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::{self, Write};
use std::sync::Arc;
use std::time::Duration;
use app_lib::state::task_manager::TaskManager;
use app_lib::state::context_manager::ContextManager;
use app_lib::tools::registry::ToolRegistry;
use app_lib::tools::sensor::SensorTool;
use app_lib::AppState;

#[tokio::main]
async fn main() {
    let args: Vec<String> = std::env::args().collect();

    // Check if --cli flag is passed
    if args.len() > 1 && args[1] == "--cli" {
        run_cli().await;
    } else {
        app_lib::run();
    }
}

async fn run_cli() {
    let _ = dotenvy::dotenv();
    println!("--- Titan.OS CLI Mode ---");
    println!("Type 'exit' to quit. Use 'clear' to reset memory.\n");

    let task_manager = Arc::new(TaskManager::new(None)); // In-memory for CLI testing
    let context_manager = Arc::new(ContextManager::new(None));
    let tool_registry = Arc::new(ToolRegistry::new());

    let state = AppState {
        task_manager,
        context_manager,
        tool_registry,
    };

    // Restore loops in CLI too (though storage is None here by default,
    // it's good practice for when we enable it)
    app_lib::restore_loops(&state, None);

    let context_manager_for_timer = Arc::clone(&state.context_manager);
    tokio::spawn(async move {
        loop {
            let snapshot = SensorTool::get_system_snapshot();
            context_manager_for_timer.update_system_state(snapshot);
            tokio::time::sleep(Duration::from_secs(5)).await;
        }
    });

    loop {
        print!("> ");
        io::stdout().flush().unwrap();

        let mut input = String::new();
        io::stdin().read_line(&mut input).unwrap();
        let input = input.trim().to_string();

        if input == "exit" {
            break;
        }

        if input == "clear" {
            state.context_manager.clear_context();
            println!("Memory cleared.");
            continue;
        }

        if input.is_empty() {
            continue;
        }

        match app_lib::process_agent_input(input, &state, None).await {
            Ok(res) => {
                println!("[Task Started] ID: {}", res.task_id);
            }
            Err(e) => {
                println!("Error: {}", e);
            }
        }

        // Small sleep to let background task output print nicely
        tokio::time::sleep(std::time::Duration::from_millis(100)).await;
    }
}
