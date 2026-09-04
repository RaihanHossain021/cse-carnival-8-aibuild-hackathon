import { NextResponse } from 'next/server';
import { resetToSeed } from '@/lib/db';

export async function POST() {
  try {
    resetToSeed();
    return NextResponse.json({ success: true, message: 'Database reset to original seed data.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
