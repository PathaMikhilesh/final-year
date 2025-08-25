import React, { useState, useEffect } from 'react';
import { User } from './types';
import { authService } from './services/authService';
import Header from './components/Header';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import AdminWorkflowDashboard from './components/AdminWorkflowDashboard';
import { LoadingSpinnerIcon } from './components/icons/Icons';
import LandingPage from './components/LandingPage';
import RoleSelectionPage from './components/RoleSelectionPage';

type Theme = 'light' | 'dark' | 'system';
type AuthFlowState = 'landing' | 'roleSelection' | 'login';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
  
  // State for the unauthenticated user flow
  const [authFlowState, setAuthFlowState] = useState<AuthFlowState>('landing');
  const [selectedRole, setSelectedRole] = useState<User['role'] | null>(null);


  // Robust theme-switching logic
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && mediaQuery.matches);
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('theme') === 'system') {
        if (e.matches) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };
  
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (user) {
      await authService.logout(user);
      // Reset the onboarding flow for the next user
      setAuthFlowState('landing');
      setSelectedRole(null);
    }
  };
  
  const handleRequestAdmin = async () => {
    if (user) {
      try {
        await authService.requestAdminAccess(user.uid);
      } catch (error) {
        console.error("Failed to request admin access", error);
        alert("There was an error submitting your request.");
      }
    }
  };

  const handleAcknowledgeAdmin = async () => {
    if (user && user.isNewAdmin) {
        try {
            await authService.acknowledgeAdminWelcome(user.uid);
        } catch (error) {
            console.error("Failed to acknowledge admin welcome", error);
            alert("Could not update your status. Please try again later.");
        }
    }
  };

  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        if (user.isNewAdmin) {
          return <AdminWorkflowDashboard user={user} onAcknowledge={handleAcknowledgeAdmin} />;
        }
        return <AdminDashboard user={user} />;
      case 'superadmin':
        return <SuperAdminDashboard user={user} />;
      case 'user':
      default:
        return <UserDashboard user={user} />;
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoadingSpinnerIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
      </div>
    );
  }

  if (!user) {
    switch (authFlowState) {
      case 'landing':
        return <LandingPage onGetStarted={() => setAuthFlowState('roleSelection')} />;
      case 'roleSelection':
        return <RoleSelectionPage onRoleSelect={(role) => {
          setSelectedRole(role);
          setAuthFlowState('login');
        }} />;
      case 'login':
        if (selectedRole) {
          return <Login selectedRole={selectedRole} onBack={() => setAuthFlowState('roleSelection')} />;
        }
        // Fallback if role somehow isn't set
        setAuthFlowState('roleSelection');
        return <RoleSelectionPage onRoleSelect={(role) => {
          setSelectedRole(role);
          setAuthFlowState('login');
        }} />;
      default:
        return <LandingPage onGetStarted={() => setAuthFlowState('roleSelection')} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-white flex flex-col">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onRequestAdminAccess={handleRequestAdmin}
        currentTheme={theme}
        onSetTheme={handleSetTheme}
      />
      <div className="flex-1">
        {renderDashboard()}
      </div>
    </div>
  );
};

export default App;