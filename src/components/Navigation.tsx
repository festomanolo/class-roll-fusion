import React from "react";
import { motion } from "framer-motion";
import { BookOpen, BarChart3, Settings, Home, Calendar, Library } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'classes', icon: BookOpen, label: 'Classes' },
  { id: 'plans', icon: Calendar, label: 'Plans' },
  { id: 'subjects', icon: BookOpen, label: 'Subjects' },
  { id: 'reports', icon: BarChart3, label: 'Reports' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <motion.nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-200 dark:bg-gray-900/90 dark:border-gray-800 shadow-lg rounded-t-3xl"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px'
      }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative flex flex-col items-center justify-center w-14 h-full rounded-xl"
              whileTap={{ scale: 0.95 }}
            >
                <motion.div
                className={`flex flex-col items-center transition-all duration-200`}
                style={{ color: isActive ? 'hsl(var(--primary))' : undefined }}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                whileHover={{
                  scale: isActive ? 1.1 : 1.05
                }}
                transition={{ duration: 0.15 }}
              >
                {isActive && (
                  <>
                    <motion.div
                      className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      initial={false}
                    />
                    <motion.div
                      className="absolute -top-1 w-8 h-8 rounded-full"
                      style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--primary-glow) / 0.08))' }}
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  </>
                )}
                <Icon className="w-5 h-5 mb-1 relative z-10" strokeWidth={isActive ? 2 : 1.5} />
                <span className={`text-xs font-poppins leading-none tracking-tight relative z-10 ${isActive ? 'font-semibold' : ''}`} style={{ color: isActive ? 'hsl(var(--primary))' : undefined }}>
                  {item.label}
                </span>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}

export { Navigation };
