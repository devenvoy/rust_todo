import { Task, useAppStore } from '../store/appStore';
import { Flag } from 'lucide-react';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTaskComplete, setSelectedTask, selectedTaskId } = useAppStore();

  const priorityColors = {
    1: '#e74444',
    2: '#f5a623',
    3: '#f5b829',
    4: '#9e9e9e',
  };

  return (
    <div
      onClick={() => setSelectedTask(task.id)}
      className={`group flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-[#f0f0f0] transition-colors ${
        task.is_completed ? 'opacity-60' : ''
      } ${selectedTaskId === task.id ? 'bg-[#e8e8e8]' : ''}`}
    >
      <button
        onClick={e => {
          e.stopPropagation();
          toggleTaskComplete(task.id!);
        }}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          task.is_completed
            ? 'bg-[#5cbd5c] border-[#5cbd5c]'
            : 'border-[#aaa] hover:border-[#777]'
        }`}
      >
        {task.is_completed && <span className="text-white text-xs">✓</span>}
      </button>
      <span
        className={`text-sm flex-1 truncate ${
          task.is_completed ? 'line-through text-[#888]' : 'text-[#1a1a1a]'
        }`}
      >
        {task.title}
      </span>
      {task.priority < 4 && (
        <Flag size={14} style={{ color: priorityColors[task.priority as keyof typeof priorityColors] }} />
      )}
    </div>
  );
}

export function TaskList() {
  const { tasks, currentView } = useAppStore();

  const filteredTasks = tasks.filter(task => {
    if (currentView === 'inbox') {
      return !task.project_id || task.project_id === 1;
    }
    if (currentView === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.getTime() / 1000;
      const todayEnd = todayStart + 86400;
      return task.due_date && task.due_date >= todayStart && task.due_date < todayEnd;
    }
    if (currentView === 'upcoming') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.getTime() / 1000;
      return task.due_date && task.due_date > todayStart;
    }
    return task.project_id === currentView;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => a.sort_order - b.sort_order);

  if (sortedTasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#888] text-sm">
        No tasks
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {sortedTasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}