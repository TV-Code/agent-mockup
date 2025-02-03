import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
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
  onTaskStart: (taskId: string, initialMessage: string) => void;
}

export function Layout({ tasks, activeTaskId, onAddTask, onTaskSelect, onTaskStart }: LayoutProps) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!backgroundRef.current) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Calculate relative position
      const x = (clientX / innerWidth - 0.5) * 2;
      const y = (clientY / innerHeight - 0.5) * 2;
      
      // Animate the background gradients
      controls.start({
        background: `radial-gradient(circle at ${50 + x * 10}% ${50 + y * 10}%, rgba(255,160,122,0.03), transparent 70%),
                     radial-gradient(circle at ${40 - x * 5}% ${60 - y * 5}%, rgba(255,160,122,0.03), transparent 70%)`
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [controls]);

  return (
    <div className="relative min-h-screen bg-surface text-white p-6 overflow-hidden">
      {/* Animated Background Effect */}
      <motion.div
        ref={backgroundRef}
        className="fixed inset-0 pointer-events-none"
        animate={controls}
        transition={{ type: "tween", ease: "easeOut", duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-surface-300 to-surface" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <TaskTabs
          tasks={tasks}
          activeTaskId={activeTaskId}
          onAddTask={onAddTask}
          onTaskSelect={onTaskSelect}
          className="mb-6"
        />

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
          {/* Left: Main Interaction Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-4 rounded-2xl overflow-hidden"
            transition={{ duration: 0.2 }}
          >
            <div className="h-full bg-surface-50 shadow-premium">
              <InteractionCard 
                activeTaskId={activeTaskId} 
                tasks={tasks}
                onTaskStart={onTaskStart}
              />
            </div>
          </motion.div>

          {/* Center: Ferro Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-4 relative"
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 rounded-2xl overflow-hidden bg-surface-200 shadow-premium">
              <Canvas camera={{ position: [0, 0, 4] }}>
                <FerroCore tasks={tasks} activeTaskId={activeTaskId} />
              </Canvas>
            </div>
          </motion.div>

          {/* Right: Monitoring Cards */}
          <div className="col-span-4 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
              transition={{ duration: 0.2 }}
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
              transition={{ delay: 0.1, duration: 0.2 }}
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
    </div>
  );
} 