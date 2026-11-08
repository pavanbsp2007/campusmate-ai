import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTier?: 'plus' | 'pro';
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, defaultTier = 'pro' }) => {
  const { user, refreshProfile } = useAuth();
  const [selectedTier, setSelectedTier] = useState<'plus' | 'pro'>(defaultTier);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      // 1. Create order on backend
      const orderRes = await api.post('/subscriptions/create-order', { targetTier: selectedTier });
      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Could not initiate payment order.');
      }

      // 2. Real Razorpay modal if active
      if (!orderRes.isSandboxDemo && (window as any).Razorpay) {
        const options = {
          key: orderRes.keyId,
          amount: orderRes.amount,
          currency: orderRes.currency,
          name: 'CampusMate AI',
          description: `${orderRes.tierName} Access`,
          order_id: orderRes.orderId,
          handler: async function (response: any) {
            try {
              const verifyRes = await api.post('/subscriptions/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                targetTier: selectedTier
              });

              if (verifyRes.success) {
                confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
                setSuccessMessage(`Welcome to ${selectedTier === 'pro' ? 'Student Pro' : 'Student Plus'}!`);
                await refreshProfile();
                setTimeout(() => {
                  setSuccessMessage(null);
                  onClose();
                }, 1800);
              }
            } catch (vErr: any) {
              alert(vErr.message || 'Payment verification failed.');
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: user?.fullName || 'Student',
            email: user?.email
          },
          theme: {
            color: '#4F46E5'
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      }

      // 3. Instant Payment Activation (Demo / Sandbox)
      const instantPaymentId = `pay_rzp_instant_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const verifyRes = await api.post('/subscriptions/verify-payment', {
        razorpay_order_id: orderRes.orderId,
        razorpay_payment_id: instantPaymentId,
        targetTier: selectedTier
      });

      if (verifyRes.success) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        setSuccessMessage(`Welcome to ${selectedTier === 'pro' ? 'Student Pro' : 'Student Plus'}!`);
        await refreshProfile();
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      alert(err.message || 'Upgrade failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm mb-3">
            <Sparkles size={14} className="text-amber-300" />
            Supercharge Your Academic Performance
          </div>
          <h2 className="text-2xl font-bold">Upgrade Your CampusMate AI Plan</h2>
          <p className="text-indigo-100 text-sm mt-1">
            Unlock unrestricted AI Tutoring, PDF Document Summarizer, Exam Prep Mode, and high-yield study tools.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {successMessage ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl shadow-lg">
                <Check size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{successMessage}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your account has been upgraded with unlimited high-priority AI queries.
              </p>
            </div>
          ) : (
            <>
              {/* Plan Switcher Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Plus Plan */}
                <div
                  onClick={() => setSelectedTier('plus')}
                  className={`cursor-pointer rounded-xl p-5 border-2 transition-all relative ${
                    selectedTier === 'plus'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-500 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Essential AI
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">₹199<span className="text-xs font-normal text-slate-500">/mo</span></span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">Student Plus</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                    For students who want AI tutoring and notes summarization.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500 flex-shrink-0" />
                      <span>50 AI Queries / Day</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500 flex-shrink-0" />
                      <span>AI Academic Tutor & Coding Assistant</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500 flex-shrink-0" />
                      <span>PDF Document Summarizer</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500 flex-shrink-0" />
                      <span>MCQ Quiz & Flashcard Generator</span>
                    </li>
                  </ul>
                </div>

                {/* Pro Plan */}
                <div
                  onClick={() => setSelectedTier('pro')}
                  className={`cursor-pointer rounded-xl p-5 border-2 transition-all relative ${
                    selectedTier === 'pro'
                      ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/30 dark:border-violet-500 shadow-lg'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                    Most Popular
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                      Ultimate Mastery
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">₹399<span className="text-xs font-normal text-slate-500">/mo</span></span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">Student Pro</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                    Complete suite for top CGPA, placements, and exam ace.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2 font-medium text-violet-700 dark:text-violet-300">
                      <Zap size={14} className="text-amber-500 flex-shrink-0" />
                      <span>500 AI Queries / Day (Ultra-fast)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500 flex-shrink-0" />
                      <span>Full AI Exam Preparation Mode</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500 flex-shrink-0" />
                      <span>University 2/5/10 Mark Answer Generator</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500 flex-shrink-0" />
                      <span>Personalized Study Timetable AI</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500 flex-shrink-0" />
                      <span>Advanced Academic Analytics</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Free Tier Callout reminder */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-500" />
                  <span>College Survival Kit (Attendance, CGPA, Timetable) is 100% Free Forever.</span>
                </div>
                <span className="font-medium">Current: {user?.planTier?.toUpperCase() || 'FREE'}</span>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.99] transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Upgrade to {selectedTier === 'pro' ? 'Student Pro (₹399)' : 'Student Plus (₹199)'}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-slate-400 mt-2">
                  Configured with Razorpay sandbox simulation. Instant activation, cancel anytime.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
