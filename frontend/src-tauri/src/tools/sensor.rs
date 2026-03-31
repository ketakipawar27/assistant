use crate::tools::tool::Tool;
use crate::agent::models::PermissionLevel;
use async_trait::async_trait;
use sysinfo::{System, Disks, Components};
use serde_json::json;

pub struct SensorTool;

impl SensorTool {
    pub fn get_system_snapshot() -> serde_json::Value {
        let mut sys = System::new_all();
        sys.refresh_all();

        let cpu_usage = sys.global_cpu_usage();
        let total_memory = sys.total_memory();
        let used_memory = sys.used_memory();
        let mem_usage = (used_memory as f32 / total_memory as f32) * 100.0;

        let disks = Disks::new_with_refreshed_list();
        let disk_info: Vec<_> = disks.iter().map(|d| {
            let total = d.total_space();
            let available = d.available_space();
            let used = total - available;
            let usage_pct = if total > 0 { (used as f32 / total as f32) * 100.0 } else { 0.0 };

            json!({
                "name": d.name().to_string_lossy(),
                "mount": d.mount_point().to_string_lossy(),
                "total_gb": total / 1024 / 1024 / 1024,
                "available_gb": available / 1024 / 1024 / 1024,
                "usage_percent": usage_pct
            })
        }).collect();

        let mut battery_info = json!(null);
        let components = Components::new_with_refreshed_list();
        for component in components.iter() {
            let label = component.label().to_lowercase();
            if label.contains("battery") || label.contains("charge") {
                 battery_info = json!({
                    "label": component.label(),
                    "temp": component.temperature(),
                });
                break;
            }
        }

        json!({
            "cpu_percent": cpu_usage,
            "ram_percent": mem_usage,
            "disks": disk_info,
            "battery": battery_info,
            "timestamp": std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs()
        })
    }
}

#[async_trait]
impl Tool for SensorTool {
    fn name(&self) -> &str { "sensor" }
    fn description(&self) -> &str { "Monitors system resources (CPU, RAM, Disk, Battery)" }
    fn example_usage(&self) -> &str { "sensor:get_status() - Returns real-time system metrics" }
    fn actions(&self) -> Vec<&str> { vec!["get_status"] }

    fn permission_level(&self, _action: &str) -> PermissionLevel {
        PermissionLevel::Safe
    }

    async fn execute(&self, action: String, _args: String) -> Result<String, String> {
        if action != "get_status" {
            return Err(format!("Unknown action for sensor: {}", action));
        }

        let snapshot = Self::get_system_snapshot();
        Ok(snapshot.to_string())
    }
}
