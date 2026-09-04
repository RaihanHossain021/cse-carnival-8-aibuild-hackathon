'use client';

import React, { useState } from 'react';
import {
  Schedule,
  Room,
  Event,
  Announcement,
  Assignment,
  NavSection,
  Booking,
  DayOfWeek
} from '@/types';
import {
  Calendar,
  DoorOpen,
  PartyPopper,
  BellRing,
  BookOpenCheck,
  ArrowRight,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Bot,
  Search,
  Users,
  Tv,
  Wind,
  Layers,
  Filter,
  CalendarDays,
  X,
  Check,
  CalendarCheck,
  AlertCircle,
  UserCheck
} from 'lucide-react';

interface OverviewSectionProps {
  schedules: Schedule[];
  rooms: Room[];
  events: Event[];
  announcements: Announcement[];
  assignments: Assignment[];
  setActiveSection: (s: NavSection) => void;
  onBookRoom?: (roomNumber: string, booking: Omit<Booking, 'booking_id'>) => Promise<{ success: boolean; message: string }>;
  onCancelBooking?: (bookingId: string) => Promise<{ success: boolean; message: string }>;
  onRegisterEvent?: (eventId: string, studentId: string, name: string) => Promise<{ success: boolean; message: string }>;
  onCancelRegistration?: (eventId: string, studentId: string) => Promise<{ success: boolean; message: string }>;
  onUpdateAssignment?: (id: string, updates: Partial<Assignment>) => Promise<void>;
}

