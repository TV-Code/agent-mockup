import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Task, TaskStatus } from './types/task';
import { Visualization } from './components/Visualization';
import { Layout } from './components/Layout';
import './App.css';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'system';
  timestamp: Date;
  isStreaming?: boolean;
  steps?: {
    title: string;
    status: 'completed' | 'in-progress' | 'pending';
    timeEstimate?: string;
  }[];
}

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
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Add theme toggle handler
  const handleThemeToggle = useCallback(() => {
    setIsDarkMode(prev => !prev);
    // You can add additional theme-related logic here
  }, []);

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
    // If switching away from a pending task that hasn't been started, remove it
    if (pendingTask && activeTaskId === pendingTask.id && !messagesMap[pendingTask.id]) {
      setPendingTask(null);
    }
    
    // If switching to an empty string (task removal) and we have other tasks,
    // select the most recent non-pending task
    if (!taskId) {
      const nonPendingTasks = tasks.filter(t => !t.id.startsWith('pending-'));
      if (nonPendingTasks.length > 0) {
        setActiveTaskId(nonPendingTasks[nonPendingTasks.length - 1].id);
      } else {
        setActiveTaskId(null);
      }
      return;
    }

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

      // Create initial message
      const initialUserMessage: Message = {
        id: Date.now().toString(),
        text: initialMessage,
        type: 'user',
        timestamp: new Date()
      };

      // Add initial message and simulate AI response
      setMessagesMap(prev => ({
        ...prev,
        [newTask.id]: [initialUserMessage]
      }));

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'll help you with that. Let me break this down into steps...",
          type: 'system',
          timestamp: new Date(),
          isStreaming: true,
          steps: [
            { title: "Analyzing request", status: 'completed' },
            { title: "Planning execution steps", status: 'completed' },
            { title: "Executing planned actions", status: 'in-progress', timeEstimate: "~2 min" },
            { title: "Reviewing results", status: 'pending' }
          ]
        };

        setMessagesMap(prev => ({
          ...prev,
          [newTask.id]: [...prev[newTask.id], aiResponse]
        }));
      }, 500);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleSendMessage = (taskId: string, message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      type: 'user',
      timestamp: new Date()
    };

    setMessagesMap(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), newMessage]
    }));

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'll help you with that. Let me break this down into steps...",
        type: 'system',
        timestamp: new Date(),
        isStreaming: true,
        steps: [
          { title: "Analyzing request", status: 'completed' },
          { title: "Planning execution steps", status: 'completed' },
          { title: "Executing planned actions", status: 'in-progress', timeEstimate: "~2 min" },
          { title: "Reviewing results", status: 'pending' }
        ]
      };

      setMessagesMap(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), aiResponse]
      }));
    }, 500);
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
      messagesMap={messagesMap}
      onSendMessage={handleSendMessage}
      isDarkMode={isDarkMode}
      onToggleTheme={handleThemeToggle}
    />
  );
}

export default App; 