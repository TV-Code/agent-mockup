import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Task, TaskStatus } from '../types/task';
import clsx from 'clsx';

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
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  type: 'status' | 'analytics';
  tasks: Task[];
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export function MonitoringCard({ 
  title, 
  type,
  tasks, 
  isDarkMode = true,
  onToggleTheme 
}: MonitoringCardProps) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const processing = tasks.filter(t => t.status === 'PROCESSING').length;
    const error = tasks.filter(t => t.status === 'ERROR').length;
    
    // Calculate success rate
    const successRate = total ? Math.round((completed / total) * 100) : 0;
    
    // Get most recent tasks (limit to 3)
    const recentTasks = [...tasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);

    // Calculate completion trend data (last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const trendData = tasks
      .filter(t => new Date(t.updatedAt) >= sevenDaysAgo)
      .reduce((acc, task) => {
        const date = new Date(task.updatedAt).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { completed: 0, failed: 0 };
        }
        if (task.status === 'COMPLETED') {
          acc[date].completed++;
        } else if (task.status === 'ERROR') {
          acc[date].failed++;
        }
        return acc;
      }, {} as Record<string, { completed: number; failed: number }>);

    // Fill in missing days with zeros
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toLocaleDateString();
      if (!trendData[date]) {
        trendData[date] = { completed: 0, failed: 0 };
      }
    }

    // Sort by date and get last 7 days
    const trendPoints = Object.entries(trendData)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-7)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        completed: data.completed,
        failed: data.failed
      }));

    return {
      total,
      completed,
      processing,
      error,
      successRate,
      recentTasks,
      trendPoints,
      activeTasksData: tasks
        .filter(t => t.status === 'PROCESSING')
        .slice(0, 2)
        .map(t => ({
          id: t.id,
          progress: Math.min(100, Math.round(t.progress)),
          name: t.name || t.description || `Task ${t.id.slice(0, 8)}`
        }))
    };
  }, [tasks]);

  return (
    <div className="relative h-full">
      <motion.div 
        className="relative h-full rounded-2xl border-[0.5px] border-[rgb(255,160,122)]/10 shadow-premium flex flex-col overflow-hidden"
        style={{
          background: 'rgba(28, 28, 28, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="absolute inset-0 rounded-2xl"
          style={{
            padding: '1px',
            background: 'rgba(255, 160, 122, 0.05)',
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
            <div className="flex items-center space-x-2">
              <button
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors duration-200"
              >
                <ChartBarIcon className="w-4 h-4 text-[rgb(255,160,122)]/30" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 overflow-y-auto flex-1">
          {type === 'status' ? (
            <div className="space-y-3">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2">
                <StatusItem
                  label="Active Tasks"
                  value={stats.processing}
                  subtext={stats.processing === 1 ? 'task' : 'tasks'}
                  icon={ClockIcon}
                  color="text-[rgb(255,160,122)]/90"
                  trend="processing"
                />
                <StatusItem
                  label="Total Tasks"
                  value={stats.total}
                  subtext="tasks"
                  icon={CheckCircleIcon}
                  color="text-[rgb(255,160,122)]/90"
                  trend="default"
                />
              </div>

              {/* Active Tasks - Always show space for 2 */}
              <div className="space-y-2">
                <h3 className="text-[13px] font-medium text-white/50">Active Tasks</h3>
                <div className="space-y-1.5 min-h-[104px]">
                  {stats.activeTasksData.length > 0 ? (
                    stats.activeTasksData.slice(0, 2).map(task => (
                      <div 
                        key={task.id} 
                        className="rounded-lg p-2 border-[0.5px] border-[rgb(255,160,122)]/20 backdrop-blur-xl"
                        style={{
                          background: 'rgba(255, 160, 122, 0.01)',
                        }}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="text-[13px] text-white/70 truncate flex-1">{task.name}</span>
                          <span className="text-[11px] text-[rgb(255,160,122)]/70 ml-2">{task.progress}%</span>
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
                    ))
                  ) : (
                    <div className="h-[104px] flex items-center justify-center text-[13px] text-white/30 border-[0.5px] border-[rgb(255,160,122)]/10 rounded-lg backdrop-blur-xl"
                      style={{
                        background: 'rgba(255, 160, 122, 0.01)',
                      }}>
                      No active tasks
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="space-y-2">
                <h3 className="text-[13px] font-medium text-white/50">Recent Activity</h3>
                <div className="space-y-1.5">
                  {stats.recentTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-1.5 rounded-lg text-[13px] border-[0.5px] border-[rgb(255,160,122)]/[0.05] backdrop-blur-xl"
                      style={{
                        background: 'rgba(255, 160, 122, 0.01)',
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
            <div className="h-[120px] relative">
              {/* Simplified background */}
              <div className="absolute inset-0 opacity-30"
                style={{
                  background: 'rgba(255, 160, 122, 0.02)'
                }}
              />
              
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-full border-t border-[rgb(255,160,122)]/[0.02]"
                  />
                ))}
              </div>
              
              {/* Graph */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-2 pb-4">
                {stats.trendPoints.map((point, i) => (
                  <div key={i} className="relative group">
                    {/* Hover Effect */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="text-[10px] text-white/70 whitespace-nowrap bg-[rgb(255,160,122)]/10 px-1.5 py-0.5 rounded backdrop-blur-sm border-[0.5px] border-[rgb(255,160,122)]/20">
                        {point.completed} tasks
                      </div>
                    </div>
                    
                    {/* Bar */}
                    <div className="relative">
                      <div 
                        className="w-1.5 rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          height: `${point.completed ? Math.max(15, (point.completed / Math.max(...stats.trendPoints.map(p => p.completed))) * 70) : 0}px`,
                          background: 'linear-gradient(180deg, rgba(255, 160, 122, 0.3) 0%, rgba(255, 160, 122, 0.1) 100%)',
                        }}
                      />
                      {/* Glow Effect */}
                      <div 
                        className="absolute inset-0 blur-sm opacity-50"
                        style={{ 
                          height: `${point.completed ? Math.max(15, (point.completed / Math.max(...stats.trendPoints.map(p => p.completed))) * 70) : 0}px`,
                          background: 'linear-gradient(180deg, rgba(255, 160, 122, 0.2) 0%, transparent 100%)',
                        }}
                      />
                    </div>
                    
                    {/* Day Label */}
                    <div className="mt-2 text-[10px] text-white/30">{point.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
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
      case 'completed': return 'rgba(255, 160, 122, 0.02)';
      case 'processing': return 'rgba(255, 255, 255, 0.02)';
      case 'error': return 'rgba(255, 86, 86, 0.02)';
      case 'pending': return 'rgba(255, 196, 0, 0.02)';
      default: return 'rgba(255, 255, 255, 0.02)';
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
  subtext: string;
  trend: 'completed' | 'processing' | 'error' | 'pending' | 'default';
}

function MetricItem({ label, value, subtext, trend }: MetricItemProps) {
  const getBorderColor = () => {
    switch (trend) {
      case 'completed': return 'border-[rgb(255,160,122)]/20';
      case 'error': return 'border-[rgb(255,86,86)]/20';
      default: return 'border-white/20';
    }
  };

  const getBackground = () => {
    switch (trend) {
      case 'completed': return 'linear-gradient(to bottom, rgba(255, 160, 122, 0.02), rgba(255, 160, 122, 0.01))';
      case 'error': return 'linear-gradient(to bottom, rgba(255, 86, 86, 0.02), rgba(255, 86, 86, 0.01))';
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
      <div className="text-[11px] text-white/30">{subtext}</div>
    </div>
  );
} 