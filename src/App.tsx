import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { Sidebar } from './components/Sidebar';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { TaskDetail } from './components/TaskDetail';

export default function App() {
  const { selectedTaskId, currentView, projects, fetchProjects, fetchLabels, fetchTasks } = useAppStore();

  useEffect(() => {
    fetchProjects();
    fetchLabels();
    fetchTasks();
  }, []);

  const getViewTitle = () => {
    if (currentView === 'inbox') return 'Inbox';
    if (currentView === 'today') return 'Today';
    if (currentView === 'upcoming') return 'Upcoming';
    const project = projects.find(p => p.id === currentView);
    return project?.name || 'Tasks';
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 py-3 border-b border-[#e0e0e0]">
          <h1 className="text-lg font-semibold text-[#1a1a1a]">{getViewTitle()}</h1>
        </div>
        <TaskInput />
        <TaskList />
      </div>
      {selectedTaskId && <TaskDetail />}
    </div>
  );
}