
import React, { useState } from 'react';
import { GoogleIcon, GithubIcon, UserCircleIcon, LoadingSpinnerIcon, CubeTransparentIcon } from './icons/Icons';

type Provider = 'google' | 'github';

interface SocialAuthRedirectProps {
  provider: Provider;
  onLogin: (details: { email: string; fullName: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const MOCK_ACCOUNTS = [
  { email: 'dev.user@example.com', fullName: 'Dev User' },
  { email: 'new.user@example.com', fullName: 'New User' },
];

const providerDetails = {
    google: {
        name: 'Google',
        Icon: GoogleIcon,
    },
    github: {
        name: 'GitHub',
        Icon: GithubIcon,
    }
}

type SocialAuthStep = 'accountSelection' | 'consent';

const SocialAuthRedirect: React.FC<SocialAuthRedirectProps> = ({ provider, onLogin, onCancel, isLoading }) => {
    const [step, setStep] = useState<SocialAuthStep>('accountSelection');
    
    const [selectedUser, setSelectedUser] = useState<{email: string, fullName: string} | null>(null);

    const [customEmail, setCustomEmail] = useState('');
    const [customFullName, setCustomFullName] = useState('');
    const [showCustom, setShowCustom] = useState(false);
    
    const details = providerDetails[provider];

    const handleProceedToConsent = (user: { email: string; fullName: string }) => {
        setSelectedUser(user);
        setStep('consent');
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleProceedToConsent({ email: customEmail, fullName: customFullName });
    };
    
    const handleAllow = () => {
        if (selectedUser) {
            onLogin(selectedUser);
        }
    };
    
    if (step === 'consent' && selectedUser) {
        return (
             <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 p-4 animate-fade-in">
                <div className="w-full max-w-sm mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <div className="p-6 text-center">
                        <div className="flex justify-center items-center gap-4 mb-4">
                            <details.Icon className="h-10 w-10" />
                            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            <div className="h-10 w-10 p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                               <CubeTransparentIcon className="text-gray-600 dark:text-gray-400" />
                            </div>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            MVP Generator wants to access your {details.name} Account
                        </h1>
                         <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                           {selectedUser.email}
                        </p>
                        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                           By continuing, you will allow MVP Generator to access information including your name and email address.
                        </p>
                    </div>
                     <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">This will allow MVP Generator to:</p>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-3">
                               <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                               <span>View your name and email address.</span>
                            </li>
                             <li className="flex items-start gap-3">
                               <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                               <span>Associate you with your public info from {details.name}.</span>
                            </li>
                        </ul>
                    </div>
                     <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button onClick={onCancel} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-transparent rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                            Cancel
                        </button>
                        <button onClick={handleAllow} disabled={isLoading} className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isLoading ? <LoadingSpinnerIcon className="h-5 w-5"/> : 'Allow'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    // Account Selection Step
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 p-4 animate-fade-in">
            <div className="w-full max-w-sm mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                <div className="p-6 text-center">
                    <details.Icon className="h-10 w-10 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Sign in with {details.name}
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        to continue to MVP Generator
                    </p>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    {!showCustom ? (
                        <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">Choose an account</p>
                            <ul className="space-y-2">
                                {MOCK_ACCOUNTS.map(acc => (
                                    <li key={acc.email}>
                                        <button
                                            onClick={() => handleProceedToConsent(acc)}
                                            disabled={isLoading}
                                            className="w-full flex items-center gap-4 p-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                        >
                                            <UserCircleIcon className="h-8 w-8 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{acc.fullName}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{acc.email}</p>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                                <li>
                                     <button
                                        onClick={() => setShowCustom(true)}
                                        disabled={isLoading}
                                        className="w-full flex items-center gap-4 p-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        <div className="h-8 w-8 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">Use another account</p>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <form onSubmit={handleCustomSubmit} className="space-y-4">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">Enter account details</p>
                             <input 
                                type="email" 
                                placeholder="Email Address" 
                                required 
                                value={customEmail}
                                onChange={e => setCustomEmail(e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-900 dark:text-white" 
                                disabled={isLoading} 
                            />
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                required 
                                value={customFullName}
                                onChange={e => setCustomFullName(e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-900 dark:text-white" 
                                disabled={isLoading} 
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading || !customEmail || !customFullName}
                                className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:bg-indigo-400 dark:disabled:bg-gray-600"
                            >
                                {isLoading ? <LoadingSpinnerIcon className="h-5 w-5"/> : 'Next'}
                            </button>
                             <button type="button" onClick={() => setShowCustom(false)} className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-2">
                                Back to account list
                            </button>
                        </form>
                    )}
                </div>

                <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                    <button onClick={onCancel} disabled={isLoading} className="text-sm text-indigo-600 dark:text-indigo-500 hover:underline">
                        Cancel and return to MVP Generator
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SocialAuthRedirect;