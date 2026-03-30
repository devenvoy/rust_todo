use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum TaskStatus {
    Backlog,
    InProgress,
    Done,
    Critical,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Todo {
    pub id: Option<u32>,
    pub parent_id: Option<u32>,
    pub title: String,
    pub summary: String,
    pub status: TaskStatus,
    pub done: bool,
    pub created_at: i64,
    pub updated_at: i64,
}
