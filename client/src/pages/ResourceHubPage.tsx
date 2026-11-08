import React, { useEffect, useState } from 'react';
import {
  Share2,
  Plus,
  Search,
  ThumbsUp,
  Flag,
  Download,
  FileText,
  Code,
  BookOpen,
  Filter,
  Check,
  X
} from 'lucide-react';
import { SharedResource } from '../types';
import { api } from '../services/api';

export const ResourceHubPage: React.FC = () => {
  const [resources, setResources] = useState<SharedResource[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Upload Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [category, setCategory] = useState<'notes' | 'pyq' | 'lab_code' | 'cheat_sheet'>('notes');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState('2.4 MB');

  // Report Modal
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Incorrect or misleading information');

  const fetchResources = async () => {
    try {
      const res = await api.get(`/resources?category=${categoryFilter}&search=${encodeURIComponent(search)}`);
      if (res.success && res.data) {
        setResources(res.data);
      }
    } catch (e) {
      console.error('Failed to load resources:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [categoryFilter, search]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subjectName) return;

    try {
      const res = await api.post('/resources', {
        title,
        subjectName,
        category,
        description,
        fileUrl: fileUrl || 'https://example.com/materials/sample.pdf',
        fileSize
      });

      alert(res.message || 'Resource published!');
      setIsModalOpen(false);
      setTitle('');
      setSubjectName('');
      setDescription('');
      fetchResources();
    } catch (e) {
      alert('Failed to share resource');
    }
  };

  const handleUpvote = async (id: string) => {
    try {
      await api.post(`/resources/${id}/upvote`);
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
      );
    } catch (e) {
      // ignore
    }
  };

  const handleReport = async () => {
    if (!reportingId) return;
    try {
      await api.post(`/resources/${reportingId}/report`, { reason: reportReason });
      alert('Report submitted for moderator review.');
      setReportingId(null);
      fetchResources();
    } catch (e) {
      alert('Failed to submit report');
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'pyq':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
            <BookOpen size={12} /> Previous Year Paper
          </span>
        );
      case 'lab_code':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 flex items-center gap-1">
            <Code size={12} /> Lab Programs
          </span>
        );
      case 'cheat_sheet':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 flex items-center gap-1">
            <FileText size={12} /> Cheat Sheet
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center gap-1">
            <FileText size={12} /> Revision Notes
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Student Resource Hub
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
              Peer-to-Peer
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and share previous-year question papers (PYQs), verified handwritten notes, and solved lab codes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-2 active:scale-95"
        >
          <Plus size={16} />
          <span>Share Resource</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by topic, paper year, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'pyq', label: 'PYQ Papers' },
            { id: 'notes', label: 'Notes' },
            { id: 'lab_code', label: 'Lab Codes' },
            { id: 'cheat_sheet', label: 'Cheat Sheets' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                categoryFilter === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading verified campus resources...</div>
      ) : resources.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <BookOpen size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="font-semibold text-slate-600 dark:text-slate-300">No resources found</p>
          <p className="text-xs text-slate-400 mt-1">Be the first to share notes or exam papers!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <div
              key={res.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  {getCategoryBadge(res.category)}
                  <span className="text-[10px] text-slate-400 font-medium">
                    {res.file_size || '2.0 MB'}
                  </span>
                </div>

                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block mt-1">
                  {res.subject_name}
                </span>

                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                  {res.title}
                </h3>

                {res.description && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3">
                    {res.description}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Uploaded by: <strong className="text-slate-600 dark:text-slate-300">{res.author_name || 'Senior Student'}</strong></span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpvote(res.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ThumbsUp size={14} className="text-indigo-600" />
                    <span>{res.upvotes}</span>
                  </button>

                  <button
                    onClick={() => setReportingId(res.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition"
                    title="Report resource"
                  >
                    <Flag size={14} />
                  </button>
                </div>

                <a
                  href={res.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-1.5 transition active:scale-95"
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Share Campus Resource</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems 2025 Mid-Term Solutions"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Resource Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="pyq">PYQ Question Paper</option>
                    <option value="notes">Lecture Notes</option>
                    <option value="lab_code">Lab Code Programs</option>
                    <option value="cheat_sheet">Formula Cheat Sheet</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    File Size Estimate
                  </label>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description & Key Topics Covered
                </label>
                <textarea
                  rows={3}
                  placeholder="Includes handwritten step-by-step answers for semaphore and virtual memory numericals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Direct File Link / Cloud Storage URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or leave blank for demo"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md"
                >
                  Publish Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Report Content</h3>
            <p className="text-xs text-slate-500 mb-4">Please specify why this resource violates community standards:</p>

            <div className="space-y-2 mb-4">
              {[
                'Incorrect or misleading information',
                'Copyright infringement / unauthorized material',
                'Broken file or dead link',
                'Spam or inappropriate language'
              ].map((reason) => (
                <label key={reason} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="reportReason"
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                    className="text-indigo-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setReportingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
