import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import { createClient } from '@supabase/supabase-js';

type SeedRow = { command: string; user_name: string; source: string; status: 'success' | 'failed' };

const SEEDS: SeedRow[] = [
  { command: '/help',           user_name: 'seed', source: 'test', status: 'success' },
  { command: '/report_today',   user_name: 'seed', source: 'test', status: 'success' },
  { command: '/check_errors',   user_name: 'seed', source: 'test', status: 'failed'  },
  { command: '/audit_pipeline', user_name: 'seed', source: 'test', status: 'success' },
];

async function main(): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('[ERROR] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });
  let ok = 0;

  for (const seed of SEEDS) {
    const { error } = await sb.from('command_logs').insert(seed);
    if (error) {
      console.error(`[error] ${seed.command}: ${error.message}`);
    } else {
      console.log(`[ok] ${seed.command} | user=${seed.user_name} | source=${seed.source} | status=${seed.status}`);
      ok++;
    }
  }

  console.log(`db:seed OK — ${ok}/${SEEDS.length} rows inserted`);
  process.exit(ok === SEEDS.length ? 0 : 1);
}

main().catch((err) => {
  console.error('[ERROR] Unexpected:', err);
  process.exit(1);
});
