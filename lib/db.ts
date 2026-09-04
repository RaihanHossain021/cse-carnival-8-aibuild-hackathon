import fs from 'fs';
import path from 'path';
import { Schedule, Room, Event, Announcement, Assignment, Booking, Registration } from '@/types';

const SEED_DIR = path.join(process.cwd(), 'data');
const STORAGE_DIR = path.join(process.cwd(), 'storage');

const FILES = {
  schedules: 'schedules.json',
  rooms: 'rooms.json',
  events: 'events.json',
  announcements: 'announcements.json',
  assignments: 'assignments.json',
};

// Ensure storage directory exists and seed files are initialized
export function initDatabase() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }

  for (const [key, filename] of Object.entries(FILES)) {
    const targetFile = path.join(STORAGE_DIR, filename);
    const seedFile = path.join(SEED_DIR, filename);

    if (!fs.existsSync(targetFile)) {
      if (fs.existsSync(seedFile)) {
        const content = fs.readFileSync(seedFile, 'utf-8');
        fs.writeFileSync(targetFile, content, 'utf-8');
      } else {
        fs.writeFileSync(targetFile, JSON.stringify([], null, 2), 'utf-8');
      }
    }
  }
}

function readStorage<T>(filename: string): T[] {
  initDatabase();
  const filePath = path.join(STORAGE_DIR, filename);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return [];
  }
}

function writeStorage<T>(filename: string, data: T[]): void {
  initDatabase();
  const filePath = path.join(STORAGE_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Reset database back to seed data if ever needed
export function resetToSeed(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
  for (const [key, filename] of Object.entries(FILES)) {
    const targetFile = path.join(STORAGE_DIR, filename);
    const seedFile = path.join(SEED_DIR, filename);
    if (fs.existsSync(seedFile)) {
      const content = fs.readFileSync(seedFile, 'utf-8');
      fs.writeFileSync(targetFile, content, 'utf-8');
    }
  }
}

// --- SCHEDULES ---
export function getSchedules(): Schedule[] {
  return readStorage<Schedule>(FILES.schedules);
}
export function saveSchedules(items: Schedule[]): void {
  writeStorage<Schedule>(FILES.schedules, items);
}
export function addSchedule(item: Omit<Schedule, 'id'> & { id?: string }): Schedule {
  const items = getSchedules();
  const newItem: Schedule = {
    ...item,
    id: item.id || `sch-${Date.now().toString().slice(-4)}`,
  };
  items.push(newItem);
  saveSchedules(items);
  return newItem;
}
export function updateSchedule(id: string, updates: Partial<Schedule>): Schedule | null {
  const items = getSchedules();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates };
  saveSchedules(items);
  return items[idx];
}
export function deleteSchedule(id: string): boolean {
  const items = getSchedules();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  saveSchedules(filtered);
  return true;
}

// --- ROOMS ---
export function getRooms(): Room[] {
  return readStorage<Room>(FILES.rooms);
}
export function saveRooms(items: Room[]): void {
  writeStorage<Room>(FILES.rooms, items);
}
export function addRoom(item: Omit<Room, 'id' | 'bookings'> & { id?: string; bookings?: Booking[] }): Room {
  const items = getRooms();
  const newItem: Room = {
    ...item,
    id: item.id || `room-${Date.now().toString().slice(-4)}`,
    bookings: item.bookings || [],
  };
  items.push(newItem);
  saveRooms(items);
  return newItem;
}
export function updateRoom(id: string, updates: Partial<Room>): Room | null {
  const items = getRooms();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates };
  saveRooms(items);
  return items[idx];
}
export function deleteRoom(id: string): boolean {
  const items = getRooms();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  saveRooms(filtered);
  return true;
}
export function bookRoom(
  roomNumber: string,
  booking: Omit<Booking, 'booking_id'> & { booking_id?: string }
): { success: boolean; message: string; booking?: Booking } {
  const rooms = getRooms();
  const room = rooms.find((r) => r.room_number.toLowerCase() === roomNumber.toLowerCase() || r.id === roomNumber);
  if (!room) {
    return { success: false, message: `Room ${roomNumber} not found.` };
  }

  // Check collision with existing bookings for this room
  const collision = room.bookings?.some((b) => {
    if (b.date !== booking.date) return false;
    // Overlap if max(start1, start2) < min(end1, end2)
    return Math.max(timeToMinutes(b.start_time), timeToMinutes(booking.start_time)) <
           Math.min(timeToMinutes(b.end_time), timeToMinutes(booking.end_time));
  });

  if (collision) {
    return { success: false, message: `Room ${room.room_number} is already booked during this time on ${booking.date}.` };
  }

  const newBooking: Booking = {
    ...booking,
    booking_id: booking.booking_id || `bk-${Date.now().toString().slice(-4)}`,
  };

  room.bookings = room.bookings || [];
  room.bookings.push(newBooking);
  saveRooms(rooms);
  return { success: true, message: `Room ${room.room_number} booked successfully!`, booking: newBooking };
}

