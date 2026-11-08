import React, { useEffect, useState } from 'react';
import {
  Clock,
  Plus,
  Calendar,
  Sparkles,
  MapPin,
  Trash2,
  CheckCircle2,
  BookOpen,
  X
} from 'lucide-react';
import { Examination, Subject } from '../types';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const ExamsPage: React.FC = () => {
  const [exams, setExams] = useState<Examination[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [roomNumber, setRoomNumber] = useState('');
  const [syllabusTopics, setSyllabusTopics] = useState('');
  const [targetScore, setTargetScore] = useState(85);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      if (res.success && res.data) {
        setExams(res.data);
      }
      const subRes = await api.get('/attendance');
      if (subRes.success && subRes.data) {
        setSubjects(subRes.data.subjects || []);
        if (subRes.data.subjects.length > 0 && !subjectId) {
          setSubjectId(subRes.data.subjects[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load exams:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !examName || !examDate) return;

    try {
      await api.post('/exams', {
        subjectId,
        examName,
        examDate,
        startTime,
        durationMinutes,
        roomNumber,
        syllabusTopics,
        targetScore
      });

      setIsModalOpen(false);
      setExamName('');
      setSyllabusTopics('');
      fetchExams();
    } catch (e) {
      alert('Failed to schedule examination');
    }
  };

  const handleToggleComplete = async (id: string, currentStatus: boolean | number) => {
    try {
      await api.put(`/exams/${id}/complete`, { isCompleted: !currentStatus });
      fetchExams();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this examination?')) return;
    try {
      await api.delete(`/exams/${id}`);
      fetchExams();
    } catch (e) {
      alert('Failed to delete exam');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Exam Countdown
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
              High Priority
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track midterm, lab, and semester examination dates with days remaining countdown and AI study plan generator.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-2 active:scale-95"
        >
          <Plus size={16} />
          <span>Add Examination</span>
        </button>
      </div>

      {/* Examination Cards Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading examinations...</div>
      ) : exams.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Clock size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="font-semibold text-slate-600 dark:text-slate-300">No upcoming exams recorded</p>
          <p className="text-xs text-slate-400 mt-1">Add your upcoming test schedule to get AI revision plans!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((ex) => {
            const isCompleted = Boolean(ex.is_completed);
            const isUrgent = ex.isUrgent;

            return (
              <div
                key={ex.id}
                className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'border-slate-200 dark:border-slate-800 opacity-60'
                    : isUrgent
                    ? 'border-rose-300 dark:border-rose-900 shadow-md ring-1 ring-rose-500/20'
                    : 'border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-[170px]">
                      {ex.subject_name}
                    </span>

                    <div className="text-right">
                      {isCompleted ? (
                        <span className="text-xs font-bold text-emerald-600">Completed</span>
                      ) : (
                        <span
                          className={`text-lg font-black ${
                            isUrgent ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {ex.daysRemaining} Days Left
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className={`font-bold text-lg ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {ex.exam_name}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-500 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-indigo-500" />
                      <span>{new Date(ex.exam_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {ex.start_time || '10:00 AM'}</span>
                    </div>
                    {ex.room_number && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-rose-500" />
                        <span>Room: {ex.room_number} ({ex.duration_minutes} mins)</span>
                      </div>
                    )}
                  </div>

                  {ex.syllabus_topics && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Syllabus Key Topics:
                      </span>
                      <p className="text-slate-500 line-clamp-2">{ex.syllabus_topics}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() =>
                      navigate('/ai/exam-prep', {
                        state: {
                          subject: ex.subject_name,
                          topics: ex.syllabus_topics,
                          examDate: ex.exam_date
                        }
                      })
                    }
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition flex items-center gap-1.5"
                  >
                    <Sparkles size={14} className="text-amber-500" />
                    <span>AI Study Plan</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleComplete(ex.id, ex.is_completed)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition ${
                        isCompleted ? 'text-slate-400 hover:text-slate-600' : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title="Toggle Completed"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(ex.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 transition"
                      title="Delete Exam"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Examination Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Schedule Examination</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddExam} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject *
                </label>
                <select
                  required
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code || 'Course'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Examination Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DBMS End-Semester Theory Examination"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Exam Hall / Room
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Exam Hall B-4"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Syllabus Topics (Used by AI Exam Prep)
                </label>
                <textarea
                  rows={2}
                  placeholder="Relational Algebra, SQL, Normalization, Transactions..."
                  value={syllabusTopics}
                  onChange={(e) => setSyllabusTopics(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
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
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
