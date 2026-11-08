import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  Code,
  Copy,
  Check,
  RotateCcw,
  GraduationCap,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AiTutorPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<'Beginner' | 'Undergraduate' | 'Exam-Oriented' | 'Expert'>('Undergraduate');
  const [subject, setSubject] = useState('Computer Science');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([
    {
      sender: 'ai',
      text: `Hello ${user?.fullName || 'there'}! 👋 I am your **CampusMate AI Academic Tutor**.\n\nAsk me any concept, theorem, algorithm, or ask for step-by-step code demonstrations. You can also customize your explanation level above!`,
      level: 'Undergraduate',
      time: 'Just now'
    }
  ]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const samplePrompts = [
    'Explain B+ Tree indexing with step-by-step insertion',
    'Difference between Process and Thread with memory diagram',
    'Explain Dijkstra algorithm with Python code',
    'What is ACID property in database management systems?'
  ];

  const handleAsk = async (textToAsk?: string) => {
    const q = textToAsk || query;
    if (!q.trim() || isLoading) return;

    const userMsg = {
      sender: 'user',
      text: q,
      level,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/tutor', { query: q, level, subject });
      if (res.success && res.data) {
        const aiMsg = {
          sender: 'ai',
          text: typeof res.data === 'string' ? res.data : res.data.answer || JSON.stringify(res.data),
          engine: res.engine || 'CampusMate AI',
          level,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory((prev) => [...prev, aiMsg]);
        await refreshProfile();
      }
    } catch (err: any) {
      const errorMsg = {
        sender: 'ai',
        text: `⚠️ ${err.message || 'Error communicating with AI engine.'}`,
        isError: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Bot size={28} className="text-indigo-600" />
              <span>AI Academic Tutor</span>
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300">
              Interactive
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step academic breakdowns, programming examples, and exam pointers.
          </p>
        </div>

        {/* Level Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Depth:</span>
          {(['Beginner', 'Undergraduate', 'Exam-Oriented', 'Expert'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                level === lvl
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-shrink-0 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
          <Sparkles size={12} className="text-amber-500" /> Suggested:
        </span>
        {samplePrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleAsk(p)}
            className="flex-shrink-0 px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Box */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {chatHistory.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
                  isUser
                    ? 'bg-slate-700 dark:bg-slate-600'
                    : 'bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20'
                }`}
              >
                {isUser ? 'You' : <Bot size={16} />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between gap-4 pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-700/60 text-[11px] font-semibold text-slate-400">
                    <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                      <GraduationCap size={14} /> Level: {msg.level || level}
                    </span>
                    <button
                      onClick={() => copyToClipboard(msg.text, index)}
                      className="hover:text-indigo-600 flex items-center gap-1 text-[11px]"
                    >
                      {copiedIndex === index ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      <span>{copiedIndex === index ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                <div className="text-[10px] text-right mt-2 opacity-60">
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-500">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>CampusMate AI is synthesizing explanation...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-md flex-shrink-0"
      >
        <input
          type="text"
          placeholder="Ask any concept or enter a university syllabus question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 disabled:opacity-50 transition active:scale-95"
          aria-label="Send query"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
