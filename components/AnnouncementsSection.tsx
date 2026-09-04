'use client';

import React, { useState } from 'react';
import { Announcement } from '@/types';
import {
  BellRing,
  Plus,
  Search,
  AlertTriangle,
  Calendar,
  User,
  Clock,
  Edit2,
  Trash2,
  X,
  ShieldAlert
} from 'lucide-react';

interface AnnouncementsSectionProps {
  announcements: Announcement[];
  onAddAnnouncement: (item: Omit<Announcement, 'id'>) => Promise<void>;
  onUpdateAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
}

export default function AnnouncementsSection({
  announcements,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
}: AnnouncementsSectionProps) {
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    posted_by: 'Department of CSE',
    expires: '2026-09-30',
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      body: '',
      date: new Date().toISOString().split('T')[0],
      priority: 'medium',
      posted_by: 'Department of CSE',
      expires: '2026-09-30',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Announcement) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      body: item.body,
      date: item.date,
      priority: item.priority,
      posted_by: item.posted_by,
      expires: item.expires,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await onUpdateAnnouncement(editingItem.id, formData);
    } else {
      await onAddAnnouncement(formData);
    }
    setIsModalOpen(false);
  };

  const filtered = announcements.filter((a) => {
    const matchesPriority =
      selectedPriority === 'All' || a.priority.toLowerCase() === selectedPriority.toLowerCase();
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.posted_by.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <BellRing className="w-5 h-5 text-rose-500" />
            <span>Campus Notices & Announcements</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Official department alerts, room shifts, exam updates, and urgent university bulletins.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-1.5">
          {['All', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPriority(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedPriority === p
                  ? p === 'high'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : p === 'medium'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
            No notices found matching your criteria.
          </div>
        ) : (
          filtered.map((item) => {
            const isHigh = item.priority === 'high';
            const isMed = item.priority === 'medium';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isHigh
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-sm hover:border-rose-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          isHigh
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                            : isMed
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Posted: {item.date}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {item.body}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>By: {item.posted_by}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Expires: {item.expires}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 self-end sm:self-start">
                    <button
                      onClick={() => openEditModal(item)}
                      title="Edit Notice"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteAnnouncement(item.id)}
                      title="Delete Notice"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Announcement' : 'Post New Notice'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Headline *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. CSE321 moved to Room 304"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Body *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed announcement..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="high">high</option>
                    <option value="medium">medium</option>
                    <option value="low">low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expires *
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.expires}
                    onChange={(e) => setFormData({ ...formData, expires: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Posted By (Department or Faculty) *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dept of CSE or Dr. Rahman"
                  value={formData.posted_by}
                  onChange={(e) => setFormData({ ...formData, posted_by: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
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
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20"
                >
                  {editingItem ? 'Save Changes' : 'Post Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
