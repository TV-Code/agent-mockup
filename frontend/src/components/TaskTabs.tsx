import React, { useEffect, useState, useCallback } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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

// Sun Icon component
const SunIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

// Moon Icon component
const MoonIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

interface TaskTabsProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: () => void;
  onTaskSelect: (taskId: string) => void;
  className?: string;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export function TaskTabs({
  tasks,
  activeTaskId,
  onAddTask,
  onTaskSelect,
  className = '',
  isDarkMode = true,
  onToggleTheme
}: TaskTabsProps) {
  const tabRefs = React.useRef<Map<string, HTMLElement>>(new Map());
  const initialLoadRef = React.useRef(true);
  const previousActiveTaskRef = React.useRef<string | null>(null);
  const [highlightStyle, setHighlightStyle] = React.useState({
    width: 200,
    x: 0
  });

  // Create and select new task on initial load
  React.useEffect(() => {
    if (initialLoadRef.current && !activeTaskId) {
      initialLoadRef.current = false;
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        onAddTask();
      }, 100);
    }
  }, [activeTaskId, onAddTask]);

  // Cleanup empty pending tasks when switching away from them
  React.useEffect(() => {
    const previousTaskId = previousActiveTaskRef.current;
    previousActiveTaskRef.current = activeTaskId;

    // Only check for cleanup when switching away from a task
    if (previousTaskId && previousTaskId !== activeTaskId) {
      const previousTask = tasks.find(t => t.id === previousTaskId);
      if (previousTask?.id.startsWith('pending-') && !previousTask.name && !previousTask.description) {
        // Remove the task by selecting an empty string
        onTaskSelect('');
      }
    }
  }, [activeTaskId, tasks, onTaskSelect]);

  // Helper function to truncate text
  const truncateText = (text: string, limit: number) => {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  };

  // Update highlight position when active tab changes
  React.useEffect(() => {
    if (activeTaskId) {
      const activeTab = tabRefs.current.get(activeTaskId);
      if (activeTab) {
        const newX = activeTab.offsetLeft;
        setHighlightStyle({
          width: activeTab.offsetWidth,
          x: newX
        });

        // Smooth scroll into view if needed
        activeTab.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [activeTaskId]);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex-1 flex items-center overflow-x-auto hide-scrollbar relative">
        {/* Container for highlight effect - always on top */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
          <motion.div
            layoutId="active-tab-highlight"
            className="absolute top-0 bottom-0 rounded-lg"
            animate={{
              x: highlightStyle.x,
              width: highlightStyle.width
            }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
          >
            <div className="absolute inset-0 rounded-lg border border-white/20" />
            <div className="absolute inset-0 bg-white/5 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.08] to-transparent rounded-lg" />
          </motion.div>
        </div>

        {/* Tabs container */}
        <div className="flex items-center relative" style={{ zIndex: 10 }}>
          {tasks.map((task) => (
            <motion.button
              key={task.id}
              ref={(el) => {
                if (el) {
                  tabRefs.current.set(task.id, el);
                } else {
                  tabRefs.current.delete(task.id);
                }
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={() => onTaskSelect(task.id)}
              className={`
                flex items-center justify-center px-4 py-2.5 rounded-lg mr-2 w-[220px]
                transition-all duration-200 relative cursor-pointer shrink-0
                hover:bg-white/5
                ${activeTaskId === task.id ? 'glass glass-border' : 'glass glass-border opacity-80'}
              `}
            >
              <div className="flex items-center space-x-2.5 w-full">
                {/* Status dot */}
                <div 
                  className={`
                    w-1.5 h-1.5 rounded-full shrink-0 transition-transform duration-200
                    ${getStatusColor(task.status)}
                    ${activeTaskId === task.id ? 'scale-125' : ''}
                  `}
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-center w-full">
                    <span 
                      className="text-sm font-medium truncate tracking-tight text-center"
                      title={task.name || task.description || 'New Task'}
                    >
                      {truncateText(task.name || task.description || 'New Task', 20)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-1.5 mt-0.5 shrink-0">
                    <span className="text-xs font-medium text-gray-400/80 shrink-0">
                      {getStatusText(task.status)}
                    </span>
                    <span className="text-xs text-gray-400/60 shrink-0">•</span>
                    <span className="text-xs font-mono text-gray-400/80 tabular-nums shrink-0">
                      {Math.round(task.progress)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 pl-4 border-l border-white/10" style={{ zIndex: 30 }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddTask}
          className="p-2 rounded-lg glass glass-border hover:bg-white/5 
            transition-all duration-200 group"
        >
          <PlusIcon className="w-5 h-5 text-white/70 group-hover:text-white/90 
            transition-colors duration-200" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleTheme}
          className="p-2 rounded-lg glass glass-border hover:bg-white/5 
            transition-all duration-200 group"
        >
          {isDarkMode ? (
            <SunIcon className="w-5 h-5 text-white/70 group-hover:text-white/90 
              transition-colors duration-200" />
          ) : (
            <MoonIcon className="w-5 h-5 text-white/70 group-hover:text-white/90 
              transition-colors duration-200" />
          )}
        </motion.button>
      </div>
    </div>
  );
}

function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-400';
    case 'PROCESSING':
      return 'bg-sky-400';
    case 'ERROR':
      return 'bg-rose-400';
    case 'PENDING':
      return 'bg-amber-400';
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