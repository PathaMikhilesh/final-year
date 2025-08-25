
import React, { useState } from 'react';
import { ArrowRightIcon, SparklesIcon } from './icons/Icons';

interface IdeaInputStepProps {
  onSubmit: (idea: string) => void;
  isLoading: boolean;
}

const IdeaInputStep: React.FC<IdeaInputStepProps> = ({ onSubmit, isLoading }) => {
  const [idea, setIdea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      onSubmit(idea.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
      <div className="text-center mb-8">
        <SparklesIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">Turn Your Idea into an MVP</h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Describe your business or app concept below, and our AI will generate a comprehensive plan to get you started.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="e.g., A mobile app that uses AI to create personalized workout plans based on user's available equipment and fitness goals..."
          className="w-full h-40 p-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!idea.trim() || isLoading}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Plan...
            </>
          ) : (
            <>
              Generate MVP Plan
              <ArrowRightIcon className="h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default IdeaInputStep;