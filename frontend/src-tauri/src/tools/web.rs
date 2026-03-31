use crate::tools::tool::Tool;
use crate::agent::models::PermissionLevel;
use async_trait::async_trait;
use serde_json::json;
use reqwest::header::{USER_AGENT, HeaderMap};

pub struct WebTool;

#[async_trait]
impl Tool for WebTool {
    fn name(&self) -> &str { "web" }
    fn description(&self) -> &str { "Searches the web and extracts information from the internet" }
    fn example_usage(&self) -> &str { "web:search(query=\"rust programming\") - Returns top search results" }
    fn actions(&self) -> Vec<&str> { vec!["search"] }

    fn permission_level(&self, _action: &str) -> PermissionLevel {
        PermissionLevel::Safe
    }

    async fn execute(&self, action: String, args: String) -> Result<String, String> {
        match action.as_str() {
            "search" => self.search(args).await,
            _ => Err(format!("Unknown action for web: {}", action)),
        }
    }
}

impl WebTool {
    async fn search(&self, query: String) -> Result<String, String> {
        let client = reqwest::Client::new();
        let mut headers = HeaderMap::new();
        headers.insert(USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36".parse().unwrap());

        // Using DuckDuckGo's VQD-based API or just a simple search interface.
        // For a more robust implementation, one would use SerpAPI, but let's try a direct approach first.
        // Note: Scraping search engines directly can be brittle. In a production app, an API key-based service is preferred.

        let url = format!("https://duckduckgo.com/html/?q={}", urlencoding::encode(&query));

        let response = client.get(url)
            .headers(headers)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        let html = response.text().await.map_err(|e| format!("Failed to read body: {}", e))?;

        // Simple extraction logic for DuckDuckGo HTML results
        // In a real app, use a library like 'scraper' (nipper/select.rs)
        // Here we'll do some basic string manipulation to get snippets for the demonstration.

        let mut results = Vec::new();
        let fragments: Vec<&str> = html.split("<div class=\"result__body\">").collect();

        for fragment in fragments.iter().skip(1).take(5) {
            let title = self.extract_tag(fragment, "result__a", "</a>");
            let link = self.extract_attr(fragment, "href=\"", "\"");
            let snippet = self.extract_tag(fragment, "result__snippet", "</a>"); // DuckDuckGo HTML structure varies

            results.push(json!({
                "title": title.replace("&amp;", "&").trim(),
                "link": link,
                "snippet": snippet.replace("&amp;", "&").trim()
            }));
        }

        if results.is_empty() {
             // Fallback for when the HTML structure isn't what we expect
             return Ok(json!({
                "query": query,
                "results": [],
                "note": "No results found or HTML structure changed. Consider using an official Search API."
             }).to_string());
        }

        Ok(json!({
            "query": query,
            "results": results
        }).to_string())
    }

    fn extract_tag(&self, text: &str, class: &str, end: &str) -> String {
        if let Some(start_idx) = text.find(class) {
            if let Some(inner_start) = text[start_idx..].find(">") {
                let actual_start = start_idx + inner_start + 1;
                if let Some(end_idx) = text[actual_start..].find(end) {
                    let raw = &text[actual_start..actual_start + end_idx];
                    return self.strip_html(raw);
                }
            }
        }
        "N/A".to_string()
    }

    fn extract_attr(&self, text: &str, start_pattern: &str, end_pattern: &str) -> String {
        if let Some(start_idx) = text.find(start_pattern) {
            let actual_start = start_idx + start_pattern.len();
            if let Some(end_idx) = text[actual_start..].find(end_pattern) {
                return text[actual_start..actual_start + end_idx].to_string();
            }
        }
        "N/A".to_string()
    }

    fn strip_html(&self, html: &str) -> String {
        let mut result = String::new();
        let mut in_tag = false;
        for c in html.chars() {
            if c == '<' { in_tag = true; continue; }
            if c == '>' { in_tag = false; continue; }
            if !in_tag { result.push(c); }
        }
        result
    }
}
