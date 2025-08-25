
import React from 'react';
import type { Step, Citation } from '../types';
import { GlobeAltIcon, ArrowRightIcon, LoadingSpinnerIcon } from './icons/Icons';

interface AnalysisStepProps {
  step: Step;
  content: string;
  citations: Citation[];
  isLoading: boolean;
  onNext: () => void;
  nextStepTitle: string;
}

const AnalysisStep: React.FC<AnalysisStepProps> = ({ step, content, citations, isLoading, onNext, nextStepTitle }) => {
  const formatContent = (text: string) => {
    // Basic markdown-to-JSX conversion for theme-aware elements
    return text
        .split('\n')
        .map((line, index) => {
            if (line.startsWith('### ')) {
                return <h2 key={index} className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mt-6 mb-3">{line.substring(4)}</h2>;
            }
            if (line.startsWith('**')) {
                const parts = line.split('**');
                return <p key={index} className="my-2"><strong className="font-semibold text-gray-800 dark:text-gray-200">{parts[1]}</strong>{parts[2]}</p>
            }
            if (line.trim().startsWith('- ')) {
                return <li key={index} className="ml-6 list-disc text-gray-600 dark:text-gray-400">{line.substring(2)}</li>
            }
            return <p key={index} className="my-2 text-gray-600 dark:text-gray-400">{line}</p>;
        });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/20 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-300">
          <step.icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{step.title}</h1>
          <p className="text-gray-500 dark:text-gray-400">{step.description}</p>
        </div>
      </div>
      
      <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[300px]">
        <div className="prose prose-slate dark:prose-invert max-w-none">{formatContent(content)}</div>
      </div>

      {citations && citations.length > 0 && (
        <div className="mt-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <GlobeAltIcon className="h-5 w-5"/>
                Sources
            </h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {citations.map((citation, index) => (
                    <a 
                        key={index} 
                        href={citation.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10 px-3 py-1.5 rounded-md truncate hover:bg-indigo-200 dark:hover:bg-indigo-500/20 transition-colors"
                    >
                        {citation.title || new URL(citation.uri).hostname}
                    </a>
                ))}
            </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={isLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          {isLoading ? (
            <>
              <LoadingSpinnerIcon className="h-5 w-5" />
              Generating...
            </>
          ) : (
            <>
              {`Next: ${nextStepTitle}`}
              <ArrowRightIcon className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AnalysisStep;