export default function OverviewSection({
  schedules,
  rooms,
  events,
  announcements,
  assignments,
  setActiveSection,
  onBookRoom,
  onCancelBooking,
  onRegisterEvent,
  onCancelRegistration,
  onUpdateAssignment,
}: OverviewSectionProps) {
  // Universal Search & Filter states
  const [universalSearch, setUniversalSearch] = useState('');
  const [activeModuleTab, setActiveModuleTab] = useState<
    'all' | 'schedules' | 'rooms' | 'events' | 'announcements' | 'assignments'
  >('all');

  // Schedule sub-filter (Days)
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const universityDays: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const defaultDay = universityDays.includes(currentDayName as DayOfWeek)
    ? (currentDayName as DayOfWeek)
    : 'Sunday';
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(defaultDay);

  // Room booking modal state
  const [bookingRoomTarget, setBookingRoomTarget] = useState<Room | null>(null);
  const [bookingFormData, setBookingFormData] = useState({
    booked_by: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '14:00',
    end_time: '16:00',
    purpose: '',
  });
  const [bookingStatus, setBookingStatus] = useState<{ error?: string; success?: string }>({});

  // Event registration modal state
  const [registeringEventTarget, setRegisteringEventTarget] = useState<Event | null>(null);
  const [regStudentId, setRegStudentId] = useState('');
  const [regStudentName, setRegStudentName] = useState('');
  const [regStatus, setRegStatus] = useState<{ error?: string; success?: string }>({});

  // Quick Action feedback
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Metrics
  const totalClasses = schedules.length;
  const availableRooms = rooms.filter((r) => r.status === 'available').length;
  const upcomingEvents = events.filter((e) => e.status === 'upcoming').length;
  const highPriorityNotices = announcements.filter((a) => a.priority === 'high');
  const pendingAssignments = assignments.filter((a) => a.status === 'pending');

  // Search filtering
  const q = universalSearch.toLowerCase().trim();

  const filteredSchedules = schedules.filter((s) => {
    const matchesSearch =
      !q ||
      s.course.toLowerCase().includes(q) ||
      s.title.toLowerCase().includes(q) ||
      s.instructor.toLowerCase().includes(q) ||
      s.room.toLowerCase().includes(q) ||
      s.day.toLowerCase().includes(q);
    const matchesDay = activeModuleTab === 'all' ? s.day.toLowerCase() === selectedDay.toLowerCase() : true;
    return matchesSearch && (activeModuleTab === 'schedules' ? true : matchesDay);
  });

  const filteredRooms = rooms.filter((r) => {
    if (!q) return true;
    return (
      r.room_number.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.equipment.some((eq) => eq.toLowerCase().includes(q)) ||
      r.status.toLowerCase().includes(q)
    );
  });

  const filteredEvents = events.filter((e) => {
    if (!q) return true;
    return (
      e.name.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.organizer.toLowerCase().includes(q)
    );
  });

  const filteredAnnouncements = announcements.filter((a) => {
    if (!q) return true;
    return (
      a.title.toLowerCase().includes(q) ||
      a.body.toLowerCase().includes(q) ||
      a.priority.toLowerCase().includes(q)
    );
  });

  const filteredAssignments = assignments.filter((asgn) => {
    if (!q) return true;
    return (
      asgn.course.toLowerCase().includes(q) ||
      asgn.title.toLowerCase().includes(q) ||
      asgn.description.toLowerCase().includes(q) ||
      asgn.status.toLowerCase().includes(q)
    );
  });

  // Handle Book Room Submit
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRoomTarget || !onBookRoom) return;
    setBookingStatus({});

    if (!bookingFormData.booked_by.trim()) {
      setBookingStatus({ error: 'Please enter your name or student ID.' });
      return;
    }
    if (bookingFormData.start_time >= bookingFormData.end_time) {
      setBookingStatus({ error: 'Start time must be before end time.' });
      return;
    }

    const result = await onBookRoom(bookingRoomTarget.room_number, bookingFormData);
    if (result.success) {
      triggerNotice(`Room ${bookingRoomTarget.room_number} booked successfully!`);
      setBookingRoomTarget(null);
    } else {
      setBookingStatus({ error: result.message });
    }
  };

  // Handle Event Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringEventTarget || !onRegisterEvent) return;
    setRegStatus({});

    if (!regStudentId.trim() || !regStudentName.trim()) {
      setRegStatus({ error: 'Please enter both Student ID and Name.' });
      return;
    }

    const result = await onRegisterEvent(registeringEventTarget.id, regStudentId.trim(), regStudentName.trim());
    if (result.success) {
      triggerNotice(`Registered for '${registeringEventTarget.name}'!`);
      setRegisteringEventTarget(null);
      setRegStudentId('');
      setRegStudentName('');
    } else {
      setRegStatus({ error: result.message });
    }
  };

  // Toggle Assignment Status
  const toggleAssignmentStatus = async (item: Assignment) => {
    if (!onUpdateAssignment) return;
    const nextStatus = item.status === 'pending' ? 'submitted' : 'pending';
    await onUpdateAssignment(item.id, { status: nextStatus });
    triggerNotice(`Assignment status updated to ${nextStatus.toUpperCase()}!`);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-2xl animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Hero Central Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-2xl shadow-sky-500/15">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>CampusOS · Central Operations Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            Campus Information & Live Control Center
          </h1>
          <p className="text-sky-100 text-sm sm:text-base leading-relaxed">
            Real-time schedule timetable, room bookings, campus events, urgent notices, and coursework assignments — all 5 systems synchronized live.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setActiveSection('agent')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-sky-900 font-bold text-xs hover:bg-sky-50 transition-all shadow-lg active:scale-95"
            >
              <Bot className="w-4 h-4 text-sky-600" />
              <span>Ask AI Senior Assistant</span>
            </button>
            <button
              onClick={() => {
                setActiveModuleTab('all');
                const el = document.getElementById('rooms-module');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs backdrop-blur-md transition-all border border-white/20"
            >
              <DoorOpen className="w-4 h-4" />
              <span>Check Rooms & Labs</span>
            </button>
          </div>
        </div>

        {/* Background decorative styling */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Metric 1: Schedules */}
        <div
          onClick={() => setActiveModuleTab(activeModuleTab === 'schedules' ? 'all' : 'schedules')}
          className={`cursor-pointer group p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
            activeModuleTab === 'schedules'
              ? 'border-sky-500 shadow-lg shadow-sky-500/10 ring-2 ring-sky-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-sky-400'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">1. Schedule</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors">
            {totalClasses}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Weekly classes</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Metric 2: Rooms */}
        <div
          onClick={() => setActiveModuleTab(activeModuleTab === 'rooms' ? 'all' : 'rooms')}
          className={`cursor-pointer group p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
            activeModuleTab === 'rooms'
              ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">2. Rooms & Labs</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
              <DoorOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
            {availableRooms} <span className="text-xs text-slate-400 font-normal">/ {rooms.length} free</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Bookings & equipment</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Metric 3: Events */}
        <div
          onClick={() => setActiveModuleTab(activeModuleTab === 'events' ? 'all' : 'events')}
          className={`cursor-pointer group p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
            activeModuleTab === 'events'
              ? 'border-purple-500 shadow-lg shadow-purple-500/10 ring-2 ring-purple-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-purple-400'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">3. Events</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400">
              <PartyPopper className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
            {upcomingEvents}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Registrations open</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Metric 4: Announcements */}
        <div
          onClick={() => setActiveModuleTab(activeModuleTab === 'announcements' ? 'all' : 'announcements')}
          className={`cursor-pointer group p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
            activeModuleTab === 'announcements'
              ? 'border-rose-500 shadow-lg shadow-rose-500/10 ring-2 ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">4. Announcements</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
            {announcements.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{highPriorityNotices.length} urgent notices</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Metric 5: Assignments */}
        <div
          onClick={() => setActiveModuleTab(activeModuleTab === 'assignments' ? 'all' : 'assignments')}
          className={`col-span-2 sm:col-span-1 cursor-pointer group p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
            activeModuleTab === 'assignments'
              ? 'border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">5. Assignments</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
              <BookOpenCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
            {pendingAssignments.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Pending submissions</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>
      </div>

      {/* Universal Search & Module Tab Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Universal Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={universalSearch}
            onChange={(e) => setUniversalSearch(e.target.value)}
            placeholder="Search across all 5 modules (Course, Instructor, Room, Event, Notice, Assignment)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          {universalSearch && (
            <button
              onClick={() => setUniversalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Module Switcher Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: 'All 5 Modules' },
            { id: 'schedules', label: '1. Schedule' },
            { id: 'rooms', label: '2. Room' },
            { id: 'events', label: '3. Event' },
            { id: 'announcements', label: '4. Notice' },
            { id: 'assignments', label: '5. Assignment' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveModuleTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeModuleTab === tab.id
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SCHEDULE: Course, Time, Room, Day, Instructor                          */}
      {/* ========================================================================= */}
      {(activeModuleTab === 'all' || activeModuleTab === 'schedules') && (
        <section id="schedules-module" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Class Schedules</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 font-mono">
                    {filteredSchedules.length} classes
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Course, Time, Room, Day, Instructor — weekly timetable
                </p>
              </div>
            </div>

            {/* Day Selector */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              {universityDays.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    selectedDay === d
                      ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 font-bold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSchedules.length === 0 ? (
              <div className="col-span-full p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
                No classes found for {selectedDay}.
              </div>
            ) : (
              filteredSchedules.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-400 dark:hover:border-sky-600 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {item.course}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium text-slate-600 dark:text-slate-400">
                          Sec {item.section}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 line-clamp-1">
                        {item.title}
                      </p>
                    </div>

                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 font-semibold border border-sky-200 dark:border-sky-800">
                      {item.day}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-500" />
                        <span className="font-mono font-medium">{item.start_time} - {item.end_time}</span>
                      </span>
                      <span className="flex items-center space-x-1 font-semibold text-slate-800 dark:text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>Room {item.room}</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Instructor: <span className="font-medium text-slate-700 dark:text-slate-300">{item.instructor}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-right">
            <button
              onClick={() => setActiveSection('schedules')}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center space-x-1"
            >
              <span>View Full Schedules Management</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. ROOM: Room Number, Capacity, Equipment + Book/Cancel                   */}
      {/* ========================================================================= */}
      {(activeModuleTab === 'all' || activeModuleTab === 'rooms') && (
        <section id="rooms-module" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Classrooms & Labs</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-mono">
                    {filteredRooms.length} rooms
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Room Number, Capacity, Equipment — live bookings and status
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSection('rooms')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center space-x-1 self-start sm:self-auto"
            >
              <span>View All Rooms & Full Management</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.slice(0, activeModuleTab === 'all' ? 6 : filteredRooms.length).map((room) => {
              const isAvailable = room.status === 'available';
              return (
                <div
                  key={room.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-400 dark:hover:border-emerald-600 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    {/* Room Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-lg text-slate-900 dark:text-white">
                            {room.room_number}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {room.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Capacity: <strong className="text-slate-700 dark:text-slate-200">{room.capacity} seats</strong></span>
                        </p>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {isAvailable ? 'Available' : 'Booked'}
                      </span>
                    </div>

                    {/* Equipment Tags */}
                    <div className="mt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Equipment:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {room.equipment.map((eq, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {eq.toLowerCase().includes('projector') && <Tv className="w-3 h-3 text-sky-500" />}
                            {eq.toLowerCase().includes('ac') && <Wind className="w-3 h-3 text-cyan-500" />}
                            <span>{eq}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bookings info & Cancel Booking */}
                    {room.bookings && room.bookings.length > 0 && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
                        <div className="text-[10px] font-bold text-amber-800 dark:text-amber-400 flex items-center justify-between">
                          <span>Active Reservation:</span>
                          <span className="font-mono">{room.bookings[0].date}</span>
                        </div>
                        <div className="text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                          <span>{room.bookings[0].start_time} - {room.bookings[0].end_time}</span>
                          <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                            {room.bookings[0].booked_by}
                          </span>
                        </div>
                        {onCancelBooking && (
                          <button
                            onClick={() => onCancelBooking(room.bookings[0].booking_id)}
                            className="w-full mt-1 py-1 text-[11px] font-semibold rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/80 dark:hover:bg-rose-900 dark:text-rose-300 transition-colors"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Book Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setBookingRoomTarget(room);
                        setBookingStatus({});
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs transition-all shadow-sm"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>Book Room</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. EVENT: Name, Date, Time, Capacity + Register/Cancel                   */}
      {/* ========================================================================= */}
      {(activeModuleTab === 'all' || activeModuleTab === 'events') && (
        <section id="events-module" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400">
                <PartyPopper className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Campus Events</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 font-mono">
                    {filteredEvents.length} events
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Name, Date, Time, Capacity — seminars, hackathons, and registrations
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSection('events')}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center space-x-1 self-start sm:self-auto"
            >
              <span>View Events Management</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((evt) => {
              const fillPercentage = Math.min(100, Math.round((evt.registered / evt.capacity) * 100));
              const isFull = evt.registered >= evt.capacity;

              return (
                <div
                  key={evt.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-400 dark:hover:border-purple-600 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                        {evt.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 shrink-0 capitalize">
                        {evt.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {evt.description}
                    </p>

                    {/* Key Details: Date, Time, Venue */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-purple-500" />
                          <span className="font-medium">{evt.date}</span>
                        </span>
                        <span className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-500" />
                          <span className="font-mono">{evt.start_time} - {evt.end_time}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          <span>Venue: {evt.venue}</span>
                        </span>
                        <span>Org: {evt.organizer}</span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600 dark:text-slate-400">Capacity & Registrations:</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          {evt.registered} / {evt.capacity} seats ({fillPercentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isFull ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                          }`}
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Show Registrations List with Cancel Action */}
                    {evt.registrations && evt.registrations.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Recent Registered Students:
                        </span>
                        <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-xs">
                          {evt.registrations.slice(-3).map((reg, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px]"
                            >
                              <span className="truncate max-w-[140px] font-medium">
                                {reg.name} ({reg.student_id})
                              </span>
                              {onCancelRegistration && (
                                <button
                                  onClick={() => onCancelRegistration(evt.id, reg.student_id)}
                                  className="text-rose-600 hover:text-rose-700 text-[10px] font-semibold underline shrink-0 ml-1"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Register Button */}
                  <div className="pt-2">
                    <button
                      disabled={isFull}
                      onClick={() => {
                        setRegisteringEventTarget(evt);
                        setRegStatus({});
                      }}
                      className={`w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-all shadow-sm ${
                        isFull
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400'
                          : 'bg-purple-600 hover:bg-purple-500 text-white active:scale-98'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{isFull ? 'Event Full' : 'Register for Event'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. ANNOUNCEMENT: Title, Body, Date, Priority                             */}
      {/* ========================================================================= */}
      {(activeModuleTab === 'all' || activeModuleTab === 'announcements') && (
        <section id="announcements-module" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Announcements & Notices</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-mono">
                    {filteredAnnouncements.length} notices
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Title, Body, Date, Priority — urgent notices and campus updates
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSection('announcements')}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center space-x-1 self-start sm:self-auto"
            >
              <span>View All Notices</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnnouncements.map((notice) => {
              const isHigh = notice.priority === 'high';
              const isMed = notice.priority === 'medium';
              return (
                <div
                  key={notice.id}
                  className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between space-y-3 ${
                    isHigh
                      ? 'border-rose-300 dark:border-rose-900/60 shadow-sm shadow-rose-500/5'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                        {notice.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 border ${
                          isHigh
                            ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                            : isMed
                            ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {notice.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {notice.body}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono">{notice.date}</span>
                    <span>By: {notice.posted_by}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. ASSIGNMENT: Course, Title, Deadline, Status                           */}
      {/* ========================================================================= */}
      {(activeModuleTab === 'all' || activeModuleTab === 'assignments') && (
        <section id="assignments-module" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Coursework Assignments</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 font-mono">
                    {filteredAssignments.length} items
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Course, Title, Deadline, Status — academic coursework and submissions
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSection('assignments')}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center space-x-1 self-start sm:self-auto"
            >
              <span>View All Assignments</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.map((asgn) => {
              const isSubmitted = asgn.status === 'submitted' || asgn.status === 'graded';
              return (
                <div
                  key={asgn.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-400 dark:hover:border-amber-600 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400">
                          {asgn.course}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                          {asgn.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                        {asgn.marks} pts
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {asgn.description}
                    </p>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Due: <strong className="text-slate-800 dark:text-slate-200">{asgn.deadline}</strong></span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Platform: {asgn.submission_platform}
                      </span>
                    </div>
                  </div>

                  {/* Status Toggle Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                        isSubmitted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                      }`}
                    >
                      Status: {asgn.status}
                    </span>

                    {onUpdateAssignment && (
                      <button
                        onClick={() => toggleAssignmentStatus(asgn)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {asgn.status === 'pending' ? 'Mark Submitted ✓' : 'Mark Pending'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BOOK ROOM                                                          */}
      {/* ========================================================================= */}
      {bookingRoomTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <CalendarCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Book Room — Room {bookingRoomTarget.room_number}
                </h3>
              </div>
              <button
                onClick={() => setBookingRoomTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingStatus.error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bookingStatus.error}</span>
              </div>
            )}

            <form onSubmit={handleBookSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Booked By (Name or Student ID):
                </label>
                <input
                  type="text"
                  required
                  value={bookingFormData.booked_by}
                  onChange={(e) =>
                    setBookingFormData({ ...bookingFormData, booked_by: e.target.value })
                  }
                  placeholder="e.g. Raihan Hossain (21.01.04.021)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Date:
                </label>
                <input
                  type="date"
                  required
                  value={bookingFormData.date}
                  onChange={(e) =>
                    setBookingFormData({ ...bookingFormData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Time:
                  </label>
                  <input
                    type="time"
                    required
                    value={bookingFormData.start_time}
                    onChange={(e) =>
                      setBookingFormData({ ...bookingFormData, start_time: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    End Time:
                  </label>
                  <input
                    type="time"
                    required
                    value={bookingFormData.end_time}
                    onChange={(e) =>
                      setBookingFormData({ ...bookingFormData, end_time: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Purpose:
                </label>
                <input
                  type="text"
                  required
                  value={bookingFormData.purpose}
                  onChange={(e) =>
                    setBookingFormData({ ...bookingFormData, purpose: e.target.value })
                  }
                  placeholder="e.g. Project presentation & mentor meeting"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setBookingRoomTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTER EVENT                                                     */}
      {/* ========================================================================= */}
      {registeringEventTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Event Registration — {registeringEventTarget.name}
                </h3>
              </div>
              <button
                onClick={() => setRegisteringEventTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {regStatus.error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regStatus.error}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Student ID:
                </label>
                <input
                  type="text"
                  required
                  value={regStudentId}
                  onChange={(e) => setRegStudentId(e.target.value)}
                  placeholder="e.g. 21.01.04.021"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name:
                </label>
                <input
                  type="text"
                  required
                  value={regStudentName}
                  onChange={(e) => setRegStudentName(e.target.value)}
                  placeholder="e.g. Raihan Hossain"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 text-[11px] text-purple-900 dark:text-purple-300 space-y-1">
                <div>Venue: <strong>{registeringEventTarget.venue}</strong></div>
                <div>Date & Time: <strong>{registeringEventTarget.date} ({registeringEventTarget.start_time} - {registeringEventTarget.end_time})</strong></div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRegisteringEventTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/20"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
