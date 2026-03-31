use std::collections::HashMap;
use crate::tools::tool::Tool;
use crate::tools::apps::AppsTool;
use crate::tools::fs::FsTool;
use crate::tools::system::SystemTool;
use crate::tools::shell::ShellTool;
use crate::tools::sensor::SensorTool;
use crate::tools::web::WebTool;

pub struct ToolRegistry {
    pub tools: HashMap<String, Box<dyn Tool>>,
}

impl ToolRegistry {
    pub fn new() -> Self {
        let mut tools: HashMap<String, Box<dyn Tool>> = HashMap::new();

        let apps = Box::new(AppsTool);
        tools.insert(apps.name().to_string(), apps);

        let fs = Box::new(FsTool);
        tools.insert(fs.name().to_string(), fs);

        let system = Box::new(SystemTool);
        tools.insert(system.name().to_string(), system);

        let shell = Box::new(ShellTool);
        tools.insert(shell.name().to_string(), shell);

        let sensor = Box::new(SensorTool);
        tools.insert(sensor.name().to_string(), sensor);

        let web = Box::new(WebTool);
        tools.insert(web.name().to_string(), web);

        Self { tools }
    }

    pub fn get_tool(&self, name: &str) -> Option<&dyn Tool> {
        self.tools.get(name).map(|b| b.as_ref())
    }

    pub fn list_tools(&self) -> Vec<(&str, &str)> {
        self.tools.iter().map(|(n, t)| (n.as_str(), t.description())).collect()
    }
}
