import { motion } from "framer-motion";
import { Users, BookOpen, BarChart3, Settings, Home } from "lucide-react";
import { GlassCard } from "./ui/glass-card";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'classes', icon: BookOpen, label: 'Classes' },
  { id: 'students', icon: Users, label: 'Students' },
  { id: 'reports', icon: BarChart3, label: 'Reports' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <GlassCard className="fixed bottom-6 left-4 right-4 z-50 p-2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "var(--gradient-primary)",
                    boxShadow: "0 4px 20px hsla(var(--primary), 0.3)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}
              <Icon className={`relative z-10 w-5 h-5 mb-1 ${
                isActive ? 'text-white' : ''
              }`} />
              <span className={`relative z-10 text-xs font-medium ${
                isActive ? 'text-white' : ''
              }`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </GlassCard>
  );
}