import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md mt-auto py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Mission */}
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              CampusMate <span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              SaaS v2.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Study Smarter. Manage Better. Live Campus Life.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
            <span>Crafted with</span>
            <Heart size={12} className="text-rose-500 fill-rose-500 inline" />
            <span>for college & university students.</span>
          </div>
        </div>

        {/* Mandatory Razorpay / RBI Compliance Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-medium">
          <Link
            to="/terms"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            to="/privacy"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            to="/refund-policy"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Refund & Cancellation Policy
          </Link>
          <Link
            to="/contact"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Contact & Support
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/60">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Razorpay Verified</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/60">
            <Lock size={12} className="text-indigo-500" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2 text-center">
        <p>© {new Date().getFullYear()} CampusMate AI. All rights reserved.</p>
        <p>Merchant Legal Entity: CampusMate AI EdTech Services. Payments processed securely via Razorpay.</p>
      </div>
    </footer>
  );
};
