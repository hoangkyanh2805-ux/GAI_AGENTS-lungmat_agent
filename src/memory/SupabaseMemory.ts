import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '../config/env';
import { AgentEventEntry, CommandLogEntry } from '../types';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!_client) {
    _client = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return _client;
}

export async function logCommand(entry: CommandLogEntry): Promise<void> {
  const sb = getClient();
  if (!sb) {
    console.warn('[WARN] Supabase not configured — command_logs skipped.');
    return;
  }
  const { error } = await sb.from('command_logs').insert(entry);
  if (error) throw new Error(`command_logs insert: ${error.message}`);
}

export async function logAgentEvent(entry: AgentEventEntry): Promise<void> {
  const sb = getClient();
  if (!sb) return; // silent — agent_events is optional

  const row = {
    trace_id:    entry.trace_id,
    agent:       entry.agent,
    action:      entry.action,
    input_data:  entry.input_data  ?? null,
    output_data: entry.output_data ?? null,
    duration_ms: entry.duration_ms ?? null,
  };

  const { error } = await sb.from('agent_events').insert(row);
  if (error) throw new Error(`agent_events insert: ${error.message}`);
}
