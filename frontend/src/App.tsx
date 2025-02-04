import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Task, TaskStatus } from './types/task';
import { Visualization } from './components/Visualization';
import { Layout } from './components/Layout';
import { WebSocketService } from './services/websocket';
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
  const wsService = useRef<WebSocketService>(new WebSocketService());

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

  // Handle task updates and messages
  const handleTaskUpdate = useCallback((taskId: string, data: any) => {
    if (data.status) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: data.status, 
                progress: data.progress || task.progress,
                updatedAt: new Date()
              }
            : task
        )
      );

      if (data.status === 'COMPLETED') {
        setMessagesMap(prev => {
          const taskMessages = prev[taskId] || [];
          const lastSystemMessageIndex = [...taskMessages].reverse().findIndex(msg => 
            msg.type === 'system' && msg.steps
          );
          
          if (lastSystemMessageIndex === -1) return prev;
          
          const actualIndex = taskMessages.length - 1 - lastSystemMessageIndex;
          const updatedMessages = [...taskMessages];
          updatedMessages[actualIndex] = {
            ...updatedMessages[actualIndex],
            text: "Task completed",
            isStreaming: false,
            steps: updatedMessages[actualIndex].steps?.map(step => ({
              ...step,
              status: 'completed' as const
            }))
          };

          return {
            ...prev,
            [taskId]: updatedMessages
          };
        });

        // Close WebSocket connection for completed task
        wsService.current.closeTaskConnection(taskId);
      }
    }
  }, []);

  // Create WebSocket connection when task becomes active
  useEffect(() => {
    if (activeTaskId && !activeTaskId.startsWith('pending-')) {
      wsService.current.createTaskConnection(
        activeTaskId,
        (data) => handleTaskUpdate(activeTaskId, data)
      );
    }

    return () => {
      if (activeTaskId) {
        wsService.current.closeTaskConnection(activeTaskId);
      }
    };
  }, [activeTaskId, handleTaskUpdate]);

  // Cleanup all connections on unmount
  useEffect(() => {
    return () => {
      wsService.current.closeAllConnections();
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

  const handleSendMessage = async (taskId: string, message: string) => {
    const task = tasks.find(t => t.id === taskId);
    
    // Only block messages for ERROR status (cancelled tasks)
    if (task?.status === 'ERROR') {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Cannot send message - task has been cancelled",
        type: 'system',
        timestamp: new Date(),
      };
      
      setMessagesMap(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), errorMessage]
      }));
      return;
    }

    // For all non-error tasks (including completed ones), add the message
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

    try {
      // Send message to backend
      const response = await fetch(`http://localhost:8000/tasks/${taskId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to send message');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCancelTask = async (taskId: string) => {
    // Immediately show cancellation in UI
    const cancelMessage: Message = {
      id: Date.now().toString(),
      text: "Task cancelled by user",
      type: 'system',
      timestamp: new Date(),
    };
    
    setMessagesMap(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), cancelMessage]
    }));

    setTasks((prevTasks) => prevTasks.map((task) => 
      task.id === taskId 
        ? { ...task, status: 'ERROR' as TaskStatus }
        : task
    ));

    try {
      // Send cancellation request to backend
      const response = await fetch(`http://localhost:8000/tasks/${taskId}/cancel`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to cancel task');
    } catch (error) {
      console.error('Error cancelling task:', error);
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
      onCancelTask={handleCancelTask}
      messagesMap={messagesMap}
      onSendMessage={handleSendMessage}
      isDarkMode={isDarkMode}
      onToggleTheme={handleThemeToggle}
    />
  );
}

export default App; 