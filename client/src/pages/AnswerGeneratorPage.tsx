import React, { useState } from 'react';
import {
  FileCheck,
  Sparkles,
  Copy,
  Check,
  Download,
  BookOpen,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AnswerGeneratorPage: React.FC = () => {
  const { refreshProfile } = useAuth();
  const [query, setQuery] = useState('');
  const [marks, setMarks] = useState<'2-mark' | '5-mark' | '10-mark'>('5-mark');
  const [subject, setSubject] = useState('Computer Science');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAnswer, setGeneratedAnswer] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const samplePrompts = [
    'Define Deadlock and list the four necessary Coffman conditions',
    'Explain the working and structure of B+ Tree indexing with diagrams',
    'Compare TCP and UDP protocols with packet header diagrams',
    'Explain Virtual Memory and Paging mechanism with page fault handling'
  ];

  const handleGenerate = async (qText?: string) => {
    const q = qText || query;
    if (!q.trim()) {
      alert('Please enter an exam question prompt.');
      return;
    }

    setIsLoading(true);
    setGeneratedAnswer(null);

    try {
      const res = await api.post('/ai/answer-generator', {
        query: q,
        marks,
        subject
      });

      if (res.success && res.data) {
        setGeneratedAnswer(res.data);
        await refreshProfile();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to generate formatted answer');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedAnswer) return;
    navigator.clipboard.writeText(generatedAnswer.formattedAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAnswer = () => {
    if (!generatedAnswer) return;
    const content = `# University Exam Solution (${generatedAnswer.markType})\n\n**Question:** ${generatedAnswer.question}\n\n---\n\n${generatedAnswer.formattedAnswer}`;
    const element = document.createElement('a');
    const blob = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(blob);
    element.download = `Exam_Answer_${marks}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              University Answer Generator
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
              Scoring Rubric AI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Format answers tailored specifically to university grading standards: 2-mark brief definitions, 5-mark structured points, or 10-mark full essays.
          </p>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Mark Type Selector */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
            Select University Question Weightage
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: '2-mark', title: '2-Mark Question', desc: 'Concise definition & key bullet point' },
              { id: '5-mark', title: '5-Mark Question', desc: 'Introduction, 4 key points, block diagram flow' },
              { id: '10-mark', title: '10-Mark Question', desc: 'Comprehensive essay, derivations, trade-offs, code' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMarks(t.id as any)}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                  marks === t.id
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-white shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-extrabold text-xs">{t.title}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Question Prompt Input */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Enter the Exam Question Prompt *
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Explain the Banker's algorithm for deadlock avoidance with resource allocation graph..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Suggested Prompts */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-400">Popular Exam Questions:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(p);
                handleGenerate(p);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition truncate max-w-xs"
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleGenerate()}
          disabled={isLoading || !query.trim()}
          className="w-full py-3 px-6 rounded-2xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-md flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles size={16} />
              <span>Generate Formatted {marks.toUpperCase()} Answer</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Output */}
      {generatedAnswer && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {generatedAnswer.markType.toUpperCase()} Format Answer
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {generatedAnswer.question}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition flex items-center gap-1.5"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={downloadAnswer}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Download .md</span>
              </button>
            </div>
          </div>

          {/* Formatted Markdown Body */}
          <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans space-y-4">
            {generatedAnswer.formattedAnswer}
          </div>
        </div>
      )}
    </div>
  );
};
