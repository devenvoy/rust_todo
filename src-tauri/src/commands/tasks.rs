use crate::db::get_connection;
use crate::models::Task;
use anyhow::Result;
use chrono::Utc;
use rusqlite::params;

#[tauri::command]
pub fn get_tasks(project_id: Option<i64>) -> Result<Vec<Task>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;

    let query = match project_id {
        Some(_) => "SELECT id, title, description, is_completed, priority, due_date, project_id, label_ids, sort_order, created_at, updated_at FROM tasks WHERE project_id = ? ORDER BY sort_order",
        None => "SELECT id, title, description, is_completed, priority, due_date, project_id, label_ids, sort_order, created_at, updated_at FROM tasks ORDER BY sort_order",
    };

    let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

    let tasks: Vec<Task> = if let Some(pid) = project_id {
        stmt.query_map([pid], row_to_task)
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect()
    } else {
        stmt.query_map([], row_to_task)
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect()
    };

    Ok(tasks)
}

#[tauri::command]
pub fn get_task(id: i64) -> Result<Task, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT id, title, description, is_completed, priority, due_date, project_id, label_ids, sort_order, created_at, updated_at FROM tasks WHERE id = ?",
        [id],
        row_to_task,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_task(
    title: String,
    project_id: Option<i64>,
    priority: Option<i32>,
    due_date: Option<i64>,
    label_ids: Option<String>,
) -> Result<Task, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now().timestamp();

    let max_order: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(sort_order), 0) FROM tasks WHERE project_id = ?",
            [project_id.unwrap_or(1)],
            |row| row.get(0),
        )
        .unwrap_or(0);

    conn.execute(
        "INSERT INTO tasks (title, project_id, priority, due_date, label_ids, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        params![title, project_id.unwrap_or(1), priority.unwrap_or(4), due_date, label_ids, max_order + 1, now, now],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    get_task(id)
}

#[tauri::command]
pub fn update_task(task: Task) -> Result<Task, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now().timestamp();

    conn.execute(
        "UPDATE tasks SET title = ?, description = ?, is_completed = ?, priority = ?, due_date = ?, project_id = ?, label_ids = ?, sort_order = ?, updated_at = ? WHERE id = ?",
        params![task.title, task.description, task.is_completed as i32, task.priority, task.due_date, task.project_id, task.label_ids, task.sort_order, now, task.id],
    )
    .map_err(|e| e.to_string())?;

    get_task(task.id.unwrap())
}

#[tauri::command]
pub fn delete_task(id: i64) -> Result<(), String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tasks WHERE id = ?", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn toggle_task_complete(id: i64) -> Result<Task, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now().timestamp();

    conn.execute(
        "UPDATE tasks SET is_completed = NOT is_completed, updated_at = ? WHERE id = ?",
        params![now, id],
    )
    .map_err(|e| e.to_string())?;

    get_task(id)
}

#[tauri::command]
pub fn reorder_tasks(task_ids: Vec<i64>) -> Result<(), String> {
    let conn = get_connection().map_err(|e| e.to_string())?;

    for (index, id) in task_ids.iter().enumerate() {
        conn.execute(
            "UPDATE tasks SET sort_order = ? WHERE id = ?",
            params![index as i32, id],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}

fn row_to_task(row: &rusqlite::Row) -> rusqlite::Result<Task> {
    Ok(Task {
        id: Some(row.get(0)?),
        title: row.get(1)?,
        description: row.get(2)?,
        is_completed: row.get::<_, i32>(3)? != 0,
        priority: row.get(4)?,
        due_date: row.get(5)?,
        project_id: row.get(6)?,
        label_ids: row.get(7)?,
        sort_order: row.get(8)?,
        created_at: row.get(9)?,
        updated_at: row.get(10)?,
    })
}
