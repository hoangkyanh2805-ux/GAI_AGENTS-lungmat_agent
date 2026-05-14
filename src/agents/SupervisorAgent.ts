import { randomUUID } from 'crypto';
import {
  AgentEventEntry,
  AgentMessage,
  AgentResponse,
  AgentRole,
  CommandLogEntry,
  ExecutionContext,
  SubAgent,
  TraceRecord,
} from '../types';
import { RouterAgent } from './RouterAgent';
import { SafetyAgent } from './SafetyAgent';
import { createContext, finalize, addStep, timed } from '../trace/ExecutionTrace';
import { TraceStore } from '../trace/TraceStore';
import { FileLogger } from '../memory/FileLogger';
import { logCommand, logAgentEvent } from '../memory/SupabaseMemory';

export interface ProcessorMeta {
  user: string;
  source: string;
  project?: string;
}

export interface SupervisorResult extends AgentResponse {
  trace: TraceRecord;
}

interface AgentRegistry {
  router: RouterAgent;
  safety: SafetyAgent;
  agents: Map<AgentRole, SubAgent>;
}

export class SupervisorAgent {
  private registry: AgentRegistry;

  constructor(
    private router: RouterAgent,
    private safety: SafetyAgent,
    agentList: SubAgent[]
  ) {
    const map = new Map<AgentRole, SubAgent>();
    for (const a of agentList) map.set(a.role, a);
    this.registry = { router, safety, agents: map };
  }

  async process(
    command: string,
    payload: Record<string, unknown>,
    meta: ProcessorMeta
  ): Promise<SupervisorResult> {
    const ctx: ExecutionContext = createContext({
      user: meta.user,
      source: meta.source,
      project: meta.project,
      mock_llm: process.env.MOCK_LLM === '1',
      command,
    });

    const message: AgentMessage = {
      id: randomUUID(),
      content: command,
      command,
      payload,
      user: meta.user,
      source: meta.source,
      project: meta.project,
      timestamp: ctx.started_at,
    };

    FileLogger.info('[SupervisorAgent] start', {
      trace_id: ctx.trace_id,
      command,
      user: meta.user,
    });

    try {
      // ── 1. Route ───────────────────────────────────────────────────────────
      const { result: routing, duration_ms: rd } = await timed(() =>
        Promise.resolve(this.registry.router.route(message, ctx))
      );
      addStep(ctx, {
        agent: 'RouterAgent',
        action: 'route',
        input: { command },
        output: routing,
        duration_ms: rd,
      });

      // ── 2. Safety check ────────────────────────────────────────────────────
      const { result: safety, duration_ms: sd } = await timed(() =>
        Promise.resolve(this.registry.safety.evaluate(message, routing, ctx))
      );
      addStep(ctx, {
        agent: 'SafetyAgent',
        action: 'evaluate',
        input: { command, risk_intent: routing.intent },
        output: safety,
        duration_ms: sd,
      });

      if (!safety.approved) {
        const trace = finalize(ctx, 'blocked', command);
        TraceStore.save(trace);
        return {
          status: 'blocked',
          reply: `*Action blocked* 🚫\n${safety.reason}`,
          next_actions: [],
          agent: 'SafetyAgent',
          trace_id: ctx.trace_id,
          trace,
        };
      }

      // ── 3. Delegate to target agent ────────────────────────────────────────
      const target = this.registry.agents.get(routing.target_agent);
      if (!target) {
        const trace = finalize(ctx, 'error', command);
        TraceStore.save(trace);
        return this.errResult(
          `No agent registered for role '${routing.target_agent}'`,
          ctx.trace_id,
          trace
        );
      }

      const { result: agentResp, duration_ms: ad } = await timed(() =>
        target.process(message, ctx)
      );
      addStep(ctx, {
        agent: target.name,
        action: 'process',
        input: { command, payload_keys: Object.keys(payload) },
        output: { status: agentResp.status, next_actions: agentResp.next_actions },
        duration_ms: ad,
      });

      // ── 4. Persist (fire-and-forget) ───────────────────────────────────────
      const cmdLog: CommandLogEntry = {
        command,
        user_name: meta.user,
        source: meta.source,
        status: agentResp.status === 'error' ? 'failed' : 'success',
      };
      logCommand(cmdLog).catch((e) => FileLogger.error('Supabase command log', e));

      const finalStatus = agentResp.status === 'error' ? 'error' : 'success';
      const trace = finalize(ctx, finalStatus, command);
      TraceStore.save(trace);

      // Persist each trace step as an agent_event (best-effort)
      for (const step of trace.steps) {
        const ev: AgentEventEntry = {
          trace_id: trace.id,
          agent: step.agent,
          action: step.action,
          input_data: step.input,
          output_data: step.output,
          duration_ms: step.duration_ms,
        };
        logAgentEvent(ev).catch(() => undefined);
      }

      return { ...agentResp, trace };
    } catch (err) {
      FileLogger.error('[SupervisorAgent] fatal', err);
      const trace = finalize(ctx, 'error', command);
      TraceStore.save(trace);
      return this.errResult('Internal agent pipeline error.', ctx.trace_id, trace);
    }
  }

  private errResult(
    reply: string,
    trace_id: string,
    trace: TraceRecord
  ): SupervisorResult {
    return {
      status: 'error',
      reply,
      next_actions: [],
      agent: 'SupervisorAgent',
      trace_id,
      trace,
    };
  }
}
