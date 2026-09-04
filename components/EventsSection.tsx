'use client';

import React, { useState } from 'react';
import { Event, Registration } from '@/types';
import {
  PartyPopper,
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Users
} from 'lucide-react';

interface EventsSectionProps {
  events: Event[];
  onAddEvent: (item: Omit<Event, 'id' | 'registered' | 'registrations'>) => Promise<void>;
  onUpdateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  onRegisterEvent: (eventId: string, studentId: string, name: string) => Promise<{ success: boolean; message: string }>;
  onCancelRegistration: (eventId: string, studentId: string) => Promise<{ success: boolean; message: string }>;
}

export default function EventsSection({
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onRegisterEvent,
  onCancelRegistration,
}: EventsSectionProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [registeringTarget, setRegisteringTarget] = useState<Event | null>(null);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Forms
  const [eventFormData, setEventFormData] = useState({
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '15:00',
    end_time: '17:00',
    end_date: new Date().toISOString().split('T')[0],
    venue: '7C01',
    organizer: 'AUST CSE Society',
    capacity: 60,
    status: 'upcoming',
  });

  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');

  const openAddModal = () => {
    setEditingEvent(null);
    setEventFormData({
      name: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      start_time: '15:00',
      end_time: '17:00',
      end_date: new Date().toISOString().split('T')[0],
      venue: '7C01',
      organizer: 'AUST CSE Society',
      capacity: 60,
      status: 'upcoming',
    });
    setIsEventModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setEventFormData({
      name: event.name,
      description: event.description,
      date: event.date,
      start_time: event.start_time,
      end_time: event.end_time,
      end_date: event.end_date || event.date,
      venue: event.venue,
      organizer: event.organizer,
      capacity: event.capacity,
      status: event.status,
    });
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      await onUpdateEvent(editingEvent.id, eventFormData);
    } else {
      await onAddEvent(eventFormData);
    }
    setIsEventModalOpen(false);
  };

  const openRegisterModal = (event: Event) => {
    setRegisteringTarget(event);
    setRegError('');
    setRegSuccess('');
    setStudentId('20-40532');
    setStudentName('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringTarget) return;
    setRegError('');
    setRegSuccess('');

    const res = await onRegisterEvent(registeringTarget.id, studentId, studentName);
    if (!res.success) {
      setRegError(res.message);
    } else {
      setRegSuccess(res.message);
      setTimeout(() => {
        setRegisteringTarget(null);
      }, 1500);
    }
  };

  const filtered = events.filter((e) => {
    const matchesStatus = selectedStatus === 'All' || e.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <PartyPopper className="w-5 h-5 text-purple-500" />
            <span>Campus Events & Guest Lectures</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Discover workshops, seminars, hackathons, and register instantly with seat capacity limits.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Host New Event</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {['All', 'upcoming', 'ongoing', 'full', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                selectedStatus === status
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, organizers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
            No events found matching your filter.
          </div>
        ) : (
          filtered.map((evt) => {
            const pct = Math.min(100, Math.round(((evt.registered || 0) / evt.capacity) * 100));
            const isFull = evt.registered >= evt.capacity || evt.status === 'full';
            const isCancelled = evt.status === 'cancelled';

            return (
              <div
                key={evt.id}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                        isCancelled
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                          : isFull
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          : 'bg-purple-50 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                      }`}
                    >
                      {evt.status}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(evt)}
                        title="Edit Event"
                        className="p-1 rounded-md text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEvent(evt.id)}
                        title="Delete Event"
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {evt.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {evt.description}
                  </p>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-purple-500" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      <span className="font-mono">{evt.start_time} - {evt.end_time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>Room {evt.venue}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px]">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">By:</span>
                      <span className="truncate">{evt.organizer}</span>
                    </div>
                  </div>

                  {/* Capacity Progress */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>Seats Reserved:</span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {evt.registered || 0} / {evt.capacity} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFull ? 'bg-amber-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Registered Students Mini List */}
                  {evt.registrations && evt.registrations.length > 0 && (
                    <div className="mt-3 text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Attendees: </span>
                      <span>
                        {evt.registrations.slice(0, 3).map((r) => r.name).join(', ')}
                        {evt.registrations.length > 3 && ` +${evt.registrations.length - 3} more`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Register Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    disabled={isFull || isCancelled}
                    onClick={() => openRegisterModal(evt)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm ${
                      isFull || isCancelled
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20 active:scale-95'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>
                      {isCancelled ? 'Event Cancelled' : isFull ? 'Event Full' : 'Register Now'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Register Modal */}
      {registeringTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Event Registration
                </h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold line-clamp-1">
                  {registeringTarget.name}
                </p>
              </div>
              <button
                onClick={() => setRegisteringTarget(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {regError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student ID *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 20-40532"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Your Name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRegisteringTarget(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingEvent ? 'Edit Event Details' : 'Host Campus Event'}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEventSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. AI Symposium 2026"
                  value={eventFormData.name}
                  onChange={(e) => setEventFormData({ ...eventFormData, name: e.target.value })}
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
                  placeholder="Brief description..."
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={eventFormData.date}
                    onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value, end_date: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start (24h) *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="15:00"
                    value={eventFormData.start_time}
                    onChange={(e) => setEventFormData({ ...eventFormData, start_time: e.target.value })}
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
                    placeholder="17:00"
                    value={eventFormData.end_time}
                    onChange={(e) => setEventFormData({ ...eventFormData, end_time: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Venue Room *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 7C01"
                    value={eventFormData.venue}
                    onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Capacity *
                  </label>
                  <input
                    required
                    type="number"
                    value={eventFormData.capacity}
                    onChange={(e) => setEventFormData({ ...eventFormData, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status *
                  </label>
                  <select
                    value={eventFormData.status}
                    onChange={(e) => setEventFormData({ ...eventFormData, status: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="upcoming">upcoming</option>
                    <option value="ongoing">ongoing</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Organizer *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. AUST Robotics Club"
                  value={eventFormData.organizer}
                  onChange={(e) => setEventFormData({ ...eventFormData, organizer: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20"
                >
                  {editingEvent ? 'Save Changes' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
