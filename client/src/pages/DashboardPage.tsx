import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  UserCheck,
  Award,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Bot,
  FileText,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/data');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const toggleGoal = async (id: string, currentStatus: boolean | number) => {
    try {
      await api.put(`/study-planner/goal/${id}`, { isCompleted: !currentStatus });
      fetchDashboard();
    } catch (e) {
      // ignore
    }
  };

  const toggleAssignment = async (id: string) => {
    try {
      await api.put(`/assignments/${id}/status`, { status: 'completed' });
      fetchDashboard();
    } catch (e) {
      // ignore
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading your college dashboard...</p>
      </div>
    );
  }

  const profile = data?.profile || {};
  const attendance = data?.attendance || { overallPercentage: 85, warningCount: 0, subjects: [] };
  const exams = data?.exams || [];
  const assignments = data?.assignments || [];
  const timetable = data?.timetable || [];
  const studyGoals = data?.studyGoals || [];
  const progress = data?.academicProgress || { cgpa: 9.1, semesterTrends: [] };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Welcome Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              <Sparkles size={14} className="text-amber-300" />
              <span>CampusMate AI Companion Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile.full_name || user?.fullName || 'Student'}! 👋
            </h1>
            <p className="text-indigo-100 text-sm max-w-xl">
              {profile.course || 'B.Tech Computer Science'} • Semester {profile.semester || 5} • {profile.college_name || 'Engineering College'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/ai/tutor')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-indigo-700 hover:bg-indigo-50 shadow-md transition flex items-center gap-2 active:scale-95"
            >
              <Bot size={16} />
              <span>Ask AI Tutor</span>
            </button>
            <button
              onClick={() => navigate('/ai/exam-prep')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-500/40 text-white hover:bg-indigo-500/60 border border-white/20 backdrop-blur-md transition flex items-center gap-2 active:scale-95"
            >
              <Sparkles size={16} className="text-amber-300" />
              <span>Exam Prep AI</span>
            </button>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-40 -top-10 w-48 h-48 bg-violet-400/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Attendance</span>
            <div className={`p-2 rounded-xl ${attendance.overallPercentage >= 75 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50'}`}>
              <UserCheck size={18} />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {attendance.overallPercentage}%
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {attendance.warningCount > 0 ? (
                <span className="text-rose-500 font-semibold flex items-center gap-1">
                  <AlertTriangle size={12} /> {attendance.warningCount} subject below 75%
                </span>
              ) : (
                <span className="text-emerald-500 font-semibold">Safe above 75% threshold</span>
              )}
            </div>
          </div>
          <Link to="/attendance" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            Check bunk limits <ChevronRight size={14} />
          </Link>
        </div>

        {/* CGPA Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Current CGPA</span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50">
              <Award size={18} />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {progress.cgpa} <span className="text-xs font-normal text-slate-400">/ 10</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <TrendingUp size={13} className="text-emerald-500" />
              <span className="text-emerald-500 font-semibold">+0.2 SGPA</span> vs last semester
            </div>
          </div>
          <Link to="/cgpa" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            Calculate target CGPA <ChevronRight size={14} />
          </Link>
        </div>

        {/* Next Exam Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Next Exam</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50">
              <Clock size={18} />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {exams.length > 0 ? `${exams[0].daysLeft} Days` : 'All Clear'}
            </div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate mt-0.5">
              {exams.length > 0 ? exams[0].exam_name : 'No exams this week'}
            </div>
          </div>
          <Link to="/exams" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            Exam countdown <ChevronRight size={14} />
          </Link>
        </div>

        {/* Pending Assignments */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Assignments</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {assignments.length} Pending
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {assignments.filter((a: any) => a.priority === 'urgent').length} marked urgent
            </div>
          </div>
          <Link to="/assignments" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            View assignment list <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* 3. Main Split View: Left (Today's Schedule & Attendance), Right (Study Goals & Exams) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Timetable Widget */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-600" />
                  <span>Today's Timetable ({data?.dayOfWeek})</span>
                </h3>
                <p className="text-xs text-slate-500">Your scheduled lectures and laboratory sessions for today.</p>
              </div>
              <Link to="/timetable" className="text-xs font-bold text-indigo-600 hover:underline">
                Full Week
              </Link>
            </div>

            {timetable.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                No classes scheduled for today! Enjoy your self-study time.
              </div>
            ) : (
              <div className="space-y-3">
                {timetable.map((slot: any) => (
                  <div
                    key={slot.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4 hover:border-slate-200 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-2.5 h-10 rounded-full flex-shrink-0"
                        style={{ backgroundColor: slot.subject_color || '#6366f1' }}
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {slot.subject_name}
                        </h4>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{slot.room_number ? `Room: ${slot.room_number}` : 'Room TBA'}</span>
                          <span>•</span>
                          <span>{slot.instructor || 'Instructor'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {slot.start_time} - {slot.end_time}
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                        Lecture
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance Overview Progress Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck size={18} className="text-emerald-600" />
                  <span>Subject Attendance & Bunk Predictor</span>
                </h3>
                <p className="text-xs text-slate-500">Live tracker to maintain minimum 75% university eligibility.</p>
              </div>
              <Link to="/attendance" className="text-xs font-bold text-indigo-600 hover:underline">
                Manage All
              </Link>
            </div>

            <div className="space-y-4">
              {attendance.subjects.slice(0, 4).map((sub: any) => (
                <div key={sub.subject_id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                      {sub.subject_name}
                    </span>
                    <div className="flex items-center gap-3">
                      {sub.percentage >= (sub.target_attendance_pct || 75) ? (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                          Can bunk {sub.canBunk} classes
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                          Must attend {sub.mustAttend} classes
                        </span>
                      )}
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {sub.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        sub.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, sub.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Study Shortcuts Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/20 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <span>AI Study Companion Suite</span>
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => navigate('/ai/tutor')}
                className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 hover:border-indigo-400 text-left transition shadow-sm group"
              >
                <Bot size={20} className="text-indigo-600 group-hover:scale-110 transition-transform mb-1.5" />
                <div className="font-bold text-xs text-slate-900 dark:text-white">AI Tutor</div>
                <div className="text-[10px] text-slate-500">Ask any concept</div>
              </button>

              <button
                onClick={() => navigate('/ai/summarizer')}
                className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 hover:border-violet-400 text-left transition shadow-sm group"
              >
                <FileText size={20} className="text-violet-600 group-hover:scale-110 transition-transform mb-1.5" />
                <div className="font-bold text-xs text-slate-900 dark:text-white">PDF Summary</div>
                <div className="text-[10px] text-slate-500">Upload documents</div>
              </button>

              <button
                onClick={() => navigate('/ai/mcq')}
                className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 hover:border-cyan-400 text-left transition shadow-sm group"
              >
                <Award size={20} className="text-cyan-600 group-hover:scale-110 transition-transform mb-1.5" />
                <div className="font-bold text-xs text-slate-900 dark:text-white">MCQ Quiz AI</div>
                <div className="text-[10px] text-slate-500">Test knowledge</div>
              </button>

              <button
                onClick={() => navigate('/ai/answer-gen')}
                className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 hover:border-emerald-400 text-left transition shadow-sm group"
              >
                <FileText size={20} className="text-emerald-600 group-hover:scale-110 transition-transform mb-1.5" />
                <div className="font-bold text-xs text-slate-900 dark:text-white">Answer Gen</div>
                <div className="text-[10px] text-slate-500">2/5/10 mark rubrics</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Daily Study Goals Widget */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={18} className="text-indigo-600" />
                <span>Daily Study Goals</span>
              </h3>
              <Link to="/study-planner" className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Plus size={16} />
              </Link>
            </div>

            {studyGoals.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No goals set for today. Add one in the Smart Study Planner!
              </div>
            ) : (
              <div className="space-y-2.5">
                {studyGoals.map((g: any) => (
                  <div
                    key={g.id}
                    onClick={() => toggleGoal(g.id, g.is_completed)}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 flex items-start gap-3 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(g.is_completed)}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${g.is_completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {g.title}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {g.completed_hours} / {g.target_hours} hrs completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Examinations Countdown */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Clock size={18} className="text-rose-500" />
                <span>Upcoming Exams</span>
              </h3>
              <Link to="/exams" className="text-xs font-bold text-indigo-600 hover:underline">
                View All
              </Link>
            </div>

            {exams.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">No upcoming examinations.</div>
            ) : (
              <div className="space-y-3">
                {exams.map((ex: any) => (
                  <div
                    key={ex.id}
                    className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {ex.exam_name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {ex.subject_name} • {new Date(ex.exam_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                        {ex.daysLeft}d left
                      </div>
                      <button
                        onClick={() => navigate('/ai/exam-prep')}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        AI Prep ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Assignments List */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen size={18} className="text-amber-500" />
                <span>Deadlines & Tasks</span>
              </h3>
              <Link to="/assignments" className="text-xs font-bold text-indigo-600 hover:underline">
                All
              </Link>
            </div>

            {assignments.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">No pending assignments!</div>
            ) : (
              <div className="space-y-2.5">
                {assignments.slice(0, 3).map((a: any) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${a.priority === 'urgent' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {a.title}
                        </h4>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Due: {new Date(a.due_date).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAssignment(a.id)}
                      className="px-2 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100 transition"
                    >
                      Done
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
