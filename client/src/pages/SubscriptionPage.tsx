import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Check,
  Zap,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export const SubscriptionPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      const res = await api.get('/subscriptions');
      if (res.success) {
        setSubscriptionData(res);
      }
    } catch (e) {
      console.warn('Subscription fetch:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleUpgrade = async (tier: 'plus' | 'pro') => {
    setUpgradingTier(tier);
    try {
      const mockPayId = `pay_rzp_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const res = await api.post('/subscriptions/upgrade', {
        targetTier: tier,
        paymentId: mockPayId
      });

      if (res.success) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        alert(res.message || 'Upgraded successfully!');
        await refreshProfile();
        fetchSubscription();
      }
    } catch (err: any) {
      alert(err.message || 'Upgrade failed');
    } finally {
      setUpgradingTier(null);
    }
  };

  const currentTier = user?.planTier || 'free';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 py-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} className="text-amber-500" />
          <span>Freemium Student Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Study Smarter with CampusMate AI
        </h1>
        <p className="text-sm text-slate-500">
          The basic College Survival Kit (Attendance, CGPA, Timetable) is free forever. Upgrade anytime to unlock intelligent academic AI tools.
        </p>
      </div>

      {/* Current Plan Quota Status */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Current Subscription Status
          </span>
          <div className="flex items-center gap-2.5 mt-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white capitalize">
              {currentTier} Plan
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            You have used <strong>{user?.aiQueriesUsedToday || 0}</strong> of <strong>{user?.aiQueriesLimit || 10}</strong> AI study queries today.
          </p>
        </div>

        {currentTier === 'free' && (
          <button
            onClick={() => handleUpgrade('pro')}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md self-start sm:self-auto"
          >
            Upgrade to Pro (₹399)
          </button>
        )}
      </div>

      {/* 3 Pricing Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* FREE PLAN */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Free Plan
            </span>
            <div className="my-3">
              <span className="text-4xl font-black text-slate-900 dark:text-white">₹0</span>
              <span className="text-xs text-slate-400 ml-1">/ forever</span>
            </div>
            <p className="text-xs text-slate-500">
              Essential college survival tools to keep your attendance and GPA on track.
            </p>

            <div className="pt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Attendance Manager & Bunk Calculator</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500 flex-shrink-0" />
                <span>CGPA / SGPA Configurable Calculator</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Interactive Timetable & Class Schedule</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Assignment Deadlines & Reminders</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Student Peer Resource Hub</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Zap size={16} className="text-amber-500 flex-shrink-0" />
                <span>10 Daily AI Study Queries</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              disabled={currentTier === 'free'}
              className="w-full py-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-60"
            >
              {currentTier === 'free' ? 'Currently Active' : 'Downgrade to Free'}
            </button>
          </div>
        </div>

        {/* STUDENT PLUS */}
        <div className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all flex flex-col justify-between space-y-6 ${currentTier === 'plus' ? 'border-indigo-600 shadow-xl' : 'border-slate-200/80 dark:border-slate-800'}`}>
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Student Plus
              </span>
            </div>
            <div className="my-3">
              <span className="text-4xl font-black text-slate-900 dark:text-white">₹199</span>
              <span className="text-xs text-slate-400 ml-1">/ month</span>
            </div>
            <p className="text-xs text-slate-500">
              For everyday coursework, instant concept tutoring, and PDF revision notes.
            </p>

            <div className="pt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 font-medium text-indigo-600 dark:text-indigo-400">
                <Check size={16} className="flex-shrink-0" />
                <span>Everything in Free Plan</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500 flex-shrink-0" />
                <span>AI Academic Tutor & Coding Explainer</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500 flex-shrink-0" />
                <span>PDF Document Summarizer & Notes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500 flex-shrink-0" />
                <span>AI MCQ Quiz Generator & Scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Smart Flashcards & Active Recall</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <Zap size={16} className="text-amber-500 flex-shrink-0" />
                <span>50 Daily AI Study Queries</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => handleUpgrade('plus')}
              disabled={currentTier === 'plus' || upgradingTier === 'plus'}
              className="w-full py-3 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 transition shadow-sm disabled:opacity-60"
            >
              {currentTier === 'plus' ? 'Currently Active' : 'Upgrade to Plus (₹199)'}
            </button>
          </div>
        </div>

        {/* STUDENT PRO */}
        <div className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all flex flex-col justify-between space-y-6 relative ${currentTier === 'pro' ? 'border-violet-600 shadow-xl' : 'border-indigo-600 dark:border-indigo-500 shadow-lg'}`}>
          <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
            Top Recommendation
          </div>

          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Student Pro
            </span>
            <div className="my-3">
              <span className="text-4xl font-black text-slate-900 dark:text-white">₹399</span>
              <span className="text-xs text-slate-400 ml-1">/ month</span>
            </div>
            <p className="text-xs text-slate-500">
              All-inclusive academic companion for university toppers and competitive placements.
            </p>

            <div className="pt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 font-medium text-violet-600 dark:text-violet-400">
                <Check size={16} className="flex-shrink-0" />
                <span>Everything in Student Plus</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500 flex-shrink-0" />
                <span>AI Exam Preparation Mode & Schedules</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500 flex-shrink-0" />
                <span>University 2/5/10 Mark Answer Generator</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Personalized AI Study Timetable Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Advanced CGPA Analytics & Forecast</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-violet-600 dark:text-violet-400">
                <Zap size={16} className="text-amber-500 flex-shrink-0" />
                <span>500 Daily AI Queries (High Priority)</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => handleUpgrade('pro')}
              disabled={currentTier === 'pro' || upgradingTier === 'pro'}
              className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition shadow-lg shadow-indigo-600/25 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {upgradingTier === 'pro' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : currentTier === 'pro' ? (
                'Currently Active'
              ) : (
                'Upgrade to Student Pro (₹399)'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Security Note */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center gap-2 text-xs text-slate-500">
        <CreditCard size={16} className="text-indigo-600" />
        <span>Configured with Razorpay sandbox integration. Instant activation and student money-back guarantee.</span>
      </div>
    </div>
  );
};
