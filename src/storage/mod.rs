use crate::todo_model::Todo;
use std::{fs, io::Error, path::PathBuf};

fn db_path() -> PathBuf {
    dirs_next::home_dir()
        .expect("Home dir not found")
        .join(".rust_todo.json")
}

pub fn load() -> Result<Vec<Todo>, Error> {
    let path = db_path();
    if !path.exists() {
        return Ok(Vec::new());
    }
    let data = fs::read_to_string(path)?;
    let todos = serde_json::from_str(&data)?;
    Ok(todos)
}

pub fn save(todos: &[Todo]) -> Result<(), Error> {
    let data = serde_json::to_string_pretty(todos)?;
    fs::write(db_path(), data)
}
