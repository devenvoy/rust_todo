use serde::{Deserialize, Serialize};
use crate::models::Task;
use anyhow::Result;
use tauri::command;

#[derive(Serialize, Deserialize, Debug)]
struct ChatCompletionRequest {
    model: String,
    messages: Vec<Message>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Message {
    role: String,
    content: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct ChatCompletionResponse {
    choices: Vec<Choice>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Choice {
    message: Message,
}

#[derive(Serialize, Deserialize, Debug)]
struct ModelListResponse {
    data: Vec<Model>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Model {
    id: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct AppSettings {
    ai_api_key: String,
    ai_model: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            ai_api_key: String::new(),
            ai_model: String::from("gpt-4"),
        }
    }
}

fn get_settings() -> Result<AppSettings> {
    Ok(AppSettings::default())
}

#[command]
pub async fn fetch_models() -> Result<Vec<String>, String> {
    let settings = get_settings().map_err(|e| e.to_string())?;
    if settings.ai_api_key.is_empty() {
        return Err("API Key is missing. Please configure it in settings.".to_string());
    }

    let client = reqwest::Client::new();
    let response = client
        .get("https://api.openai.com/v1/models")
        .header("Authorization", format!("Bearer {}", settings.ai_api_key))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<ModelListResponse>()
        .await
        .map_err(|e| e.to_string())?;

    let mut models: Vec<String> = response.data.into_iter().map(|m| m.id).collect();
    models.sort();
    Ok(models)
}

#[command]
pub async fn generate_subtasks(objective: String, api_key: Option<String>) -> Result<Vec<Task>, String> {
    let settings = get_settings().map_err(|e| e.to_string())?;
    let api_key = api_key.unwrap_or(settings.ai_api_key);
    
    if api_key.is_empty() {
        return Err("API Key is missing. Please provide an API key.".to_string());
    }
    let client = reqwest::Client::new();

    let prompt = format!(
        "Break down the following broad objective into a structured list of actionable To-Dos with clear titles and brief summaries. Return only a JSON array of objects with 'title' and 'summary' fields. Objective: {}",
        objective
    );

    let request = ChatCompletionRequest {
        model: settings.ai_model,
        messages: vec![
            Message {
                role: "system".to_string(),
                content: "You are an expert project manager. Break down broad goals into smaller, logical steps. Return ONLY valid JSON.".to_string(),
            },
            Message {
                role: "user".to_string(),
                content: prompt,
            },
        ],
    };

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&request)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<ChatCompletionResponse>()
        .await
        .map_err(|e| e.to_string())?;

    let content = response.choices.get(0).ok_or("No response from AI")?.message.content.clone();
    
    let subtasks: Vec<serde_json::Value> = serde_json::from_str(&content).unwrap_or_default();
    
    let now = chrono::Utc::now().timestamp();
    let mut todos = Vec::new();
    for task in subtasks {
        todos.push(Task {
            id: None,
            title: task["title"].as_str().unwrap_or("New Task").to_string(),
            description: task["summary"].as_str().map(String::from),
            is_completed: false,
            priority: 4,
            due_date: None,
            project_id: None,
            label_ids: None,
            sort_order: todos.len() as i32,
            created_at: now,
            updated_at: now,
        });
    }

    Ok(todos)
}

#[command]
pub async fn chat_with_ai(message: String, api_key: Option<String>) -> Result<String, String> {
    let settings = get_settings().map_err(|e| e.to_string())?;
    let api_key = api_key.unwrap_or(settings.ai_api_key);
    
    if api_key.is_empty() {
        return Err("API Key is missing. Please provide an API key.".to_string());
    }
    let client = reqwest::Client::new();

    let prompt = format!(
        "You are an AI Productivity Assistant. Be helpful and provide concise responses.\n\nUser Question: {}",
        message
    );

    let request = ChatCompletionRequest {
        model: settings.ai_model,
        messages: vec![
            Message {
                role: "system".to_string(),
                content: "You are an AI Productivity Assistant. Be helpful, concise, and professional.".to_string(),
            },
            Message {
                role: "user".to_string(),
                content: prompt,
            },
        ],
    };

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&request)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<ChatCompletionResponse>()
        .await
        .map_err(|e| e.to_string())?;

    Ok(response.choices.get(0).ok_or("No response from AI")?.message.content.clone())
}
