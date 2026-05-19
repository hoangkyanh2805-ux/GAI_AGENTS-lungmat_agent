-- ============================================================
-- Lungmat Agent — Supabase Schema
-- ============================================================

-- command_logs: Persistent audit trail for every agent command
CREATE TABLE IF NOT EXISTS command_logs (
  id          BIGSERIAL PRIMARY KEY,
  command     TEXT        NOT NULL,
  user_name   TEXT,
  source      TEXT        DEFAULT 'telegram',
  status      TEXT        CHECK (status IN ('success', 'failed')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for fast local writes.
-- Re-enable and add policies before exposing to the public internet.
ALTER TABLE command_logs DISABLE ROW LEVEL SECURITY;

-- agent_events: Per-step trace events from SupervisorAgent (input/output/duration).
-- Optional — writes are fire-and-forget; absent client silently skips.
-- Producer: src/memory/SupabaseMemory.ts → logAgentEvent()
CREATE TABLE IF NOT EXISTS agent_events (
  id          BIGSERIAL   PRIMARY KEY,
  trace_id    TEXT        NOT NULL,
  agent       TEXT        NOT NULL,
  action      TEXT        NOT NULL,
  input_data  JSONB,
  output_data JSONB,
  duration_ms INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS agent_events_trace_id_idx ON agent_events (trace_id);
CREATE INDEX IF NOT EXISTS agent_events_created_at_idx ON agent_events (created_at DESC);

ALTER TABLE agent_events DISABLE ROW LEVEL SECURITY;
