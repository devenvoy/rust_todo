use crate::todo_model::Todo;
use anyhow::Result;
use dirs::data_local_dir;
use log::debug;
use rusqlite::{params, Connection};
use std::fs;
use std::path::PathBuf;

fn db_connection() -> rusqlite::Result<Connection> {
    let path = get_database_path("rust_todo", "data.db3");
    Connection::open(path)
}

fn get_database_path(app_name: &str, db_name: &str) -> PathBuf {
    let mut base_dir = data_local_dir().expect("Cannot find local data directory");
    base_dir.push(app_name);

    fs::create_dir_all(&base_dir).expect("Failed to create app directory");

    base_dir.push(db_name);
    debug!("{}", db_name);
    base_dir
}

#[tauri::command]
pub fn initialize_db() -> Result<(), String> {
    let conn = db_connection().map_err(|e| e.to_string())?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS todo_table (
             id      INTEGER PRIMARY KEY AUTOINCREMENT,
             title   TEXT NOT NULL,
             summary TEXT,
             done    INTEGER NOT NULL
         )",
        [],
    )
    .map_err(|e| {
        debug!("{:?}",e.to_string());
        e.to_string()
    })?;
    Ok(())
}

#[tauri::command]
pub fn load() -> Result<Vec<Todo>, String> {
    let con = db_connection().map_err(|e| e.to_string())?;

    let mut stmt = con
        .prepare("SELECT id, title, summary, done FROM todo_table")
        .map_err(|e| e.to_string())?;

    let todos_iter = stmt
        .query_map([], |row| {
            Ok(Todo {
                id: row.get(0)?,
                title: row.get(1)?,
                summary: row.get(2)?,
                done: row.get::<_, i64>(3)? != 0,
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
pub fn upsert(todo: Todo) -> Result<u32, String> {
    let con = db_connection().map_err(|e| e.to_string())?;

    match todo.id {
        None => {
            con.execute(
                "INSERT INTO todo_table (title, summary, done) VALUES (?1, ?2, ?3)",
                params![todo.title, todo.summary, todo.done as i32],
            )
            .map_err(|e| e.to_string())?;
            let new_id = con.last_insert_rowid() as u32;
            Ok(new_id)
        }
        Some(id) => {
            con.execute(
                "INSERT INTO todo_table (id, title, summary, done)
                     VALUES (?1, ?2, ?3, ?4)
                 ON CONFLICT(id) DO UPDATE SET
                     title = excluded.title,
                     summary = excluded.summary,
                     done    = excluded.done",
                params![id, todo.title, todo.summary, todo.done as i32],
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
