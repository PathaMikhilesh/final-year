
import React, { useState, useEffect, useCallback } from 'react';
import { User, SessionLog } from '../types';
import { authService } from '../services/authService';
import { LoadingSpinnerIcon, UsersIcon, Cog6ToothIcon, ShieldCheckIcon, CheckBadgeIcon, ExclamationTriangleIcon, ClockIcon } from './icons/Icons';

interface AdminDashboardProps {
    user: User;
    // Props for when this component is controlled by a parent (like SuperAdminDashboard)
    users?: User[];
    isLoading?: boolean;
    error?: string | null;
    onDataRefresh?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    user, 
    users: controlledUsers, 
    isLoading: controlledIsLoading, 
    error: controlledError,
    onDataRefresh
}) => {
    // Local state for when the component is used standalone (as an Admin)
    const [localUsers, setLocalUsers] = useState<User[]>([]);
    const [localIsLoading, setLocalIsLoading] = useState(true);
    const [localError, setLocalError] = useState<string | null>(null);

    // State for session logs
    const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);

    // Determine which state to use
    const isControlled = controlledUsers !== undefined;
    const users = isControlled ? controlledUsers : localUsers;
    const isLoading = isControlled ? controlledIsLoading! : localIsLoading;
    const error = isControlled ? controlledError! : localError;
    
    const fetchUsers = useCallback(async () => {
        // If controlled, the parent handles fetching. If standalone, fetch locally.
        if (isControlled) {
            onDataRefresh?.();
            return;
        }
        try {
            setLocalIsLoading(true);
            setLocalError(null);
            const userList = await authService.getUsers();
            setLocalUsers(userList);
        } catch (err) {
            setLocalError('Failed to fetch users.');
            console.error(err);
        } finally {
            setLocalIsLoading(false);
        }
    }, [isControlled, onDataRefresh]);
    
    const fetchLogs = useCallback(async () => {
        try {
            setLogsLoading(true);
            const logs = await authService.getSessionLogs();
            setSessionLogs(logs);
        } catch (error) {
            console.error("Failed to fetch session logs", error);
        } finally {
            setLogsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Only fetch locally if not controlled
        if (!isControlled) {
            fetchUsers();
        }
        fetchLogs();
    }, [isControlled, fetchUsers, fetchLogs]);

    const handleDeleteUser = async (targetUser: User) => {
        if (window.confirm(`Are you sure you want to delete the user: ${targetUser.email}? This action cannot be undone.`)) {
            try {
                await authService.deleteUser(targetUser.uid, user);
                // Refresh data using the appropriate method
                fetchUsers();
            } catch (err: any) {
                alert(`Failed to delete user: ${err.message}`);
            }
        }
    };

    const canDelete = (targetUser: User): boolean => {
        if (user.uid === targetUser.uid) return false; // Cannot delete self
        if (user.role === 'superadmin') {
            return targetUser.role !== 'superadmin'; // Superadmin can delete anyone but themselves
        }
        if (user.role === 'admin') {
            return targetUser.role === 'user'; // Admin can only delete users
        }
        return false; // Users cannot delete anyone
    };
    
    const timeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <main className="p-4 sm:p-8 md:p-12">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Manage users, settings, and permissions for the application.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                           <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-white">
                             <UsersIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                             User Management
                           </h2>
                        </div>
                        <div className="p-2 sm:p-4">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64"><LoadingSpinnerIcon className="h-8 w-8" /></div>
                            ) : error ? (
                                <div className="text-center py-16 text-red-500 dark:text-red-400">{error}</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                                        <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3">User</th>
                                                <th scope="col" className="px-6 py-3">Status</th>
                                                <th scope="col" className="px-6 py-3">Verified</th>
                                                <th scope="col" className="px-6 py-3">Role</th>
                                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users && users.map((u) => (
                                                <tr key={u.uid} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                        <div className="font-semibold">{u.firstName} {u.lastName}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${u.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-200/20 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-200/20 dark:text-yellow-300'}`}>
                                                            {u.status === 'active' ? 'Active' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {u.isVerified ? (
                                                            <span title="Verified">
                                                                <CheckBadgeIcon className="h-6 w-6 text-green-500 dark:text-green-400" />
                                                            </span>
                                                        ) : (
                                                            <span title="Not Verified">
                                                                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                                            u.role === 'superadmin' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' :
                                                            u.role === 'admin' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-200/20 dark:text-indigo-300' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300'
                                                        }`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDeleteUser(u)}
                                                            disabled={!canDelete(u)}
                                                            className="font-medium text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                         <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                             <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                 <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-white">
                                   <ClockIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                   Session Activity
                                 </h2>
                             </div>
                             <div className="p-4 h-64 overflow-y-auto">
                                {logsLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinnerIcon /></div> : 
                                <ul className="space-y-3">
                                    {sessionLogs.map(log => (
                                        <li key={log.id} className="text-sm">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                                <span className={`font-bold ${log.action === 'login' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{log.action.toUpperCase()}</span>: {log.userEmail}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">{log.userRole.toUpperCase()} - {timeAgo(log.timestamp)}</p>
                                        </li>
                                    ))}
                                </ul>
                                }
                             </div>
                         </div>
                         <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                             <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-white mb-4">
                               <ShieldCheckIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                               Permissions
                             </h2>
                             <p className="text-gray-500 dark:text-gray-400 text-sm">Configure role-based access control (RBAC) and accept/decline user permission requests.</p>
                             <button className="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">Manage permissions &rarr;</button>
                         </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AdminDashboard;