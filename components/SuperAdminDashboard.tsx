
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import AdminDashboard from './AdminDashboard';
import { ShieldCheckIcon, LoadingSpinnerIcon } from './icons/Icons';

interface SuperAdminDashboardProps {
    user: User;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ user }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const allUsers = await authService.getUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error("Failed to fetch users for superadmin", error);
            setError("Failed to load user data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const handleApprove = async (uid: string) => {
        try {
            await authService.updateUser(uid, { role: 'admin', status: 'active', isNewAdmin: true });
            fetchAllUsers();
        } catch (error) {
            alert('Failed to approve request.');
        }
    };

    const handleDeny = async (uid: string) => {
        try {
            await authService.updateUser(uid, { status: 'active' });
            fetchAllUsers();
        } catch (error) {
            alert('Failed to deny request.');
        }
    };
    
    const pendingRequests = users.filter(u => u.status === 'pending_admin_approval');

    return (
        <div>
            <AdminDashboard 
                user={user} 
                users={users}
                isLoading={isLoading}
                error={error}
                onDataRefresh={fetchAllUsers}
            />

            <div className="p-4 sm:p-8 md:p-12 pt-0">
                 <div className="max-w-7xl mx-auto">
                    <div className="bg-white dark:bg-gray-800/50 border-2 border-dashed border-yellow-400 dark:border-yellow-500/50 rounded-lg mt-8">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                           <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-white">
                             <ShieldCheckIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
                             Admin Access Requests
                           </h2>
                        </div>
                        <div className="p-2 sm:p-4">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-24"><LoadingSpinnerIcon className="h-8 w-8" /></div>
                            ) : pendingRequests.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No pending requests.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                                        <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3">User</th>
                                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingRequests.map((req) => (
                                                <tr key={req.uid} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                        <div className="font-semibold">{req.firstName} {req.lastName}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{req.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-2">
                                                        <button onClick={() => handleApprove(req.uid)} className="font-medium text-green-600 dark:text-green-500 hover:text-green-500 dark:hover:text-green-400 px-3 py-1 bg-green-100 dark:bg-green-500/10 rounded-md">Approve</button>
                                                        <button onClick={() => handleDeny(req.uid)} className="font-medium text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 px-3 py-1 bg-red-100 dark:bg-red-500/10 rounded-md">Deny</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;