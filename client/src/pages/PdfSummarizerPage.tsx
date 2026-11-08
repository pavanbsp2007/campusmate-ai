import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Download,
  BookOpen,
  CheckCircle2,
  FileCode,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const PdfSummarizerPage: React.FC = () => {
  const { refreshProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [topic, setTopic] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSummarize = async () => {
    if (!file && !topic.trim() && !pastedText.trim()) {
      alert('Please select a PDF document or enter text/topic to summarize.');
      return;
    }

    setIsLoading(true);
    setSummaryData(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('topic', topic || (file ? file.name : 'Uploaded Document'));
      if (pastedText) {
        formData.append('text', pastedText);
      }

      const res = await api.post('/ai/summarize', formData);
      if (res.success && res.data) {
        setSummaryData(res.data);
        await refreshProfile();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to summarize document');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadNotes = () => {
    if (!summaryData) return;
    const content = `# ${summaryData.title || 'Revision Notes'}\n\n## Executive Summary\n${summaryData.executiveSummary || ''}\n\n## Chapter-Wise Breakdown\n${(summaryData.chapters || []).map((c: any) => `### ${c.chapter}\n${(c.points || []).map((p: string) => `- ${p}`).join('\n')}`).join('\n\n')}\n\n## Key Exam Takeaways\n${(summaryData.keyTakeaways || []).map((k: string) => `* ${k}`).join('\n')}`;

    const element = document.createElement('a');
    const blob = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(blob);
    element.download = `${(topic || 'Summary').replace(/[^a-zA-Z0-9]/g, '_')}_Revision_Notes.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyNotes = () => {
    if (!summaryData) return;
    const content = `${summaryData.title}\n\n${summaryData.executiveSummary}\n\n${(summaryData.chapters || []).map((c: any) => `${c.chapter}:\n${(c.points || []).join('\n')}`).join('\n\n')}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              PDF Document Summarizer
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300">
              AI Powered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload course PDFs, research papers, or syllabus notes to extract chapter-wise summaries and high-yield revision notes.
          </p>
        </div>
      </div>

      {/* Upload & Input Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF File Drag & Drop Dropzone */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              Method 1: Upload PDF File
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select or drop a lecture slide deck, textbook chapter, or assignment PDF.
            </p>

            <label className="border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition text-center group">
              <input
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform mb-3">
                <Upload size={24} />
              </div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                {file ? file.name : 'Click to browse or drop PDF here'}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Supports PDF documents up to 25MB'}
              </span>
            </label>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Topic or Module Title
            </label>
            <input
              type="text"
              placeholder="e.g. Relational Calculus & Query Optimization"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Text Paste Option */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              Method 2: Paste Raw Syllabus Text
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Paste textbook paragraphs, research excerpts, or handwritten notes.
            </p>

            <textarea
              rows={7}
              placeholder="Paste article, textbook chapter, or lecture transcript text here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-sans"
            />
          </div>

          <button
            onClick={handleSummarize}
            disabled={isLoading || (!file && !topic.trim() && !pastedText.trim())}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 transition active:scale-[0.99]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Chapter-Wise Summary & Notes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Summary Output */}
      {summaryData && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                AI Structured Summary
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {summaryData.title || topic || 'Document Summary'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyNotes}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition flex items-center gap-1.5"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={downloadNotes}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition flex items-center gap-1.5 active:scale-95"
              >
                <Download size={14} />
                <span>Export Markdown (.md)</span>
              </button>
            </div>
          </div>

          {/* Executive Summary */}
          {summaryData.executiveSummary && (
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                Executive Overview
              </h4>
              <p>{summaryData.executiveSummary}</p>
            </div>
          )}

          {/* Chapter-Wise Sections */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-600" />
              <span>Chapter-Wise Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {summaryData.chapters?.map((chap: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2.5"
                >
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {chap.chapter}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {chap.points?.map((pt: string, pIdx: number) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Key Exam Takeaways */}
          {summaryData.keyTakeaways && (
            <div className="p-5 rounded-2xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>Exam High-Yield Takeaways</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {summaryData.keyTakeaways.map((takeaway: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-violet-600">•</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
