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
  | 'safety';

// ── Incoming message (canonical shape for all agent inputs) ──────────────────
export interface AgentMessage {
  id: string;
  content: string;           // raw command string or natural language
  command?: string;          // normalized slash command, e.g. '/help'
  intent?: string;           // classified by RouterAgent
  payload: Record<string, unknown>;
  user: string;
  source: string;            // 'telegram' | 'curl' | 'n8n' | 'e2e' | …
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

// ── Execution context (mutable, threaded through the agent chain) ─────────────
// Agents call addStep() in trace/ExecutionTrace.ts to append their steps.
export interface ExecutionContext {
  trace_id: string;
  started_at: string;
  steps: TraceStep[];
  user: string;
  source: string;
  project?: string;
  mock_llm: boolean;
}

// ── Sub-agent contract (all routable agents implement this) ───────────────────
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
}

// ── Routing decision (output of RouterAgent) ──────────────────────────────────
export interface RoutingDecision {
  target_agent: AgentRole;
  intent: string;
  confidence: number;       // 0–1
  fallback_agent: AgentRole;
}

// ── Safety decision (output of SafetyAgent) ───────────────────────────────────
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
  ttl_ms?: number;    // L1 TTL in milliseconds
  persist?: boolean;  // also write to L2 (default true)
  agent?: string;
}

// ── Tool abstraction ──────────────────────────────────────────────────────────
export interface ToolResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

// ── Skill (backward-compatible with skills/ directory) ────────────────────────
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

// ── Retry ─────────────────────────────────────────────────────────────────────
export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  onRetry?: (attempt: number, error: unknown) => void;
}
