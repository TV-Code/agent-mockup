import React from 'react';
import { motion } from 'framer-motion';
import styles from './InteractionCard.module.css';
import clsx from 'clsx';

interface InteractionCardProps {
  activeTaskId: string | null;
}

export function InteractionCard({ activeTaskId }: InteractionCardProps) {
  const isActive = activeTaskId !== null;

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
        <div className={styles.cardContent}>
          <div className={styles.messageContainer}>
            {/* Messages will go here */}
          </div>
          
          <div className={styles.inputArea}>
            <textarea 
              className={styles.textarea}
              placeholder="Type your message..."
              rows={1}
            />
            <motion.button
              className={styles.sendButton}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-5 h-5"
              >
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}