import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Schedule, Room, Event, Announcement, Assignment, Booking, Registration } from '@/types';

type Collection = 'schedules' | 'rooms' | 'events' | 'announcements' | 'assignments';
type StoredRecord = { id: string; record: unknown };

const SEED_DIR = path.join(process.cwd(), 'data');
const FILES: Record<Collection, string> = {
  schedules: 'schedules.json',
  rooms: 'rooms.json',
  events: 'events.json',
  announcements: 'announcements.json',
  assignments: 'assignments.json',
};

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local.');
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function readCollection<T>(collection: Collection): Promise<T[]> {
  const { data, error } = await supabase()
    .from(collection)
    .select('record');
  if (error) throw new Error(`Supabase read failed for ${collection}: ${error.message}`);
  return (data as Pick<StoredRecord, 'record'>[]).map((item) => item.record as T);
}

async function writeCollection<T extends { id: string }>(collection: Collection, items: T[]): Promise<void> {
  const client = supabase();
  const rows = items.map((record) => ({ id: record.id, record, updated_at: new Date().toISOString() }));
  const { error: deleteError } = await client.from(collection).delete().neq('id', '');
  if (deleteError) throw new Error(`Supabase clear failed for ${collection}: ${deleteError.message}`);
  if (rows.length === 0) return;
  const { error } = await client.from(collection).insert(rows);
  if (error) throw new Error(`Supabase write failed for ${collection}: ${error.message}`);
}

async function updateRecord<T extends { id: string }>(collection: Collection, id: string, updates: Partial<T>): Promise<T | null> {
  const items = await readCollection<T>(collection);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates };
  await writeCollection(collection, items);
  return items[index];
}

async function deleteRecord<T extends { id: string }>(collection: Collection, id: string): Promise<boolean> {
  const items = await readCollection<T>(collection);
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  await writeCollection(collection, filtered);
  return true;
}

async function seedCollection<T extends { id: string }>(collection: Collection): Promise<T[]> {
  const contents = await fs.readFile(path.join(SEED_DIR, FILES[collection]), 'utf-8');
  return JSON.parse(contents) as T[];
}

export async function resetToSeed(): Promise<void> {
  for (const collection of Object.keys(FILES) as Collection[]) {
    await writeCollection(collection, await seedCollection(collection));
  }
}

export async function getSchedules(): Promise<Schedule[]> { return readCollection<Schedule>('schedules'); }
export async function saveSchedules(items: Schedule[]): Promise<void> { return writeCollection('schedules', items); }
export async function addSchedule(item: Omit<Schedule, 'id'> & { id?: string }): Promise<Schedule> {
  const newItem = { ...item, id: item.id || `sch-${Date.now().toString().slice(-4)}` } as Schedule;
  await saveSchedules([...(await getSchedules()), newItem]);
  return newItem;
}
export async function updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule | null> { return updateRecord('schedules', id, updates); }
export async function deleteSchedule(id: string): Promise<boolean> { return deleteRecord<Schedule>('schedules', id); }

export async function getRooms(): Promise<Room[]> { return readCollection<Room>('rooms'); }
export async function saveRooms(items: Room[]): Promise<void> { return writeCollection('rooms', items); }
export async function addRoom(item: Omit<Room, 'id' | 'bookings'> & { id?: string; bookings?: Booking[] }): Promise<Room> {
  const newItem = { ...item, id: item.id || `room-${Date.now().toString().slice(-4)}`, bookings: item.bookings || [] } as Room;
  await saveRooms([...(await getRooms()), newItem]);
  return newItem;
}
export async function updateRoom(id: string, updates: Partial<Room>): Promise<Room | null> { return updateRecord('rooms', id, updates); }
export async function deleteRoom(id: string): Promise<boolean> { return deleteRecord<Room>('rooms', id); }
export async function bookRoom(roomNumber: string, booking: Omit<Booking, 'booking_id'> & { booking_id?: string }): Promise<{ success: boolean; message: string; booking?: Booking }> {
  const rooms = await getRooms();
  const room = rooms.find((item) => item.room_number.toLowerCase() === roomNumber.toLowerCase() || item.id === roomNumber);
  if (!room) return { success: false, message: `Room ${roomNumber} not found.` };
  const collision = room.bookings?.some((existing) => existing.date === booking.date &&
    Math.max(timeToMinutes(existing.start_time), timeToMinutes(booking.start_time)) <
    Math.min(timeToMinutes(existing.end_time), timeToMinutes(booking.end_time)));
  if (collision) return { success: false, message: `Room ${room.room_number} is already booked during this time on ${booking.date}.` };
  const newBooking = { ...booking, booking_id: booking.booking_id || `bk-${Date.now().toString().slice(-4)}` } as Booking;
  room.bookings = [...(room.bookings || []), newBooking];
  await saveRooms(rooms);
  return { success: true, message: `Room ${room.room_number} booked successfully!`, booking: newBooking };
}
export async function cancelBooking(bookingId: string): Promise<{ success: boolean; message: string }> {
  const rooms = await getRooms();
  let found = false;
  for (const room of rooms) {
    const bookings = room.bookings || [];
    room.bookings = bookings.filter((booking) => booking.booking_id !== bookingId);
    if (room.bookings.length < bookings.length) { found = true; break; }
  }
  if (!found) return { success: false, message: `Booking ${bookingId} not found.` };
  await saveRooms(rooms);
  return { success: true, message: `Booking ${bookingId} cancelled successfully.` };
}

