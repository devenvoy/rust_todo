use crate::todo_model::{TaskStatus, Todo};
use anyhow::Result;
use chrono::Utc;
use dirs::data_local_dir;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProductivityLog {
    pub id: Option<u32>,
    pub timestamp: i64,
    pub window_title: String,
    pub activity_type: String, // Productive, Slow, Not Working
    pub duration: u32,         // in seconds
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Settings {
    pub ai_api_key: String,
    pub ai_model: String,
    pub ai_provider: String,
}

fn db_connection() -> rusqlite::Result<Connection> {
    let path = get_database_path("rust_todo", "data.db3");
    Connection::open(path)
}

fn get_database_path(app_name: &str, db_name: &str) -> PathBuf {
    let mut base_dir = data_local_dir().expect("Cannot find local data directory");
    base_dir.push(app_name);
    fs::create_dir_all(&base_dir).expect("Failed to create app directory");
    base_dir.push(db_name);
    base_dir
}

#[tauri::command]
pub fn initialize_db() -> Result<(), String> {
    let conn = db_connection().map_err(|e| e.to_string())?;
    
    // Create Todo table with nesting and status
    conn.execute(
        "CREATE TABLE IF NOT EXISTS todo_table (
             id          INTEGER PRIMARY KEY AUTOINCREMENT,
             parent_id   INTEGER,
             title       TEXT NOT NULL,
             summary     TEXT,
             status      TEXT NOT NULL,
             done        INTEGER NOT NULL,
             created_at  INTEGER NOT NULL,
             updated_at  INTEGER NOT NULL,
             FOREIGN KEY(parent_id) REFERENCES todo_table(id) ON DELETE CASCADE
         )",
        [],
    )
    .map_err(|e| e.to_string())?;

    // Create Productivity Logs table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS productivity_logs (
             id            INTEGER PRIMARY KEY AUTOINCREMENT,
             timestamp     INTEGER NOT NULL,
             window_title  TEXT NOT NULL,
             activity_type TEXT NOT NULL,
             duration      INTEGER NOT NULL
         )",
        [],
    )
    .map_err(|e| e.to_string())?;

    // Create Settings table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
             id           INTEGER PRIMARY KEY CHECK (id = 1),
             ai_api_key   TEXT NOT NULL,
             ai_model     TEXT NOT NULL,
             ai_provider  TEXT NOT NULL
         )",
        [],
    )
    .map_err(|e| e.to_string())?;

    // Initialize with default settings if not exists
    conn.execute(
        "INSERT OR IGNORE INTO settings (id, ai_api_key, ai_model, ai_provider) 
         VALUES (1, '', 'gpt-4o-mini', 'openai')",
        [],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn load() -> Result<Vec<Todo>, String> {
    let con = db_connection().map_err(|e| e.to_string())?;

    let mut stmt = con
        .prepare("SELECT id, parent_id, title, summary, status, done, created_at, updated_at FROM todo_table")
        .map_err(|e| e.to_string())?;

    let todos_iter = stmt
        .query_map([], |row| {
            let status_str: String = row.get(4)?;
            let status = match status_str.as_str() {
                "IN_PROGRESS" => TaskStatus::InProgress,
                "DONE" => TaskStatus::Done,
                "CRITICAL" => TaskStatus::Critical,
                _ => TaskStatus::Backlog,
            };

            Ok(Todo {
                id: row.get(0)?,
                parent_id: row.get(1)?,
                title: row.get(2)?,
                summary: row.get(3)?,
                status,
                done: row.get::<_, i64>(5)? != 0,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut todos = Vec::new();
    for todo in todos_iter {
        todos.push(todo.map_err(|e| e.to_string())?);
    }

    Ok(todos)
}

#[tauri::command]
pub fn upsert(mut todo: Todo) -> Result<u32, String> {
    let con = db_connection().map_err(|e| e.to_string())?;
    let now = Utc::now().timestamp();
    todo.updated_at = now;

    let status_str = match todo.status {
        TaskStatus::Backlog => "BACKLOG",
        TaskStatus::InProgress => "IN_PROGRESS",
        TaskStatus::Done => "DONE",
        TaskStatus::Critical => "CRITICAL",
    };

    match todo.id {
        None => {
            todo.created_at = now;
            con.execute(
                "INSERT INTO todo_table (parent_id, title, summary, status, done, created_at, updated_at) 
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![todo.parent_id, todo.title, todo.summary, status_str, todo.done as i32, todo.created_at, todo.updated_at],
            )
            .map_err(|e| e.to_string())?;
            let new_id = con.last_insert_rowid() as u32;
            Ok(new_id)
        }
        Some(id) => {
            con.execute(
                "UPDATE todo_table SET 
                 parent_id = ?1, title = ?2, summary = ?3, status = ?4, done = ?5, updated_at = ?6 
                 WHERE id = ?7",
                params![todo.parent_id, todo.title, todo.summary, status_str, todo.done as i32, now, id],
            )
            .map_err(|e| e.to_string())?;
            Ok(id)
        }
    }
}

#[tauri::command]
pub fn delete(id: u32) -> Result<usize, String> {
    let con = db_connection().map_err(|e| e.to_string())?;
    con.execute("DELETE FROM todo_table WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;
    Ok(1)
}

#[tauri::command]
pub fn log_productivity(log: ProductivityLog) -> Result<(), String> {
    let con = db_connection().map_err(|e| e.to_string())?;
    con.execute(
        "INSERT INTO productivity_logs (timestamp, window_title, activity_type, duration) 
         VALUES (?1, ?2, ?3, ?4)",
        params![log.timestamp, log.window_title, log.activity_type, log.duration],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_productivity_stats(days: u32) -> Result<Vec<ProductivityLog>, String> {
    let con = db_connection().map_err(|e| e.to_string())?;
    let start_time = Utc::now().timestamp() - (days as i64 * 86400);

    let mut stmt = con
        .prepare("SELECT id, timestamp, window_title, activity_type, duration FROM productivity_logs WHERE timestamp > ?")
        .map_err(|e| e.to_string())?;

    let logs_iter = stmt
        .query_map([start_time], |row| {
            Ok(ProductivityLog {
                id: row.get(0)?,
                timestamp: row.get(1)?,
                window_title: row.get(2)?,
                activity_type: row.get(3)?,
                duration: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut logs = Vec::new();
    for log in logs_iter {
        logs.push(log.map_err(|e| e.to_string())?);
    }

    Ok(logs)
}
#[tauri::command]
pub fn get_settings() -> Result<Settings, String> {
    let con = db_connection().map_err(|e| e.to_string())?;
    let mut stmt = con
        .prepare("SELECT ai_api_key, ai_model, ai_provider FROM settings WHERE id = 1")
        .map_err(|e| e.to_string())?;

    let settings = stmt
        .query_row([], |row| {
            Ok(Settings {
                ai_api_key: row.get(0)?,
                ai_model: row.get(1)?,
                ai_provider: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(settings)
}

#[tauri::command]
pub fn update_settings(settings: Settings) -> Result<(), String> {
    let con = db_connection().map_err(|e| e.to_string())?;
    con.execute(
        "UPDATE settings SET ai_api_key = ?1, ai_model = ?2, ai_provider = ?3 WHERE id = 1",
        params![settings.ai_api_key, settings.ai_model, settings.ai_provider],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
