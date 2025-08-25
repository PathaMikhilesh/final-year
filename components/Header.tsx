import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { LogoIcon, ArrowRightOnRectangleIcon, SunIcon, MoonIcon, ComputerDesktopIcon, UserCircleIcon, PencilSquareIcon, Cog6ToothIcon } from './icons/Icons';

type Theme = 'light' | 'dark' | 'system';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onRequestAdminAccess: () => void;
  currentTheme: Theme;
  onSetTheme: (theme: Theme) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onRequestAdminAccess, currentTheme, onSetTheme }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const themes: { name: Theme, Icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
        { name: 'light', Icon: SunIcon },
        { name: 'dark', Icon: MoonIcon },
        { name: 'system', Icon: ComputerDesktopIcon },
    ];

    const PlanBadge = () => {
        if (!user.subscription) return null;

        let text: string;
        let classes: string;

        // Role-based badges take precedence
        if (user.role === 'superadmin') {
            text = 'Superadmin';
            classes = 'bg-red-500 text-white';
        } else if (user.role === 'admin') {
            text = 'Admin';
            classes = 'bg-purple-500 text-white';
        } else {
            // Subscription-based badges for users
            switch (user.subscription.plan) {
                case 'pro':
                    text = 'Pro Version';
                    classes = 'bg-indigo-500 text-white';
                    break;
                case 'team':
                    text = 'Team Plan';
                    classes = 'bg-teal-500 text-white';
                    break;
                case 'enterprise':
                    text = 'Enterprise';
                    classes = 'bg-yellow-400 text-yellow-900 font-bold';
                    break;
                default:
                    text = 'Free Plan';
                    classes = 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            }
        }

        return (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
                {text}
            </span>
        );
    };

    return (
        <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700/50 px-4 sm:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                    <LogoIcon className="h-8 w-8" />
                    <h1 className="hidden sm:block text-2xl font-bold tracking-wider text-gray-800 dark:text-gray-100">MVP</h1>
                </div>

                <div className="flex items-center gap-4">
                    {user.role === 'user' && (
                        <button
                            onClick={onRequestAdminAccess}
                            disabled={user.status === 'pending_admin_approval'}
                            className="text-sm font-semibold px-3 py-1.5 rounded-md transition-colors duration-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 disabled:bg-gray-200/50 dark:disabled:bg-gray-700/50 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            {user.status === 'pending_admin_approval' ? 'Request Pending' : 'Request Admin Access'}
                        </button>
                    )}

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500"
                        >
                            <span className="sr-only">Open user menu</span>
                            <UserCircleIcon className="h-8 w-8" />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-sm z-10">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center">
                                        <p className="font-semibold text-gray-900 dark:text-white truncate">{user.firstName} {user.lastName}</p>
                                        <PlanBadge />
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                </div>
                                <div className="py-2">
                                    <button className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <PencilSquareIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        Edit Profile
                                    </button>
                                    <button className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <Cog6ToothIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        Settings
                                    </button>
                                </div>
                                <div className="py-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Theme</div>
                                    <div className="flex justify-around px-2 py-1 bg-gray-100 dark:bg-gray-900/50 rounded-md mx-4">
                                        {themes.map(({ name, Icon }) => (
                                            <button
                                                key={name}
                                                onClick={() => onSetTheme(name)}
                                                className={`p-2 rounded-md transition-colors ${currentTheme === name ? 'bg-indigo-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                                title={`Switch to ${name} theme`}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="py-2 border-t border-gray-200 dark:border-gray-700">
                                    <button onClick={onLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
