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
