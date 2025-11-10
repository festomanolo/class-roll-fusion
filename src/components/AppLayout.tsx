import { FC, ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { Navigation } from './Navigation';
import { motion } from 'framer-motion';
import { GradientBackground } from './GradientBackground';

interface AppLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  title: string;
  subtitle?: string;
}

export const AppLayout: FC<AppLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  title,
  subtitle
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <AppHeader title={title} subtitle={subtitle} />
      
      {/* Main Content */}
      <motion.main 
        className="pb-16 pt-4" // Add padding bottom for navigation
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="container mx-auto px-4">
      <div className="min-h-screen">
        <GradientBackground />
            {children}
          </div>
        </div>
      </motion.main>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};
