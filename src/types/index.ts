// ============================================================================
// Hermes Agent System — Type Contracts
// This file is the canonical source of truth for all shared types.
// It imports nothing from src/ — no circular dependency risk.
// ============================================================================

// ── Agent roles ──────────────────────────────────────────────────────────────
export type AgentRole =
  | 'supervisor'
  | 'router'
  | 'sales'
  | 'support'
  | 'memory'
  | 'safety'
  | 'research'
  | 'market_summary'
  | 'thread_writer'
  | 'telegram_publisher'
  | 'daily_report'
  | 'rag'
  | 'ops';

// ── Incoming message (canonical shape for all agent inputs) ──────────────────
export interface AgentMessage {
  id: string;
  content: string;
  command?: string;
  intent?: string;
  payload: Record<string, unknown>;
  user: string;
  source: string;
  project?: string;
  chat_id?: string | number;
  timestamp: string;
}

// ── Execution trace ───────────────────────────────────────────────────────────
export type ExecutionStatus = 'success' | 'error' | 'blocked' | 'pending_approval';

export interface TraceStep {
  agent: string;
  action: string;
  input?: unknown;
  output?: unknown;
  duration_ms: number;
  ts: string;
  error?: string;
}

export interface TraceRecord {
  id: string;
  command: string;
  user: string;
  source: string;
  steps: TraceStep[];
  final_status: ExecutionStatus;
  started_at: string;
  finished_at: string;
  duration_ms: number;
}

// ── Execution context ─────────────────────────────────────────────────────────
export interface ExecutionContext {
  trace_id: string;
  started_at: string;
  steps: TraceStep[];
  user: string;
  source: string;
  project?: string;
  mock_llm: boolean;
}

// ── Sub-agent contract ────────────────────────────────────────────────────────
export interface SubAgent {
  readonly name: string;
  readonly role: AgentRole;
  process(message: AgentMessage, ctx: ExecutionContext): Promise<AgentResponse>;
}

// ── Agent response ────────────────────────────────────────────────────────────
export interface AgentResponse {
  status: ExecutionStatus;
  reply: string;
  next_actions: string[];
  agent: string;
  trace_id: string;
  meta?: Record<string, unknown>; // optional structured output (approval_id, job_ids, etc.)
}

// ── Routing & safety ──────────────────────────────────────────────────────────
export interface RoutingDecision {
  target_agent: AgentRole;
  intent: string;
  confidence: number;
  fallback_agent: AgentRole;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface SafetyDecision {
  approved: boolean;
  risk_level: RiskLevel;
  reason: string;
  requires_human_approval: boolean;
}

// ── Memory ────────────────────────────────────────────────────────────────────
export interface MemoryEntry {
  key: string;
  value: unknown;
  agent?: string;
  set_at: string;
  expires_at?: string;
}

export interface MemorySetOptions {
  ttl_ms?: number;
  persist?: boolean;
  agent?: string;
}

// ── Tool abstraction ──────────────────────────────────────────────────────────
export interface ToolResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

// ── Skill ─────────────────────────────────────────────────────────────────────
export interface SkillResult {
  reply: string;
  next_actions: string[];
}

export interface Skill {
  name: string;
  command: string;
  description: string;
  execute(payload: Record<string, unknown>): Promise<SkillResult>;
}

// ── Command registry ──────────────────────────────────────────────────────────
export interface CommandDef {
  command: string;
  description: string;
  agent?: AgentRole;
}

export interface CommandRegistry {
  [key: string]: CommandDef;
}

// ── Supabase log entries ──────────────────────────────────────────────────────
export interface CommandLogEntry {
  command: string;
  user_name: string;
  source: string;
  status: 'success' | 'failed';
}

export interface AgentEventEntry {
  trace_id: string;
  agent: string;
  action: string;
  input_data?: unknown;
  output_data?: unknown;
  duration_ms?: number;
}

// ── Job queue ─────────────────────────────────────────────────────────────────
export type JobStatus = 'pending' | 'running' | 'done' | 'failed';
export type JobType = 'research' | 'market_summary' | 'write_thread' | 'publish' | 'daily_report';

export interface Job {
  id: string;
  type: JobType;
  payload: Record<string, unknown>;
  status: JobStatus;
  created_at: string;
  started_at?: string;
  finished_at?: string;
  result?: unknown;
  error?: string;
  trace_id?: string;
}

// ── RAG ───────────────────────────────────────────────────────────────────────
export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  tags: string[];
  ingested_at: string;
}

export interface RAGSearchResult {
  document: RAGDocument;
  score: number;
}

// ── Approval ──────────────────────────────────────────────────────────────────
export interface ApprovalRequest {
  id: string;
  trace_id: string;
  type: 'publish_telegram' | 'publish_other';
  content: string;
  agent: string;
  user: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

// ── Scheduler ─────────────────────────────────────────────────────────────────
export interface Schedule {
  id: string;
  name: string;
  cron: string;
  job_type: JobType;
  payload: Record<string, unknown>;
  enabled: boolean;
  last_run?: string;
  created_at: string;
}

// ── Research / market data ────────────────────────────────────────────────────
export interface Article {
  title: string;
  url: string;
  content: string;
  source: string;
  published_at?: string;
}

export interface MarketData {
  ticker: string;
  price: number;
  change: number;
  change_pct: number;
  volume?: number;
  timestamp: string;
  extra?: {
    day_high?: number | null;
    day_low?: number | null;
    prev_close?: number;
    candles_5d?: Array<{ date: string; o: number; h: number; l: number; c: number }>;
  };
}

// ── Retry ─────────────────────────────────────────────────────────────────────
export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  onRetry?: (attempt: number, error: unknown) => void;
}
