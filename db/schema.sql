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

-- ── Phase 3: job queue ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT        NOT NULL,
  payload     JSONB,
  status      TEXT        DEFAULT 'pending'
                          CHECK (status IN ('pending', 'running', 'done', 'failed')),
  result      JSONB,
  error       TEXT,
  trace_id    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  started_at  TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_jobs_status
  ON jobs (status, created_at DESC);

-- ── Phase 3: RAG document store ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rag_documents (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  content     TEXT,
  source      TEXT,
  tags        TEXT[],
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rag_documents DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_rag_documents_ingested
  ON rag_documents (ingested_at DESC);

-- ── Phase 3: scheduler config ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedules (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  cron        TEXT        NOT NULL,
  job_type    TEXT        NOT NULL,
  payload     JSONB,
  enabled     BOOLEAN     DEFAULT TRUE,
  last_run    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;
