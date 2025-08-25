import React, { useState, useMemo } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { LogoIcon, LoadingSpinnerIcon, GoogleIcon, GithubIcon, EnvelopeIcon, ShieldCheckIcon, ArrowUturnLeftIcon } from './icons/Icons';
import SocialAuthRedirect from './SocialAuthRedirect';

interface LoginProps {
    selectedRole: User['role'];
    onBack: () => void;
}

const PasswordRequirement: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
    <li className={`text-sm ${met ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
        <span className="mr-2">{met ? '✔' : '○'}</span>
        {text}
    </li>
);

const VerificationPrompt: React.FC<{ email: string; onVerify: () => void; onBack: () => void; isLoading: boolean, error: string | null }> = ({ email, onVerify, onBack, isLoading, error }) => (
    <div className="w-full max-w-md mx-auto text-center">
        <ShieldCheckIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Verify Your Email</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
            A verification link has been sent to <strong className="text-indigo-600 dark:text-indigo-300">{email}</strong>. Please check your inbox.
        </p>
        <p className="mt-2 text-sm text-gray-500">
            (For this demo, click the button below to simulate verification.)
        </p>
        
        {error && <p className="text-red-500 dark:text-red-400 text-sm text-center mt-4">{error}</p>}

        <button
            onClick={onVerify}
            disabled={isLoading}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-all"
        >
            {isLoading ? <LoadingSpinnerIcon className="h-5 w-5" /> : 'Verify & Continue'}
        </button>
        <button onClick={onBack} className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            Back to login
        </button>
    </div>
);


const Login: React.FC<LoginProps> = ({ selectedRole, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [loading, setLoading] = useState<null | 'google' | 'github' | 'email'>(null);
  const [error, setError] = useState<string | null>(null);

  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const [socialRedirectProvider, setSocialRedirectProvider] = useState<'google' | 'github' | null>(null);

  const passwordValidation = useMemo(() => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const isLongEnough = password.length >= 8;
    const allValid = hasUpper && hasLower && hasNumber && hasSpecial && isLongEnough;
    return { hasUpper, hasLower, hasNumber, hasSpecial, isLongEnough, allValid };
  }, [password]);

  const handleSocialLogin = async (details: { email: string; fullName: string }) => {
    if (!socialRedirectProvider) return;
    
    setLoading(socialRedirectProvider);
    setError(null);
    try {
        await authService.loginWithProvider(
            socialRedirectProvider, 
            details, 
            selectedRole
        );
        setSocialRedirectProvider(null);
    } catch (err: any) {
        setError(err.message || 'Failed to login.');
        setSocialRedirectProvider(null); 
    } finally {
        setLoading(null);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && (!firstName || !lastName)) {
        setError('Please enter your first and last name.');
        return;
    }
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (isSignUp && !passwordValidation.allValid) {
        setError('Please ensure your password meets all requirements.');
        return;
    }
    setLoading('email');
    setError(null);
    setVerificationSuccess(false);

    try {
      if (isSignUp) {
        await authService.signUpWithEmail(firstName, lastName, email, password);
        setEmailForVerification(email);
        setShowVerificationPrompt(true);
      } else {
        await authService.loginWithEmail(email, password, selectedRole);
      }
    } catch (err: any) {
      if (err.message.includes('not verified')) {
        setEmailForVerification(email);
        setShowVerificationPrompt(true);
        setError(null);
      } else {
        setError(err.message || 'An error occurred.');
      }
    } finally {
        setLoading(null);
    }
  };

  const handleVerification = async () => {
    setLoading('email');
    setError(null);
    try {
        await authService.verifyUserAccount(emailForVerification);
        setShowVerificationPrompt(false);
        setIsSignUp(false);
        setVerificationSuccess(true);
        setEmail(emailForVerification); 
        setPassword('');
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(null);
    }
  };
  
  if (socialRedirectProvider) {
    return (
        <SocialAuthRedirect 
            provider={socialRedirectProvider} 
            onLogin={handleSocialLogin}
            onCancel={() => setSocialRedirectProvider(null)}
            isLoading={loading === socialRedirectProvider}
        />
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {showVerificationPrompt ? (
        <VerificationPrompt 
            email={emailForVerification}
            onVerify={handleVerification}
            onBack={() => setShowVerificationPrompt(false)}
            isLoading={loading === 'email'}
            error={error}
        />
      ) : (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
            <LogoIcon className="h-16 w-16 mx-auto mb-4" />
            <div className="flex justify-center items-center gap-2">
                <h1 className="text-5xl font-extrabold tracking-wider text-gray-900 dark:text-white">MVP</h1>
                <span className="px-3 py-1 text-sm font-semibold text-indigo-800 bg-indigo-100 rounded-full dark:bg-indigo-900 dark:text-indigo-200 capitalize">{selectedRole}</span>
            </div>
            <p className="mt-8 text-lg text-gray-700 dark:text-gray-300">
             {isSignUp ? 'Create your account to get started' : 'Sign in to continue your journey'}
            </p>
        </div>

        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-8 shadow-2xl relative">
             <button onClick={onBack} className="absolute top-4 left-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                <ArrowUturnLeftIcon className="h-6 w-6" />
                <span className="sr-only">Back to role selection</span>
            </button>
            {verificationSuccess && <p className="text-green-600 dark:text-green-400 text-sm text-center mb-4 bg-green-100 dark:bg-green-500/10 p-3 rounded-md">Account verified successfully. Please sign in.</p>}
            
            {error && !isSignUp && <p className="text-red-600 dark:text-red-400 text-sm text-center mb-4">{error}</p>}
            
            <div className="space-y-4 mb-6">
                <button
                    onClick={() => setSocialRedirectProvider('google')}
                    disabled={!!loading}
                    className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                    {loading === 'google' ? <LoadingSpinnerIcon className="h-5 w-5"/> : <GoogleIcon className="h-5 w-5" />}
                    Continue with Google
                </button>
                 <button
                    onClick={() => setSocialRedirectProvider('github')}
                    disabled={!!loading}
                    className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                    {loading === 'github' ? <LoadingSpinnerIcon className="h-5 w-5"/> : <GithubIcon className="h-5 w-5" />}
                    Continue with GitHub
                </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or</span>
              </div>
            </div>
            
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {isSignUp && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <input name="firstName" type="text" placeholder="First Name" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-900 dark:text-white" disabled={!!loading} />
                  <input name="lastName" type="text" placeholder="Last Name" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-900 dark:text-white" disabled={!!loading} />
                </div>
              )}
              <input name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-900 dark:text-white" placeholder="Email address" disabled={!!loading} />
              <input name="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-900 dark:text-white" placeholder="Password" disabled={!!loading} />
              
              {isSignUp && (
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 p-3 bg-gray-100 dark:bg-gray-700/30 rounded-md">
                    <PasswordRequirement met={passwordValidation.isLongEnough} text="At least 8 characters" />
                    <PasswordRequirement met={passwordValidation.hasUpper} text="Contains an uppercase letter" />
                    <PasswordRequirement met={passwordValidation.hasLower} text="Contains a lowercase letter" />
                    <PasswordRequirement met={passwordValidation.hasNumber} text="Contains a number" />
                    <PasswordRequirement met={passwordValidation.hasSpecial} text="Contains a special character" />
                </ul>
              )}

              {error && isSignUp && <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>}

              <button type="submit" disabled={!!loading || (isSignUp && !passwordValidation.allValid)} className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:bg-indigo-400 dark:disabled:bg-gray-600">
                  {loading === 'email' ? <LoadingSpinnerIcon className="h-5 w-5"/> : <EnvelopeIcon className="h-5 w-5" />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

             <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button onClick={() => { setIsSignUp(!isSignUp); setError(null); setVerificationSuccess(false); }} className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
            </p>
        </div>
      </div>
      )}
    </div>
  );
};

export default Login;