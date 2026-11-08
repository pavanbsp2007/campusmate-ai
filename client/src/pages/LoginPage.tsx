import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  User,
  School,
  BookOpen,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { login, register, googleLogin, quickLogin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('student@campusmate.ai');
  const [password, setPassword] = useState('campusmate123');

  // Register Fields
  const [fullName, setFullName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [course, setCourse] = useState('B.Tech Computer Science');
  const [semester, setSemester] = useState(5);
  const [academicYear, setAcademicYear] = useState('2024-2028');

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      if (activeTab === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else if (activeTab === 'register') {
        await register({
          email,
          password,
          fullName,
          collegeName,
          course,
          semester,
          academicYear
        });
        navigate('/dashboard');
      } else {
        // Forgot password
        setStatusMessage(`Password reset link sent to ${email}. Check your inbox!`);
      }
    } catch (err: any) {
      alert(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await googleLogin();
      navigate('/dashboard');
    } catch (e: any) {
      alert(e.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonaLogin = async (role: 'student' | 'pro' | 'admin') => {
    setIsLoading(true);
    try {
      await quickLogin(role);
      navigate('/dashboard');
    } catch (e: any) {
      alert(e.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/30 mb-3">
          <GraduationCap size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          CampusMate <span className="text-indigo-600 dark:text-indigo-400">AI</span>
        </h1>
        <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-widest">
          Study Smarter. Manage Better. Live Campus Life.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-6">
          {/* Tabs */}
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs font-bold">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 rounded-xl transition ${
                activeTab === 'login' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 rounded-xl transition ${
                activeTab === 'register' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              Register Student
            </button>
            <button
              onClick={() => setActiveTab('forgot')}
              className={`flex-1 py-2 rounded-xl transition ${
                activeTab === 'forgot' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              Reset Pass
            </button>
          </div>

          {/* Quick Reviewer Persona Demo Banner */}
          <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
              ⚡ Instant 1-Click Persona Login
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePersonaLogin('student')}
                className="py-1.5 px-2 text-[11px] font-bold rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition"
              >
                Aarav (Free)
              </button>
              <button
                type="button"
                onClick={() => handlePersonaLogin('pro')}
                className="py-1.5 px-2 text-[11px] font-bold rounded-xl bg-violet-600 text-white shadow-sm hover:bg-violet-700 transition"
              >
                Priya (Pro)
              </button>
              <button
                type="button"
                onClick={() => handlePersonaLogin('admin')}
                className="py-1.5 px-2 text-[11px] font-bold rounded-xl bg-rose-600 text-white shadow-sm hover:bg-rose-700 transition"
              >
                Dr. Sarah (Admin)
              </button>
            </div>
          </div>

          {/* Google Auth Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Or continue with email
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'register' && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      College / University *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NIT Trichy"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Course / Branch *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. B.Tech CSE"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Current Semester
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      placeholder="2024-2028"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {activeTab !== 'forgot' && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {activeTab === 'login' ? 'Sign In to CampusMate' : activeTab === 'register' ? 'Complete Registration' : 'Send Reset Link'}
                  </span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
