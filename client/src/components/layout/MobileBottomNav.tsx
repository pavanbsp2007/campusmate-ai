import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserCheck, Bot, CalendarDays, MoreHorizontal } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenSidebar: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenSidebar }) => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center py-2 px-3 text-[10px] font-bold transition-colors ${
      isActive
        ? 'text-indigo-600 dark:text-indigo-400'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
    }`;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 flex items-center justify-around shadow-lg">
      <NavLink to="/dashboard" className={linkClass}>
        <LayoutDashboard size={20} className="mb-0.5" />
        <span>Home</span>
      </NavLink>

      <NavLink to="/attendance" className={linkClass}>
        <UserCheck size={20} className="mb-0.5" />
        <span>Attendance</span>
      </NavLink>

      <NavLink to="/ai/tutor" className={linkClass}>
        <div className="p-2 -mt-4 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-full shadow-lg shadow-indigo-500/30">
          <Bot size={22} />
        </div>
        <span className="mt-0.5">AI Tutor</span>
      </NavLink>

      <NavLink to="/timetable" className={linkClass}>
        <CalendarDays size={20} className="mb-0.5" />
        <span>Timetable</span>
      </NavLink>

      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center justify-center py-2 px-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <MoreHorizontal size={20} className="mb-0.5" />
        <span>Tools</span>
      </button>
    </nav>
  );
};
