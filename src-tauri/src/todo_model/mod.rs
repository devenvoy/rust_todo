use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Todo {
    pub id: Option<u32>,
    pub title: String,
    pub summary: String,
    pub done: bool,
}
