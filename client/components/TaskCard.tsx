
import React from 'react';
import { Task, Priority } from '../types';
import Button from './Button';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete, onDelete, onEdit }) => {
  const priorityColors: Record<Priority, string> = {
    low: 'bg-[#00ff9d] text-black',
    medium: 'bg-[#ffdf00] text-black',
    high: 'bg-[#ff5555] text-white',
  };

  // Logic warna background
  const cardBg = task.is_completed 
    ? 'bg-[#86efac] dark:bg-[#064e3b]' 
    : 'bg-white dark:bg-[#1f1f1f]';
    
  const textColor = task.is_completed
    ? 'text-gray-800 dark:text-gray-300'
    : 'text-black dark:text-white';

  const checkboxClass = `
    mt-1.5 w-7 h-7 border-4 border-black dark:border-white rounded-none appearance-none 
    relative after:content-['✓'] after:absolute after:hidden after:checked:block 
    after:text-white after:font-black after:text-center after:w-full cursor-pointer
    checked:bg-black dark:checked:bg-white dark:after:text-black
    transition-all hover:scale-110
  `;

  // Calculate Urgency and Specific Label
  const urgencyInfo = React.useMemo(() => {
    if (task.is_completed || !task.due_date) return null;
    const due = new Date(task.due_date);
    const now = new Date();
    // Reset hours to compare dates only
    due.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Only urgent if 3 days or less (including overdue)
    if (diffDays > 3) return null;

    let label = '';
    if (diffDays < 0) label = `OVERDUE ${Math.abs(diffDays)}D`;
    else if (diffDays === 0) label = 'TODAY!';
    else label = `D-${diffDays}`;

    return { label, isUrgent: true };
  }, [task.due_date, task.is_completed]);

  return (
    <div className={`
      border-4 border-black dark:border-white p-6 neo-brutal-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] hover:neo-brutal-shadow-lg
      relative overflow-hidden transition-all duration-200 flex flex-col h-full
      ${cardBg}
      ${urgencyInfo ? 'ring-4 ring-[#ff5555] ring-offset-4 ring-offset-[#f3f3f3] dark:ring-offset-[#121212]' : ''}
    `}>
      {/* Decorative corner tag */}
      <div className={`absolute top-0 right-0 px-4 py-2 border-b-4 border-l-4 border-black dark:border-white font-black uppercase text-sm tracking-wide ${priorityColors[task.priority]}`}>
        {task.priority}
      </div>

      {/* WARNING STICKER for Urgent Tasks */}
      {urgencyInfo && (
        <div className="absolute top-0 left-0 bg-[#ff5555] text-white border-b-4 border-r-4 border-black dark:border-white p-2 z-10 animate-pulse">
           <span className="text-xl font-black">⚠️ {urgencyInfo.label}</span>
        </div>
      )}
      
      <div className="flex items-start gap-4 mt-8 flex-1">
        <input 
          type="checkbox" 
          checked={task.is_completed}
          onChange={() => onToggleComplete(task)}
          className={checkboxClass}
        />
        <div className="flex-1 min-w-0">
          <h3 className={`text-2xl font-black uppercase leading-tight mb-2 truncate ${task.is_completed ? 'line-through opacity-60' : ''} ${textColor}`}>
            {task.title}
          </h3>
          <p className={`mb-4 text-base font-medium break-words ${textColor} opacity-90`}>
            {task.description || "No description provided."}
          </p>
          
        </div>
      </div>

      <div className="mt-4 pt-4 border-t-4 border-black/10 dark:border-white/20 flex justify-between items-center">
        {task.due_date ? (
            <div className={`text-xs font-black uppercase px-2 py-1 border-2 border-black dark:border-white/50 inline-block ${textColor} ${urgencyInfo ? 'bg-[#ff5555] text-white border-none' : ''}`}>
              📅 {new Date(task.due_date).toLocaleDateString()}
            </div>
          ) : <span className="text-xs font-bold opacity-50 uppercase">No Deadline</span>}

        <div className="flex gap-2">
            <Button 
              variant="secondary" 
              className="px-3 py-1 text-xs border-2 shadow-none hover:shadow-md"
              onClick={() => onEdit(task)}
            >
              Edit
            </Button>
            <Button 
              variant="danger" 
              className="px-3 py-1 text-xs border-2 shadow-none hover:shadow-md"
              onClick={() => onDelete(task.id)}
            >
              Del
            </Button>
          </div>
      </div>
    </div>
  );
};

export default TaskCard;
