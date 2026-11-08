import React, { useState } from 'react';
import { Sun, Moon, Bell, Menu, Sparkles, User, LogOut, ChevronDown, ShieldCheck, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
  onOpenUpgrade: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenNotifications, onOpenUpgrade }) => {
  const { user, logout, quickLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 lg:px-6 flex items-center justify-between transition-colors">
      {/* Left side: Brand + Mobile hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                CampusMate <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                v2.0
              </span>
            </div>
            <span className="hidden sm:block text-[11px] text-slate-400 dark:text-slate-500 leading-none">
              Study Smarter. Manage Better.
            </span>
          </div>
        </Link>
      </div>

      {/* Middle/Right Quick Switcher & User Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Persona Switcher for easy testing */}
        <div className="relative">
          <button
            onClick={() => setPersonaOpen(!personaOpen)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <span>Persona:</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold capitalize">
              {user?.role === 'admin' ? 'Admin Sarah' : user?.planTier === 'pro' ? 'Pro Priya' : 'Aarav (Free)'}
            </span>
            <ChevronDown size={14} />
          </button>

          {personaOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-40 animate-fade-in">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Switch Test Account
              </div>
              <button
                onClick={() => {
                  quickLogin('student');
                  setPersonaOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold">Aarav Sharma</div>
                  <div className="text-[10px] text-slate-400">Student (Free Tier)</div>
                </div>
                {user?.email === 'student@campusmate.ai' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
              </button>
              <button
                onClick={() => {
                  quickLogin('pro');
                  setPersonaOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-violet-600 dark:text-violet-400">Priya Patel</div>
                  <div className="text-[10px] text-slate-400">Student Pro Member</div>
                </div>
                {user?.email === 'pro@campusmate.ai' && <div className="w-2 h-2 rounded-full bg-violet-500" />}
              </button>
              <button
                onClick={() => {
                  quickLogin('admin');
                  setPersonaOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-rose-600 dark:text-rose-400">Dr. Sarah Jenkins</div>
                  <div className="text-[10px] text-slate-400">Platform Administrator</div>
                </div>
                {user?.role === 'admin' && <div className="w-2 h-2 rounded-full bg-rose-500" />}
              </button>
            </div>
          )}
        </div>

        {/* Upgrade Pill */}
        {user?.planTier !== 'pro' && (
          <button
            onClick={onOpenUpgrade}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-sm transition active:scale-95"
          >
            <Sparkles size={13} />
            <span>Upgrade Pro</span>
          </button>
        )}

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="View notifications"
        >
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={19} /> : <Sun size={19} className="text-amber-400" />}
        </button>

        {/* User Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || 'User')}`}
              alt={user?.fullName || 'User'}
              className="w-8 h-8 rounded-full ring-2 ring-indigo-500/30 object-cover"
            />
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-40 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {user?.fullName || 'Student'}
                </div>
                <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {user?.planTier?.toUpperCase() || 'FREE'} PLAN
                  </span>
                  {user?.role === 'admin' && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                      <ShieldCheck size={10} /> Admin
                    </span>
                  )}
                </div>
              </div>

              <div className="py-1 text-xs">
                <Link
                  to="/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <User size={15} />
                  <span>Student Profile</span>
                </Link>
                <Link
                  to="/subscription"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <Sparkles size={15} className="text-amber-500" />
                  <span>Subscription Management</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <ShieldCheck size={15} />
                    <span>Admin Control Center</span>
                  </Link>
                )}
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <LogOut size={15} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
