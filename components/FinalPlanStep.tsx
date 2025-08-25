
import React, { useState, useEffect } from 'react';
import { MvpPlan, StepKey, Citation } from '../types';
import { STEPS } from '../constants';
import { ArrowDownTrayIcon, EyeIcon, ArrowPathIcon, LoadingSpinnerIcon, GlobeAltIcon } from './icons/Icons';
import JSZip from 'jszip';

interface FinalPlanStepProps {
  plan: MvpPlan;
  citations: Record<string, Citation[]>;
  onStartOver: () => void;
  onGenerateCode: () => void;
  onInitialDisplay?: () => void;
}

const FinalPlanStep: React.FC<FinalPlanStepProps> = ({ plan, citations, onStartOver, onGenerateCode, onInitialDisplay }) => {
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    onInitialDisplay?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planSections = STEPS.filter(
    (step) => step.key !== StepKey.IDEA_INPUT && step.key !== StepKey.FINAL_PLAN && step.key !== StepKey.WEBSITE_PREVIEW
  );
    
  const formatContent = (text: string) => {
    if (!text) return <p className="text-gray-500 dark:text-gray-400">Not available.</p>;
    return text
        .split('\n')
        .map((line, index) => {
            if (line.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mt-4 mb-2">{line.substring(4)}</h3>;
            }
             if (line.startsWith('**')) {
                const parts = line.split('**');
                return <p key={index} className="my-1"><strong className="font-semibold text-gray-800 dark:text-gray-200">{parts[1]}</strong>{parts[2]}</p>
            }
            if (line.trim().startsWith('- ')) {
                return <li key={index} className="ml-5 list-disc text-gray-600 dark:text-gray-400">{line.substring(2)}</li>
            }
            return <p key={index} className="my-1 text-gray-600 dark:text-gray-400">{line}</p>;
        });
  };
  
  const renderSectionContent = (step: typeof STEPS[0]) => {
      if (step.key === StepKey.TECH_STACK) {
          const stack = plan.techStack;
          if (!stack) return <p className="text-gray-500 dark:text-gray-400">Not selected.</p>;
          return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">FRONTEND</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{stack.frontend}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">BACKEND</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{stack.backend}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">DATABASE</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{stack.database}</p>
                  </div>
              </div>
          )
      }
      return formatContent(plan[step.key as keyof MvpPlan] as string);
  };

  const handleExportZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      let fullPlanMarkdown = `# MVP Plan for: ${plan.idea}\n\n`;

      planSections.forEach((step, index) => {
        let sectionContent: string;
        if (step.key === StepKey.TECH_STACK) {
            const stack = plan.techStack;
            sectionContent = `
### Selected Tech Stack
- **Frontend:** ${stack?.frontend || 'Not selected'}
- **Backend:** ${stack?.backend || 'Not selected'}
- **Database:** ${stack?.database || 'Not selected'}
`;
        } else {
            sectionContent = (plan[step.key as keyof MvpPlan] as string) || 'Not generated.';
        }
        
        const sectionCitations = citations[step.key] || [];
        if (sectionCitations.length > 0) {
            sectionContent += '\n\n### Sources\n';
            sectionCitations.forEach(cite => {
                sectionContent += `- [${cite.title}](${cite.uri})\n`;
            });
        }
        
        const fileName = `${String(index + 1).padStart(2, '0')}-${step.title.replace(' ', '-')}.md`;
        
        const fileContent = `## ${step.title}\n\n${sectionContent}`;
        zip.file(fileName, fileContent);
        fullPlanMarkdown += `${fileContent}\n\n---\n\n`;
      });
      
      zip.file('MVP_PLAN_SUMMARY.md', fullPlanMarkdown);

      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const safeFilename = (plan.idea || 'idea').toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
      link.download = `mvp-plan-${safeFilename}.zip`;
      
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
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">Your Complete MVP Plan</h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
          Here is the comprehensive, AI-generated roadmap for your idea: <strong className="text-indigo-600 dark:text-indigo-300">"{plan.idea}"</strong>
        </p>
      </div>
      
      <div className="space-y-8">
        {planSections.map((step) => (
          <div key={step.key} className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300">
                <step.icon className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{step.title}</h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {renderSectionContent(step)}
            </div>
            {citations[step.key] && citations[step.key].length > 0 && (
                 <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <GlobeAltIcon className="h-5 w-5"/>
                        Sources
                    </h4>
                     <div className="mt-3 flex flex-wrap gap-2">
                        {citations[step.key].map((citation, index) => (
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
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-indigo-500/30 dark:border-indigo-500/50">
          <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white">Ready to Build?</h3>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2 mb-6">Take the next step in bringing your vision to life.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
                onClick={onGenerateCode}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
            >
              <EyeIcon className="h-5 w-5" />
              Preview Website
            </button>
            <button 
                onClick={handleExportZip}
                disabled={isZipping}
                className="flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isZipping ? (
                <>
                  <LoadingSpinnerIcon className="h-5 w-5" />
                  Zipping...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  Export Plan as ZIP
                </>
              )}
            </button>
          </div>
      </div>
      
      <div className="mt-8 text-center">
        <button 
          onClick={onStartOver}
          className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold transition-colors duration-300 mx-auto"
        >
          <ArrowPathIcon className="h-5 w-5"/>
          Start a New Plan
        </button>
      </div>
    </div>
  );
};

export default FinalPlanStep;