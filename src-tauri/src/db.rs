use anyhow::Result;
use chrono::Utc;
use dirs::data_local_dir;
use rusqlite::{params, Connection};
use std::fs;
use std::path::PathBuf;

fn get_db_path() -> PathBuf {
    let mut path = data_local_dir().expect("Cannot find local data directory");
    path.push("taskflow");
    fs::create_dir_all(&path).expect("Failed to create taskflow directory");
    path.push("db.sqlite");
    path
}

pub fn get_connection() -> Result<Connection> {
    Ok(Connection::open(get_db_path())?)
}

pub fn initialize_db() -> Result<()> {
    let conn = get_connection()?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            color TEXT NOT NULL DEFAULT '#5cbd5c',
            is_inbox INTEGER NOT NULL DEFAULT 0,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS labels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            color TEXT NOT NULL DEFAULT '#4f7dff'
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            is_completed INTEGER NOT NULL DEFAULT 0,
            priority INTEGER NOT NULL DEFAULT 4,
            due_date INTEGER,
            project_id INTEGER,
            label_ids TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE SET NULL
        )",
        [],
    )?;

    let inbox_exists: i32 = conn.query_row(
        "SELECT COUNT(*) FROM projects WHERE is_inbox = 1",
        [],
        |row| row.get(0),
    )?;

    if inbox_exists == 0 {
        let now = Utc::now().timestamp();
        conn.execute(
            "INSERT INTO projects (name, color, is_inbox, sort_order, created_at) VALUES ('Inbox', '#5cbd5c', 1, 0, ?)",
            params![now],
        )?;
    }

    Ok(())
}
