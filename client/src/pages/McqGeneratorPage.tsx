import React, { useState } from 'react';
import {
  CheckSquare,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  HelpCircle,
  ArrowRight,
  Save
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const McqGeneratorPage: React.FC = () => {
  const { refreshProfile } = useAuth();
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const sampleTopics = [
    'Operating Systems: Deadlock & Synchronization',
    'Database Systems: Normalization & Indexing',
    'Computer Networks: TCP/IP & Subnetting',
    'Data Structures: Balanced Trees & Heaps'
  ];

  const handleGenerate = async (topicStr?: string) => {
    const t = topicStr || topic;
    if (!t.trim()) {
      alert('Please enter a topic for the quiz.');
      return;
    }

    setIsLoading(true);
    setQuizData(null);
    setSelectedAnswers({});
    setIsSubmitted(false);

    try {
      const res = await api.post('/ai/mcq-generator', { topic: t });
      if (res.success && res.data) {
        setQuizData(res.data);
        await refreshProfile();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionLetter: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizData?.questions) return;
    let calculatedScore = 0;
    quizData.questions.forEach((q: any) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);
    setIsSubmitted(true);

    if (calculatedScore >= Math.ceil(quizData.questions.length * 0.75)) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    if (quizData.quizId) {
      try {
        await api.post('/ai/mcq/score', {
          quizId: quizData.quizId,
          score: calculatedScore,
          totalQuestions: quizData.questions.length
        });
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI MCQ & Quiz Generator
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300">
              Instant Scoring
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate 4-option multiple-choice tests on any engineering subject with in-depth answers and explanations.
          </p>
        </div>
      </div>

      {/* Generation Input Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
          Enter Subject, Topic, or Unit to Test
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="e.g. Design & Analysis of Algorithms: Dynamic Programming"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={isLoading || !topic.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Quiz</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Suggested Topics */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-[11px] font-bold text-slate-400">Popular:</span>
          {sampleTopics.map((t, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopic(t);
                handleGenerate(t);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Interface */}
      {quizData && (
        <div className="space-y-6 animate-fade-in">
          {/* Quiz Header Bar with Score if submitted */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                AI Knowledge Assessment
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {quizData.topic || topic}
              </h2>
            </div>

            {isSubmitted && (
              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Final Score</span>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {score} / {quizData.questions.length}
                </div>
              </div>
            )}
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {quizData.questions?.map((q: any, qIdx: number) => {
              const selected = selectedAnswers[q.id];
              const isCorrect = selected === q.correctAnswer;

              return (
                <div
                  key={q.id || qIdx}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {qIdx + 1}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {q.question}
                    </h3>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {['A', 'B', 'C', 'D'].map((letter) => {
                      const optionText = q.options[letter];
                      const isOptionSelected = selected === letter;
                      const isOptionCorrect = q.correctAnswer === letter;

                      let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300';

                      if (isSubmitted) {
                        if (isOptionCorrect) {
                          btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold';
                        } else if (isOptionSelected && !isOptionCorrect) {
                          btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200';
                        }
                      } else if (isOptionSelected) {
                        btnStyle = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold shadow-sm';
                      }

                      return (
                        <button
                          key={letter}
                          disabled={isSubmitted}
                          onClick={() => handleSelectOption(q.id, letter)}
                          className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-3 ${btnStyle}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-600">
                            {letter}
                          </span>
                          <span className="flex-1">{optionText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation Section when submitted */}
                  {isSubmitted && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        {isCorrect ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={15} /> Correct!
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <XCircle size={15} /> Incorrect (Correct: Option {q.correctAnswer})
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 leading-relaxed">
                        <strong className="text-slate-700 dark:text-slate-300">Explanation: </strong>
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {Object.keys(selectedAnswers).length} of {quizData.questions.length} answered
            </span>

            {!isSubmitted ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md disabled:opacity-50"
              >
                Submit & Calculate Score
              </button>
            ) : (
              <button
                onClick={() => handleGenerate()}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition flex items-center gap-2"
              >
                <RotateCcw size={15} />
                <span>Generate New Questions</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
