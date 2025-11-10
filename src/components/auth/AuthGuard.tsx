/**
 * Auth Guard Component
 * Protects routes and ensures user is authenticated
 */

import { useEffect, useState } from 'react';
import { AuthService } from '@/services/auth/AuthService';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { TeacherSetup, TeacherProfile } from '@/components/TeacherSetup';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [teacherProfile, setTeacherProfile] = useLocalStorage<TeacherProfile | null>('teacherProfile', null);
  const [showTeacherSetup, setShowTeacherSetup] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔐 Checking authentication...');
      const authenticated = await AuthService.isAuthenticated();
      console.log('🔐 Authentication result:', authenticated);
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    // Check if teacher profile exists
    if (!teacherProfile) {
      setShowTeacherSetup(true);
    }
  };

  const handleTeacherSetupComplete = (profile: TeacherProfile) => {
    setTeacherProfile(profile);
    setShowTeacherSetup(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--apple-background-primary)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-[var(--apple-blue)]" />
          <p className="apple-body text-[var(--apple-label-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--apple-background-secondary)] p-4">
        <div className="w-full max-w-md bg-[var(--apple-background-primary)] rounded-[28px] shadow-[var(--shadow-xl)] border border-[hsl(var(--glass-border)/0.35)] ios-blur">
          {showRegister ? (
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setShowRegister(false)}
            />
          ) : (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={() => setShowRegister(true)}
            />
          )}
        </div>
      </div>
    );
  }

  if (showTeacherSetup) {
    return <TeacherSetup onComplete={handleTeacherSetupComplete} />;
  }

  return <>{children}</>;
};
