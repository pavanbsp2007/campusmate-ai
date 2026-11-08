import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Footer } from '../../components/layout/Footer';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to CampusMate</span>
          </Link>
          <div className="flex items-center gap-2">
            <RefreshCw size={18} className="text-amber-500" />
            <span className="font-bold text-sm">Refund &amp; Cancellation</span>
          </div>
        </div>
      </header>

      {/* Content Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-8">
          
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
              Student Guarantee
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 text-slate-900 dark:text-white">
              Cancellation &amp; Refund Policy
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Last updated: November 8, 2026 • Clear, fair, and transparent billing for college students.
            </p>
          </div>

          {/* Quick Highlight Box */}
          <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
            <Clock size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="text-slate-900 dark:text-white block font-bold mb-1">
                7-Day Money-Back Guarantee &amp; Fast Refund Processing
              </strong>
              <p className="text-slate-600 dark:text-slate-300">
                If you subscribe to Student Plus or Student Pro and are unsatisfied for any reason, request a refund within <strong>7 days</strong> of purchase. Approved refunds are credited back to your original source (Bank / UPI / Card) within <strong>5 to 7 business days</strong>.
              </p>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-6">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-amber-500" />
                1. Subscription Cancellation
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Students can cancel their active <strong>Student Plus</strong> or <strong>Student Pro</strong> monthly subscription at any time directly through the Subscription settings page or by emailing our support desk.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                <li>Upon cancellation, your Pro features will remain active until the end of your current 30-day billing cycle.</li>
                <li>Your account will automatically downgrade to the <strong>Free Plan</strong> without interrupting your attendance records or saved timetable.</li>
                <li>No cancellation fees will ever be applied.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-amber-500" />
                2. Refund Eligibility Criteria
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                You are eligible for a 100% full refund under any of the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                <li><strong>7-Day Trial Window:</strong> You submit a refund request within 7 calendar days of your initial plan upgrade.</li>
                <li><strong>Accidental Duplicate Deduction:</strong> In case a technical network glitch causes a dual deduction from your UPI account or bank during checkout.</li>
                <li><strong>Service Downtime:</strong> Unscheduled platform unavailability lasting longer than 48 consecutive hours.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-amber-500" />
                3. Refund Processing Timeline
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Once your refund request is received and verified:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                <li>Refund verification is performed within <strong>24 business hours</strong>.</li>
                <li>The reversal is initiated automatically through Razorpay to the original payment method used (UPI ID, NetBanking, Debit/Credit Card).</li>
                <li>Banks typically credit the funds back to your account within <strong>5 to 7 business days</strong>.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-amber-500" />
                4. How to Request a Refund
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                To initiate a cancellation or refund claim, simply send an email to:
              </p>
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs space-y-1">
                <p><strong>To:</strong> support@campusmate.ai (or refunds@campusmate.ai)</p>
                <p><strong>Subject:</strong> Refund Request - [Your Registered Email]</p>
                <p><strong>Body:</strong> Please include your Razorpay Payment ID (found in your transaction receipt) and reason for refund.</p>
              </div>
            </section>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
