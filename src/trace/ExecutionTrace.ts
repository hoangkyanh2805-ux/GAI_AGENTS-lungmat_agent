import { randomUUID } from 'crypto';
import {
  ExecutionContext,
  ExecutionStatus,
  TraceRecord,
  TraceStep,
} from '../types';

export function createContext(opts: {
  user: string;
  source: string;
  project?: string;
  mock_llm?: boolean;
  command?: string;
}): ExecutionContext {
  return {
    trace_id: randomUUID(),
    started_at: new Date().toISOString(),
    steps: [],
    user: opts.user,
    source: opts.source,
    project: opts.project,
    mock_llm: opts.mock_llm ?? false,
  };
}

export function addStep(
  ctx: ExecutionContext,
  step: Omit<TraceStep, 'ts'>
): void {
  ctx.steps.push({ ...step, ts: new Date().toISOString() });
}

export function finalize(
  ctx: ExecutionContext,
  status: ExecutionStatus,
  command: string
): TraceRecord {
  const finished_at = new Date().toISOString();
  const duration_ms = Date.now() - new Date(ctx.started_at).getTime();
  return {
    id: ctx.trace_id,
    command,
    user: ctx.user,
    source: ctx.source,
    steps: ctx.steps,
    final_status: status,
    started_at: ctx.started_at,
    finished_at,
    duration_ms,
  };
}

export async function timed<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration_ms: number }> {
  const start = Date.now();
  const result = await fn();
  return { result, duration_ms: Date.now() - start };
}
