import React from 'react';
import { LogoIcon, ArrowRightIcon } from './icons/Icons';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 text-center animate-fade-in">
      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 sm:p-12 shadow-2xl max-w-2xl w-full">
        <LogoIcon className="h-24 w-24 mx-auto mb-6" />
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-wider text-gray-900 dark:text-white">
          MVP
        </h1>
        <p className="mt-3 text-lg sm:text-xl uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Where Ideas Evolve Into Impact
        </p>
        <p className="mt-8 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-prose mx-auto">
          Transform your concepts into comprehensive, AI-powered plans. From market analysis to a live website preview, we provide the roadmap to turn your vision into a reality.
        </p>
        <button
          onClick={onGetStarted}
          className="mt-10 inline-flex items-center justify-center gap-3 bg-indigo-600 text-white font-semibold py-4 px-8 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Get Started
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
