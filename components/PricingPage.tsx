
import React, { useState } from 'react';
import { User, Subscription } from '../types';
import { authService } from '../services/authService';
import { CreditCardIcon, CheckCircleIcon, LoadingSpinnerIcon, QrCodeIcon, BuildingOffice2Icon } from './icons/Icons';

interface PricingPageProps {
  user: User;
  onSubscriptionChange: () => void;
}

const PaymentModal: React.FC<{
    onClose: () => void;
    onSuccess: () => void;
    planName: string;
    planPrice: string;
}> = ({ onClose, onSuccess, planName, planPrice }) => {
    const [paymentMethod, setPaymentMethod] = useState<'qr' | 'upi' | 'card'>('qr');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = async () => {
        setIsProcessing(true);
        setError(null);
        // Simulate API call to payment gateway
        setTimeout(() => {
            // On successful payment:
            onSuccess();
        }, 2500);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upgrade to {planName}</h2>
                        <p className="text-gray-500 dark:text-gray-400">Complete your payment of {planPrice}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">&times;</button>
                </div>

                <div className="p-6">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                        {([ 'qr', 'upi', 'card'] as const).map(method => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                className={`py-2 px-4 text-sm font-semibold capitalize transition-colors ${
                                    paymentMethod === method
                                        ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {method === 'qr' ? 'QR Code' : method}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 min-h-[200px]">
                        {paymentMethod === 'qr' && (
                             <div className="text-center">
                                <p className="text-gray-700 dark:text-gray-300 mb-4">Scan the code with any UPI app</p>
                                <div className="bg-white p-4 inline-block rounded-lg">
                                    <QrCodeIcon className="h-40 w-40 text-black" />
                                </div>
                             </div>
                        )}
                        {paymentMethod === 'upi' && (
                             <div className="space-y-4">
                                <label htmlFor="upi_id" className="text-gray-700 dark:text-gray-300">Enter your UPI ID</label>
                                <input
                                    id="upi_id"
                                    type="text"
                                    placeholder="yourname@bank"
                                    className="w-full p-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                />
                             </div>
                        )}
                        {paymentMethod === 'card' && (
                             <div className="space-y-4">
                                <input type="text" placeholder="Card Number" className="w-full p-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
                                <div className="flex gap-4">
                                    <input type="text" placeholder="MM / YY" className="w-1/2 p-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
                                    <input type="text" placeholder="CVC" className="w-1/2 p-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
                                </div>
                             </div>
                        )}
                    </div>
                </div>
                 {error && <p className="text-red-500 dark:text-red-400 text-center text-sm px-6 pb-4">{error}</p>}
                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-gray-600 transition-all"
                    >
                        {isProcessing ? (
                            <>
                                <LoadingSpinnerIcon className="h-5 w-5" />
                                Processing Payment...
                            </>
                        ) : `Pay ${planPrice}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SalesModal: React.FC<{ user: User; onClose: () => void; }> = ({ user, onClose }) => {
    const [companyName, setCompanyName] = useState('');
    const [teamSize, setTeamSize] = useState('');
    const [message, setMessage] = useState('');
    
    const [isSending, setIsSending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setError(null);
        try {
            await authService.contactSalesRequest(user, { companyName, teamSize, message });
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2500); // Close after success message
        } catch (err) {
            setError("Failed to send request. Please try again later.");
        } finally {
            setIsSending(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
                {isSuccess ? (
                    <div className="p-12 text-center">
                        <CheckCircleIcon className="h-16 w-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Request Sent!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Thank you for your interest. Our sales team will be in touch with you shortly.</p>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact Sales for Enterprise Plan</h2>
                            <button onClick={onClose} disabled={isSending} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label htmlFor="fullName" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                    <input id="fullName" type="text" value={`${user.firstName} ${user.lastName}`} readOnly className="w-full p-3 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label htmlFor="companyName" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                                    <input id="companyName" type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your Company, Inc." className="w-full p-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label htmlFor="teamSize" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Number of Team Members</label>
                                    <input id="teamSize" type="text" required value={teamSize} onChange={e => setTeamSize(e.target.value)} placeholder="e.g., 10-50, 100+, etc." className="w-full p-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Message (Optional)</label>
                                    <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Tell us about your specific needs..." className="w-full p-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white resize-none"></textarea>
                                </div>
                            </div>
                            {error && <p className="text-red-500 dark:text-red-400 text-center text-sm px-6 pb-4">{error}</p>}
                            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
                                <button
                                    type="submit"
                                    disabled={isSending || !companyName || !teamSize}
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-gray-600 transition-all"
                                >
                                    {isSending ? (
                                        <>
                                            <LoadingSpinnerIcon className="h-5 w-5" />
                                            Sending Request...
                                        </>
                                    ) : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};


const PricingPage: React.FC<PricingPageProps> = ({ user, onSubscriptionChange }) => {
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [upgradingTo, setUpgradingTo] = useState<Subscription['plan'] | null>(null);
    const [showSalesModal, setShowSalesModal] = useState(false);

    const handleUpgradeSuccess = async () => {
        if (!upgradingTo) return;
        setIsUpgrading(true);
        setError(null);
        try {
            await authService.updateUserSubscription(user.uid, upgradingTo);
            setUpgradingTo(null);
            onSubscriptionChange();
        } catch (err: any) {
            setError(err.message || 'Failed to update subscription after payment.');
        } finally {
            setIsUpgrading(false);
        }
    };
    
    const planDetails = {
        pro: { name: 'Pro', price: '₹999' },
        team: { name: 'Team', price: '₹1,999' }
    }

  return (
    <>
    {upgradingTo && (upgradingTo === 'pro' || upgradingTo === 'team') && (
        <PaymentModal 
            onClose={() => setUpgradingTo(null)}
            onSuccess={handleUpgradeSuccess}
            planName={planDetails[upgradingTo].name}
            planPrice={planDetails[upgradingTo].price}
        />
    )}
    {showSalesModal && (
        <SalesModal user={user} onClose={() => setShowSalesModal(false)} />
    )}
    <div className="animate-fade-in py-12">
      <div className="text-center mb-12">
        <CreditCardIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">Subscription Plans</h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Choose the plan that's right for you. Unlock your full potential.
        </p>
        {user.subscription.plan === 'free' && user.subscription.usageCount >= 3 && (
            <p className="mt-4 text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-500/10 p-3 rounded-md max-w-xl mx-auto">
                You have reached the limit of the Free plan. Please upgrade to continue generating MVP plans.
            </p>
        )}
      </div>

      {error && <p className="text-red-500 dark:text-red-400 text-center mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {/* Free Plan */}
        <div className={`p-8 rounded-lg border-2 ${user.subscription.plan === 'free' ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800/50 flex flex-col`}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Free</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">For individuals getting started.</p>
          <p className="mt-6 text-4xl font-extrabold text-gray-900 dark:text-white">₹0 <span className="text-base font-medium text-gray-500 dark:text-gray-400">/ month</span></p>
          <ul className="mt-8 space-y-4 text-gray-700 dark:text-gray-300 flex-grow">
            <li className="flex items-center gap-3"><CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" /> 3 MVP Plan Generations</li>
            <li className="flex items-center gap-3"><CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" /> Basic AI Analysis</li>
            <li className="flex items-center gap-3"><CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" /> Export Plan as ZIP</li>
          </ul>
          <button disabled className="mt-10 w-full py-3 px-6 text-center font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">Your Current Plan</button>
        </div>

        {/* Pro Plan */}
        <div className={`p-8 rounded-lg border-2 ${user.subscription.plan === 'pro' ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800/50 relative flex flex-col`}>
            <div className="absolute top-0 -translate-y-1/2 w-full left-0 px-4 text-center">
              <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Most Popular</span>
            </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pro</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">For professionals and small teams.</p>
          <p className="mt-6 text-4xl font-extrabold text-gray-900 dark:text-white">₹999 <span className="text-base font-medium text-gray-500 dark:text-gray-400">/ user / month</span></p>
          <ul className="mt-8 space-y-4 text-gray-700 dark:text-gray-300 flex-grow">
            <li className="flex items-center gap-3"><CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" /> Unlimited MVP Plans</li>
            <li className="flex items-center gap-3"><CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" /> Advanced AI Analysis</li>
            <li className="flex items-center gap-3"><CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" /> Live Website Preview</li>
            <li className="flex items-center gap-3"><CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" /> Export Full Project Code</li>
          </ul>
          {user.subscription.plan === 'pro' ? (
             <button disabled className="mt-10 w-full py-3 px-6 text-center font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">Your Current Plan</button>
          ) : (
             <button onClick={() => setUpgradingTo('pro')} disabled={isUpgrading} className="mt-10 w-full py-3 px-6 text-center font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                {isUpgrading ? <LoadingSpinnerIcon className="h-5 w-5 mx-auto" /> : 'Upgrade to Pro'}
             </button>
          )}
        </div>
        
        {/* Team Plan */}
        <div className={`p-8 rounded-lg border-2 ${user.subscription.plan === 'team' ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800/50 flex flex-col`}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">For collaborative projects.</p>
          <p className="mt-6 text-4xl font-extrabold text-gray-900 dark:text-white">₹1,999 <span className="text-base font-medium text-gray-500 dark:text-gray-400">/ user / month</span></p>
          <ul className="mt-8 space-y-4 text-gray-700 dark:text-gray-300 flex-grow">
            <li className="flex items-center gap-3"><CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" /> Everything in Pro</li>
            <li className="flex items-center gap-3"><CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" /> Shared Project History</li>
            <li className="flex items-center gap-3"><CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" /> Team Collaboration Workspace</li>
            <li className="flex items-center gap-3"><CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" /> Priority Support</li>
          </ul>
           {user.subscription.plan === 'team' ? (
             <button disabled className="mt-10 w-full py-3 px-6 text-center font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">Your Current Plan</button>
          ) : (
             <button onClick={() => setUpgradingTo('team')} disabled={isUpgrading} className="mt-10 w-full py-3 px-6 text-center font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors">
                {isUpgrading ? <LoadingSpinnerIcon className="h-5 w-5 mx-auto" /> : 'Upgrade to Team'}
             </button>
          )}
        </div>

        {/* Enterprise Plan */}
        <div className={`p-8 rounded-lg border-2 ${user.subscription.plan === 'enterprise' ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800/50 flex flex-col`}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enterprise</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">For large organizations.</p>
          <p className="mt-6 text-4xl font-extrabold text-gray-900 dark:text-white">Custom</p>
          <ul className="mt-8 space-y-4 text-gray-700 dark:text-gray-300 flex-grow">
            <li className="flex items-center gap-3"><CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" /> Everything in Team</li>
            <li className="flex items-center gap-3"><CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" /> Dedicated Account Manager</li>
            <li className="flex items-center gap-3"><CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" /> Advanced Security & SSO</li>
          </ul>
          {user.subscription.plan === 'enterprise' ? (
             <button disabled className="mt-10 w-full py-3 px-6 text-center font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">Your Current Plan</button>
          ) : (
             <button onClick={() => setShowSalesModal(true)} className="mt-10 w-full py-3 px-6 text-center font-semibold rounded-lg border-2 border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">Contact Sales</button>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default PricingPage;