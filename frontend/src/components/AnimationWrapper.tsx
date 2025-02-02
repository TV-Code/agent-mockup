import React, { ReactNode, Fragment } from 'react';
import { AnimatePresence } from 'framer-motion';

interface AnimationWrapperProps {
  children: ReactNode;
  mode?: "sync" | "wait" | "popLayout";
}

export function AnimationWrapper({ children, mode }: AnimationWrapperProps): JSX.Element {
  const presence = AnimatePresence({ mode, children });
  
  // Ensure we always return a valid element by wrapping in Fragment
  return presence ? <Fragment>{presence}</Fragment> : <Fragment />;
} 