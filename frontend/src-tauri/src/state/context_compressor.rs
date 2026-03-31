use serde_json::Value;

pub struct ContextCompressor;

impl ContextCompressor {
    pub fn compress(data: String) -> String {
        if data.len() < 500 {
            return data;
        }

        // Check if it's JSON
        if let Ok(json_val) = serde_json::from_str::<Value>(&data) {
            return Self::compress_json(&json_val);
        }

        // If it's just plain text and too long, truncate intelligently
        let truncated = &data[..497];
        format!("{}...", truncated)
    }

    fn compress_json(val: &Value) -> String {
        match val {
            Value::Object(map) => {
                let mut compressed_map = serde_json::Map::new();
                for (k, v) in map {
                    // Filter out likely noisy or redundant keys if needed
                    // For now, just truncate large string values inside the JSON
                    let compressed_v = match v {
                        Value::String(s) if s.len() > 200 => {
                            Value::String(format!("{}... [TRUNCATED]", &s[..197]))
                        }
                        Value::Array(arr) if arr.len() > 10 => {
                            Value::String(format!("[Array of {} items]", arr.len()))
                        }
                        _ => v.clone(),
                    };
                    compressed_map.insert(k.clone(), compressed_v);
                }
                Value::Object(compressed_map).to_string()
            }
            Value::Array(arr) => {
                format!("[Array of {} items]", arr.len())
            }
            _ => val.to_string(),
        }
    }
}
