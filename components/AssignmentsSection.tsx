'use client';

import React, { useState } from 'react';
import { Assignment } from '@/types';
import {
  BookOpenCheck,
  Plus,
  Search,
  Clock,
  ExternalLink,
  Award,
  Calendar,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AssignmentsSectionProps {
  assignments: Assignment[];
  onAddAssignment: (item: Omit<Assignment, 'id'>) => Promise<void>;
  onUpdateAssignment: (id: string, updates: Partial<Assignment>) => Promise<void>;
  onDeleteAssignment: (id: string) => Promise<void>;
}

export default function AssignmentsSection({
  assignments,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
}: AssignmentsSectionProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Assignment | null>(null);

  const [formData, setFormData] = useState({
    course: '',
    course_title: '',
    title: '',
    description: '',
    assigned_date: new Date().toISOString().split('T')[0],
    deadline: '2026-09-15',
    submission_platform: 'Google Classroom',
    status: 'pending',
    marks: 10,
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      course: '',
      course_title: '',
      title: '',
      description: '',
      assigned_date: new Date().toISOString().split('T')[0],
      deadline: '2026-09-15',
      submission_platform: 'Google Classroom',
      status: 'pending',
      marks: 10,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Assignment) => {
    setEditingItem(item);
    setFormData({
      course: item.course,
      course_title: item.course_title,
      title: item.title,
      description: item.description,
      assigned_date: item.assigned_date,
      deadline: item.deadline,
      submission_platform: item.submission_platform,
      status: item.status,
      marks: item.marks,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await onUpdateAssignment(editingItem.id, formData);
    } else {
      await onAddAssignment(formData);
    }
    setIsModalOpen(false);
  };

  const filtered = assignments.filter((a) => {
    const matchesStatus =
      selectedStatus === 'All' || a.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesSearch =
      a.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.course_title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <BookOpenCheck className="w-5 h-5 text-amber-500" />
            <span>Coursework & Assignment Deadlines</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Keep track of upcoming deadlines, submission portals, marks, and evaluation status.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {['All', 'pending', 'submitted', 'graded', 'late'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                selectedStatus === s
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assignments or courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
            No assignments found matching your filter.
          </div>
        ) : (
          filtered.map((item) => {
            const isPending = item.status === 'pending';
            const isLate = item.status === 'late';
            const isSubmitted = item.status === 'submitted';
            const isGraded = item.status === 'graded';

            return (
              <div
                key={item.id}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                        isPending
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          : isSubmitted
                          ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400 border-sky-200 dark:border-sky-800'
                          : isGraded
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {item.status}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(item)}
                        title="Edit Assignment"
                        className="p-1 rounded-md text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteAssignment(item.id)}
                        title="Delete Assignment"
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="font-extrabold text-xs text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                      {item.course}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.marks} marks
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{item.course_title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Deadline:</span>
                      </span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {item.deadline}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center space-x-1.5">
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                        <span>Platform:</span>
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.submission_platform}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Assignment' : 'Create New Assignment'}
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
                    Marks *
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Compiler Design"
                  value={formData.course_title}
                  onChange={(e) => setFormData({ ...formData, course_title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Lexical Analyzer Implementation"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Task instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deadline Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="pending">pending</option>
                    <option value="submitted">submitted</option>
                    <option value="graded">graded</option>
                    <option value="late">late</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Submission Platform *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Google Classroom, Moodle, Physical"
                  value={formData.submission_platform}
                  onChange={(e) => setFormData({ ...formData, submission_platform: e.target.value })}
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
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20"
                >
                  {editingItem ? 'Save Changes' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
