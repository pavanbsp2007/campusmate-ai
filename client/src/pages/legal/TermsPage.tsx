import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, CheckCircle2 } from 'lucide-react';
import { Footer } from '../../components/layout/Footer';

export const TermsPage: React.FC = () => {
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
            <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-sm">Terms of Service</span>
          </div>
        </div>
      </header>

      {/* Content Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-8">
          
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              Legal Agreement
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 text-slate-900 dark:text-white">
              Terms & Conditions
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Last updated: November 8, 2026 • Effective immediately for all users.
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-6">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-600" />
                1. Acceptance of Terms
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Welcome to <strong>CampusMate AI</strong> (&quot;the Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By creating an account, browsing our website, or subscribing to our paid services (Student Plus / Student Pro), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, you must discontinue using our services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-600" />
                2. Eligibility and User Accounts
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                CampusMate AI is intended for students currently enrolled in college, university, or high school educational programs. You agree to provide accurate, current, and complete registration details (Full name, College/University name, Semester, and Academic Year). You are responsible for safeguarding your login credentials and for any activities under your account.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-600" />
                3. Freemium Services &amp; Subscription Billing
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                CampusMate AI provides both free features and paid subscription tiers:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                <li><strong>Free Plan:</strong> Includes core college survival tools (Attendance calculator, CGPA projector, Timetable, Assignment organizer) at no cost.</li>
                <li><strong>Student Plus (₹199 / month):</strong> Unlocks AI academic tutor, PDF summarizer, MCQ quiz generator, and flashcard tools.</li>
                <li><strong>Student Pro (₹399 / month):</strong> Unlocks advanced exam preparation mode, university answer generator, priority AI processing, and personalized academic analytics.</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300">
                All payments are processed securely through <strong>Razorpay</strong>. By subscribing to a paid plan, you authorize the charge of the listed fee for the chosen billing cycle.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-600" />
                4. Acceptable Use Policy &amp; Academic Integrity
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Our AI Study Companion is designed as a learning aid to help students understand concepts, synthesize revision notes, and prepare for examinations. Users agree not to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                <li>Use the platform for academic dishonesty or proctored exam cheating.</li>
                <li>Upload copyrighted textbooks or proprietary question papers without authorization.</li>
                <li>Reverse-engineer, scrape, or flood the API endpoints.</li>
                <li>Upload harmful, offensive, or malicious files to the Student Resource Hub.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-600" />
                5. Intellectual Property
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                All platform trademarks, logo designs, software interfaces, algorithms, and branding remain the exclusive intellectual property of CampusMate AI. Any study materials, notes, or flashcards generated by students remain their personal study data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-600" />
                6. Limitation of Liability
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                CampusMate AI provides calculation tools (attendance percentage, CGPA projections) and AI academic summaries on an &quot;as-is&quot; basis. While we strive for extreme accuracy, students are advised to confirm official exam dates, credits, and minimum attendance thresholds directly with their respective college administration.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-600" />
                7. Governing Law &amp; Jurisdiction
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                These terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of India.
              </p>
            </section>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
