import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Task, TaskStatus } from './types/task';
import { Visualization } from './components/Visualization';
import { Layout } from './components/Layout';
import './App.css';

// Initial task for demonstration
const initialTask: Task = {
  id: '1',
  name: 'Initial Task',
  status: 'PENDING',
  progress: 0,
  description: 'Ready to start processing',
  createdAt: new Date(),
  updatedAt: new Date(),
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [pendingTask, setPendingTask] = useState<Task | null>(null);

  // Load initial tasks from the server
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:8000/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const tasks = await response.json();
        setTasks(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  // WebSocket connection for task updates
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onopen = () => {
      console.log('WebSocket Connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.taskId && data.status) {
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task.id === data.taskId 
                ? { 
                    ...task, 
                    status: data.status, 
                    progress: data.progress || task.progress,
                    updatedAt: new Date()
                  }
                : task
            )
          );
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setTimeout(() => {
        console.log('Attempting to reconnect...');
      }, 2000);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleAddTask = () => {
    // Create a temporary task for UI purposes only
    const tempTask: Task = {
      id: 'pending-' + Date.now(),
      name: '',
      status: 'PENDING',
      progress: 0,
      description: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setPendingTask(tempTask);
    setActiveTaskId(tempTask.id);
  };

  const handleTaskSelect = (taskId: string) => {
    setActiveTaskId(taskId);
  };

  const handleTaskStart = async (taskId: string, initialMessage: string) => {
    if (!taskId.startsWith('pending-')) return;

    try {
      // Create the actual task with the backend
      const response = await fetch('http://localhost:8000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: initialMessage,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create task');
      
      const newTask = await response.json();
      
      // Replace the pending task with the real one
      setTasks(prev => [...prev, newTask]);
      setPendingTask(null);
      setActiveTaskId(newTask.id);
    } catch (error) {
      console.error('Error creating task:', error);
      // Handle error - maybe show a notification to the user
    }
  };

  // Combine real tasks with pending task for UI
  const allTasks = pendingTask 
    ? [...tasks, pendingTask]
    : tasks;

  return (
    <Layout
      tasks={allTasks}
      activeTaskId={activeTaskId}
      onAddTask={handleAddTask}
      onTaskSelect={handleTaskSelect}
      onTaskStart={handleTaskStart}
    />
  );
}

export default App; 