export function cancelBooking(bookingId: string): { success: boolean; message: string } {
  const rooms = getRooms();
  let found = false;
  for (const room of rooms) {
    if (room.bookings) {
      const initLen = room.bookings.length;
      room.bookings = room.bookings.filter((b) => b.booking_id !== bookingId);
      if (room.bookings.length < initLen) {
        found = true;
        break;
      }
    }
  }
  if (found) {
    saveRooms(rooms);
    return { success: true, message: `Booking ${bookingId} cancelled successfully.` };
  }
  return { success: false, message: `Booking ${bookingId} not found.` };
}

// --- EVENTS ---
export function getEvents(): Event[] {
  return readStorage<Event>(FILES.events);
}
export function saveEvents(items: Event[]): void {
  writeStorage<Event>(FILES.events, items);
}
export function addEvent(item: Omit<Event, 'id' | 'registered' | 'registrations'> & { id?: string }): Event {
  const items = getEvents();
  const newItem: Event = {
    ...item,
    id: item.id || `evt-${Date.now().toString().slice(-4)}`,
    registered: 0,
    registrations: [],
  };
  items.push(newItem);
  saveEvents(items);
  return newItem;
}
export function updateEvent(id: string, updates: Partial<Event>): Event | null {
  const items = getEvents();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates };
  saveEvents(items);
  return items[idx];
}
export function deleteEvent(id: string): boolean {
  const items = getEvents();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  saveEvents(filtered);
  return true;
}
export function registerForEvent(
  eventId: string,
  registration: Registration
): { success: boolean; message: string; event?: Event } {
  const events = getEvents();
  const event = events.find((e) => e.id === eventId || e.name.toLowerCase() === eventId.toLowerCase());
  if (!event) {
    return { success: false, message: `Event '${eventId}' not found.` };
  }
  if (event.status === 'cancelled') {
    return { success: false, message: `Cannot register: Event '${event.name}' has been cancelled.` };
  }
  if (event.registered >= event.capacity) {
    event.status = 'full';
    saveEvents(events);
    return { success: false, message: `Event '${event.name}' is already at full capacity (${event.capacity} seats).` };
  }

  event.registrations = event.registrations || [];
  const already = event.registrations.some((r) => r.student_id === registration.student_id);
  if (already) {
    return { success: false, message: `Student ${registration.student_id} is already registered for this event.` };
  }

  event.registrations.push(registration);
  event.registered = event.registrations.length;
  if (event.registered >= event.capacity) {
    event.status = 'full';
  }
  saveEvents(events);
  return { success: true, message: `Successfully registered for '${event.name}'!`, event };
}

export function cancelEventRegistration(
  eventId: string,
  studentId: string
): { success: boolean; message: string } {
  const events = getEvents();
  const event = events.find((e) => e.id === eventId);
  if (!event || !event.registrations) {
    return { success: false, message: `Event or registration not found.` };
  }
  const initLen = event.registrations.length;
  event.registrations = event.registrations.filter((r) => r.student_id !== studentId);
  if (event.registrations.length < initLen) {
    event.registered = event.registrations.length;
    if (event.status === 'full' && event.registered < event.capacity) {
      event.status = 'upcoming';
    }
    saveEvents(events);
    return { success: true, message: `Registration cancelled successfully.` };
  }
  return { success: false, message: `Registration for student ${studentId} not found.` };
}

// --- ANNOUNCEMENTS ---
export function getAnnouncements(): Announcement[] {
  return readStorage<Announcement>(FILES.announcements);
}
export function saveAnnouncements(items: Announcement[]): void {
  writeStorage<Announcement>(FILES.announcements, items);
}
export function addAnnouncement(item: Omit<Announcement, 'id'> & { id?: string }): Announcement {
  const items = getAnnouncements();
  const newItem: Announcement = {
    ...item,
    id: item.id || `ann-${Date.now().toString().slice(-4)}`,
  };
  items.push(newItem);
  saveAnnouncements(items);
  return newItem;
}
export function updateAnnouncement(id: string, updates: Partial<Announcement>): Announcement | null {
  const items = getAnnouncements();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates };
  saveAnnouncements(items);
  return items[idx];
}
export function deleteAnnouncement(id: string): boolean {
  const items = getAnnouncements();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  saveAnnouncements(filtered);
  return true;
}

// --- ASSIGNMENTS ---
export function getAssignments(): Assignment[] {
  return readStorage<Assignment>(FILES.assignments);
}
export function saveAssignments(items: Assignment[]): void {
  writeStorage<Assignment>(FILES.assignments, items);
}
export function addAssignment(item: Omit<Assignment, 'id'> & { id?: string }): Assignment {
  const items = getAssignments();
  const newItem: Assignment = {
    ...item,
    id: item.id || `asgn-${Date.now().toString().slice(-4)}`,
  };
  items.push(newItem);
  saveAssignments(items);
  return newItem;
}
export function updateAssignment(id: string, updates: Partial<Assignment>): Assignment | null {
  const items = getAssignments();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates };
  saveAssignments(items);
  return items[idx];
}
export function deleteAssignment(id: string): boolean {
  const items = getAssignments();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  saveAssignments(filtered);
  return true;
}

// Helper: Convert "HH:MM" to minutes from 00:00
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
