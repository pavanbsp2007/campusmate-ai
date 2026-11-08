import React, { useEffect, useState } from 'react';
import {
  Layers,
  Sparkles,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  BookOpen,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const FlashcardsPage: React.FC = () => {
  const { refreshProfile } = useAuth();
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [decks, setDecks] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeDeckTitle, setActiveDeckTitle] = useState('Operating Systems Core Concepts');

  // Load existing decks
  const fetchDecks = async () => {
    try {
      const res = await api.get('/ai/flashcards/decks');
      if (res.success && res.data) {
        setDecks(res.data);
        if (res.data.length > 0 && cards.length === 0) {
          loadDeckCards(res.data[0].id, res.data[0].title);
        }
      }
    } catch (e) {
      console.warn('Decks fetch:', e);
    }
  };

  const loadDeckCards = async (deckId: string, title: string) => {
    try {
      const res = await api.get(`/ai/flashcards/decks/${deckId}`);
      if (res.success && res.data) {
        setCards(res.data);
        setActiveDeckTitle(title);
        setCurrentCardIndex(0);
        setIsFlipped(false);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);

    try {
      const res = await api.post('/ai/flashcards', { topic });
      if (res.success && res.data) {
        setCards(res.data.cards || []);
        setActiveDeckTitle(topic);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        fetchDecks();
        await refreshProfile();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to generate flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  const currentCard = cards[currentCardIndex] || {
    question: 'Click "Generate Cards" above or select a deck to begin your flashcard review!',
    answer: 'Flashcards use spaced repetition to help you memorize key concepts, formulas, and viva definitions.',
    difficulty: 'easy'
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      confetti({ particleCount: 70, spread: 60 });
      alert('🎉 You completed reviewing this flashcard deck!');
      setCurrentCardIndex(0);
    }
  };

  const prevCard = () => {
    setIsFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Flashcard Generator
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
              Active Recall
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate digital study flashcards to memorize definitions, key equations, and core algorithms.
          </p>
        </div>
      </div>

      {/* Generation Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
          Enter Topic or Concept to Generate Cards
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="e.g. Computer Networks OSI Layer Protocols & Ports"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Cards</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Flashcard Interactive Viewer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Deck: {activeDeckTitle}
          </span>
          <span>
            Card {cards.length > 0 ? currentCardIndex + 1 : 1} of {Math.max(1, cards.length)}
          </span>
        </div>

        {/* 3D Flip Card Container */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="perspective-1000 cursor-pointer min-h-[320px] sm:min-h-[360px] w-full"
        >
          <div
            className={`w-full h-full min-h-[320px] sm:min-h-[360px] p-8 sm:p-12 rounded-3xl border text-center flex flex-col justify-between transition-all duration-500 transform-style-3d shadow-xl relative ${
              isFlipped
                ? 'bg-gradient-to-br from-indigo-900 to-violet-950 text-white border-indigo-700'
                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800'
            }`}
          >
            {/* Top Indicator */}
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  isFlipped ? 'bg-white/20 text-indigo-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {isFlipped ? 'Answer' : 'Question'}
              </span>

              <span className="text-xs font-semibold opacity-70 flex items-center gap-1">
                <Eye size={14} /> Click to flip
              </span>
            </div>

            {/* Central Content */}
            <div className="my-auto py-6">
              <h2 className="text-lg sm:text-2xl font-bold leading-relaxed max-w-xl mx-auto">
                {isFlipped ? currentCard.answer : currentCard.question}
              </h2>
            </div>

            {/* Bottom Tag */}
            <div className="text-[11px] opacity-60">
              {isFlipped ? 'Press Next Card or rate your recall below' : 'Tap anywhere to reveal definition'}
            </div>
          </div>
        </div>

        {/* Navigation & Recall Rating Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <button
            onClick={prevCard}
            disabled={currentCardIndex === 0}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition flex items-center justify-center gap-1"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          {/* Recall Grading Pills */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">Recall:</span>
            <button
              onClick={nextCard}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-100 transition"
            >
              Hard
            </button>
            <button
              onClick={nextCard}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-100 transition"
            >
              Medium
            </button>
            <button
              onClick={nextCard}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 transition"
            >
              Easy
            </button>
          </div>

          <button
            onClick={nextCard}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition flex items-center justify-center gap-1"
          >
            <span>Next Card</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
