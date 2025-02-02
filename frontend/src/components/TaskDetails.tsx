import React from 'react';
import { motion } from 'framer-motion';
import { Task, TaskStatus } from '../types/task';

interface TaskDetailsProps {
  task: Task;
}

export function TaskDetails({ task }: TaskDetailsProps) {
  const formatTimestamp = (date: Date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED': return '#4CAF50';
      case 'PROCESSING': return '#61dafb';
      case 'ERROR': return '#f44336';
      case 'PENDING': return '#ffd700';
      default: return '#ffd700';
    }
  };

  return (
    <div className="p-4 bg-[#2a2a2d]/80 backdrop-blur-xl rounded-xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-gray-200">{task.name}</h2>
          <div 
            className="px-2 py-1 rounded-full text-sm"
            style={{ backgroundColor: getStatusColor(task.status) + '20', color: getStatusColor(task.status) }}
          >
            {task.status}
          </div>
        </div>

        {task.description && (
          <p className="text-gray-400">{task.description}</p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="text-sm text-gray-500 space-y-1"
        >
          <span className="task-id block">ID: {task.id}</span>
          <span className="task-created block">Created: {formatTimestamp(task.createdAt)}</span>
          <span className="task-updated block">Last Update: {formatTimestamp(task.updatedAt)}</span>
        </motion.div>
      </motion.div>
    </div>
  );
} 