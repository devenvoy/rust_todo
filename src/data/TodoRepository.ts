
export interface Todo {
    id?: number;
    title: string;
    summary: string;
    done:boolean
}

export interface TaskRepository {
    createTask(title: string, summary: string): void;
    deleteTask(index: number): void;
    getTasks(): Todo[];
}
