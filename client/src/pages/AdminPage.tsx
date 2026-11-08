import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Users,
  Award,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (e: any) {
      alert(e.message || 'Access denied or error loading admin stats');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      // Allow testing but alert
    }
    fetchAdminStats();
  }, [user]);

  const handleModerateResource = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/admin/resource/${id}/status`, { status });
      alert(`Resource ${status === 'approved' ? 'approved' : 'rejected and removed'}!`);
      fetchAdminStats();
    } catch (e) {
      alert('Failed to update resource');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to remove this user account?')) return;
    try {
      await api.delete(`/admin/user/${id}`);
      fetchAdminStats();
    } catch (e) {
      alert('Failed to remove user');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading Admin Control Center...
      </div>
    );
  }

  const sub = stats?.subscriptionDistribution || { free: 0, plus: 0, pro: 0 };
  const resCounts = stats?.resources || { approved: 0, pending: 0, flagged: 0 };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="text-rose-600" />
              <span>CampusMate AI Admin Portal</span>
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
              Platform Oversight
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage registered students, track freemium tier subscriptions, and moderate shared peer learning resources.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Registered Students</span>
            <Users size={18} className="text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {stats?.totalStudents || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-500" />
            <span className="text-emerald-500 font-bold">{stats?.activeToday || 0}</span> active sessions today
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pro Subscribers</span>
            <Award size={18} className="text-violet-600" />
          </div>
          <div className="text-3xl font-black text-violet-600 dark:text-violet-400 mt-2">
            {sub.pro} <span className="text-xs font-normal text-slate-400">Students</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Plus: {sub.plus} | Free: {sub.free}</div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Shared Resources</span>
            <Share2 size={18} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {resCounts.approved}
          </div>
          <div className="text-xs text-slate-500 mt-1">Published across all engineering branches</div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Flagged for Review</span>
            <AlertTriangle size={18} className="text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-600 mt-2">
            {stats?.reportedResources?.length || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Requires moderator clearance</div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <span>Content Moderation Queue</span>
          </h3>
          <span className="text-xs text-slate-400">
            {stats?.reportedResources?.length || 0} items pending review
          </span>
        </div>

        {(!stats?.reportedResources || stats.reportedResources.length === 0) ? (
          <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
            🎉 All resource submissions and reports are resolved!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.reportedResources.map((res: any) => (
              <div
                key={res.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {res.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      {res.reports_count} Report(s)
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Subject: {res.subject_name} • Author: {res.author_name || 'Student'} • Category: {res.category}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={res.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ExternalLink size={12} />
                  </a>
                  <button
                    onClick={() => handleModerateResource(res.id, 'approved')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 transition flex items-center gap-1"
                  >
                    <Check size={14} />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleModerateResource(res.id, 'rejected')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 transition flex items-center gap-1"
                  >
                    <X size={14} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Management Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Users size={18} className="text-indigo-600" />
          <span>Recently Registered Students</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3">Student Name</th>
                <th className="py-3">Email Address</th>
                <th className="py-3">College & Course</th>
                <th className="py-3">Plan Tier</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {stats?.recentStudents?.map((stu: any) => (
                <tr key={stu.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">
                    {stu.full_name || 'Student'}
                  </td>
                  <td className="py-3">{stu.email}</td>
                  <td className="py-3">
                    {stu.college_name || 'Engineering College'} ({stu.course || 'CS'})
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        stu.plan_tier === 'pro'
                          ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                          : stu.plan_tier === 'plus'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {stu.plan_tier || 'FREE'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDeleteUser(stu.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 transition"
                      title="Remove Account"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
