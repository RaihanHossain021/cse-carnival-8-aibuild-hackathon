'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import OverviewSection from '@/components/OverviewSection';
import SchedulesSection from '@/components/SchedulesSection';
import RoomsSection from '@/components/RoomsSection';
import EventsSection from '@/components/EventsSection';
import AnnouncementsSection from '@/components/AnnouncementsSection';
import AssignmentsSection from '@/components/AssignmentsSection';
import AgentSection from '@/components/AgentSection';
import {
  Schedule,
  Room,
  Event,
  Announcement,
  Assignment,
  NavSection,
  Booking
} from '@/types';
import { Bot, Check, AlertCircle } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface CampusDashboardProps {
  initialSchedules: Schedule[];
  initialRooms: Room[];
  initialEvents: Event[];
  initialAnnouncements: Announcement[];
  initialAssignments: Assignment[];
}

export default function CampusDashboard({
  initialSchedules,
  initialRooms,
  initialEvents,
  initialAnnouncements,
  initialAssignments,
}: CampusDashboardProps) {
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 5 Datasets state initialized with SSR data
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Re-fetch all 5 datasets from backend when needed
  const fetchAllData = useCallback(async () => {
    try {
      const [schRes, rmRes, evRes, anRes, asRes] = await Promise.all([
        fetch('/api/schedules'),
        fetch('/api/rooms'),
        fetch('/api/events'),
        fetch('/api/announcements'),
        fetch('/api/assignments'),
      ]);

      if (schRes.ok) setSchedules(await schRes.json());
      if (rmRes.ok) setRooms(await rmRes.json());
      if (evRes.ok) setEvents(await evRes.json());
      if (anRes.ok) setAnnouncements(await anRes.json());
      if (asRes.ok) setAssignments(await asRes.json());
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel('campus-records-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, fetchAllData)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchAllData]);

  // Reset database back to default seed data
  const handleResetData = async () => {
    if (!window.confirm('Reset all databases back to initial seed data? Any custom records will be reverted.')) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        await fetchAllData();
        showToast('Database successfully restored to original seed data!');
      } else {
        showToast('Failed to reset database', 'error');
      }
    } catch (err) {
      showToast('Error resetting database', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // --- SCHEDULES CRUD ---
  const handleAddSchedule = async (item: Omit<Schedule, 'id'>) => {
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const created = await res.json();
      setSchedules((prev) => [...prev, created]);
      showToast(`Class ${created.course} added to schedule!`);
    }
  };

  const handleUpdateSchedule = async (id: string, updates: Partial<Schedule>) => {
    const res = await fetch(`/api/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)));
      showToast(`Class schedule updated!`);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this class schedule?')) return;
    const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      showToast('Class removed from schedule.');
    }
  };

  // --- ROOMS CRUD & BOOKINGS ---
  const handleAddRoom = async (item: Omit<Room, 'id' | 'bookings'>) => {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const created = await res.json();
      setRooms((prev) => [...prev, created]);
      showToast(`Room ${created.room_number} added!`);
    }
  };

  const handleUpdateRoom = async (id: string, updates: Partial<Room>) => {
    const res = await fetch(`/api/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      setRooms((prev) => prev.map((r) => (r.id === id ? updated : r)));
      showToast(`Room ${updated.room_number} updated!`);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this room?')) return;
    const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setRooms((prev) => prev.filter((r) => r.id !== id));
      showToast('Room deleted.');
    }
  };

  const handleBookRoom = async (roomNumber: string, booking: Omit<Booking, 'booking_id'>) => {
    const res = await fetch('/api/rooms/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_number: roomNumber, ...booking }),
    });
    const data = await res.json();
    if (res.ok) {
      await fetchAllData();
      showToast(data.message || 'Room booked successfully!');
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.error || 'Booking failed.' };
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Cancel this room reservation?')) return { success: false, message: 'Cancelled' };
    const res = await fetch('/api/rooms/cancel-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId }),
    });
    const data = await res.json();
    if (res.ok) {
      await fetchAllData();
      showToast('Booking cancelled.');
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.error || 'Cancel failed.' };
    }
  };

  // --- EVENTS CRUD & REGISTRATION ---
  const handleAddEvent = async (item: Omit<Event, 'id' | 'registered' | 'registrations'>) => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const created = await res.json();
      setEvents((prev) => [...prev, created]);
      showToast(`Event '${created.name}' published!`);
    }
  };

  const handleUpdateEvent = async (id: string, updates: Partial<Event>) => {
    const res = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
      showToast(`Event updated!`);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
      showToast('Event removed.');
    }
  };

  const handleRegisterEvent = async (eventId: string, studentId: string, name: string) => {
    const res = await fetch('/api/events/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId, student_id: studentId, name }),
    });
    const data = await res.json();
    if (res.ok) {
      await fetchAllData();
      showToast(data.message || 'Registered successfully!');
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.error || 'Registration failed.' };
    }
  };

  const handleCancelRegistration = async (eventId: string, studentId: string) => {
    const res = await fetch('/api/events/cancel-reg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId, student_id: studentId }),
    });
    const data = await res.json();
    if (res.ok) {
      await fetchAllData();
      showToast('Registration cancelled.');
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.error || 'Cancel failed.' };
    }
  };

  // --- ANNOUNCEMENTS CRUD ---
  const handleAddAnnouncement = async (item: Omit<Announcement, 'id'>) => {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const created = await res.json();
      setAnnouncements((prev) => [created, ...prev]);
      showToast(`Notice posted!`);
    }
  };

  const handleUpdateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    const res = await fetch(`/api/announcements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      setAnnouncements((prev) => prev.map((a) => (a.id === id ? updated : a)));
      showToast(`Notice updated!`);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      showToast('Notice deleted.');
    }
  };

  // --- ASSIGNMENTS CRUD ---
  const handleAddAssignment = async (item: Omit<Assignment, 'id'>) => {
    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const created = await res.json();
      setAssignments((prev) => [created, ...prev]);
      showToast(`Assignment for ${created.course} added!`);
    }
  };

  const handleUpdateAssignment = async (id: string, updates: Partial<Assignment>) => {
    const res = await fetch(`/api/assignments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      setAssignments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      showToast(`Assignment updated!`);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm('Delete this assignment?')) return;
    const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      showToast('Assignment removed.');
    }
  };

  return (
    <div className="aura-bg min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Ocean Pearl Aura Gradient - Layer 1 & 2 */}
      <div className="aura-layer-1" aria-hidden="true" />
      <div className="aura-layer-2" aria-hidden="true" />

      {/* Page Content sitting above aura blend layers */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-2xl animate-bounce">
            {toastMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 dark:text-rose-600" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

      {/* Top Navbar */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'overview' && (
          <OverviewSection
            schedules={schedules}
            rooms={rooms}
            events={events}
            announcements={announcements}
            assignments={assignments}
            setActiveSection={setActiveSection}
            onBookRoom={handleBookRoom}
            onCancelBooking={handleCancelBooking}
            onRegisterEvent={handleRegisterEvent}
            onCancelRegistration={handleCancelRegistration}
            onUpdateAssignment={handleUpdateAssignment}
          />
        )}

        {activeSection === 'schedules' && (
          <SchedulesSection
            schedules={schedules}
            onAddSchedule={handleAddSchedule}
            onUpdateSchedule={handleUpdateSchedule}
            onDeleteSchedule={handleDeleteSchedule}
          />
        )}

        {activeSection === 'rooms' && (
          <RoomsSection
            rooms={rooms}
            onAddRoom={handleAddRoom}
            onUpdateRoom={handleUpdateRoom}
            onDeleteRoom={handleDeleteRoom}
            onBookRoom={handleBookRoom}
            onCancelBooking={handleCancelBooking}
          />
        )}

        {activeSection === 'events' && (
          <EventsSection
            events={events}
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onRegisterEvent={handleRegisterEvent}
            onCancelRegistration={handleCancelRegistration}
          />
        )}

        {activeSection === 'announcements' && (
          <AnnouncementsSection
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onUpdateAnnouncement={handleUpdateAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
          />
        )}

        {activeSection === 'assignments' && (
          <AssignmentsSection
            assignments={assignments}
            onAddAssignment={handleAddAssignment}
            onUpdateAssignment={handleUpdateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
          />
        )}

        {activeSection === 'agent' && (
          <AgentSection onDataMutated={fetchAllData} />
        )}
      </main>

      {/* Floating AI Button (Visible when not on agent tab) */}
      {activeSection !== 'agent' && (
        <button
          onClick={() => setActiveSection('agent')}
          className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Bot className="w-5 h-5 text-sky-200 animate-pulse" />
          <span className="hidden sm:inline">Ask Campus AI</span>
        </button>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/60 dark:border-slate-800/80 py-4 text-center text-xs text-slate-500 dark:text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CampusOS &copy; 2026 — Built for AI Build Hackathon (CSE Carnival 8)</span>
          <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400">
            AUST Sunday–Thursday Timetable System
          </span>
        </div>
      </footer>
      </div>
    </div>
  );
}
