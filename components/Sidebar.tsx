
import React from 'react';
import type { Step } from '../types';

interface SidebarProps {
  steps: Step[];
  currentStepIndex: number;
}

const Sidebar: React.FC<SidebarProps> = ({ steps, currentStepIndex }) => {
  return (
    <aside className="hidden md:block w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700/50 p-8">
      <nav>
        <ul className="space-y-2">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;
            
            let statusClasses = 'bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400';
            if (isActive) {
              statusClasses = 'bg-indigo-100 border-indigo-500 text-indigo-600 dark:bg-indigo-500/20 dark:border-indigo-500 dark:text-indigo-300 animate-pulse';
            } else if (isCompleted) {
              statusClasses = 'bg-green-100 border-green-500 text-green-600 dark:bg-green-500/20 dark:border-green-500 dark:text-green-300';
            }

            return (
              <li key={step.key} className="flex items-start gap-4 p-3 rounded-lg transition-all duration-300">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center border-2 ${statusClasses}`}>
                   <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isActive || isCompleted ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;