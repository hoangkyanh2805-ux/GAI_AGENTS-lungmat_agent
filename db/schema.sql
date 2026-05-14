-- ============================================================
-- Lungmat Agent — Supabase Schema
-- Apply in Supabase SQL Editor: Dashboard → SQL Editor → Paste → Run
-- ============================================================

-- ── Phase 1: command audit trail ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS command_logs (
  id          BIGSERIAL   PRIMARY KEY,
  command     TEXT        NOT NULL,
  user_name   TEXT,
  source      TEXT        DEFAULT 'telegram',
  status      TEXT        CHECK (status IN ('success', 'failed')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE command_logs DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_command_logs_command
  ON command_logs (command, created_at DESC);

-- ── Phase 2: execution traces per agent step ──────────────────────────────────
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

ALTER TABLE agent_events DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_agent_events_trace
  ON agent_events (trace_id, created_at ASC);

-- ── Phase 2: L3 long-term agent memory ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_memory (
  id          BIGSERIAL   PRIMARY KEY,
  key         TEXT        UNIQUE NOT NULL,
  value       JSONB,
  agent       TEXT,
  expires_at  TIMESTAMPTZ,
  set_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE agent_memory DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_agent_memory_key
  ON agent_memory (key);

-- ── Phase 2: safety approval queue ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS approval_requests (
  id          BIGSERIAL   PRIMARY KEY,
  trace_id    TEXT        NOT NULL,
  command     TEXT        NOT NULL,
  user_name   TEXT,
  payload     JSONB,
  risk_level  TEXT        CHECK (risk_level IN ('low', 'medium', 'high')),
  status      TEXT        DEFAULT 'pending'
                          CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE approval_requests DISABLE ROW LEVEL SECURITY;
