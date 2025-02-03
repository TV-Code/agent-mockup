import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { Task, TaskStatus } from '../types/task';

// Plus Icon component
const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

// Chart Bar Icon component
const ChartBarIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

interface TaskTabsProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: () => void;
  onTaskSelect: (taskId: string) => void;
  className?: string;
}

export function TaskTabs({
  tasks,
  activeTaskId,
  onAddTask,
  onTaskSelect,
  className = '',
}: TaskTabsProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex-1 flex items-center overflow-x-auto hide-scrollbar">
        <LayoutGroup>
          {tasks.map((task) => (
            <motion.button
              key={task.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => onTaskSelect(task.id)}
              className={`
                flex items-center px-4 py-2 rounded-t-lg mr-1 min-w-[180px] max-w-[300px]
                transition-colors duration-200 relative cursor-pointer
                ${activeTaskId === task.id
                  ? 'glass glass-border glass-active'
                  : 'glass glass-border opacity-70'}
              `}
            >
              <div className="flex items-center space-x-2 w-full relative z-10">
                <div className={`
                  w-2 h-2 rounded-full shrink-0
                  ${getStatusColor(task.status)}
                  transition-colors duration-200
                `} />
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-sm font-medium truncate w-full">
                    {task.name || task.description || 'New Task'}
                  </span>
                  <span className="text-xs text-gray-400 truncate w-full">
                    {getStatusText(task.status)} • {Math.round(task.progress)}%
                  </span>
                </div>
              </div>
              {activeTaskId === task.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-t-lg border-b-2 border-blue-500"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </LayoutGroup>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 pl-2 border-l border-white/10">
        <button
          onClick={onAddTask}
          className="p-2 rounded-lg glass glass-border"
        >
          <PlusIcon />
        </button>
        <button
          className="p-2 rounded-lg glass glass-border"
        >
          <ChartBarIcon />
        </button>
      </div>
    </div>
  );
}

function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-500';
    case 'PROCESSING':
      return 'bg-blue-500';
    case 'ERROR':
      return 'bg-red-500';
    case 'PENDING':
      return 'bg-gray-500';
  }
}

function getStatusText(status: TaskStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'Completed';
    case 'PROCESSING':
      return 'Processing';
    case 'ERROR':
      return 'Error';
    case 'PENDING':
      return 'Pending';
  }
}

// Add this to your global CSS or as a style tag
const styles = `
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`; 