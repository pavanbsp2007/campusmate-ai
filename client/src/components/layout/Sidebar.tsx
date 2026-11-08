import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  FileText,
  CheckSquare,
  Layers,
  Target,
  FileCheck,
  UserCheck,
  Calculator,
  ClipboardList,
  CalendarDays,
  Wallet,
  Clock,
  Folder,
  Timer,
  Share2,
  Sparkles,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpgrade: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenUpgrade }) => {
  const { user } = useAuth();

  const navSectionClass = "px-3 mb-1 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase";
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
    }`;

  const used = user?.aiQueriesUsedToday || 0;
  const limit = user?.aiQueriesLimit || 10;
  const pct = Math.min(100, Math.round((used / limit) * 100));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 z-40 h-full lg:h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation scrollable area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Section */}
          <div>
            <div className={navSectionClass}>Overview</div>
            <nav className="space-y-1 mt-1.5">
              <NavLink to="/dashboard" onClick={onClose} className={linkClass}>
                <LayoutDashboard size={18} />
                <span>Main Dashboard</span>
              </NavLink>
            </nav>
          </div>

          {/* AI Study Companion Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1">
              <span className={navSectionClass + " px-0 mb-0"}>AI Study Companion</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                AI Core
              </span>
            </div>
            <nav className="space-y-1 mt-1.5">
              <NavLink to="/ai/tutor" onClick={onClose} className={linkClass}>
                <Bot size={18} className="text-indigo-500 group-hover:text-current" />
                <span>AI Tutor & Coding</span>
              </NavLink>
              <NavLink to="/ai/summarizer" onClick={onClose} className={linkClass}>
                <FileText size={18} className="text-violet-500 group-hover:text-current" />
                <span>PDF Summarizer</span>
              </NavLink>
              <NavLink to="/ai/mcq" onClick={onClose} className={linkClass}>
                <CheckSquare size={18} className="text-cyan-500 group-hover:text-current" />
                <span>AI MCQ Generator</span>
              </NavLink>
              <NavLink to="/ai/flashcards" onClick={onClose} className={linkClass}>
                <Layers size={18} className="text-amber-500 group-hover:text-current" />
                <span>Flashcard Decks</span>
              </NavLink>
              <NavLink to="/ai/exam-prep" onClick={onClose} className={linkClass}>
                <Target size={18} className="text-rose-500 group-hover:text-current" />
                <span>Exam Prep Mode</span>
              </NavLink>
              <NavLink to="/ai/answer-gen" onClick={onClose} className={linkClass}>
                <FileCheck size={18} className="text-emerald-500 group-hover:text-current" />
                <span>2/5/10 Mark Answers</span>
              </NavLink>
            </nav>
          </div>

          {/* College Survival Kit Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1">
              <span className={navSectionClass + " px-0 mb-0"}>College Survival Kit</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                100% Free
              </span>
            </div>
            <nav className="space-y-1 mt-1.5">
              <NavLink to="/attendance" onClick={onClose} className={linkClass}>
                <UserCheck size={18} className="text-emerald-500 group-hover:text-current" />
                <span>Attendance Manager</span>
              </NavLink>
              <NavLink to="/cgpa" onClick={onClose} className={linkClass}>
                <Calculator size={18} className="text-indigo-500 group-hover:text-current" />
                <span>CGPA / SGPA Calculator</span>
              </NavLink>
              <NavLink to="/assignments" onClick={onClose} className={linkClass}>
                <ClipboardList size={18} className="text-amber-500 group-hover:text-current" />
                <span>Assignment Manager</span>
              </NavLink>
              <NavLink to="/timetable" onClick={onClose} className={linkClass}>
                <CalendarDays size={18} className="text-sky-500 group-hover:text-current" />
                <span>Timetable & Schedule</span>
              </NavLink>
              <NavLink to="/expenses" onClick={onClose} className={linkClass}>
                <Wallet size={18} className="text-teal-500 group-hover:text-current" />
                <span>Student Expense Tracker</span>
              </NavLink>
              <NavLink to="/exams" onClick={onClose} className={linkClass}>
                <Clock size={18} className="text-rose-500 group-hover:text-current" />
                <span>Exam Countdown</span>
              </NavLink>
              <NavLink to="/notes" onClick={onClose} className={linkClass}>
                <Folder size={18} className="text-indigo-500 group-hover:text-current" />
                <span>Notes & Documents</span>
              </NavLink>
            </nav>
          </div>

          {/* Productivity & Resource Hub */}
          <div>
            <div className={navSectionClass}>Productivity & Hub</div>
            <nav className="space-y-1 mt-1.5">
              <NavLink to="/study-planner" onClick={onClose} className={linkClass}>
                <Timer size={18} className="text-fuchsia-500 group-hover:text-current" />
                <span>Smart Study Planner</span>
              </NavLink>
              <NavLink to="/resource-hub" onClick={onClose} className={linkClass}>
                <Share2 size={18} className="text-blue-500 group-hover:text-current" />
                <span>Student Resource Hub</span>
              </NavLink>
            </nav>
          </div>

          {/* Admin Control */}
          {user?.role === 'admin' && (
            <div>
              <div className={navSectionClass}>Administration</div>
              <nav className="space-y-1 mt-1.5">
                <NavLink to="/admin" onClick={onClose} className={linkClass}>
                  <ShieldAlert size={18} className="text-rose-500 group-hover:text-current" />
                  <span>Admin Control Center</span>
                </NavLink>
              </nav>
            </div>
          )}
        </div>

        {/* AI Query Quota Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-amber-500" />
                <span>AI Daily Quota</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {used} / {limit}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  pct >= 90 ? 'bg-rose-500' : pct >= 60 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {user?.planTier === 'free' ? (
              <button
                onClick={onOpenUpgrade}
                className="w-full py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition flex items-center justify-center gap-1"
              >
                <Sparkles size={13} />
                <span>Get Unlimited AI</span>
              </button>
            ) : (
              <div className="text-[10px] text-center font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                {user?.planTier} Plan Active
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
