import {
  AgentMessage,
  AgentResponse,
  AgentRole,
  ExecutionContext,
  Skill,
  SubAgent,
} from '../types';
import { addStep, timed } from '../trace/ExecutionTrace';

export class SupportAgent implements SubAgent {
  readonly name = 'SupportAgent';
  readonly role: AgentRole = 'support';

  private skills: Map<string, Skill>;

  constructor(skills: Skill[]) {
    this.skills = new Map(skills.map((s) => [s.command, s]));
  }

  async process(message: AgentMessage, ctx: ExecutionContext): Promise<AgentResponse> {
    const cmd = message.command ?? message.content.trim().split(/\s+/)[0];
    const skill = this.skills.get(cmd);

    if (!skill) {
      return {
        status: 'success',
        reply: `Unknown command *${cmd}*. Type /help for available commands.`,
        next_actions: [],
        agent: this.name,
        trace_id: ctx.trace_id,
      };
    }

    const { result, duration_ms } = await timed(() => skill.execute(message.payload));

    addStep(ctx, {
      agent: this.name,
      action: `execute:${cmd}`,
      input: { command: cmd },
      output: { next_actions: result.next_actions },
      duration_ms,
    });

    return {
      status: 'success',
      ...result,
      agent: this.name,
      trace_id: ctx.trace_id,
    };
  }
}
