import React, { useEffect, useState } from 'react';
import {
  Calculator,
  Award,
  Plus,
  Trash2,
  TrendingUp,
  Target,
  ChevronDown,
  Info,
  CheckCircle2
} from 'lucide-react';
import { SemesterData } from '../types';
import { api } from '../services/api';

export const CgpaPage: React.FC = () => {
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [cgpa, setCgpa] = useState<number>(0);
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [gradeScale, setGradeScale] = useState<'10_point' | '4_point'>('10_point');
  const [isLoading, setIsLoading] = useState(true);

  // New Grade Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSem, setNewSem] = useState<number>(5);
  const [newSubName, setNewSubName] = useState('');
  const [newCredits, setNewCredits] = useState(4);
  const [newGradeLetter, setNewGradeLetter] = useState('A+');
  const [newGradePoints, setNewGradePoints] = useState(9.5);

  // Target Projector State
  const [targetCGPA, setTargetCGPA] = useState<number>(9.0);
  const [futureCredits, setFutureCredits] = useState<number>(20);
  const [targetResult, setTargetResult] = useState<any>(null);

  const GRADE_OPTIONS_10 = [
    { letter: 'O (Outstanding)', val: 10.0, label: 'O' },
    { letter: 'A+ (Excellent)', val: 9.5, label: 'A+' },
    { letter: 'A (Very Good)', val: 9.0, label: 'A' },
    { letter: 'B+ (Good)', val: 8.0, label: 'B+' },
    { letter: 'B (Above Average)', val: 7.0, label: 'B' },
    { letter: 'C (Average)', val: 6.0, label: 'C' },
    { letter: 'P (Pass)', val: 5.0, label: 'P' },
    { letter: 'F (Fail)', val: 0.0, label: 'F' }
  ];

  const fetchGrades = async () => {
    try {
      const res = await api.get('/cgpa');
      if (res.success && res.data) {
        setSemesters(res.data.semesters || []);
        setCgpa(res.data.cgpa || 0);
        setTotalCredits(res.data.totalCumulativeCredits || 0);
        setTotalPoints(res.data.totalCumulativePoints || 0);
      }
    } catch (err) {
      console.error('Failed to load CGPA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName) return;

    try {
      await api.post('/cgpa/grade', {
        semester: newSem,
        subjectName: newSubName,
        credits: newCredits,
        gradeLetter: newGradeLetter,
        gradePoints: newGradePoints
      });

      setIsModalOpen(false);
      setNewSubName('');
      fetchGrades();
    } catch (err) {
      alert('Failed to add course grade');
    }
  };

  const handleDeleteGrade = async (id: string) => {
    try {
      await api.delete(`/cgpa/grade/${id}`);
      fetchGrades();
    } catch (err) {
      alert('Failed to delete grade');
    }
  };

  const calculateTarget = async () => {
    try {
      const res = await api.post('/cgpa/target-calculator', {
        targetCGPA,
        futureCredits
      });
      if (res.success && res.data) {
        setTargetResult(res.data);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (cgpa > 0) {
      calculateTarget();
    }
  }, [targetCGPA, futureCredits, cgpa]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              CGPA & SGPA Calculator
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
              Configurable Grading
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Calculate your semester SGPA, monitor cumulative CGPA trends, and calculate required future performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={gradeScale}
            onChange={(e) => setGradeScale(e.target.value as any)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm"
          >
            <option value="10_point">10-Point Indian University Scale</option>
            <option value="4_point">4-Point US/International Scale</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-2 active:scale-95"
          >
            <Plus size={16} />
            <span>Add Course Grade</span>
          </button>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-80 text-xs font-bold uppercase tracking-wider">
            <span>Cumulative CGPA</span>
            <Award size={20} />
          </div>
          <div className="my-3">
            <div className="text-4xl sm:text-5xl font-black">{cgpa}</div>
            <div className="text-xs opacity-90 mt-1">On a 10.0 grading scale</div>
          </div>
          <div className="text-[11px] opacity-80">
            {cgpa >= 9.0 ? '🌟 First Class with Distinction' : cgpa >= 7.5 ? '⭐ First Class' : 'Second Class'}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Credits Earned</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white my-2">
            {totalCredits} <span className="text-xs font-normal text-slate-400">Credits</span>
          </div>
          <div className="text-xs text-slate-500">Across {semesters.length} completed semesters</div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Grade Points</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white my-2">
            {Math.round(totalPoints * 10) / 10}
          </div>
          <div className="text-xs text-slate-500">∑(Course Credits × Grade Points)</div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Latest Semester SGPA</span>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 my-2">
            {semesters.length > 0 ? semesters[semesters.length - 1].sgpa : 'N/A'}
          </div>
          <div className="text-xs text-slate-500">Semester {semesters.length > 0 ? semesters[semesters.length - 1].semester : 1}</div>
        </div>
      </div>

      {/* Main Split: Semester Grade Breakdown & Target Projector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Semester Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Semester-Wise Academic History</h3>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400">Loading academic records...</div>
          ) : semesters.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No course grades logged yet. Click "+ Add Course Grade" to build your transcript.
            </div>
          ) : (
            semesters.map((sem) => (
              <div
                key={sem.semester}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-extrabold text-sm">
                      Semester {sem.semester}
                    </span>
                    <span className="text-xs text-slate-500">
                      {sem.subjects.length} Courses • {sem.totalCredits} Total Credits
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SGPA: </span>
                    <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                      {sem.sgpa}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-2">Course Name</th>
                        <th className="py-2">Credits</th>
                        <th className="py-2">Grade</th>
                        <th className="py-2">Points</th>
                        <th className="py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                      {sem.subjects.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 font-semibold">{sub.subject_name}</td>
                          <td className="py-2.5">{sub.credits}</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {sub.grade_letter}
                            </span>
                          </td>
                          <td className="py-2.5 font-bold">{sub.grade_points}</td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => handleDeleteGrade(sub.id)}
                              className="text-slate-300 hover:text-rose-500 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column (1 Col): Target CGPA Projector */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm sticky top-20">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
                <Target size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Target CGPA Projector
                </h3>
                <p className="text-xs text-slate-500">Calculate SGPA needed to graduate with your dream score.</p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Desired Graduation CGPA
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="10"
                  value={targetCGPA}
                  onChange={(e) => setTargetCGPA(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Upcoming Semester Credits Left
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={futureCredits}
                  onChange={(e) => setFutureCredits(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {targetResult && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-center">
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    Required Future SGPA
                  </span>
                  <div
                    className={`text-4xl font-extrabold ${
                      targetResult.isAchievable ? 'text-violet-600 dark:text-violet-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {targetResult.requiredSGPA}
                  </div>
                  <div className="text-xs text-slate-500">
                    Average SGPA needed across the next {futureCredits} credits.
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs font-semibold">
                    {targetResult.isAchievable ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                        <CheckCircle2 size={14} /> Achievable! Stay consistent with AI Exam Prep.
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400">
                        Exceeds maximum 10.0 scale. Consider adjusting your target.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Grade Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Add Course Grade</h3>

            <form onSubmit={handleAddGrade} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Semester
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newSem}
                    onChange={(e) => setNewSem(Number(e.target.value))}
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
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject / Course Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Networks"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Grade Earned
                </label>
                <select
                  value={newGradeLetter}
                  onChange={(e) => {
                    const sel = GRADE_OPTIONS_10.find((g) => g.label === e.target.value);
                    if (sel) {
                      setNewGradeLetter(sel.label);
                      setNewGradePoints(sel.val);
                    }
                  }}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {GRADE_OPTIONS_10.map((g) => (
                    <option key={g.label} value={g.label}>
                      {g.letter} ({g.val} Points)
                    </option>
                  ))}
                </select>
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
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
