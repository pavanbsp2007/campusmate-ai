import React, { useEffect, useState } from 'react';
import {
  Folder,
  Plus,
  Search,
  Star,
  Download,
  Trash2,
  Edit,
  Tag,
  BookOpen,
  X,
  FileText
} from 'lucide-react';
import { NoteItem, Subject } from '../types';
import { api } from '../services/api';

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Viewing note in read modal
  const [viewingNote, setViewingNote] = useState<NoteItem | null>(null);

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/notes?subjectId=${selectedSubject}&search=${encodeURIComponent(search)}`);
      if (res.success && res.data) {
        setNotes(res.data);
      }
      const subRes = await api.get('/attendance');
      if (subRes.success && subRes.data) {
        setSubjects(subRes.data.subjects || []);
      }
    } catch (e) {
      console.error('Failed to load notes:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedSubject, search]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      if (editingId) {
        await api.put(`/notes/${editingId}`, {
          title,
          subjectId: subjectId || null,
          content,
          tags,
          isFavorite
        });
      } else {
        await api.post('/notes', {
          title,
          subjectId: subjectId || null,
          content,
          tags,
          isFavorite
        });
      }

      setIsModalOpen(false);
      setEditingId(null);
      setTitle('');
      setContent('');
      setTags('');
      fetchNotes();
    } catch (e) {
      alert('Failed to save note');
    }
  };

  const handleToggleFavorite = async (note: NoteItem) => {
    try {
      await api.put(`/notes/${note.id}`, { isFavorite: !note.is_favorite });
      fetchNotes();
    } catch (e) {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      fetchNotes();
      if (viewingNote?.id === id) setViewingNote(null);
    } catch (e) {
      alert('Failed to delete note');
    }
  };

  const downloadNote = (note: NoteItem) => {
    const element = document.createElement('a');
    const file = new Blob([`# ${note.title}\n\nSubject: ${note.subject_name || 'General'}\nTags: ${note.tags || ''}\n\n---\n\n${note.content}`], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Notes & Documents
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
              Markdown Editor
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize revision notes, lab code references, and class lecture transcripts by subject.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setTitle('');
            setContent('');
            setTags('');
            setIsFavorite(false);
            setIsModalOpen(true);
          }}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-2 active:scale-95"
        >
          <Plus size={16} />
          <span>New Note</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes by keyword, title, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
          />
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full sm:w-auto text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <FileText size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="font-semibold text-slate-600 dark:text-slate-300">No notes found</p>
          <p className="text-xs text-slate-400 mt-1">Create your first markdown revision note!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 truncate max-w-[180px]">
                    {note.subject_name || 'General Note'}
                  </span>

                  <button
                    onClick={() => handleToggleFavorite(note)}
                    className="p-1 text-slate-300 hover:text-amber-400 transition"
                  >
                    <Star
                      size={16}
                      className={note.is_favorite ? 'fill-amber-400 text-amber-400' : ''}
                    />
                  </button>
                </div>

                <h3
                  onClick={() => setViewingNote(note)}
                  className="font-bold text-base text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 transition"
                >
                  {note.title}
                </h3>

                <p
                  onClick={() => setViewingNote(note)}
                  className="text-xs text-slate-500 mt-2 line-clamp-4 cursor-pointer whitespace-pre-line"
                >
                  {note.content}
                </p>

                {note.tags && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {note.tags.split(',').map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {new Date(note.updated_at).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => downloadNote(note)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition"
                    title="Download as Markdown"
                  >
                    <Download size={15} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(note.id);
                      setTitle(note.title);
                      setSubjectId(note.subject_id || '');
                      setContent(note.content);
                      setTags(note.tags || '');
                      setIsFavorite(Boolean(note.is_favorite));
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition"
                    title="Edit Note"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition"
                    title="Delete Note"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Note Modal */}
      {viewingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {viewingNote.subject_name || 'General Notes'}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {viewingNote.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadNote(viewingNote)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 flex items-center gap-1"
                >
                  <Download size={14} /> Download .md
                </button>
                <button
                  onClick={() => setViewingNote(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {viewingNote.content}
            </div>

            {viewingNote.tags && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
                <Tag size={14} />
                <span>Tags: {viewingNote.tags}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit/Create Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingId ? 'Edit Note' : 'Create New Note'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Normalization 1NF to BCNF Summary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">General (No Subject)</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. sql, dbms, viva"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Markdown Content *
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Write in Markdown: headings (#), lists, code blocks..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Mark as favorite</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
