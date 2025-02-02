import React from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { FerroCore } from './FerroCore';
import { TaskTabs } from './TaskTabs';
import { InteractionCard } from './InteractionCard';
import { MonitoringCard } from './MonitoringCard';
import { Task } from '../types/task';

interface LayoutProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: () => void;
  onTaskSelect: (taskId: string) => void;
}

export function Layout({ tasks, activeTaskId, onAddTask, onTaskSelect }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#1a1a1d] text-white p-4">
      {/* Header/Navigation */}
      <TaskTabs
        tasks={tasks}
        activeTaskId={activeTaskId}
        onAddTask={onAddTask}
        onTaskSelect={onTaskSelect}
        className="mb-4"
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-7rem)]">
        {/* Left: Main Interaction Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-4 rounded-xl overflow-hidden"
        >
          <InteractionCard activeTaskId={activeTaskId} />
        </motion.div>

        {/* Center: Ferro Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-4 relative"
        >
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <Canvas camera={{ position: [0, 0, 4] }}>
              <FerroCore tasks={tasks} activeTaskId={activeTaskId} />
            </Canvas>
          </div>
        </motion.div>

        {/* Right: Monitoring Cards */}
        <div className="col-span-4 flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <MonitoringCard
              title="System Status"
              type="status"
              tasks={tasks}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1"
          >
            <MonitoringCard
              title="Performance Metrics"
              type="metrics"
              tasks={tasks}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
} 