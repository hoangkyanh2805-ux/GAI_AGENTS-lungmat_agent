import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import { createClient } from '@supabase/supabase-js';

async function main(): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('[ERROR] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });

  const { error } = await sb.from('command_logs').select('id').limit(1);

  if (error) {
    console.error(`[ERROR] db:check FAILED — ${error.message}`);
    console.error('  Make sure you have applied db/schema.sql in Supabase SQL Editor.');
    process.exit(1);
  }

  console.log('db:check OK');
}

main().catch((err) => {
  console.error('[ERROR] Unexpected:', err);
  process.exit(1);
});
