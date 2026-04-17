use crate::db::get_connection;
use crate::models::Project;
use anyhow::Result;
use chrono::Utc;
use rusqlite::params;

#[tauri::command]
pub fn get_projects() -> Result<Vec<Project>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, color, is_inbox, sort_order, created_at FROM projects ORDER BY sort_order")
        .map_err(|e| e.to_string())?;

    let projects = stmt
        .query_map([], |row| {
            Ok(Project {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                color: row.get(2)?,
                is_inbox: row.get::<_, i32>(3)? != 0,
                sort_order: row.get(4)?,
                created_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(projects)
}

#[tauri::command]
pub fn get_project(id: i64) -> Result<Project, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT id, name, color, is_inbox, sort_order, created_at FROM projects WHERE id = ?",
        [id],
        |row| {
            Ok(Project {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                color: row.get(2)?,
                is_inbox: row.get::<_, i32>(3)? != 0,
                sort_order: row.get(4)?,
                created_at: row.get(5)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_project(name: String, color: Option<String>) -> Result<Project, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now().timestamp();

    let max_order: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(sort_order), 0) FROM projects",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    conn.execute(
        "INSERT INTO projects (name, color, sort_order, created_at) VALUES (?, ?, ?, ?)",
        params![
            name,
            color.unwrap_or_else(|| "#5cbd5c".to_string()),
            max_order + 1,
            now
        ],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    get_project(id)
}

#[tauri::command]
pub fn update_project(project: Project) -> Result<Project, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE projects SET name = ?, color = ?, sort_order = ? WHERE id = ?",
        params![project.name, project.color, project.sort_order, project.id],
    )
    .map_err(|e| e.to_string())?;

    get_project(project.id.unwrap())
}

#[tauri::command]
pub fn delete_project(id: i64) -> Result<(), String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute("UPDATE tasks SET project_id = 1 WHERE project_id = ?", [id])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM projects WHERE id = ? AND is_inbox = 0", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
