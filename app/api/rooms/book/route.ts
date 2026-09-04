import { NextResponse } from 'next/server';
import { bookRoom } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { room_number, date, start_time, end_time, booked_by, purpose } = body;

    if (!room_number || !date || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required booking fields (room_number, date, start_time, end_time)' },
        { status: 400 }
      );
    }

    const result = bookRoom(room_number, {
      booked_by: booked_by || 'Student',
      date,
      start_time,
      end_time,
      purpose: purpose || 'Study/Meeting',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 409 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
