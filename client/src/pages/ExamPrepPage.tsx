import React, { useState, useEffect } from 'react';
import {
  Target,
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
  Award,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ExamPrepPage: React.FC = () => {
  const location = useLocation();
  const { refreshProfile } = useAuth();

  const [subject, setSubject] = useState(location.state?.subject || 'Database Management Systems');
  const [topics, setTopics] = useState(location.state?.topics || 'Relational Algebra, SQL, Normalization (1NF to BCNF), ACID Transactions, B+ Tree Indexing');
  const [examDate, setExamDate] = useState(location.state?.examDate || '2026-11-20');
  const [availableHours, setAvailableHours] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  const [prepResult, setPrepResult] = useState<any>(null);

  useEffect(() => {
    if (location.state?.subject) {
      handleGenerate();
    }
  }, []);

  const handleGenerate = async () => {
    if (!subject.trim()) {
      alert('Please enter a subject.');
      return;
    }

    setIsLoading(true);
    setPrepResult(null);

    try {
      const res = await api.post('/ai/exam-prep', {
        subject,
        topics,
        examDate,
        availableHours
      });

      if (res.success && res.data) {
        setPrepResult(res.data);
        await refreshProfile();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to generate exam prep roadmap');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPlan = () => {
    if (!prepResult) return;
    const content = `# Exam Preparation Plan: ${prepResult.subject}\n\nDays Remaining: ${prepResult.daysRemaining}\nTotal Study Budget: ${prepResult.studyBudgetHours} Hours\n\n---\n\n## 1. Revision Timetable\n${prepResult.revisionSchedule?.map((s: any) => `### ${s.day} (${s.allocatedHours} Hours)\n- Focus Topics: ${s.topicsToCover?.join(', ')}\n- Goal Milestone: ${s.milestone}`).join('\n\n')}\n\n## 2. High-Yield Hot Topics\n${prepResult.hotExamTopics?.map((t: any) => `- ${t.topic} [Weightage: ${t.weightage}, Priority: ${t.priority}]`).join('\n')}\n\n## 3. Predicted Practice Questions\n${prepResult.practiceQuestions?.join('\n\n')}`;

    const element = document.createElement('a');
    const blob = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(blob);
    element.download = `${prepResult.subject.replace(/[^a-zA-Z0-9]/g, '_')}_Exam_Plan.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Exam Preparation Mode
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
              Exam Ace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Input examination details to generate an optimal revision schedule, predicted exam questions, and hot weightage topics.
          </p>
        </div>
      </div>

      {/* Input Configuration Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
          Examination Details & Target Constraints
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Operating Systems"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Examination Date *
            </label>
            <input
              type="date"
              required
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Syllabus Topics to Cover (Separate by commas)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Process scheduling, Deadlocks, Paging, Virtual memory, File systems..."
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-slate-700 dark:text-slate-300">
              Total Study Hours Available Before Exam:
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{availableHours} Hours</span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            step="1"
            value={availableHours}
            onChange={(e) => setAvailableHours(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !subject.trim()}
          className="w-full py-3.5 px-6 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 transition active:scale-[0.99]"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles size={16} />
              <span>Generate AI Revision Timetable & Practice Questions</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Roadmap Output */}
      {prepResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Personalized Revision Roadmap
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1">{prepResult.subject}</h2>
              <p className="text-xs text-slate-300 mt-1">{prepResult.recommendation}</p>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-right">
                <span className="text-xs text-slate-400">Countdown</span>
                <div className="text-2xl font-black text-rose-400">{prepResult.daysRemaining} Days</div>
              </div>

              <button
                onClick={downloadPlan}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-indigo-900 hover:bg-slate-100 transition shadow-md flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Export Plan</span>
              </button>
            </div>
          </div>

          {/* Section 1: Day-by-Day Revision Timetable */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              <span>Optimized Revision Timetable ({prepResult.studyBudgetHours} Study Hours)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {prepResult.revisionSchedule?.map((step: any, i: number) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">{step.day}</span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {step.allocatedHours} hrs
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Target Modules
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {step.topicsToCover?.map((t: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 font-medium">
                    Goal: {step.milestone}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Hot Exam Topics with Weightage */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              <span>High-Yield Hot Topics & Weightage Analysis</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prepResult.hotExamTopics?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.topic}</h4>
                    <span className="text-[11px] text-slate-400">Exam Weightage: {item.weightage}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.priority === 'Urgent'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                  >
                    {item.priority} Priority
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Predicted Practice Questions */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen size={18} className="text-violet-500" />
              <span>Predicted University Practice Questions</span>
            </h3>

            <div className="space-y-3">
              {prepResult.practiceQuestions?.map((q: string, i: number) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-violet-50/40 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/60 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200"
                >
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
