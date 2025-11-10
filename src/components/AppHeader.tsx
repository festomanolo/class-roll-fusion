import { FC } from 'react';
import { motion } from 'framer-motion';
import classRollLogo from '../assets/class-roll.svg';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export const AppHeader: FC<AppHeaderProps> = ({ title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-700"
    style={{
      borderBottomLeftRadius: '24px',
      borderBottomRightRadius: '24px',
      backdropFilter: 'blur(20px) saturate(150%)',
      WebkitBackdropFilter: 'blur(20px) saturate(150%)',
    }}
  >
    <div className="h-16 px-4 flex items-center">
      <div className="flex items-center gap-3">
        <img
          src={classRollLogo}
          alt="Class-Roll"
          className="h-10 w-10 shrink-0 object-contain rounded-full"
        />
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight font-poppins">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 font-poppins">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);
