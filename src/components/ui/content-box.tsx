import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ContentBoxProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentBox({ children, className }: ContentBoxProps) {
  return (
    <motion.div 
      className={cn(
        "bg-card/50 backdrop-blur-sm border-t border-border/50 p-4 mb-24 mx-0 sticky top-[44px] overflow-hidden",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
      }}
    >
      {children}
    </motion.div>
  );
}
