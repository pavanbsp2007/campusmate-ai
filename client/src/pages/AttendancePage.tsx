import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  AlertTriangle,
  Plus,
  Check,
  X,
  Sliders,
  Sparkles,
  Info,
  Calendar,
  Trash2,
  TrendingUp,
  Percent
} from 'lucide-react';
import { Subject } from '../types';
import { api } from '../services/api';

export const AttendancePage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Subject Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubCredits, setNewSubCredits] = useState(3);
  const [newSubProfessor, setNewSubProfessor] = useState('');
  const [newSubTotal, setNewSubTotal] = useState(30);
  const [newSubAttended, setNewSubAttended] = useState(25);
  const [newSubTarget, setNewSubTarget] = useState(75);

  // Bunk Simulator State
  const [simSubjectId, setSimSubjectId] = useState<string>('');
  const [simFutureAttend, setSimFutureAttend] = useState<number>(0);
  const [simFutureMiss, setSimFutureMiss] = useState<number>(0);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance');
      if (res.success && res.data) {
        setSubjects(res.data.subjects || []);
        setSummary(res.data.summary || {});
        if (res.data.subjects?.length > 0 && !simSubjectId) {
          setSimSubjectId(res.data.subjects[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName) return;

    try {
      await api.post('/attendance/subject', {
        name: newSubName,
        code: newSubCode,
        credits: newSubCredits,
        professor: newSubProfessor,
        totalClasses: newSubTotal,
        attendedClasses: newSubAttended,
        targetAttendancePct: newSubTarget,
        color: ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'][
          Math.floor(Math.random() * 6)
        ]
      });

      setIsModalOpen(false);
      setNewSubName('');
      setNewSubCode('');
      fetchAttendance();
    } catch (err) {
      alert('Failed to add subject');
    }
  };

  const markClass = async (subjectId: string, status: 'present' | 'absent') => {
    try {
      await api.post('/attendance/log', { subjectId, status });
      fetchAttendance();
    } catch (err) {
      alert('Failed to log attendance');
    }
  };

  const deleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await api.delete(`/attendance/subject/${id}`);
      fetchAttendance();
    } catch (err) {
      alert('Failed to delete subject');
    }
  };

  // Selected subject for simulation
  const selectedSimSubject = subjects.find((s) => s.id === simSubjectId) || subjects[0];
  const simTotal = (selectedSimSubject?.total_classes || 0) + simFutureAttend + simFutureMiss;
  const simAttended = (selectedSimSubject?.attended_classes || 0) + simFutureAttend;
  const simPct = simTotal > 0 ? Math.round((simAttended / simTotal) * 100 * 10) / 10 : 100;
  const simTarget = selectedSimSubject?.target_attendance_pct || 75;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Attendance Manager
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
              Survival Kit
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track classes, calculate how many you can safely bunk, and ensure you remain above your university threshold.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-2 active:scale-95"
        >
          <Plus size={16} />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Aggregate Overview Bar */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Classes</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {summary.overallTotal}
            </div>
            <div className="text-xs text-slate-500 mt-1">Across all {subjects.length} subjects</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Classes Attended</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {summary.overallAttended}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Missed: {summary.overallTotal - summary.overallAttended} classes
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Percentage</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
              {summary.percentage}%
            </div>
            <div className="text-xs text-slate-500 mt-1">Min. requirement: 75%</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Eligibility Status</span>
            <div className="text-lg font-extrabold mt-1">
              {summary.warningCount > 0 ? (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle size={18} /> {summary.warningCount} Warning(s)
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check size={18} /> All Subjects Safe
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {summary.warningCount > 0 ? 'Attend urgent recovery classes' : 'You can comfortably bunk select classes'}
            </div>
          </div>
        </div>
      )}

      {/* Main Subjects Table & Bunk Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Subject Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Subjects & Calculations</h3>
            <span className="text-xs text-slate-400">Click Present/Absent for instant updates</span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400">Loading subjects...</div>
          ) : subjects.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No subjects added yet. Click "+ Add Subject" to get started!
            </div>
          ) : (
            subjects.map((sub) => {
              const target = sub.target_attendance_pct || 75;
              const isBelow = (sub.percentage || 0) < target;

              return (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-12 rounded-full flex-shrink-0"
                        style={{ backgroundColor: sub.color || '#6366f1' }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-slate-900 dark:text-white">
                            {sub.name}
                          </h4>
                          {sub.code && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {sub.code}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {sub.professor ? `Prof. ${sub.professor}` : 'Core Subject'} • {sub.credits} Credits • Target: {target}%
                        </div>
                      </div>
                    </div>

                    {/* Percentage & Quick Status */}
                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                          {sub.percentage}%
                        </div>
                        <div className="text-xs text-slate-400">
                          {sub.attended_classes} / {sub.total_classes} classes
                        </div>
                      </div>

                      <button
                        onClick={() => deleteSubject(sub.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition"
                        title="Delete Subject"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        !isBelow ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, sub.percentage || 0)}%` }}
                    />
                  </div>

                  {/* Bunk / Must Attend Recommendation Pill + Quick Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="text-xs">
                      {!isBelow ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Check size={14} />
                          <span>
                            Safe zone! You can bunk <strong className="underline">{sub.canBunk}</strong> more classes and still remain above {target}%.
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                          <AlertTriangle size={14} />
                          <span>
                            Critical warning! You must attend the next <strong className="underline">{sub.mustAttend}</strong> consecutive classes to reach {target}%.
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => markClass(sub.id, 'present')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 transition flex items-center gap-1"
                      >
                        <Check size={13} />
                        <span>Present (+1)</span>
                      </button>
                      <button
                        onClick={() => markClass(sub.id, 'absent')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 transition flex items-center gap-1"
                      >
                        <X size={13} />
                        <span>Absent</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column (1 Col): Interactive What-If Bunk Simulator */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm sticky top-20">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Sliders size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  "What-If" Bunk Simulator
                </h3>
                <p className="text-xs text-slate-500">Simulate upcoming classes before you skip.</p>
              </div>
            </div>

            {subjects.length > 0 && (
              <div className="space-y-4 mt-4">
                {/* Select Subject */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Select Subject
                  </label>
                  <select
                    value={simSubjectId}
                    onChange={(e) => {
                      setSimSubjectId(e.target.value);
                      setSimFutureAttend(0);
                      setSimFutureMiss(0);
                    }}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.percentage}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Slider: Future classes attended */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-600 dark:text-emerald-400">Classes you will attend:</span>
                    <span className="font-bold">+{simFutureAttend}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={simFutureAttend}
                    onChange={(e) => setSimFutureAttend(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Slider: Future classes missed / bunked */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-rose-600 dark:text-rose-400">Classes you plan to bunk:</span>
                    <span className="font-bold">+{simFutureMiss}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={simFutureMiss}
                    onChange={(e) => setSimFutureMiss(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                {/* Simulated Outcome Display */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 mt-4 text-center">
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    Projected Percentage
                  </span>
                  <div className={`text-4xl font-extrabold ${simPct >= simTarget ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {simPct}%
                  </div>
                  <div className="text-xs text-slate-500">
                    Projected total: {simAttended} attended of {simTotal} total classes
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs font-semibold">
                    {simPct >= simTarget ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                        <Check size={14} /> You will be safely eligible for exams!
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
                        <AlertTriangle size={14} /> Warning! You will fall below the {simTarget}% threshold.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add New Subject</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS501"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newSubCredits}
                    onChange={(e) => setNewSubCredits(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Professor / Instructor
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ramesh Kumar"
                  value={newSubProfessor}
                  onChange={(e) => setNewSubProfessor(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Total Classes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newSubTotal}
                    onChange={(e) => setNewSubTotal(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Attended
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newSubAttended}
                    onChange={(e) => setNewSubAttended(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target %
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={newSubTarget}
                    onChange={(e) => setNewSubTarget(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
