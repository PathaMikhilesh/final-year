
import React from 'react';
import { User } from '../types';
import UserDashboard from './UserDashboard';
import { ArrowRightIcon, ShieldCheckIcon } from './icons/Icons';

interface AdminWorkflowDashboardProps {
  user: User;
  onAcknowledge: () => void;
}

const AdminWorkflowDashboard: React.FC<AdminWorkflowDashboardProps> = ({ user, onAcknowledge }) => {
  return (
    <div className="flex h-[calc(100vh_-_4rem)] bg-gray-100 dark:bg-gray-900">
      {/* User Dashboard side */}
      <div className="flex-1 w-2/3 overflow-hidden">
        <UserDashboard user={user} />
      </div>
      
      {/* Admin Welcome Panel */}
      <div className="w-1/3 max-w-md border-l border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900 flex flex-col p-8 justify-center animate-fade-in">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-lg border border-indigo-500/30 shadow-2xl">
            <div className="text-center">
                <ShieldCheckIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, Administrator!</h1>
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                    Your request for admin access has been approved. You now have access to powerful new tools.
                </p>
            </div>
            
            <div className="mt-6 text-left text-gray-700 dark:text-gray-300 space-y-3">
                <p>You can now:</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Manage all users in the application.</li>
                    <li>View system-wide settings.</li>
                    <li>Oversee application permissions.</li>
                </ul>
                <p className="pt-2">
                    You can continue to use the MVP generator on the left, or proceed to your new dedicated dashboard.
                </p>
            </div>
            
            <button
                onClick={onAcknowledge}
                className="mt-8 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
            >
                Proceed to Admin Dashboard
                <ArrowRightIcon className="h-5 w-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminWorkflowDashboard;