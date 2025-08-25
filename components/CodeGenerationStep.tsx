import React, { useState, useMemo } from 'react';
import { MvpPlan, ProjectFile } from '../types';
import { ArrowDownTrayIcon, CodeBracketSquareIcon, ArrowPathIcon, FolderIcon, DocumentIcon, LoadingSpinnerIcon, ArrowUturnLeftIcon } from './icons/Icons';
import JSZip from 'jszip';

interface CodeGenerationStepProps {
  plan: MvpPlan;
  files: ProjectFile[] | null;
  isLoading: boolean;
  onBack: () => void;
  onStartOver: () => void;
}

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="h-6 bg-gray-700 rounded-md w-full animate-pulse" style={{ width: `${Math.random() * 40 + 50}%` }}></div>
    ))}
  </div>
);

const CodeGenerationStep: React.FC<CodeGenerationStepProps> = ({ plan, files, isLoading, onBack, onStartOver }) => {
    const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
    const [isZipping, setIsZipping] = useState(false);

    const fileTree = useMemo(() => {
        if (!files) return {};
        const tree: any = {};
        files.forEach(file => {
            let currentLevel = tree;
            const parts = file.path.split('/');
            parts.forEach((part, index) => {
                if (index === parts.length - 1) {
                    currentLevel[part] = file;
                } else {
                    currentLevel[part] = currentLevel[part] || {};
                    currentLevel = currentLevel[part];
                }
            });
        });
        return tree;
    }, [files]);
    
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

    const renderFileTree = (tree: any, depth = 0) => {
        return Object.entries(tree).sort(([a,],[b,]) => a.localeCompare(b)).map(([name, node]) => {
            const isFile = (node as ProjectFile).path;
            return (
                <div key={name} style={{ paddingLeft: `${depth * 1.5}rem` }}>
                    {isFile ? (
                        <button onClick={() => setSelectedFile(node as ProjectFile)} className={`flex items-center gap-2 w-full text-left p-1.5 rounded-md ${selectedFile?.path === (node as ProjectFile).path ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-gray-700/50'}`}>
                            <DocumentIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            <span>{name}</span>
                        </button>
                    ) : (
                        <div className="mt-2">
                             <div className="flex items-center gap-2 text-gray-400 p-1.5">
                                <FolderIcon className="h-5 w-5 flex-shrink-0" />
                                <span className="font-semibold">{name}</span>
                            </div>
                            {renderFileTree(node, depth + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };
    
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center bg-indigo-500/20 border-2 border-indigo-500 text-indigo-300">
          <CodeBracketSquareIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Generated Project Code</h1>
          <p className="text-gray-400">Here is the scaffolded boilerplate for your project.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-96 overflow-y-auto">
            <h3 className="font-bold mb-3 text-gray-200">Project Structure</h3>
            {isLoading ? <LoadingSkeleton /> : renderFileTree(fileTree)}
        </div>
        <div className="md:col-span-2 bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
            {isLoading ? (
                 <div className="flex items-center justify-center h-full text-gray-400">
                    <LoadingSpinnerIcon className="h-6 w-6 mr-3"/>
                    Generating code...
                 </div>
            ) : selectedFile ? (
                 <pre className="whitespace-pre-wrap"><code>{selectedFile.content}</code></pre>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Select a file to preview its content</p>
                </div>
            )}
        </div>
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-300">
            <ArrowUturnLeftIcon className="h-5 w-5"/>
            Back to Plan
        </button>

         <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
                onClick={handleDownloadZip}
                disabled={isZipping || isLoading || !files}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-500 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isZipping ? (
                <><LoadingSpinnerIcon className="h-5 w-5" />Zipping...</>
              ) : (
                <><ArrowDownTrayIcon className="h-5 w-5" />Download Project ZIP</>
              )}
            </button>
        </div>
        
        <button onClick={onStartOver} className="flex items-center gap-2 text-gray-500 hover:text-gray-400 font-semibold transition-colors duration-300">
          <ArrowPathIcon className="h-5 w-5"/>
          Start New Plan
        </button>
      </div>

    </div>
  );
};

export default CodeGenerationStep;