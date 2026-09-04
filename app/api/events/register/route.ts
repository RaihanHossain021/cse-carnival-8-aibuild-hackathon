import { NextResponse } from 'next/server';
import { registerForEvent } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_id, student_id, name } = body;

    if (!event_id || !student_id || !name) {
      return NextResponse.json(
        { error: 'Missing required registration fields (event_id, student_id, name)' },
        { status: 400 }
      );
    }

    const result = await registerForEvent(event_id, { student_id, name });
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 409 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
