export type DayOfWeek = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday";

export interface Schedule {
  id: string;
  course: string;
  title: string;
  day: DayOfWeek | string;
  start_time: string;
  end_time: string;
  room: string;
  instructor: string;
  section: string;
}

export interface Booking {
  booking_id: string;
  booked_by: string;
  date: string;
  start_time: string;
  end_time: string;
  purpose: string;
}

export interface Room {
  id: string;
  room_number: string;
  type: "classroom" | "lab" | "seminar" | string;
  capacity: number;
  equipment: string[];
  floor: number;
  status: "available" | "unavailable" | string;
  bookings: Booking[];
}

export interface Registration {
  student_id: string;
  name: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  end_date: string;
  venue: string;
  organizer: string;
  capacity: number;
  registered: number;
  registrations: Registration[];
  status: "upcoming" | "ongoing" | "completed" | "cancelled" | "full" | string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
  priority: "high" | "medium" | "low" | string;
  posted_by: string;
  expires: string;
}

export interface Assignment {
  id: string;
  course: string;
  course_title: string;
  title: string;
  description: string;
  assigned_date: string;
  deadline: string;
  submission_platform: string;
  status: "pending" | "submitted" | "graded" | "late" | string;
  marks: number;
}

export type NavSection = "overview" | "schedules" | "rooms" | "events" | "announcements" | "assignments" | "agent";
