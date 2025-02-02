import React from 'react';
import { Task } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
}

export function TaskList({ tasks, activeTaskId, onTaskSelect }: TaskListProps) {
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`task-item ${task.id === activeTaskId ? 'active' : ''}`}
          onClick={() => onTaskSelect(task.id)}
        >
          <div className="task-header">
            <div className={`status-indicator status-${task.status.toLowerCase()}`} />
            <div className="task-description">{task.description}</div>
          </div>
          <div className="task-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span className="progress-text">{task.progress}%</span>
          </div>
          <div className="task-meta">
            <span className="task-date">
              {new Date(task.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
} 