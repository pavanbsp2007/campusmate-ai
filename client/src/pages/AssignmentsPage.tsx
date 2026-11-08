import React, { useEffect, useState } from 'react';
import {
  ClipboardList,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Filter,
  X
} from 'lucide-react';
import { Assignment } from '../types';
import { api } from '../services/api';

export const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [submissionLink, setSubmissionLink] = useState('');

  const fetchAssignments = async () => {
    try {
      let query = `?status=${statusFilter}&priority=${priorityFilter}`;
      const res = await api.get(`/assignments${query}`);
      if (res.success && res.data) {
        setAssignments(res.data);
      }
    } catch (e) {
      console.error('Failed to load assignments:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [statusFilter, priorityFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    try {
      await api.post('/assignments', {
        title,
        description,
        dueDate,
        priority,
        submissionLink
      });

      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      fetchAssignments();
    } catch (err) {
      alert('Failed to create assignment');
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await api.put(`/assignments/${id}/status`, { status: nextStatus });
      fetchAssignments();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      fetchAssignments();
    } catch (e) {
      alert('Failed to delete assignment');
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">Urgent</span>;
      case 'high':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">High</span>;
      case 'medium':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">Medium</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Low</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Assignment Manager
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
              Deadlines & Tracker
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize coursework, track upcoming submission deadlines, and never miss a university deadline.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-2 active:scale-95"
        >
          <Plus size={16} />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Filter size={14} /> Filter:
          </span>
          {['all', 'pending', 'in_progress', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs font-semibold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <ClipboardList size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="font-semibold text-slate-600 dark:text-slate-300">No assignments match your criteria</p>
          <p className="text-xs text-slate-400 mt-1">Add a new assignment or clear your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((item) => {
            const isCompleted = item.status === 'completed';
            const isDueSoon = item.isDueSoon;
            const isOverdue = item.isOverdue;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'border-slate-200 dark:border-slate-800 opacity-70'
                    : isOverdue
                    ? 'border-rose-300 dark:border-rose-900 shadow-sm'
                    : isDueSoon
                    ? 'border-amber-300 dark:border-amber-900 shadow-sm'
                    : 'border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {getPriorityBadge(item.priority)}
                    <div className="text-right">
                      {isOverdue ? (
                        <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <AlertCircle size={12} /> Overdue
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          <Clock size={12} /> {item.daysLeft !== undefined ? `${item.daysLeft}d left` : 'Upcoming'}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className={`font-bold text-base mt-2 ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-3">
                      {item.description}
                    </p>
                  )}

                  {item.subject_name && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <span>{item.subject_name}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-slate-400 text-[11px]">
                    Due: {new Date(item.due_date).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusToggle(item.id, item.status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        isCompleted
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle2 size={14} />
                      <span>{isCompleted ? 'Reopen' : 'Mark Done'}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 transition"
                      title="Delete assignment"
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

      {/* New Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">New Assignment</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B+ Tree Indexing Implementation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Requirements, file formats, submission criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Due Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Submission Portal Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="e.g. Google Classroom / Canvas URL"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
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
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
