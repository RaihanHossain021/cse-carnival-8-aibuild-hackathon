import { NextResponse } from 'next/server';
import { cancelEventRegistration } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_id, student_id } = body;

    if (!event_id || !student_id) {
      return NextResponse.json({ error: 'Missing event_id or student_id' }, { status: 400 });
    }

    const result = await cancelEventRegistration(event_id, student_id);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
