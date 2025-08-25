
import React, { useState } from 'react';
import { MvpPlan, ProjectFile } from '../types';
import { ArrowDownTrayIcon, EyeIcon, ArrowPathIcon, LoadingSpinnerIcon, ArrowUturnLeftIcon } from './icons/Icons';
import JSZip from 'jszip';

interface WebsitePreviewStepProps {
  plan: MvpPlan;
  files: ProjectFile[] | null;
  previewHtml: string | null;
  isLoading: boolean;
  onBack: () => void;
  onStartOver: () => void;
}

const WebsitePreviewStep: React.FC<WebsitePreviewStepProps> = ({ plan, files, previewHtml, isLoading, onBack, onStartOver }) => {
    const [isZipping, setIsZipping] = useState(false);

    const handleDownloadZip = async () => {
        if (!files) return;
        setIsZipping(true);
        try {
            const zip = new JSZip();
            files.forEach(file => {
                zip.file(file.path, file.content);
            });
            const blob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const safeFilename = (plan.idea || 'idea').toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
            link.download = `mvp-code-${safeFilename}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Failed to generate zip file", error);
        } finally {
            setIsZipping(false);
        }
    };

    return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/20 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-300">
          <EyeIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Website Preview</h1>
          <p className="text-gray-500 dark:text-gray-400">An interactive preview of your generated full-stack application.</p>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-2 h-[60vh] overflow-hidden">
        {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <LoadingSpinnerIcon className="h-6 w-6 mr-3"/>
                Generating preview...
            </div>
        ) : (
            <iframe
                srcDoc={previewHtml || ''}
                title="Website Preview"
                className="w-full h-full bg-white rounded-md"
                sandbox="allow-scripts"
            />
        )}
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold transition-colors duration-300">
            <ArrowUturnLeftIcon className="h-5 w-5"/>
            Back to Plan
        </button>

         <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
                onClick={handleDownloadZip}
                disabled={isZipping || isLoading || !files}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-indigo-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isZipping ? (
                <><LoadingSpinnerIcon className="h-5 w-5" />Zipping...</>
              ) : (
                <><ArrowDownTrayIcon className="h-5 w-5" />Download Full Project</>
              )}
            </button>
        </div>
        
        <button onClick={onStartOver} className="flex items-center gap-2 text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 font-semibold transition-colors duration-300">
          <ArrowPathIcon className="h-5 w-5"/>
          Start New Plan
        </button>
      </div>

    </div>
  );
};

export default WebsitePreviewStep;