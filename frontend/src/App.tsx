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
  // Load tasks from localStorage on initial render
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [initialTask];
  });
  
  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    const savedActiveId = localStorage.getItem('activeTaskId');
    return savedActiveId || initialTask.id;
  });

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('activeTaskId', activeTaskId || '');
  }, [activeTaskId]);

  // WebSocket connection for all tasks
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onopen = () => {
      console.log('WebSocket Connected');
      // Subscribe to updates for all tasks
      tasks.forEach(task => {
        ws.send(JSON.stringify({ type: 'SUBSCRIBE', taskId: task.id }));
      });
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
      // Attempt to reconnect after 2 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        // The effect will run again and attempt to reconnect
      }, 2000);
    };

    return () => {
      ws.close();
    };
  }, []); // Empty dependency array to only run on mount

  const handleAddTask = async () => {
    try {
      const response = await fetch('http://localhost:8000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'New task description',
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create task');
      
      const newTask = await response.json();
      setTasks(prev => [...prev, newTask]);
      setActiveTaskId(newTask.id);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    console.log('Selecting task:', taskId); // Debug log
    setActiveTaskId(taskId);
  };

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

  return (
    <Layout
      tasks={tasks}
      activeTaskId={activeTaskId}
      onAddTask={handleAddTask}
      onTaskSelect={handleTaskSelect}
    />
  );
}

export default App; 