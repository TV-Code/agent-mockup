import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './InteractionCard.module.css';
import clsx from 'clsx';
import { Task } from '../types/task';
import { ChatBubbleLeftIcon, XMarkIcon, PaperAirplaneIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { SparkAnimation } from './SparkAnimation';

interface InteractionCardProps {
  activeTaskId: string | null;
  tasks: Task[];
  onTaskStart?: (taskId: string, initialMessage: string) => void;
  messagesMap: Record<string, Message[]>;
  onSendMessage: (taskId: string, message: string) => void;
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

export function InteractionCard({ 
  activeTaskId, 
  tasks, 
  onTaskStart,
  messagesMap,
  onSendMessage 
}: InteractionCardProps) {
  const [message, setMessage] = useState('');
  const [showSparkAnimation, setShowSparkAnimation] = useState(false);
  const [sparkCoords, setSparkCoords] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  
  const activeTask = tasks.find(t => t.id === activeTaskId);
  const isActive = activeTaskId !== null;
  const isPending = activeTaskId?.startsWith('pending-');
  
  const currentMessages = activeTaskId ? messagesMap[activeTaskId] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSendMessage = () => {
    if (!message.trim() || !activeTask || !activeTaskId) return;
    
    // Get coordinates for the animation
    if (sendButtonRef.current) {
      const sendButtonRect = sendButtonRef.current.getBoundingClientRect();
      const ferroCore = document.querySelector('.ferro-core');
      if (ferroCore) {
        const ferroCoreRect = ferroCore.getBoundingClientRect();
        setSparkCoords({
          startX: sendButtonRect.left + sendButtonRect.width / 2,
          startY: sendButtonRect.top + sendButtonRect.height / 2,
          endX: ferroCoreRect.left + ferroCoreRect.width / 2,
          endY: ferroCoreRect.top + ferroCoreRect.height / 2
        });
        setShowSparkAnimation(true);
      }
    }
    
    // If this is a pending task and it's the first message, start the actual task
    if (isPending && (!messagesMap[activeTaskId] || messagesMap[activeTaskId].length === 0)) {
      onTaskStart?.(activeTask.id, message);
    } else {
      onSendMessage(activeTaskId, message);
    }
    
    setMessage('');
  };

  const handleSparkComplete = () => {
    setShowSparkAnimation(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.cardContainer}>
      {showSparkAnimation && (
        <SparkAnimation
          startX={sparkCoords.startX}
          startY={sparkCoords.startY}
          endX={sparkCoords.endX}
          endY={sparkCoords.endY}
          onComplete={handleSparkComplete}
        />
      )}
      <motion.div
        className={clsx(styles.glassCard, {
          [styles.active]: isActive,
          [styles.inactive]: !isActive
        })}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.cardContent}>
          {activeTask && (
            <motion.div 
              className={styles.taskInfo}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.taskHeader}>
                <h2 className={styles.taskTitle}>
                  {isPending ? (currentMessages[0]?.text.slice(0, 50) || 'New Task') : 
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
              
              {isPending && currentMessages.length === 0 && (
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
              {currentMessages.map((msg) => (
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
              ref={sendButtonRef}
              className={styles.sendButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!isActive || !message.trim()}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}