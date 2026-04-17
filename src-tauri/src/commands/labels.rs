use crate::db::get_connection;
use crate::models::Label;
use anyhow::Result;
use rusqlite::params;

#[tauri::command]
pub fn get_labels() -> Result<Vec<Label>, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, color FROM labels ORDER BY name")
        .map_err(|e| e.to_string())?;

    let labels = stmt
        .query_map([], |row| {
            Ok(Label {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                color: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(labels)
}

#[tauri::command]
pub fn create_label(name: String, color: Option<String>) -> Result<Label, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO labels (name, color) VALUES (?, ?)",
        params![name, color.unwrap_or_else(|| "#4f7dff".to_string())],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    conn.query_row(
        "SELECT id, name, color FROM labels WHERE id = ?",
        [id],
        |row| {
            Ok(Label {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                color: row.get(2)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_label(label: Label) -> Result<Label, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE labels SET name = ?, color = ? WHERE id = ?",
        params![label.name, label.color, label.id],
    )
    .map_err(|e| e.to_string())?;

    conn.query_row(
        "SELECT id, name, color FROM labels WHERE id = ?",
        [label.id.unwrap()],
        |row| {
            Ok(Label {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                color: row.get(2)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_label(id: i64) -> Result<(), String> {
    let conn = get_connection().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM labels WHERE id = ?", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
