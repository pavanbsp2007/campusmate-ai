import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  User,
  Trash2,
  Calendar,
  Grid,
  List,
  X
} from 'lucide-react';
import { TimetableSlot, Subject } from '../types';
import { api } from '../services/api';

export const TimetablePage: React.FC = () => {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [weekly, setWeekly] = useState<Record<string, TimetableSlot[]>>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [roomNumber, setRoomNumber] = useState('');
  const [building, setBuilding] = useState('');
  const [instructor, setInstructor] = useState('');

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchTimetable = async () => {
    try {
      const res = await api.get('/timetable');
      if (res.success && res.data) {
        setSlots(res.data.raw || []);
        setWeekly(res.data.weekly || {});
      }
      const subRes = await api.get('/attendance');
      if (subRes.success && subRes.data) {
        setSubjects(subRes.data.subjects || []);
        if (subRes.data.subjects.length > 0 && !subjectId) {
          setSubjectId(subRes.data.subjects[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load timetable:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;

    try {
      await api.post('/timetable', {
        subjectId,
        dayOfWeek,
        startTime,
        endTime,
        roomNumber,
        building,
        instructor
      });

      setIsModalOpen(false);
      fetchTimetable();
    } catch (e) {
      alert('Failed to add class slot');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/timetable/${id}`);
      fetchTimetable();
    } catch (e) {
      alert('Failed to delete slot');
    }
  };

  const dailyClasses = weekly[selectedDay] || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Timetable & Schedule
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300">
              Weekly Routine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Keep track of class locations, faculty, and weekly lecture schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('daily')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'daily'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List size={14} />
              <span>Day View</span>
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'weekly'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Grid size={14} />
              <span>Week Matrix</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-2 active:scale-95"
          >
            <Plus size={16} />
            <span>Add Class Slot</span>
          </button>
        </div>
      </div>

      {/* Daily View Mode */}
      {viewMode === 'daily' && (
        <div className="space-y-6">
          {/* Day Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {DAYS.map((d) => {
              const count = weekly[d]?.length || 0;
              const isSelected = selectedDay === d;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span>{d}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Classes for selected day */}
          {dailyClasses.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <CalendarDays size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No classes scheduled on {selectedDay}</p>
              <p className="text-xs text-slate-400 mt-1">Enjoy a lecture-free day or schedule revision time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dailyClasses.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-3 h-14 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.subject_color || '#6366f1' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {item.subject_name}
                        </h3>
                        {item.subject_code && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {item.subject_code}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-indigo-500" />
                          {item.room_number ? `${item.room_number} (${item.building || 'Campus'})` : 'Hall TBA'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User size={14} className="text-violet-500" />
                          {item.instructor || item.professor || 'Course Instructor'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 sm:justify-end">
                        <Clock size={14} className="text-indigo-600" />
                        <span>{item.start_time} - {item.end_time}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">60 Minutes Session</span>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition"
                      title="Remove Slot"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Weekly Matrix Mode */}
      {viewMode === 'weekly' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto">
          <div className="grid grid-cols-6 gap-3 min-w-[850px]">
            {DAYS.map((d) => (
              <div key={d} className="space-y-3">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center font-bold text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                  {d}
                </div>

                <div className="space-y-2">
                  {(weekly[d] || []).length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-slate-400 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      Free day
                    </div>
                  ) : (
                    weekly[d].map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-sm text-xs space-y-1 relative group"
                        style={{ borderLeftWidth: 4, borderLeftColor: slot.subject_color || '#6366f1' }}
                      >
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {slot.subject_name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={11} /> {slot.start_time} - {slot.end_time}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {slot.room_number || 'Room TBA'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Class Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add Class Slot</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject *
                </label>
                <select
                  required
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code || 'Course'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Day of Week *
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Room / Lab Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LH-201"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Building / Block
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tech Block A"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
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
                  Save Class Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
