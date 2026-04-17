# Todoist MVP Desktop App

Build a Todoist MVP desktop application using Rust (Tauri) for the backend and React + TypeScript + Tailwind CSS for the frontend, communicating via local SQLite database.

## User Review Required

The project will be built in a new root directory `taskflow` under the current workspace (`rust_todo`). 
Since there are existing files in `rust_todo`, they will be ignored but maintained. Please confirm if you want me to delete the existing files in `rust_todo` or safely proceed inside `taskflow`.

## Proposed Changes

We will implement the 13-step implementation order precisely as outlined in the prompt specifications.

### Project Foundation

- Scaffold a new standard Vite+React+TS app inside `taskflow`.
- Initialize Tauri backend using `cargo tauri init` inside `taskflow`.
- Add backend dependencies (`rusqlite`, `tokio`, `serde`, `chrono`) to `src-tauri/Cargo.toml`.
- Add frontend dependencies (`zustand`, `tailwindcss`, `lucide-react`, `date-fns`, `@dnd-kit/*`, `@tauri-apps/*`) to `package.json`.
- Initialize Tailwind CSS logic for the project.

### Backend implementation (Rust + SQLite)

#### [NEW] src-tauri/src/db.rs
Initialize SQLite connection, ensure DB file `~/.taskflow/db.sqlite` is created, apply table migrations, and seed Inbox project.

#### [NEW] src-tauri/src/models.rs
Define all Rust structs for `Task`, `Project`, `Label`.

#### [NEW] src-tauri/src/commands/tasks.rs
Implement CRUD endpoints for Tasks including `get_tasks`, `create_task`, `update_task`, `delete_task`, `toggle_task_complete`, and `reorder_tasks`.

#### [NEW] src-tauri/src/commands/projects.rs
Implement CRUD endpoints for Projects.

#### [NEW] src-tauri/src/commands/labels.rs
Implement CRUD endpoints for Labels.

#### [MODIFY] src-tauri/src/main.rs
Wire commands, initialize DB schema and state, and run Tauri app.

### Frontend implementation (React + TS)

#### [NEW] src/store/appStore.ts
Implement Zustand store binding frontend state tightly to the Rust backend (Tauri commands).

#### [NEW] src/hooks/useTasks.ts & useProjects.ts
React custom hooks wrapping Zustand state access.

#### [NEW] src/components/Sidebar.tsx
List Inbox, Today, Upcoming smart views. Show "My Projects" and "My Labels" sections mapping from Zustand store.

#### [NEW] src/components/TaskInput.tsx
Quick-add implementation with NLP features for hashtags (`#project`), labels (`@label`), and priority flags (`p1-p4`).

#### [NEW] src/components/TaskList.tsx & TaskItem.tsx
Primary view for tasks displaying checkboxes, priority indicators, label chips. Support drag-and-drop reordering with `@dnd-kit`.

#### [NEW] src/components/TaskDetail.tsx
Slide-in right hand panel for markdown description editing, sub-tasks management, dates, and priorities.

#### [NEW] src/App.tsx & main.tsx
Application layout structure, initializing keyboard shortcuts (e.g., `q` to open quick-add, `e` edit), and mounting router/views.

## Open Questions

None. Proceeding strictly by specification.

## Verification Plan

### Manual Verification
1. Run `cargo tauri dev` to build and verify application rendering.
2. Create, Edit, Delete Task: verify local DB updates.
3. Switch Smart Views (Today, Upcoming, Inbox).
4. Perform drag and drop reordering and verify DB persists `sort_order`.
5. Interact with "TaskDetail" to update and save subtasks.
6. Make sure all styling aligns with Todoist UI (colors, layouts).
