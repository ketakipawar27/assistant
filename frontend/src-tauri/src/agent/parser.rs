use crate::agent::models::Command;

pub struct Parser;

impl Parser {
    pub fn parse_input(input: &str) -> Vec<Command> {
        println!("[Parser] Parsing input: {}", input);

        // Split by " then " or " and then " to support basic chaining
        let parts: Vec<&str> = input
            .split(" then ")
            .flat_map(|s| s.split(" and then "))
            .collect();

        parts.iter().map(|s| Self::parse_single_command(s.trim())).collect()
    }

    fn parse_single_command(input: &str) -> Command {
        let input_lower = input.to_lowercase();

        if input_lower.contains("open notepad") {
            Command::OpenApp { target: "notepad".to_string() }
        } else if input_lower.contains("open browser") {
            Command::OpenApp { target: "browser".to_string() }
        } else if input_lower.contains("list files") {
             // Handle "list files in C:\test"
             let path = if input_lower.contains(" in ") {
                 Some(input_lower.split(" in ").nth(1).unwrap_or("").to_string())
             } else {
                 None
             };
            Command::ListFiles { path }
        } else if input_lower.contains("system info") {
            Command::SystemInfo
        } else if input_lower.contains("run shell") {
            let script = input.splitn(3, ' ').nth(2).unwrap_or("").to_string();
            Command::Shell { script }
        } else if input_lower.contains("read file") {
             let path = input.replace("read file", "").trim().to_string();
             Command::ReadFile { path }
        } else {
            Command::Unknown { input: input.to_string() }
        }
    }
}
