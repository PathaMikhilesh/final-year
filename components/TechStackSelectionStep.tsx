
import React, { useState } from 'react';
import { TechStack } from '../types';
import { TECH_CHOICES } from '../constants';
import { ArrowRightIcon, CodeBracketIcon } from './icons/Icons';

interface TechStackSelectionStepProps {
  onSubmit: (techStack: TechStack) => void;
  isLoading: boolean;
}

type TechCategory = keyof TechStack;

const TechStackSelectionStep: React.FC<TechStackSelectionStepProps> = ({ onSubmit, isLoading }) => {
  const [selection, setSelection] = useState<Partial<TechStack>>({});

  const handleSelect = (category: TechCategory, value: string) => {
    setSelection(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selection.frontend && selection.backend && selection.database) {
      onSubmit(selection as TechStack);
    }
  };
  
  const isComplete = selection.frontend && selection.backend && selection.database;

  return (
    <div className="animate-fade-in">
       <div className="flex items-center gap-4 mb-8">
        <div className="flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/20 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-300">
          <CodeBracketIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Select Your Tech Stack</h1>
          <p className="text-gray-500 dark:text-gray-400">Choose the technologies you want to build your MVP with.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {(Object.keys(TECH_CHOICES) as TechCategory[]).map(category => (
            <div key={category}>
              <label htmlFor={category} className="block mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">{category}</label>
              <div className="relative">
                <select
                  id={category}
                  value={selection[category] || ''}
                  onChange={(e) => handleSelect(category, e.target.value)}
                  className="w-full appearance-none p-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 dark:text-white"
                  required
                >
                  <option value="" disabled>Select a {category} technology...</option>
                  {TECH_CHOICES[category].map(choice => (
                    <option key={choice} value={choice} className="text-black dark:text-white bg-white dark:bg-gray-800">{choice}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={!isComplete || isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {isLoading ? 'Please wait...' : 'Next: Generate Business Model'}
              <ArrowRightIcon className="h-5 w-5" />
            </button>
        </div>
      </form>
    </div>
  );
};

export default TechStackSelectionStep;