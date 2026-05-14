// Legacy single-agent router — superseded by SupervisorAgent.
// Kept for backward reference only; not used by src/index.ts.
import { randomUUID } from 'crypto';
import { AgentResponse, Skill } from '../types';
import { FileLogger } from '../memory/FileLogger';
import { logCommand } from '../memory/SupabaseMemory';

interface RouteMeta {
  user: string;
  source: string;
  project?: string;
}

export class HermesAgent {
  private skills: Map<string, Skill>;

  constructor(skills: Skill[]) {
    this.skills = new Map(skills.map((s) => [s.command, s]));
  }

  async process(
    command: string,
    payload: Record<string, unknown>,
    meta: RouteMeta
  ): Promise<AgentResponse> {
    const trace_id = randomUUID();

    FileLogger.info('[HermesAgent] routing', { trace_id, command, user: meta.user });

    const skill = this.skills.get(command);

    if (!skill) {
      return {
        status: 'success',
        reply: `Unknown command: *${command}*\nType /help for available commands.`,
        next_actions: [],
        agent: 'HermesAgent',
        trace_id,
      };
    }

    try {
      const result = await skill.execute(payload);

      FileLogger.command(command, meta.user, meta.source, true);
      logCommand({ command, user_name: meta.user, source: meta.source, status: 'success' })
        .catch((err) => FileLogger.error('[HermesAgent] Supabase log failed', err));

      return { status: 'success', ...result, agent: 'HermesAgent', trace_id };
    } catch (err) {
      FileLogger.error(`[HermesAgent] skill ${command} threw`, err);
      FileLogger.command(command, meta.user, meta.source, false);
      logCommand({ command, user_name: meta.user, source: meta.source, status: 'failed' })
        .catch(() => undefined);

      return {
        status: 'error',
        reply: 'Internal error. Please try again.',
        next_actions: [],
        agent: 'HermesAgent',
        trace_id,
      };
    }
  }
}
