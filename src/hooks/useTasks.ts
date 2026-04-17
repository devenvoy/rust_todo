import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

export function useTasks() {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask, toggleTaskComplete, reorderTasks, isLoading } = useAppStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  return { tasks, createTask, updateTask, deleteTask, toggleTaskComplete, reorderTasks, refresh: fetchTasks, isLoading };
}

export function useProjects() {
  const { projects, fetchProjects, createProject, updateProject, deleteProject } = useAppStore();

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, createProject, updateProject, deleteProject, refresh: fetchProjects };
}

export function useLabels() {
  const { labels, fetchLabels, createLabel, deleteLabel } = useAppStore();

  useEffect(() => {
    fetchLabels();
  }, []);

  return { labels, createLabel, deleteLabel, refresh: fetchLabels };
}