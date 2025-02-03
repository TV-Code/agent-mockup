import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './InteractionCard.module.css';
import clsx from 'clsx';
import { Task } from '../types/task';
import { ChatBubbleLeftIcon, XMarkIcon, PaperAirplaneIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface InteractionCardProps {
  activeTaskId: string | null;
  tasks: Task[];
  onTaskStart?: (taskId: string, initialMessage: string) => void;
}

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

const mockSteps = [
  { title: "Analyzing request", status: 'completed' as const },
  { title: "Planning execution steps", status: 'completed' as const },
  { title: "Executing planned actions", status: 'in-progress' as const, timeEstimate: "~2 min" },
  { title: "Reviewing results", status: 'pending' as const }
];

export function InteractionCard({ activeTaskId, tasks, onTaskStart }: InteractionCardProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeTask = tasks.find(t => t.id === activeTaskId);
  const isActive = activeTaskId !== null;
  const isPending = activeTaskId?.startsWith('pending-');

  // Simulate streaming effect
  useEffect(() => {
    if (isStreaming) {
      const timer = setTimeout(() => {
        setIsStreaming(false);
        setMessages(prev => prev.map(msg => 
          msg.isStreaming ? { ...msg, isStreaming: false } : msg
        ));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isStreaming]);

  const handleSendMessage = () => {
    if (!message.trim() || !activeTask) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      type: 'user',
      timestamp: new Date()
    };
    
    // If this is a pending task and it's the first message, start the actual task
    if (isPending && messages.length === 0) {
      onTaskStart?.(activeTask.id, message);
    }
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response with streaming
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'll help you with that. Let me break this down into steps...",
        type: 'system',
        timestamp: new Date(),
        isStreaming: true,
        steps: mockSteps
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsStreaming(true);
    }, 500);

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.cardContainer}>
      <motion.div
        className={clsx(styles.glassCard, {
          [styles.active]: isActive,
          [styles.inactive]: !isActive
        })}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Animated Background Effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl overflow-hidden"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, rgba(255, 160, 122, 0.03), transparent 50%)',
              'radial-gradient(circle at 100% 100%, rgba(255, 160, 122, 0.03), transparent 50%)',
              'radial-gradient(circle at 0% 100%, rgba(255, 160, 122, 0.03), transparent 50%)',
              'radial-gradient(circle at 100% 0%, rgba(255, 160, 122, 0.03), transparent 50%)',
              'radial-gradient(circle at 0% 0%, rgba(255, 160, 122, 0.03), transparent 50%)',
            ]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <div className={styles.cardContent}>
          {activeTask && (
            <motion.div 
              className={styles.taskInfo}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.taskHeader}>
                <h2 className={styles.taskTitle}>
                  {isPending ? (messages[0]?.text.slice(0, 50) || 'New Task') : 
                   activeTask.name || activeTask.description || 'New Task'}
                </h2>
                <motion.div 
                  className={clsx(styles.taskStatus, styles[activeTask.status.toLowerCase()])}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  {activeTask.status}
                </motion.div>
              </div>
              
              <div className={styles.progressContainer}>
                <div className={styles.progressLabel}>
                  <span>Progress</span>
                  <span>{Math.min(100, Math.round(activeTask.progress))}%</span>
                </div>
                <div className={styles.progressBar}>
                  <motion.div 
                    className={styles.progressFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, activeTask.progress)}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              </div>
              
              {isPending && messages.length === 0 && (
                <motion.p 
                  className={styles.taskDescription}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Type your message to start the task...
                </motion.p>
              )}
            </motion.div>
          )}

          <div className={styles.messageContainer}>
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={clsx(styles.message, styles[msg.type])}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className={styles.messageContent}>
                    <div className={clsx({ [styles.streamingText]: msg.isStreaming })}>
                      {msg.text}
                      {msg.isStreaming && <span className={styles.cursor} />}
                    </div>
                    {msg.steps && (
                      <div className={styles.steps}>
                        {msg.steps.map((step, index) => (
                          <motion.div
                            key={index}
                            className={clsx(styles.step, styles[step.status])}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <ArrowRightIcon className={styles.stepIcon} />
                            <span>{step.title}</span>
                            {step.timeEstimate && (
                              <span className={styles.timeEstimate}>{step.timeEstimate}</span>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={styles.messageTime}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
          
          <div className={styles.inputArea}>
            <textarea 
              ref={textareaRef}
              className={styles.textarea}
              placeholder={isActive ? 
                (isPending ? "Type your message to start the task..." : "Type your message...") 
                : "Select a task to start interaction"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isActive}
            />
            <motion.button
              className={styles.sendButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!isActive || !message.trim()}
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}