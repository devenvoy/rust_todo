import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { X } from 'lucide-react';

export function TaskDetail() {
  const { selectedTaskId, tasks, updateTask, deleteTask, setSelectedTask, projects } = useAppStore();
  const task = tasks.find(t => t.id === selectedTaskId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(4);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      if (task.due_date) {
        const date = new Date(task.due_date * 1000);
        setDueDate(date.toISOString().split('T')[0]);
      }
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    if (!task) return;
    const updatedTask = {
      ...task,
      title,
      description: description || null,
      priority,
      due_date: dueDate ? Math.floor(new Date(dueDate).getTime() / 1000) : null,
      sort_order: task.sort_order || 0,
      created_at: task.created_at || Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    };
    console.log('Saving task:', updatedTask);
    await updateTask(updatedTask);
  };

  const handleDelete = async () => {
    if (confirm('Delete this task?')) {
      await deleteTask(task.id!);
    }
  };

  const priorityOptions = [
    { value: 1, label: 'P1', color: '#e74444' },
    { value: 2, label: 'P2', color: '#f5a623' },
    { value: 3, label: 'P3', color: '#f5b829' },
    { value: 4, label: 'P4', color: '#9e9e9e' },
  ];

  return (
    <div className="w-80 bg-white h-full border-l border-[#e0e0e0] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#e0e0e0]">
        <span className="text-sm font-medium text-[#888]">Task Details</span>
        <button onClick={() => setSelectedTask(null)} className="text-[#888] hover:text-[#555]">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleSave}
            className="w-full text-lg font-medium text-[#1a1a1a] border-none outline-none bg-transparent"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[#888] uppercase">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            onBlur={handleSave}
            placeholder="Add a description..."
            className="w-full mt-1 p-2 text-sm text-[#1a1a1a] bg-[#f5f5f5] rounded-md outline-none resize-none"
            rows={4}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[#888] uppercase">Priority</label>
          <div className="flex gap-2 mt-2">
            {priorityOptions.map(p => (
              <button
                key={p.value}
                onClick={() => { setPriority(p.value); setTimeout(handleSave, 0); }}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  priority === p.value ? 'text-white' : 'bg-[#f5f5f5] text-[#555]'
                }`}
                style={{ backgroundColor: priority === p.value ? p.color : undefined }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[#888] uppercase">Due Date</label>
          <input
            type="date"
            value={dueDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => { setDueDate(e.target.value); setTimeout(handleSave, 0); }}
            className="w-full mt-1 p-2 text-sm text-[#1a1a1a] bg-[#f5f5f5] rounded-md outline-none focus:ring-2 focus:ring-[#5cbd5c] focus:ring-opacity-50"
          />
          {dueDate && (
            <button
              onClick={() => { setDueDate(''); setTimeout(handleSave, 0); }}
              className="text-xs text-[#888] hover:text-[#e74444] mt-1"
            >
              Clear date
            </button>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-[#888] uppercase">Project</label>
          <select
            value={task.project_id || ''}
            onChange={e => { updateTask({ ...task, project_id: parseInt(e.target.value) || null }); }}
            className="w-full mt-1 p-2 text-sm text-[#1a1a1a] bg-[#f5f5f5] rounded-md outline-none"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id!}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 border-t border-[#e0e0e0]">
        <button
          onClick={handleDelete}
          className="w-full py-2 text-sm text-[#e74444] hover:bg-[#fef2f2] rounded-md transition-colors"
        >
          Delete Task
        </button>
      </div>
    </div>
  );
}