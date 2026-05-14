import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import { createClient } from '@supabase/supabase-js';

const TEST_COMMANDS = [
  '/help',
  '/report_today',
  '/check_errors',
  '/audit_pipeline',
  '/check_pending',
  '/create_brief',
] as const;

async function main(): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('[ERROR] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });
  let ok = 0;

  for (const cmd of TEST_COMMANDS) {
    const entry = {
      command: cmd,
      user_name: 'test-log',
      source: 'db-test',
      status: 'success' as const,
    };
    const { error } = await sb.from('command_logs').insert(entry);
    if (error) {
      console.error(`[error] ${cmd}: ${error.message}`);
    } else {
      console.log(`[ok] logged ${cmd}`);
      ok++;
    }
  }

  console.log(`db:test-log OK — ${ok}/${TEST_COMMANDS.length} logs written`);
  process.exit(ok === TEST_COMMANDS.length ? 0 : 1);
}

main().catch((err) => {
  console.error('[ERROR] Unexpected:', err);
  process.exit(1);
});
