import { NextResponse } from 'next/server';
import { getRooms, addRoom } from '@/lib/db';

export async function GET() {
  const data = await getRooms();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item = await addRoom(body);
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
