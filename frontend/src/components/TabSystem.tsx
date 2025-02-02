import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types/task';

interface TabSystemProps {
  tasks: Task[];
  activeTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
}

export function TabSystem({ tasks, activeTaskId, onTaskSelect }: TabSystemProps) {
  return (
    <motion.div className="tab-system">
      <motion.div className="tab-list">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            className={`tab ${task.id === activeTaskId ? 'active' : ''} status-${task.status.toLowerCase()}`}
            onClick={() => onTaskSelect(task.id)}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: `0 0 20px ${task.status === 'COMPLETED' ? '#4CAF50' : '#61dafb'}33`
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="tab-content">
              <div className="tab-header">
                <span className="task-id">#{task.id.slice(0, 8)}</span>
                <span className={`status-indicator status-${task.status.toLowerCase()}`}>
                  {task.status}
                </span>
              </div>
              <div className="tab-progress">
                <motion.div 
                  className="progress-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
                <span className="progress-text">{task.progress}%</span>
              </div>
              <p className="task-description">{task.description}</p>
            </div>
            <div className="tab-glow" />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
} 