import React from 'react';
import { User } from '../types';
import { LogoIcon, UserCircleIcon, UsersIcon, KeyIcon } from './icons/Icons';

interface RoleSelectionPageProps {
  onRoleSelect: (role: User['role']) => void;
}

const RoleCard: React.FC<{
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ icon: Icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-6 bg-white dark:bg-gray-800/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
  >
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  </button>
);

const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ onRoleSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 animate-fade-in">
      <div className="text-center mb-10">
        <LogoIcon className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
          Choose Your Role
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
          How will you be using the MVP Generator today?
        </p>
      </div>
      <div className="w-full max-w-lg space-y-6">
        <RoleCard
          icon={UserCircleIcon}
          title="User"
          description="I want to generate an MVP plan for my idea."
          onClick={() => onRoleSelect('user')}
        />
        <RoleCard
          icon={UsersIcon}
          title="Admin"
          description="I need to manage users and application settings."
          onClick={() => onRoleSelect('admin')}
        />
        <RoleCard
          icon={KeyIcon}
          title="Superadmin"
          description="I require full system control and access."
          onClick={() => onRoleSelect('superadmin')}
        />
      </div>
    </div>
  );
};

export default RoleSelectionPage;
