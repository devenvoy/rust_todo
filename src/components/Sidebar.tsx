import { useAppStore } from '../store/appStore';
import { Inbox, Calendar, CalendarDays, Plus, Trash2 } from 'lucide-react';

export function Sidebar() {
  const { projects, labels, currentView, setCurrentView, createProject, createLabel, deleteProject, deleteLabel } = useAppStore();

  const handleCreateProject = async () => {
    const name = prompt('Project name:');
    if (name) await createProject(name);
  };

  const handleCreateLabel = async () => {
    const name = prompt('Label name:');
    if (name) await createLabel(name);
  };

  const handleDeleteProject = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this project?')) {
      await deleteProject(id);
    }
  };

  const handleDeleteLabel = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this label?')) {
      await deleteLabel(id);
    }
  };

  return (
    <div className="w-64 bg-[#f5f5f5] h-full flex flex-col border-r border-[#e0e0e0]">
      <div className="p-3">
        <button
          onClick={() => setCurrentView('inbox')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === 'inbox' ? 'bg-[#e0e0e0] text-[#1a1a1a]' : 'text-[#555] hover:bg-[#e8e8e8]'
          }`}
        >
          <Inbox size={18} />
          <span>Inbox</span>
        </button>
        <button
          onClick={() => setCurrentView('today')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === 'today' ? 'bg-[#e0e0e0] text-[#1a1a1a]' : 'text-[#555] hover:bg-[#e8e8e8]'
          }`}
        >
          <Calendar size={18} />
          <span>Today</span>
        </button>
        <button
          onClick={() => setCurrentView('upcoming')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === 'upcoming' ? 'bg-[#e0e0e0] text-[#1a1a1a]' : 'text-[#555] hover:bg-[#e8e8e8]'
          }`}
        >
          <CalendarDays size={18} />
          <span>Upcoming</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="flex items-center justify-between mb-2 mt-4">
          <span className="text-xs font-semibold text-[#888] uppercase">Projects</span>
          <button onClick={handleCreateProject} className="text-[#888] hover:text-[#555]">
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-0.5">
          {projects.filter(p => !p.is_inbox).map(project => (
            <div
              key={project.id}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                currentView === project.id ? 'bg-[#e0e0e0] text-[#1a1a1a]' : 'text-[#555] hover:bg-[#e8e8e8]'
              }`}
            >
              <button onClick={() => setCurrentView(project.id!)} className="flex items-center gap-2 flex-1">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: project.color }} />
                <span className="truncate">{project.name}</span>
              </button>
              <button onClick={(e) => handleDeleteProject(project.id!, e)} className="opacity-0 group-hover:opacity-100 text-[#888] hover:text-[#e74444]">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-2 mt-4">
          <span className="text-xs font-semibold text-[#888] uppercase">Labels</span>
          <button onClick={handleCreateLabel} className="text-[#888] hover:text-[#555]">
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-0.5">
          {labels.map(label => (
            <div
              key={label.id}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[#555] hover:bg-[#e8e8e8] transition-colors group"
            >
              <span className="flex items-center gap-2 flex-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color }} />
                <span>{label.name}</span>
              </span>
              <button onClick={(e) => handleDeleteLabel(label.id!, e)} className="opacity-0 group-hover:opacity-100 text-[#888] hover:text-[#e74444]">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}