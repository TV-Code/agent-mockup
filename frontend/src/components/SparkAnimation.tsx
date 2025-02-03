import React from 'react';
import { motion } from 'framer-motion';

interface SparkAnimationProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  onComplete: () => void;
}

export function SparkAnimation({ startX, startY, endX, endY, onComplete }: SparkAnimationProps) {
  const cornerX = endX;
  const cornerY = startY;
  
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.8 }}
      onAnimationComplete={onComplete}
    >
      <svg className="w-full h-full">
        <defs>
          <radialGradient id="particleGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 160, 122, 0.8)" />
            <stop offset="100%" stopColor="rgba(255, 160, 122, 0)" />
          </radialGradient>
          
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Morphing core */}
        <g filter="url(#glow)" transform={`translate(${endX}, ${endY})`}>
          <motion.path
            d="M -6 0 C -6 -3.3 -3.3 -6 0 -6 C 3.3 -6 6 -3.3 6 0 C 6 3.3 3.3 6 0 6 C -3.3 6 -6 3.3 -6 0"
            fill="rgba(255, 160, 122, 0.15)"
            animate={{
              d: [
                "M -6 0 C -6 -3.3 -3.3 -6 0 -6 C 3.3 -6 6 -3.3 6 0 C 6 3.3 3.3 6 0 6 C -3.3 6 -6 3.3 -6 0", // circle
                "M -8 0 C -8 -2 -3.3 -6 0 -6 C 3.3 -6 8 -2 8 0 C 8 2 3.3 6 0 6 C -3.3 6 -8 2 -8 0", // peanut horizontal
                "M -6 0 C -6 -3.3 -3.3 -6 0 -6 C 3.3 -6 6 -3.3 6 0 C 6 3.3 3.3 6 0 6 C -3.3 6 -6 3.3 -6 0" // back to circle
              ],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.path
            d="M -4 0 C -4 -2.2 -2.2 -4 0 -4 C 2.2 -4 4 -2.2 4 0 C 4 2.2 2.2 4 0 4 C -2.2 4 -4 2.2 -4 0"
            fill="rgba(255, 160, 122, 0.8)"
            animate={{
              d: [
                "M -4 0 C -4 -2.2 -2.2 -4 0 -4 C 2.2 -4 4 -2.2 4 0 C 4 2.2 2.2 4 0 4 C -2.2 4 -4 2.2 -4 0", // circle
                "M -6 0 C -6 -1.5 -2.2 -4 0 -4 C 2.2 -4 6 -1.5 6 0 C 6 1.5 2.2 4 0 4 C -2.2 4 -6 1.5 -6 0", // peanut horizontal
                "M -4 0 C -4 -2.2 -2.2 -4 0 -4 C 2.2 -4 4 -2.2 4 0 C 4 2.2 2.2 4 0 4 C -2.2 4 -4 2.2 -4 0" // back to circle
              ],
              rotate: [0, -180, -360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </g>

        {/* Trail path - very subtle guide */}
        <motion.path
          d={`M ${startX} ${startY} L ${cornerX} ${cornerY} L ${endX} ${endY}`}
          stroke="rgba(255, 160, 122, 0.05)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {/* Particles */}
        {[...Array(3)].map((_, i) => {
          const delay = i * 0.12;
          const size = 3 + Math.random() * 1;
          
          return (
            <g key={i} filter="url(#glow)">
              {/* Core particle */}
              <motion.circle
                cx="0"
                cy="0"
                r={size}
                fill="rgba(255, 160, 122, 0.9)"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.9, 0.9, 0],
                }}
                transition={{
                  duration: 0.6,
                  delay,
                  times: [0, 0.1, 0.8, 1],
                }}
              >
                <animateMotion
                  dur="0.6s"
                  begin={`${delay}s`}
                  fill="freeze"
                  path={`M ${startX} ${startY} L ${cornerX} ${cornerY} L ${endX} ${endY}`}
                />
              </motion.circle>

              {/* Subtle glow */}
              <motion.circle
                cx="0"
                cy="0"
                r={size * 2}
                fill="url(#particleGradient)"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.4, 0.4, 0],
                }}
                transition={{
                  duration: 0.6,
                  delay,
                  times: [0, 0.1, 0.8, 1],
                }}
              >
                <animateMotion
                  dur="0.6s"
                  begin={`${delay}s`}
                  fill="freeze"
                  path={`M ${startX} ${startY} L ${cornerX} ${cornerY} L ${endX} ${endY}`}
                />
              </motion.circle>
            </g>
          );
        })}

        {/* Start effect */}
        <g filter="url(#glow)">
          <motion.circle
            cx={startX}
            cy={startY}
            r="8"
            fill="rgba(255, 160, 122, 0.2)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 0],
              opacity: [0, 0.4, 0]
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut"
            }}
          />
          <motion.circle
            cx={startX}
            cy={startY}
            r="4"
            fill="rgba(255, 160, 122, 0.8)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: 0.25,
              ease: "easeOut"
            }}
          />
        </g>

        {/* Corner effect - very subtle */}
        <motion.circle
          cx={cornerX}
          cy={cornerY}
          r="4"
          fill="rgba(255, 160, 122, 0.3)"
          filter="url(#glow)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.3, 0]
          }}
          transition={{
            duration: 0.25,
            delay: 0.3,
            ease: "easeOut"
          }}
        />
      </svg>
    </motion.div>
  );
} 