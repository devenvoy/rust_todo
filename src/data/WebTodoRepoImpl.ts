import { Todo, TaskRepository } from './TodoRepository';

export class WebTaskRepository implements TaskRepository {
  private tasks: Todo[] = [];

  constructor() {
    this.loadTasks();
  }

  createTask(title: string, summary: string): void {
    const newTask: Todo = { title, summary ,done:false};
    this.tasks.push(newTask);
    this.saveTasks();
  }

  deleteTask(index: number): void {
    this.tasks.splice(index, 1);
    this.saveTasks();
  }

  getTasks(): Todo[] {
    return this.tasks;
  }

  private loadTasks(): void {
    const loadedTasks = localStorage.getItem('tasks');
    this.tasks = loadedTasks ? JSON.parse(loadedTasks) : [];
  }

  private saveTasks(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
}
