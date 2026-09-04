'use client';

import React, { useState } from 'react';
import { Schedule, DayOfWeek } from '@/types';
import {
  Calendar,
  Plus,
  Search,
  Clock,
  MapPin,
  User,
  Edit2,
  Trash2,
  Filter,
  X,
  Check
} from 'lucide-react';

interface SchedulesSectionProps {
  schedules: Schedule[];
  onAddSchedule: (item: Omit<Schedule, 'id'>) => Promise<void>;
  onUpdateSchedule: (id: string, updates: Partial<Schedule>) => Promise<void>;
  onDeleteSchedule: (id: string) => Promise<void>;
}

const DAYS: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

export default function SchedulesSection({
  schedules,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
}: SchedulesSectionProps) {
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Schedule | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    course: '',
    title: '',
    day: 'Sunday',
    start_time: '08:00',
    end_time: '09:20',
    room: '7A01',
    instructor: '',
    section: 'A',
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      course: '',
      title: '',
      day: selectedDay !== 'All' ? selectedDay : 'Sunday',
      start_time: '08:00',
      end_time: '09:20',
      room: '7A01',
      instructor: '',
      section: 'A',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Schedule) => {
    setEditingItem(item);
    setFormData({
      course: item.course,
      title: item.title,
      day: item.day,
      start_time: item.start_time,
      end_time: item.end_time,
      room: item.room,
      instructor: item.instructor,
      section: item.section,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await onUpdateSchedule(editingItem.id, formData);
    } else {
      await onAddSchedule(formData);
    }
    setIsModalOpen(false);
  };

  const filtered = schedules.filter((s) => {
    const matchesDay = selectedDay === 'All' || s.day.toLowerCase() === selectedDay.toLowerCase();
    const matchesSearch =
      s.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.room.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDay && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-sky-500" />
            <span>Class Timetable & Schedules</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage course lectures, laboratory sessions, assigned rooms, and faculty schedules.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Class</span>
        </button>
      </div>

      {/* Day Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Day Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {['All', ...DAYS].map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search course, teacher, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Schedules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
            No classes found matching your criteria.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="group relative p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-sky-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                    {item.day}
                  </span>
                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(item)}
                      title="Edit Class"
                      className="p-1 rounded-md text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSchedule(item.id)}
                      title="Delete Class"
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline space-x-2">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {item.course}
                  </h3>
                  <span className="text-xs text-slate-500">Section {item.section}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1 font-medium">
                  {item.title}
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    <span className="font-mono">{item.start_time} – {item.end_time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Room {item.room}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="truncate">{item.instructor || 'TBA'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Class Schedule' : 'Add New Class Schedule'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Code *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. CSE 4113"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Section *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. A or B1"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Course Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Compiler Design"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Day *
                  </label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start (24h) *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="08:00"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End (24h) *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="09:20"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Room Number *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 7A03"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Instructor *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Faculty name or TBA"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md shadow-sky-500/20"
                >
                  {editingItem ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
