import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { Footer } from '../../components/layout/Footer';

export const PrivacyPage: React.FC = () => {
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
            <ShieldCheck size={18} className="text-emerald-500" />
            <span className="font-bold text-sm">Privacy Policy</span>
          </div>
        </div>
      </header>

      {/* Content Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-8">
          
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              Data Protection &amp; Security
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Last updated: November 8, 2026 • Compliant with Indian Information Technology Act, 2000 &amp; SPDI Rules.
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-6">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                1. Overview
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                At <strong>CampusMate AI</strong>, we deeply respect the privacy of our student community. This Privacy Policy describes how we collect, store, utilize, and protect your personal and academic information when you interact with our web platform and AI services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                2. Information We Collect
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                We only collect information necessary to deliver student productivity and personalized AI learning:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                <li><strong>Account Registration Details:</strong> Full Name, Email Address, College/University Name, Course, Semester, and Academic Year.</li>
                <li><strong>Academic Logs:</strong> Timetable classes, attendance tallies, course credits, assignment deadlines, and exam schedules.</li>
                <li><strong>Study Files &amp; Notes:</strong> PDF lecture slides and study notes uploaded for AI summarization and flashcard synthesis.</li>
                <li><strong>Transaction Records:</strong> Razorpay payment identifiers, subscription tiers, and billing dates. (We never store your credit/debit card numbers or UPI MPINs).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                3. Payment Security &amp; Razorpay Processing
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                All financial transactions on CampusMate AI are processed via <strong>Razorpay Software Private Limited</strong>, an RBI-authorized and PCI-DSS Level 1 certified payment aggregator. Sensitive card information or UPI credentials never touch our servers. Razorpay manages and encrypts your payment details in accordance with standard RBI payment security guidelines.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                4. AI Data Processing (OpenAI)
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                When you ask a question to the AI Tutor or generate summaries from uploaded lecture notes, study prompts are securely routed through server-side APIs to OpenAI language models. Under our API terms, customer inputs and outputs are not utilized to train foundation models.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                5. Data Security Standards
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                We implement industry-standard technical safeguards:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                <li><strong>256-Bit SSL/TLS Encryption:</strong> All client-server communication is encrypted in transit using HTTPS.</li>
                <li><strong>Password Protection:</strong> Passwords are salted and hashed using bcrypt (10 rounds).</li>
                <li><strong>Injection &amp; XSS Defense:</strong> Deep HTML input sanitization and parameterized SQL queries to prevent unauthorized data exposure.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                6. Student Data Rights &amp; Deletion
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Students retain full ownership of their data. You have the right to request access to your records or ask for full account and data deletion at any time by emailing <code>privacy@campusmate.ai</code>. Requests are honored within 48 business hours.
              </p>
            </section>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
