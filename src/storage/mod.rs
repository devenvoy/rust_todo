use crate::todo_model::Todo;
use rusqlite::{Connection, Error, Result, params};

fn db_connection() -> Result<Connection> {
    Connection::open("./data.db3")
}

pub fn initialize_db() -> Result<()> {
    db_connection()?.execute(
        "CREATE TABLE IF NOT EXISTS todo_app (
             id      INTEGER PRIMARY KEY AUTOINCREMENT,
             content TEXT    NOT NULL,
             done    INTEGER NOT NULL
         )",
        [],
    )?;
    Ok(())
}

pub fn load() -> Result<Vec<Todo>> {
    let con = db_connection()?;
    let mut stmt = con.prepare("SELECT id, content, done FROM todo_app")?;
    let todos_iter = stmt.query_map([], |row| {
        Ok(Todo {
            id: row.get(0)?,
            content: row.get(1)?,
            done: row.get::<_, i64>(2)? != 0, // SQLite stores booleans as 0/1
        })
    })?;
    let mut todos = Vec::new();
    for todo in todos_iter {
        todos.push(todo?);
    }
    Ok(todos)
}

pub fn upsert(todo: &Todo) -> Result<u32> {
    let con = db_connection()?;

    match todo.id {
        None => {
            con.execute(
                "INSERT INTO todo_app (content, done) VALUES (?1, ?2)",
                params![todo.content, todo.done as i32],
            )?;
            let new_id = con.last_insert_rowid() as u32;
            Ok(new_id)
        }
        Some(id) => {
            con.execute(
                "INSERT INTO todo_app (id, content, done)
                     VALUES (?1, ?2, ?3)
                 ON CONFLICT(id) DO UPDATE SET
                     content = excluded.content,
                     done    = excluded.done",
                params![id, todo.content, todo.done as i32],
            )?;
            Ok(id)
        }
    }
}

pub fn delete(id: u32) -> Result<usize, Error> {
    let con = db_connection()?;
    con.execute("DELETE FROM todo_app WHERE id = ?", params![id])
}
