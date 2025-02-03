import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Task, TaskStatus } from '../types/task';
import clsx from 'clsx';

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
    
    // Calculate average completion time (mock data for now)
    const avgCompletionTime = "2.5 min";
    
    // Calculate success rate
    const successRate = total ? Math.round((completed / total) * 100) : 0;
    
    // Get most recent tasks (limit to 3)
    const recentTasks = [...tasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);

    return {
      total,
      completed,
      processing,
      error,
      successRate,
      avgCompletionTime,
      recentTasks,
      activeTasksData: tasks
        .filter(t => t.status === 'PROCESSING')
        .map(t => ({
          id: t.id,
          progress: Math.min(100, Math.round(t.progress)),
          timeRemaining: "~1 min", // Mock data for now
          name: t.name || t.description || `Task ${t.id.slice(0, 8)}`
        }))
    };
  }, [tasks]);

  return (
    <motion.div
      className="relative h-full"
    >
      {/* Static Background */}
      <div
        className="absolute inset-0 opacity-100 rounded-2xl overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 160, 122, 0.03), transparent 50%)'
        }}
      />

      {/* Card Content */}
      <motion.div 
        className="relative h-full rounded-2xl border-[0.5px] border-[rgb(255,160,122)]/10 shadow-premium flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, rgba(255, 160, 122, 0.01), rgba(255, 160, 122, 0.02))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Accent Border */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            padding: '1px',
            background: 'linear-gradient(to bottom right, rgba(255, 160, 122, 0.1), rgba(255, 160, 122, 0))',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none',
          }}
        />

        <div className="p-3 border-b border-[rgb(255,160,122)]/[0.02] shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-medium text-white/80">{title}</h2>
            <ChartBarIcon className="w-4 h-4 text-[rgb(255,160,122)]/30" />
          </div>
        </div>

        <div className="p-3 overflow-y-auto flex-1">
          {type === 'status' ? (
            <div className="space-y-3">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2">
                <StatusItem
                  label="In Progress"
                  value={stats.processing}
                  subtext={stats.processing === 1 ? 'task' : 'tasks'}
                  icon={ClockIcon}
                  color="text-[rgb(255,160,122)]/90"
                  trend="default"
                />
                <StatusItem
                  label="Success Rate"
                  value={stats.successRate}
                  subtext="%"
                  icon={CheckCircleIcon}
                  color="text-[rgb(255,160,122)]/90"
                  trend="default"
                />
              </div>

              {/* Active Tasks */}
              {stats.activeTasksData.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[13px] font-medium text-white/50">Active Tasks</h3>
                  <div className="space-y-1.5 max-h-[20vh] overflow-y-auto">
                    {stats.activeTasksData.map(task => (
                      <div 
                        key={task.id} 
                        className="rounded-lg p-2 border-[0.5px] border-[rgb(255,160,122)]/20 backdrop-blur-xl"
                        style={{
                          background: 'linear-gradient(to bottom, rgba(255, 160, 122, 0.02), rgba(255, 160, 122, 0.01))',
                        }}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="text-[13px] text-white/70 truncate flex-1">{task.name}</span>
                          <span className="text-[11px] text-[rgb(255,160,122)]/70 ml-2 whitespace-nowrap">{task.timeRemaining}</span>
                        </div>
                        <div className="h-[3px] bg-white/[0.03] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full"
                            style={{
                              background: 'linear-gradient(to right, rgba(255, 160, 122, 0.5), rgba(255, 160, 122, 0.8))',
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="space-y-2">
                <h3 className="text-[13px] font-medium text-white/50">Recent Activity</h3>
                <div className="space-y-1.5 max-h-[20vh] overflow-y-auto">
                  {stats.recentTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-1.5 rounded-lg text-[13px] border-[0.5px] border-[rgb(255,160,122)]/[0.05] backdrop-blur-xl"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(255, 160, 122, 0.01), rgba(255, 160, 122, 0.02))',
                      }}
                    >
                      <span className="text-white/70 truncate flex-1">
                        {task.name || task.description || `Task ${task.id.slice(0, 8)}`}
                      </span>
                      <span className={clsx(
                        'px-1.5 py-0.5 rounded-md text-[11px] ml-2 whitespace-nowrap border-[0.5px]',
                        task.status === 'COMPLETED' ? 'text-[rgb(255,160,122)] border-[rgb(255,160,122)]/20 bg-[rgb(255,160,122)]/10' :
                        task.status === 'PROCESSING' ? 'text-white/70 border-white/20 bg-white/10' :
                        task.status === 'ERROR' ? 'text-[rgb(255,86,86)] border-[rgb(255,86,86)]/20 bg-[rgb(255,86,86)]/10' :
                        'text-[rgb(255,196,0)] border-[rgb(255,196,0)]/20 bg-[rgb(255,196,0)]/10'
                      )}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Performance Overview */}
              <div className="grid grid-cols-2 gap-2">
                <MetricItem
                  label="Avg. Completion"
                  value={stats.avgCompletionTime}
                  change="per task"
                  trend="processing"
                />
                <MetricItem
                  label="Success Rate"
                  value={`${stats.successRate}%`}
                  change={`${stats.completed} completed`}
                  trend={stats.successRate > 80 ? 'completed' : 'pending'}
                />
              </div>

              {/* Task Distribution */}
              <div className="space-y-2">
                <h3 className="text-[13px] font-medium text-white/50">Task Distribution</h3>
                <div className="grid grid-cols-4 gap-1.5 h-20">
                  <div className="rounded-lg relative overflow-hidden border-[0.5px] border-[rgb(255,160,122)]/20 backdrop-blur-xl"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255, 160, 122, 0.02), rgba(255, 160, 122, 0.01))',
                    }}>
                    <div className="absolute inset-x-0 bottom-0 bg-[rgb(255,160,122)]/10" 
                      style={{ height: `${(stats.completed / stats.total) * 100}%` }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1.5">
                      <span className="text-[11px] text-[rgb(255,160,122)]/70">Completed</span>
                      <span className="text-[13px] font-medium text-[rgb(255,160,122)]">{stats.completed}</span>
                    </div>
                  </div>
                  <div className="rounded-lg relative overflow-hidden border-white/20 backdrop-blur-xl"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))',
                    }}>
                    <div className="absolute inset-x-0 bottom-0 bg-white/10" 
                      style={{ height: `${(stats.processing / stats.total) * 100}%` }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1.5">
                      <span className="text-[11px] text-white/70">Active</span>
                      <span className="text-[13px] font-medium text-white">{stats.processing}</span>
                    </div>
                  </div>
                  <div className="rounded-lg relative overflow-hidden border-[0.5px] border-[rgb(255,86,86)]/20 backdrop-blur-xl"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255, 86, 86, 0.02), rgba(255, 86, 86, 0.01))',
                    }}>
                    <div className="absolute inset-x-0 bottom-0 bg-[rgb(255,86,86)]/10" 
                      style={{ height: `${(stats.error / stats.total) * 100}%` }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1.5">
                      <span className="text-[11px] text-[rgb(255,86,86)]/70">Failed</span>
                      <span className="text-[13px] font-medium text-[rgb(255,86,86)]">{stats.error}</span>
                    </div>
                  </div>
                  <div className="rounded-lg relative overflow-hidden border-white/[0.05] backdrop-blur-xl"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.01), rgba(255, 255, 255, 0.02))',
                    }}>
                    <div className="absolute inset-x-0 bottom-0 bg-white/[0.03]" 
                      style={{ height: '100%' }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1.5">
                      <span className="text-[11px] text-white/40">Total</span>
                      <span className="text-[13px] font-medium text-white/70">{stats.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

interface StatusItemProps {
  label: string;
  value: number;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend: 'completed' | 'processing' | 'error' | 'pending' | 'default';
}

function StatusItem({ label, value, subtext, icon: Icon, color, trend }: StatusItemProps) {
  const getBorderColor = () => {
    switch (trend) {
      case 'completed': return 'border-[rgb(255,160,122)]/20';
      case 'processing': return 'border-white/20';
      case 'error': return 'border-[rgb(255,86,86)]/20';
      case 'pending': return 'border-[rgb(255,196,0)]/20';
      default: return 'border-white/20';
    }
  };

  const getBackground = () => {
    switch (trend) {
      case 'completed': return 'linear-gradient(to bottom, rgba(255, 160, 122, 0.02), rgba(255, 160, 122, 0.01))';
      case 'processing': return 'linear-gradient(to bottom, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))';
      case 'error': return 'linear-gradient(to bottom, rgba(255, 86, 86, 0.02), rgba(255, 86, 86, 0.01))';
      case 'pending': return 'linear-gradient(to bottom, rgba(255, 196, 0, 0.02), rgba(255, 196, 0, 0.01))';
      default: return 'linear-gradient(to bottom, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))';
    }
  };

  return (
    <div 
      className={`rounded-lg border-[0.5px] ${getBorderColor()} p-2.5 backdrop-blur-xl`}
      style={{
        background: getBackground(),
      }}
    >
      <div className="flex items-center space-x-2 mb-0.5">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-[13px] text-white/50">{label}</span>
      </div>
      <div className="text-lg font-medium text-white/80">
        {value}
        <span className="text-[13px] text-white/30 ml-1">{subtext}</span>
      </div>
    </div>
  );
}

interface MetricItemProps {
  label: string;
  value: string | number;
  change: string;
  trend: 'completed' | 'processing' | 'error' | 'pending' | 'default';
}

function MetricItem({ label, value, change, trend }: MetricItemProps) {
  const getBorderColor = () => {
    switch (trend) {
      case 'completed': return 'border-[rgb(255,160,122)]/20';
      case 'processing': return 'border-white/20';
      case 'error': return 'border-[rgb(255,86,86)]/20';
      case 'pending': return 'border-[rgb(255,196,0)]/20';
      default: return 'border-white/20';
    }
  };

  const getBackground = () => {
    switch (trend) {
      case 'completed': return 'linear-gradient(to bottom, rgba(255, 160, 122, 0.02), rgba(255, 160, 122, 0.01))';
      case 'processing': return 'linear-gradient(to bottom, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))';
      case 'error': return 'linear-gradient(to bottom, rgba(255, 86, 86, 0.02), rgba(255, 86, 86, 0.01))';
      case 'pending': return 'linear-gradient(to bottom, rgba(255, 196, 0, 0.02), rgba(255, 196, 0, 0.01))';
      default: return 'linear-gradient(to bottom, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))';
    }
  };

  return (
    <div 
      className={`rounded-lg border-[0.5px] ${getBorderColor()} p-2.5 backdrop-blur-xl`}
      style={{
        background: getBackground(),
      }}
    >
      <div className="text-[13px] text-white/50 mb-0.5">{label}</div>
      <div className="text-lg font-medium text-white/80">{value}</div>
      <div className="text-[11px] text-white/30">
        {change}
      </div>
    </div>
  );
} 