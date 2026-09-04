import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.');
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const dataDir = path.join(process.cwd(), 'data');
const collections = ['schedules', 'rooms', 'events', 'announcements', 'assignments'];

for (const collection of collections) {
  const records = JSON.parse(await fs.readFile(path.join(dataDir, `${collection}.json`), 'utf8'));
  const rows = records.map((record) => ({
    id: record.id,
    record,
    updated_at: new Date().toISOString(),
  }));

  const { error: deleteError } = await supabase.from(collection).delete().neq('id', '');
  if (deleteError) throw new Error(`${collection}: ${deleteError.message}`);
  if (rows.length > 0) {
    const { error } = await supabase.from(collection).insert(rows);
    if (error) throw new Error(`${collection}: ${error.message}`);
  }
  console.log(`Seeded ${collection}: ${rows.length} records`);
}
