import React, { useEffect, useState, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { StudyGoal, StudySession, Subject } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export const StudyPlannerPage: React.FC = () => {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [subjectDist, setSubjectDist] = useState<any[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pomodoro Timer State
  const [timerMode, setTimerMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 mins
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const timerRef = useRef<any>(null);

  // New Goal Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalSubjectId, setGoalSubjectId] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [goalTargetHours, setGoalTargetHours] = useState(2.0);

  const fetchPlanner = async () => {
    try {
      const res = await api.get('/study-planner');
      if (res.success && res.data) {
        setGoals(res.data.goals || []);
        setSessions(res.data.sessions || []);
        setTotalHours(res.data.totalHoursLogged || 0);
        setSubjectDist(res.data.subjectDistribution || []);
      }
      const subRes = await api.get('/attendance');
      if (subRes.success && subRes.data) {
        setSubjects(subRes.data.subjects || []);
        if (subRes.data.subjects.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(subRes.data.subjects[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load study planner:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanner();
  }, []);

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timerMode]);

  const handleTimerComplete = async () => {
    confetti({ particleCount: 80, spread: 60 });
    alert(`🎉 Pomodoro ${timerMode === 'focus' ? 'Focus Session' : 'Break'} complete! Great job.`);

    if (timerMode === 'focus') {
      try {
        await api.post('/study-planner/session', {
          subjectId: selectedSubjectId || null,
          sessionType: 'pomodoro',
          durationMinutes: 25,
          notes: 'Completed 25m Focus Block'
        });
        fetchPlanner();
      } catch (e) {
        // ignore
      }
    }
  };

  const setMode = (mode: 'focus' | 'short_break' | 'long_break') => {
    setIsRunning(false);
    setTimerMode(mode);
    if (mode === 'focus') setTimeLeft(25 * 60);
    else if (mode === 'short_break') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode(timerMode);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !goalTargetDate) return;

    try {
      await api.post('/study-planner/goal', {
        title: goalTitle,
        subjectId: goalSubjectId || null,
        targetDate: goalTargetDate,
        targetHours: goalTargetHours
      });

      setIsGoalModalOpen(false);
      setGoalTitle('');
      fetchPlanner();
    } catch (e) {
      alert('Failed to add goal');
    }
  };

  const handleToggleGoal = async (id: string, currentStatus: boolean | number) => {
    try {
      await api.put(`/study-planner/goal/${id}`, { isCompleted: !currentStatus });
      fetchPlanner();
    } catch (e) {
      // ignore
    }
  };

  const loadAiRecommendation = async () => {
    try {
      const res = await api.get('/study-planner/ai-recommendation');
      if (res.success && res.recommendation) {
        setAiRecommendation(res.recommendation);
      }
    } catch (e) {
      alert('Failed to generate recommendation');
    }
  };

  const formatMinutes = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Smart Study Planner & Pomodoro
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/80 dark:text-fuchsia-300">
              AI Timetable
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Focus with science-backed Pomodoro intervals, set daily goals, and get AI recommendations based on exam dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAiRecommendation}
            className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition flex items-center gap-2"
          >
            <Sparkles size={16} className="text-amber-500" />
            <span>AI Study Advice</span>
          </button>

          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-2 active:scale-95"
          >
            <Plus size={16} />
            <span>Add Study Goal</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Pomodoro Timer & Subject Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Pomodoro Timer Box */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-950 text-white shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Mode Selector Tabs */}
          <div className="inline-flex p-1 rounded-2xl bg-white/10 backdrop-blur-md mb-8">
            <button
              onClick={() => setMode('focus')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                timerMode === 'focus' ? 'bg-white text-indigo-900 shadow-md' : 'text-white/70 hover:text-white'
              }`}
            >
              25m Focus Block
            </button>
            <button
              onClick={() => setMode('short_break')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                timerMode === 'short_break' ? 'bg-white text-indigo-900 shadow-md' : 'text-white/70 hover:text-white'
              }`}
            >
              5m Short Break
            </button>
            <button
              onClick={() => setMode('long_break')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                timerMode === 'long_break' ? 'bg-white text-indigo-900 shadow-md' : 'text-white/70 hover:text-white'
              }`}
            >
              15m Rest Break
            </button>
          </div>

          {/* Big Digital Timer Display */}
          <div className="relative my-4">
            <div className="text-6xl sm:text-8xl font-black font-mono tracking-tight select-none">
              {formatMinutes(timeLeft)}
            </div>
            <div className="text-xs uppercase font-bold tracking-widest text-indigo-200 mt-2">
              {timerMode === 'focus' ? 'Deep Work Session' : 'Recharge & Hydrate'}
            </div>
          </div>

          {/* Subject tag select */}
          <div className="my-4 max-w-xs w-full">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white/10 border border-white/20 text-white backdrop-blur-md"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="text-slate-900">
                  Studying: {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Play / Pause / Reset Controls */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3.5 rounded-2xl font-black text-sm tracking-wide transition shadow-lg flex items-center gap-2 active:scale-95 ${
                isRunning
                  ? 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                  : 'bg-emerald-400 text-slate-900 hover:bg-emerald-300'
              }`}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              <span>{isRunning ? 'Pause Timer' : 'Start Focus Session'}</span>
            </button>

            <button
              onClick={resetTimer}
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Right Column: Weekly Study Analytics */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Award size={18} className="text-indigo-600" />
                <span>Study Time Metrics</span>
              </h3>
              <span className="text-xs text-slate-400">Total Logged</span>
            </div>

            <div className="my-4 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Total Focus Time
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {totalHours} <span className="text-sm font-semibold text-slate-400">Hours</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Logged across all self-study sessions</div>
            </div>

            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
              Subject Distribution
            </h4>
            {subjectDist.length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center">Complete a Pomodoro session to see subject breakdown.</div>
            ) : (
              <div className="space-y-2.5">
                {subjectDist.map((sub, i) => (
                  <div key={i} className="text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                      <span>{sub.subject}</span>
                      <span>{sub.hours}h</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (sub.hours / Math.max(1, totalHours)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendation Box if loaded */}
      {aiRecommendation && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/20 border border-violet-200 dark:border-violet-900 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-violet-950 dark:text-violet-200 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              <span>CampusMate AI Recommendation for {aiRecommendation.subject}</span>
            </h3>
            <span className="text-xs font-bold text-violet-600 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm">
              {aiRecommendation.daysRemaining} Days to Exam
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {aiRecommendation.recommendation}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {aiRecommendation.revisionSchedule?.map((step: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-violet-100 dark:border-slate-700 space-y-1">
                <span className="font-bold text-xs text-violet-700 dark:text-violet-400">{step.day}</span>
                <div className="text-[11px] text-slate-500">{step.milestone}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Goals Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 size={18} className="text-indigo-600" />
            <span>Target Study Goals</span>
          </h3>
          <span className="text-xs text-slate-400">
            {goals.filter((g) => g.is_completed).length} / {goals.length} Completed
          </span>
        </div>

        {goals.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No active goals. Click "+ Add Study Goal" above!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {goals.map((g) => (
              <div
                key={g.id}
                onClick={() => handleToggleGoal(g.id, g.is_completed)}
                className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                  g.is_completed
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 opacity-70'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 shadow-sm'
                }`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(g.is_completed)}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-bold ${g.is_completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {g.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>Target: {g.target_date}</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {g.completed_hours} / {g.target_hours} hrs
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Study Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add Study Goal</h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Normalization & BCNF decomposition"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject
                </label>
                <select
                  value={goalSubjectId}
                  onChange={(e) => setGoalSubjectId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">General (No Specific Subject)</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Study Hours Budget
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    value={goalTargetHours}
                    onChange={(e) => setGoalTargetHours(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md"
                >
                  Set Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
