import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface Task {
  id: number | null;
  title: string;
  description: string | null;
  is_completed: boolean;
  priority: number;
  due_date: number | null;
  project_id: number | null;
  label_ids: string | null;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

export interface Project {
  id: number | null;
  name: string;
  color: string;
  is_inbox: boolean;
  sort_order: number;
  created_at: number;
}

export interface Label {
  id: number | null;
  name: string;
  color: string;
}

interface AppState {
  tasks: Task[];
  projects: Project[];
  labels: Label[];
  selectedProjectId: number | null;
  selectedTaskId: number | null;
  currentView: 'inbox' | 'today' | 'upcoming' | number;
  isLoading: boolean;
  fetchTasks: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchLabels: () => Promise<void>;
  createTask: (title: string, projectId?: number, priority?: number, dueDate?: number, labelIds?: string) => Promise<Task>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleTaskComplete: (id: number) => Promise<void>;
  reorderTasks: (taskIds: number[]) => Promise<void>;
  createProject: (name: string, color?: string) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  createLabel: (name: string, color?: string) => Promise<void>;
  updateLabel: (label: Label) => Promise<void>;
  deleteLabel: (id: number) => Promise<void>;
  setSelectedProject: (id: number | null) => void;
  setSelectedTask: (id: number | null) => void;
  setCurrentView: (view: 'inbox' | 'today' | 'upcoming' | number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  tasks: [],
  projects: [],
  labels: [],
  selectedProjectId: null,
  selectedTaskId: null,
  currentView: 'inbox',
  isLoading: false,

  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const tasks = await invoke<Task[]>('get_tasks', { projectId: get().selectedProjectId });
      set({ tasks, isLoading: false });
    } catch (e) {
      console.error('Failed to fetch tasks:', e);
      set({ isLoading: false });
    }
  },

  fetchProjects: async () => {
    try {
      const projects = await invoke<Project[]>('get_projects');
      set({ projects });
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    }
  },

  fetchLabels: async () => {
    try {
      const labels = await invoke<Label[]>('get_labels');
      set({ labels });
    } catch (e) {
      console.error('Failed to fetch labels:', e);
    }
  },

  createTask: async (title, projectId, priority = 4, dueDate = undefined, labelIds = undefined) => {
    const task = await invoke<Task>('create_task', {
      title,
      project_id: projectId ?? 1,
      priority,
      due_date: dueDate,
      label_ids: labelIds,
    });
    await get().fetchTasks();
    return task;
  },

  updateTask: async (task: Task) => {
    console.log('Updating task:', task);
    await invoke('update_task', { task });
    await get().fetchTasks();
  },

  deleteTask: async (id) => {
    console.log('Deleting task:', id);
    await invoke('delete_task', { id });
    await get().fetchTasks();
    if (get().selectedTaskId === id) {
      set({ selectedTaskId: null });
    }
  },

  toggleTaskComplete: async (id) => {
    await invoke('toggle_task_complete', { id });
    await get().fetchTasks();
  },

  reorderTasks: async (taskIds) => {
    await invoke('reorder_tasks', { taskIds });
    await get().fetchTasks();
  },

  createProject: async (name, color = '#5cbd5c') => {
    console.log('Creating project:', name, color);
    await invoke('create_project', { name, color });
    await get().fetchProjects();
  },

  updateProject: async (project) => {
    await invoke('update_project', { project });
    await get().fetchProjects();
  },

  deleteProject: async (id) => {
    console.log('Deleting project:', id);
    await invoke('delete_project', { id });
    await get().fetchProjects();
    await get().fetchTasks();
  },

  createLabel: async (name, color = '#4f7dff') => {
    console.log('Creating label:', name, color);
    await invoke('create_label', { name, color });
    await get().fetchLabels();
  },

  updateLabel: async (label: Label) => {
    console.log('Updating label:', label);
    await invoke('update_label', { label });
    await get().fetchLabels();
  },

  deleteLabel: async (id) => {
    console.log('Deleting label:', id);
    await invoke('delete_label', { id });
    await get().fetchLabels();
  },

  setSelectedProject: (id: number | null) => set({ selectedProjectId: id, currentView: id ?? 'inbox' }),
  setSelectedTask: (id: number | null) => set({ selectedTaskId: id }),
  setCurrentView: (view: 'inbox' | 'today' | 'upcoming' | number | null) => set({ currentView: view ?? 'inbox', selectedProjectId: typeof view === 'number' ? view : null }),
}));