export async function getEvents(): Promise<Event[]> { return readCollection<Event>('events'); }
export async function saveEvents(items: Event[]): Promise<void> { return writeCollection('events', items); }
export async function addEvent(item: Omit<Event, 'id' | 'registered' | 'registrations'> & { id?: string }): Promise<Event> {
  const newItem = { ...item, id: item.id || `evt-${Date.now().toString().slice(-4)}`, registered: 0, registrations: [] } as Event;
  await saveEvents([...(await getEvents()), newItem]);
  return newItem;
}
export async function updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> { return updateRecord('events', id, updates); }
export async function deleteEvent(id: string): Promise<boolean> { return deleteRecord<Event>('events', id); }
export async function registerForEvent(eventId: string, registration: Registration): Promise<{ success: boolean; message: string; event?: Event }> {
  const events = await getEvents();
  const event = events.find((item) => item.id === eventId || item.name.toLowerCase() === eventId.toLowerCase());
  if (!event) return { success: false, message: `Event '${eventId}' not found.` };
  if (event.status === 'cancelled') return { success: false, message: `Cannot register: Event '${event.name}' has been cancelled.` };
  if (event.registered >= event.capacity) {
    event.status = 'full';
    await saveEvents(events);
    return { success: false, message: `Event '${event.name}' is already at full capacity (${event.capacity} seats).` };
  }
  event.registrations = event.registrations || [];
  if (event.registrations.some((item) => item.student_id === registration.student_id)) {
    return { success: false, message: `Student ${registration.student_id} is already registered for this event.` };
  }
  event.registrations.push(registration);
  event.registered = event.registrations.length;
  if (event.registered >= event.capacity) event.status = 'full';
  await saveEvents(events);
  return { success: true, message: `Successfully registered for '${event.name}'!`, event };
}
export async function cancelEventRegistration(eventId: string, studentId: string): Promise<{ success: boolean; message: string }> {
  const events = await getEvents();
  const event = events.find((item) => item.id === eventId);
  if (!event?.registrations) return { success: false, message: 'Event or registration not found.' };
  const initialLength = event.registrations.length;
  event.registrations = event.registrations.filter((item) => item.student_id !== studentId);
  if (event.registrations.length === initialLength) return { success: false, message: `Registration for student ${studentId} not found.` };
  event.registered = event.registrations.length;
  if (event.status === 'full' && event.registered < event.capacity) event.status = 'upcoming';
  await saveEvents(events);
  return { success: true, message: 'Registration cancelled successfully.' };
}

export async function getAnnouncements(): Promise<Announcement[]> { return readCollection<Announcement>('announcements'); }
export async function saveAnnouncements(items: Announcement[]): Promise<void> { return writeCollection('announcements', items); }
export async function addAnnouncement(item: Omit<Announcement, 'id'> & { id?: string }): Promise<Announcement> {
  const newItem = { ...item, id: item.id || `ann-${Date.now().toString().slice(-4)}` } as Announcement;
  await saveAnnouncements([...(await getAnnouncements()), newItem]);
  return newItem;
}
export async function updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement | null> { return updateRecord('announcements', id, updates); }
export async function deleteAnnouncement(id: string): Promise<boolean> { return deleteRecord<Announcement>('announcements', id); }

export async function getAssignments(): Promise<Assignment[]> { return readCollection<Assignment>('assignments'); }
export async function saveAssignments(items: Assignment[]): Promise<void> { return writeCollection('assignments', items); }
export async function addAssignment(item: Omit<Assignment, 'id'> & { id?: string }): Promise<Assignment> {
  const newItem = { ...item, id: item.id || `asgn-${Date.now().toString().slice(-4)}` } as Assignment;
  await saveAssignments([...(await getAssignments()), newItem]);
  return newItem;
}
export async function updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment | null> { return updateRecord('assignments', id, updates); }
export async function deleteAssignment(id: string): Promise<boolean> { return deleteRecord<Assignment>('assignments', id); }

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}
