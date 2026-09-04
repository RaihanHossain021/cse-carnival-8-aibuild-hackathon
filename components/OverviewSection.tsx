'use client';

import React from 'react';
import { Schedule, Room, Event, Announcement, Assignment, NavSection } from '@/types';
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
  Bot
} from 'lucide-react';

interface OverviewSectionProps {
  schedules: Schedule[];
  rooms: Room[];
  events: Event[];
  announcements: Announcement[];
  assignments: Assignment[];
  setActiveSection: (s: NavSection) => void;
}

export default function OverviewSection({
  schedules,
  rooms,
  events,
  announcements,
  assignments,
  setActiveSection,
}: OverviewSectionProps) {
  // Stats
  const totalClasses = schedules.length;
  const availableRooms = rooms.filter((r) => r.status === 'available').length;
  const upcomingEvents = events.filter((e) => e.status === 'upcoming').length;
  const highPriorityNotices = announcements.filter((a) => a.priority === 'high');
  const pendingAssignments = assignments.filter((a) => a.status === 'pending');

  // Today's classes (Sunday as sample or day of week)
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const universityDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const displayDay = universityDays.includes(currentDayName) ? currentDayName : 'Sunday';
  const todayClasses = schedules
    .filter((s) => s.day.toLowerCase() === displayDay.toLowerCase())
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-sky-500/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>CampusOS Central Operating Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to Ahsanullah University CampusOS
          </h1>
          <p className="text-sky-100 text-sm leading-relaxed">
            Real-time schedule timetable, room bookings, campus events, urgent notices, and AI assistance — all synchronized live.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setActiveSection('agent')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white text-sky-900 font-bold text-xs hover:bg-sky-50 transition-all shadow-md active:scale-95"
            >
              <Bot className="w-4 h-4 text-sky-600" />
              <span>Ask AI Senior Assistant</span>
            </button>
            <button
              onClick={() => setActiveSection('rooms')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs backdrop-blur-md transition-all border border-white/20"
            >
              <DoorOpen className="w-4 h-4" />
              <span>Check Room Availability</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Classes */}
        <div
          onClick={() => setActiveSection('schedules')}
          className="cursor-pointer group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-sky-400 dark:hover:border-sky-500 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Classes</span>
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {totalClasses}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Weekly scheduled</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Metric 2: Available Rooms */}
        <div
          onClick={() => setActiveSection('rooms')}
          className="cursor-pointer group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-500 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Free Rooms</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <DoorOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {availableRooms} / {rooms.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Classrooms & Labs</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Metric 3: Upcoming Events */}
        <div
          onClick={() => setActiveSection('events')}
          className="cursor-pointer group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-purple-400 dark:hover:border-purple-500 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Events</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <PartyPopper className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {upcomingEvents}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Active & upcoming</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Metric 4: Urgent Notices */}
        <div
          onClick={() => setActiveSection('announcements')}
          className="cursor-pointer group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-rose-400 dark:hover:border-rose-500 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">High Priority</span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
            {highPriorityNotices.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Critical announcements</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Metric 5: Due Assignments */}
        <div
          onClick={() => setActiveSection('assignments')}
          className="col-span-2 lg:col-span-1 cursor-pointer group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-400 dark:hover:border-amber-500 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Deadlines</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <BookOpenCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {pendingAssignments.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Pending submissions</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>
      </div>

      {/* Main Grid: Today's Schedule + Urgent Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule for Current Day */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {displayDay}&apos;s Class Timetable
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {todayClasses.length} sessions
              </span>
            </div>
            <button
              onClick={() => setActiveSection('schedules')}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center space-x-1"
            >
              <span>Full Week Schedule</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {todayClasses.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
                No classes scheduled for {displayDay}. Enjoy your break!
              </div>
            ) : (
              todayClasses.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-300 dark:hover:border-sky-700 transition-all gap-3"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 flex flex-col items-center justify-center text-sky-600 dark:text-sky-400 font-bold shrink-0">
                      <span className="text-xs font-mono">{item.start_time}</span>
                      <span className="text-[9px] text-slate-400 font-normal">to {item.end_time}</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.course}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          Sec {item.section}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Instructor: <span className="text-slate-700 dark:text-slate-300">{item.instructor}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 self-start sm:self-center">
                    <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>Room {item.room}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: High Priority Notices & Deadlines */}
        <div className="space-y-6">
          {/* Urgent Notices */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Urgent Notices</h3>
              </div>
              <button
                onClick={() => setActiveSection('announcements')}
                className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {highPriorityNotices.slice(0, 3).map((notice) => (
                <div
                  key={notice.id}
                  className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400 line-clamp-1">
                      {notice.title}
                    </span>
                    <span className="text-[10px] text-rose-600/80 dark:text-rose-400/70 font-mono shrink-0">
                      {notice.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {notice.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Assignments Due */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpenCheck className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pending Assignments</h3>
              </div>
              <button
                onClick={() => setActiveSection('assignments')}
                className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              {pendingAssignments.slice(0, 3).map((asgn) => (
                <div
                  key={asgn.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
                >
                  <div className="space-y-0.5 max-w-[70%]">
                    <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {asgn.course}: {asgn.title}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>Due {asgn.deadline}</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0">
                    {asgn.marks} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
