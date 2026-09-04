import { getSchedules, getRooms, getEvents, getAnnouncements, getAssignments } from '@/lib/db';
import CampusDashboard from '@/components/CampusDashboard';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const schedules = getSchedules();
  const rooms = getRooms();
  const events = getEvents();
  const announcements = getAnnouncements();
  const assignments = getAssignments();

  return (
    <CampusDashboard
      initialSchedules={schedules}
      initialRooms={rooms}
      initialEvents={events}
      initialAnnouncements={announcements}
      initialAssignments={assignments}
    />
  );
}
