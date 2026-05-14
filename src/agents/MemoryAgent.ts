import {
  AgentMessage,
  AgentResponse,
  AgentRole,
  ExecutionContext,
  SubAgent,
} from '../types';
import { addStep } from '../trace/ExecutionTrace';
import { MemoryManager } from '../memory/MemoryManager';

export class MemoryAgent implements SubAgent {
  readonly name = 'MemoryAgent';
  readonly role: AgentRole = 'memory';

  constructor(private memory: MemoryManager) {}

  async process(message: AgentMessage, ctx: ExecutionContext): Promise<AgentResponse> {
    const cmd = message.command ?? '';
    const { payload } = message;

    switch (cmd) {
      case '/memory_store': {
        if (typeof payload.key !== 'string' || !payload.key) {
          return this.err('payload.key (string) is required for /memory_store', ctx);
        }
        this.memory.set(payload.key, payload.value, { agent: ctx.user });
        addStep(ctx, { agent: this.name, action: 'memory_store', input: { key: payload.key }, output: { stored: true }, duration_ms: 0 });
        return this.ok(`*Memory stored* ✅\nKey: \`${payload.key}\``, [], ctx);
      }

      case '/memory_get': {
        if (typeof payload.key !== 'string' || !payload.key) {
          return this.err('payload.key (string) is required for /memory_get', ctx);
        }
        const val = this.memory.get(payload.key);
        addStep(ctx, { agent: this.name, action: 'memory_get', input: { key: payload.key }, output: { found: val !== undefined }, duration_ms: 0 });
        if (val === undefined) {
          return this.ok(`*Memory miss*\nKey \`${payload.key}\` not found.`, [], ctx);
        }
        return this.ok(
          `*Memory hit* ✅\nKey: \`${payload.key}\`\n\`\`\`\n${JSON.stringify(val, null, 2)}\n\`\`\``,
          [],
          ctx
        );
      }

      case '/memory_list': {
        const keys = this.memory.keys();
        addStep(ctx, { agent: this.name, action: 'memory_list', output: { count: keys.length }, duration_ms: 0 });
        const list = keys.length
          ? keys.map((k) => `• \`${k}\``).join('\n')
          : '_(empty)_';
        return this.ok(`*Memory Keys (${keys.length}):*\n${list}`, [], ctx);
      }

      default:
        return this.err(`Unknown memory command: ${cmd}`, ctx);
    }
  }

  private ok(reply: string, next_actions: string[], ctx: ExecutionContext): AgentResponse {
    return { status: 'success', reply, next_actions, agent: this.name, trace_id: ctx.trace_id };
  }

  private err(msg: string, ctx: ExecutionContext): AgentResponse {
    return { status: 'error', reply: msg, next_actions: [], agent: this.name, trace_id: ctx.trace_id };
  }
}
