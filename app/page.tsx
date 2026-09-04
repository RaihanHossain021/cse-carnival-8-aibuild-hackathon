import { getSchedules, getRooms, getEvents, getAnnouncements, getAssignments } from '@/lib/db';
import CampusDashboard from '@/components/CampusDashboard';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [schedules, rooms, events, announcements, assignments] = await Promise.all([
    getSchedules(), getRooms(), getEvents(), getAnnouncements(), getAssignments(),
  ]);

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
