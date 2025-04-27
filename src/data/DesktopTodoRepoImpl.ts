import { invoke } from "@tauri-apps/api/core";
import { Todo, TaskRepository } from "./TodoRepository";

export class DesktopTaskManager implements TaskRepository {
    private tasks: Todo[] = [];

    constructor() {
        this.loadTasksFromDB();
    }

    async createTask(title: string, summary: string) {
        const todo: Todo = {
            title,
            summary,
            done: false, 
        };

        await invoke('upsert', { todo });
        await this.loadTasksFromDB();
    }

    async updateTask(todo: Todo) {
        await invoke('upsert', { todo })
        await this.loadTasksFromDB();
    }

    async deleteTask(index: number): Promise<void> {
        const taskToDelete = this.tasks[index];
        if (!taskToDelete) return;

        // Load all todos to find matching task
        const todos: Todo[] = await invoke('load');

        const matchingTodo = todos.find(
            (t) => t.title === taskToDelete.title && t.summary === taskToDelete.summary
        );

        if (matchingTodo && matchingTodo.id !== undefined) {
            await invoke('delete', { id: matchingTodo.id });
            await this.loadTasksFromDB();
        }
    }

    getTasks(): Todo[] {
        return this.tasks;
    }

    private async loadTasksFromDB(): Promise<void> {
        const todos: Todo[] = await invoke('load');
        this.tasks = todos.map(todo => ({
            id: todo.id,
            title: todo.title,
            summary: todo.summary,
            done: todo.done
        }));
    }
}
