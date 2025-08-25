import React, { useState, useMemo } from 'react';
import { StepKey, MvpPlan, Citation, TechStack, ProjectFile, User, HistoryItem } from '../types';
import { generateMvpSection, generateProjectCode } from '../services/geminiService';
import { authService } from '../services/authService';
import Sidebar from './Sidebar';
import IdeaInputStep from './IdeaInputStep';
import AnalysisStep from './AnalysisStep';
import FinalPlanStep from './FinalPlanStep';
import TechStackSelectionStep from './TechStackSelectionStep';
import WebsitePreviewStep from './WebsitePreviewStep';
import PricingPage from './PricingPage';
import { HistoryPanel } from './HistoryPanel';
import { STEPS } from '../constants';
import { CreditCardIcon, RectangleStackIcon } from './icons/Icons';

interface UserDashboardProps {
    user: User;
}

const FREE_PLAN_LIMIT = 3;

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
    const [view, setView] = useState<'generator' | 'pricing' | 'history'>('generator');
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [userIdea, setUserIdea] = useState('');
    const [mvpPlan, setMvpPlan] = useState<Partial<MvpPlan>>({});
    const [citations, setCitations] = useState<Record<string, Citation[]>>({});
    const [projectFiles, setProjectFiles] = useState<ProjectFile[] | null>(null);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentStep = useMemo(() => STEPS[currentStepIndex], [currentStepIndex]);

    const handleSaveHistory = async () => {
        try {
            await authService.addHistoryItem(user.uid, mvpPlan as MvpPlan, citations);
        } catch (error) {
            console.error("Failed to save history:", error);
            // Non-critical error, so we don't need to show a UI message
        }
    };
    
    const handleProceed = async (currentIdea: string, currentPlan: Partial<MvpPlan>) => {
        const nextStepIndex = currentStepIndex + 1;
        const stepToGenerate = STEPS[nextStepIndex];

        if (!stepToGenerate || stepToGenerate.key === StepKey.FINAL_PLAN) {
            setCurrentStepIndex(STEPS.findIndex(s => s.key === StepKey.FINAL_PLAN));
            return;
        }

        if (stepToGenerate.key === StepKey.TECH_STACK || stepToGenerate.key === StepKey.WEBSITE_PREVIEW) {
            setCurrentStepIndex(nextStepIndex);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { content, citations: newCitations } = await generateMvpSection(
                stepToGenerate.key,
                currentIdea,
                currentPlan
            );
            const updatedPlan = { ...currentPlan, [stepToGenerate.key]: content };
            setMvpPlan(updatedPlan);
            if (newCitations) {
                setCitations(prev => ({ ...prev, [stepToGenerate.key]: newCitations }));
            }
            setCurrentStepIndex(nextStepIndex);
        } catch (err) {
            setError(`An error occurred during ${stepToGenerate.title}. Please try again.`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleIdeaSubmit = async (idea: string) => {
        // --- Subscription Gating Logic ---
        if (user.subscription.plan === 'free' && user.subscription.usageCount >= FREE_PLAN_LIMIT) {
            setView('pricing');
            return;
        }

        try {
             await authService.incrementMvpUsage(user.uid);
        } catch (error) {
            console.error("Failed to increment usage", error);
        }

        const initialPlan = { idea };
        setUserIdea(idea);
        setMvpPlan(initialPlan);
        setError(null);
        setCitations({});
        setProjectFiles(null);
        setPreviewHtml(null);
        setCurrentStepIndex(0);
        await handleProceed(idea, initialPlan);
    };

    const handleTechStackSubmit = async (techStack: TechStack) => {
        const updatedPlan = { ...mvpPlan, techStack };
        setMvpPlan(updatedPlan);
        await handleProceed(userIdea, updatedPlan);
    };

    const handleNextFromAnalysis = async () => {
        await handleProceed(userIdea, mvpPlan);
    };

    const handleGeneratePreview = async () => {
        setCurrentStepIndex(STEPS.findIndex(s => s.key === StepKey.WEBSITE_PREVIEW));
        setIsLoading(true);
        setError(null);
        try {
            const { files, previewHtml: html } = await generateProjectCode(mvpPlan as MvpPlan);
            setProjectFiles(files);
            setPreviewHtml(html);
        } catch (err) {
            setError(`An error occurred during preview generation. Please try again.`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartOver = () => {
        setCurrentStepIndex(0);
        setUserIdea('');
        setMvpPlan({});
        setError(null);
        setIsLoading(false);
        setCitations({});
        setProjectFiles(null);
        setPreviewHtml(null);
        setView('generator');
    };
    
    const handleLoadHistoryItem = (item: HistoryItem) => {
        setUserIdea(item.idea);
        setMvpPlan(item.plan);
        setCitations(item.citations);
        setProjectFiles(null);
        setPreviewHtml(null);
        setCurrentStepIndex(STEPS.findIndex(s => s.key === StepKey.FINAL_PLAN));
        setView('generator');
    };

    const handleBackToPlan = () => {
        setCurrentStepIndex(STEPS.findIndex(s => s.key === StepKey.FINAL_PLAN));
    };

    const renderGeneratorView = () => {
        if (!currentStep) return null;

        const nextStep = STEPS[currentStepIndex + 1];

        switch (currentStep.key) {
            case StepKey.IDEA_INPUT:
                return <IdeaInputStep onSubmit={handleIdeaSubmit} isLoading={isLoading} />;
            case StepKey.TECH_STACK:
                return <TechStackSelectionStep onSubmit={handleTechStackSubmit} isLoading={isLoading} />;
            case StepKey.FINAL_PLAN:
                return <FinalPlanStep plan={mvpPlan as MvpPlan} citations={citations} onStartOver={handleStartOver} onGenerateCode={handleGeneratePreview} onInitialDisplay={handleSaveHistory} />;
            case StepKey.WEBSITE_PREVIEW:
                return <WebsitePreviewStep 
                    plan={mvpPlan as MvpPlan} 
                    files={projectFiles} 
                    previewHtml={previewHtml} 
                    isLoading={isLoading} 
                    onBack={handleBackToPlan} 
                    onStartOver={handleStartOver} 
                />;
            default:
                return (
                    <AnalysisStep
                        step={currentStep}
                        content={mvpPlan[currentStep.key as keyof MvpPlan] as string || ''}
                        citations={citations[currentStep.key] || []}
                        isLoading={isLoading}
                        onNext={handleNextFromAnalysis}
                        nextStepTitle={nextStep ? nextStep.title : 'Final Plan'}
                    />
                );
        }
    };

    const renderContent = () => {
        if (view === 'pricing') {
            return <PricingPage user={user} onSubscriptionChange={() => setView('generator')} />;
        }
        if (view === 'history') {
            return <HistoryPanel user={user} onLoadItem={handleLoadHistoryItem} onBack={() => setView('generator')} />;
        }

        return (
            <>
            <div className="absolute top-4 right-4 sm:right-8 flex gap-2">
                 <button onClick={() => setView('history')} className="flex items-center gap-2 text-sm font-semibold bg-white dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-600">
                     <RectangleStackIcon className="h-5 w-5" />
                     View History
                 </button>
                 <button onClick={() => setView('pricing')} className="flex items-center gap-2 text-sm font-semibold bg-white dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-600">
                     <CreditCardIcon className="h-5 w-5" />
                     Subscription
                 </button>
            </div>
            {renderGeneratorView()}
            </>
        )
    };

    return (
        <div className="flex h-[calc(100vh_-_4rem)]">
            <Sidebar steps={STEPS} currentStepIndex={currentStepIndex} />
            <main className="flex-1 p-4 sm:p-8 md:p-12 overflow-y-auto relative bg-gray-100 dark:bg-gray-900">
                <div className="w-full max-w-4xl mx-auto">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-8">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;