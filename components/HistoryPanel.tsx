import React, { useState, useEffect, useMemo } from 'react';
import { User, HistoryItem } from '../types';
import { authService } from '../services/authService';
import { ArrowUturnLeftIcon, DocumentCheckIcon, StarIcon, TrashIcon } from './icons/Icons';
import FinalPlanStep from './FinalPlanStep';

interface HistoryPanelProps {
  user: User;
  onLoadItem: (item: HistoryItem) => void;
  onBack: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ user, onLoadItem, onBack }) => {
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>(user.history || []);

    useEffect(() => {
        setHistory(user.history || []);
    }, [user.history]);

    const handleToggleFavorite = async (itemId: string) => {
        const optimisticHistory = history.map(item => 
            item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item
        );
        setHistory(optimisticHistory);

        try {
            await authService.toggleFavoriteHistoryItem(user.uid, itemId);
        } catch (error) {
            console.error("Failed to update favorite status", error);
            // Revert on error
            setHistory(history); 
            alert("Could not update favorite status. Please try again.");
        }
    };

    const handleDelete = async (itemId: string, itemIdea: string) => {
        if (window.confirm(`Are you sure you want to permanently delete the plan for "${itemIdea}"?`)) {
            const optimisticHistory = history.filter(item => item.id !== itemId);
            setHistory(optimisticHistory);
            if (selectedItem?.id === itemId) {
                setSelectedItem(null);
            }
            try {
                await authService.deleteHistoryItem(user.uid, itemId);
            } catch (error) {
                console.error("Failed to delete history item", error);
                setHistory(history);
                alert("Could not delete the plan. Please try again.");
            }
        }
    };

    const sortedHistory = useMemo(() => {
        return [...history].sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [history]);

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
        return "Just now";
    };
    
    if (selectedItem) {
        return (
            <div>
                 <button onClick={() => setSelectedItem(null)} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold transition-colors duration-300 mb-6">
                    <ArrowUturnLeftIcon className="h-5 w-5"/>
                    Back to History
                </button>
                <FinalPlanStep 
                    plan={selectedItem.plan} 
                    citations={selectedItem.citations}
                    onStartOver={onBack}
                    onGenerateCode={() => onLoadItem(selectedItem)}
                />
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
             <div className="flex items-center justify-between mb-8">
                 <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Plan History</h1>
                    <p className="text-gray-500 dark:text-gray-400">Review your previously generated MVP plans.</p>
                 </div>
                 <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold transition-colors duration-300">
                    <ArrowUturnLeftIcon className="h-5 w-5"/>
                    Back to Generator
                </button>
             </div>
             
             {(!history || history.length === 0) ? (
                 <div className="text-center py-24 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <DocumentCheckIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500" />
                    <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">No History Found</h2>
                    <p className="mt-2 text-gray-500">You haven't generated any MVP plans yet.</p>
                 </div>
             ) : (
                <div className="space-y-4">
                    {sortedHistory.map(item => (
                        <div key={item.id} className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">{item.idea}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">Created {timeAgo(item.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => handleToggleFavorite(item.id)}
                                    title={item.isFavorite ? "Unmark as favorite" : "Mark as favorite"}
                                    className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                                >
                                    <StarIcon className={`h-5 w-5 ${item.isFavorite ? 'text-yellow-400 fill-current' : ''}`} />
                                </button>
                                 <button
                                    onClick={() => handleDelete(item.id, item.idea)}
                                    title="Delete plan"
                                    className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                                <button 
                                    onClick={() => setSelectedItem(item)}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                >View</button>
                            </div>
                        </div>
                    ))}
                </div>
             )}
        </div>
    );
};
