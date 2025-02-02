import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Task, TaskStatus } from '../types/task';

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

// Clock Icon component
const ClockIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

// Check Circle Icon component
const CheckCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

interface MonitoringCardProps {
  title: string;
  type: 'status' | 'metrics';
  tasks: Task[];
}

export function MonitoringCard({ title, type, tasks }: MonitoringCardProps) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const processing = tasks.filter(t => t.status === 'PROCESSING').length;
    const error = tasks.filter(t => t.status === 'ERROR').length;
    const avgProgress = tasks.length > 0 
      ? tasks.reduce((acc, task) => acc + task.progress, 0) / tasks.length
      : 0;

    return {
      total,
      completed,
      processing,
      error,
      avgProgress,
      completionRate: total ? (completed / total) * 100 : 0,
      errorRate: total ? (error / total) * 100 : 0,
    };
  }, [tasks]);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="h-full p-4 bg-[#2a2a2d]/80 backdrop-blur-xl rounded-xl border border-gray-800/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-200">{title}</h2>
        <ChartBarIcon />
      </div>

      {type === 'status' ? (
        <div className="space-y-4">
          {/* Status Indicators */}
          <div className="grid grid-cols-2 gap-4">
            <StatusItem
              label="Processing"
              value={stats.processing}
              icon={ClockIcon}
              color="text-blue-400"
            />
            <StatusItem
              label="Completed"
              value={stats.completed}
              icon={CheckCircleIcon}
              color="text-green-400"
            />
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Overall Progress</span>
              <span className="text-[#ffa07a]">{(stats.avgProgress * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.avgProgress * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-[#ffa07a] to-[#ff7a50]"
              />
            </div>
          </div>

          {/* Completion Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Completion Rate</span>
              <span className="text-[#ffa07a]">{stats.completionRate.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.completionRate}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-[#ffa07a] to-[#ff7a50]"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <MetricItem
              label="Total Tasks"
              value={stats.total}
              change={`${stats.processing} active`}
            />
            <MetricItem
              label="Error Rate"
              value={`${stats.errorRate.toFixed(1)}%`}
              change={`${stats.error} total`}
              trend={stats.error > 0 ? 'up' : 'down'}
            />
          </div>

          {/* Activity Graph */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Task Progress</span>
              <span className="text-xs text-gray-500">Active Tasks</span>
            </div>
            <div className="h-20 flex items-end space-x-1">
              {tasks
                .filter(t => t.status === 'PROCESSING')
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex-1 bg-[#ffa07a]/20 rounded-t"
                    style={{
                      height: `${task.progress * 100}%`,
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface StatusItemProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function StatusItem({ label, value, icon: Icon, color }: StatusItemProps) {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg bg-[#222224]">
      <Icon className={`w-5 h-5 ${color}`} />
      <div>
        <div className="text-sm text-gray-400">{label}</div>
        <div className="text-lg font-medium text-gray-200">{value}</div>
      </div>
    </div>
  );
}

interface MetricItemProps {
  label: string;
  value: string | number;
  change: string;
  trend?: 'up' | 'down';
}

function MetricItem({ label, value, change, trend }: MetricItemProps) {
  return (
    <div className="p-3 rounded-lg bg-[#222224]">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-lg font-medium text-gray-200">{value}</div>
      <div className={`text-xs ${
        trend === 'down' ? 'text-green-400' : 'text-[#ffa07a]'
      }`}>
        {change}
      </div>
    </div>
  );
} 