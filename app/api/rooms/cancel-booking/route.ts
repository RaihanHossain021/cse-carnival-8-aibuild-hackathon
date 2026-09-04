import { NextResponse } from 'next/server';
import { cancelBooking } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { booking_id } = body;
    if (!booking_id) {
      return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });
    }

    const result = await cancelBooking(booking_id);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
