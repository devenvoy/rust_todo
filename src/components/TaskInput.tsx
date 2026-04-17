import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { Plus } from 'lucide-react';

export function TaskInput() {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { createTask, selectedProjectId, projects } = useAppStore();

  const parseTaskInput = (input: string) => {
    let title = input;
    let priority = 4;
    let projectId: number | undefined;
    let labelIds: string[] = [];

    const priorityMatch = input.match(/\bp([1-4])\b/i);
    if (priorityMatch) {
      priority = parseInt(priorityMatch[1]);
      title = title.replace(/\bp[1-4]\b/i, '').trim();
    }

    const projectMatch = input.match(/#(\w+)/);
    if (projectMatch) {
      const projectName = projectMatch[1].toLowerCase();
      const project = projects.find(p => p.name.toLowerCase() === projectName);
      if (project) projectId = project.id ?? undefined;
      title = title.replace(/#\w+/, '').trim();
    }

    const labelMatch = input.match(/@(\w+)/g);
    if (labelMatch) {
      labelMatch.forEach(() => {
        title = title.replace(/@\w+/, '').trim();
      });
    }

    return { title: title.trim(), priority, projectId, labelIds: labelIds.join(',') };
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;

    const { title, priority, projectId, labelIds } = parseTaskInput(text);
    if (!title) return;

    await createTask(title, projectId ?? selectedProjectId ?? undefined, priority, undefined, labelIds || undefined);
    setText('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'q' && !isFocused && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  return (
    <div className={`px-4 py-2 border-b border-[#e0e0e0] ${isFocused ? 'bg-white' : 'bg-[#f5f5f5]'}`}>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button
          type="button"
          className="w-5 h-5 rounded border-2 border-[#aaa] flex-shrink-0 hover:border-[#777] transition-colors"
        />
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Add a task... (p1-4 for priority, #project, @label)"
          className="flex-1 bg-transparent border-none outline-none text-sm text-[#1a1a1a] placeholder-[#999]"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-1 text-[#999] hover:text-[#555] disabled:opacity-50"
        >
          <Plus size={18} />
        </button>
      </form>
    </div>
  );
}