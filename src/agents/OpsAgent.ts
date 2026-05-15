import { SubAgent, AgentMessage, AgentResponse, AgentRole, ExecutionContext } from '../types';
import { JobQueue } from '../queue/JobQueue';
import { ApprovalStore } from '../approval/ApprovalStore';
import { ApifyClient } from '../integrations/ApifyClient';
import { addStep } from '../trace/ExecutionTrace';

export class OpsAgent implements SubAgent {
  readonly name = 'OpsAgent';
  readonly role: AgentRole = 'ops';

  async process(message: AgentMessage, ctx: ExecutionContext): Promise<AgentResponse> {
    const cmd = message.command ?? '';

    switch (cmd) {
      case '/queue_status': {
        const jobs = JobQueue.list();
        const byStatus = {
          pending: jobs.filter((j) => j.status === 'pending').length,
          running: jobs.filter((j) => j.status === 'running').length,
          done:    jobs.filter((j) => j.status === 'done').length,
          failed:  jobs.filter((j) => j.status === 'failed').length,
        };
        const recent = jobs
          .slice(-5)
          .reverse()
          .map((j) => `• \`${j.type}\` [${j.status}] \`${j.id.slice(0, 8)}\``)
          .join('\n');
        addStep(ctx, { agent: this.name, action: 'queue_status', output: byStatus, duration_ms: 0 });
        return this.ok(
          `*Job Queue Status*\n\n` +
          `⏳ Pending: ${byStatus.pending} | ▶️ Running: ${byStatus.running} | ✅ Done: ${byStatus.done} | ❌ Failed: ${byStatus.failed}\n\n` +
          `*Recent:*\n${recent || '_(empty)_'}`,
          [],
          ctx,
          { ...byStatus, total: jobs.length },
        );
      }

      case '/approval_list': {
        const status = message.payload.status as 'pending' | 'approved' | 'rejected' | undefined;
        const approvals = ApprovalStore.list(status);
        addStep(ctx, { agent: this.name, action: 'approval_list', output: { count: approvals.length }, duration_ms: 0 });
        const shown = approvals.slice(0, 10);
        const list = shown
          .map((a) => `• [${a.status}] \`${a.id}\` — ${a.type} by ${a.agent}`)
          .join('\n');
        return this.ok(
          `*Approval Queue (${approvals.length}):*\n${list || '_(none)_'}`,
          [],
          ctx,
          { approvals: shown.map((a) => ({ id: a.id, status: a.status, type: a.type, agent: a.agent })) },
        );
      }

      case '/debug_env': {
        // Returns safe booleans and Apify diagnostics — never prints secret values
        const apifyDiag = ApifyClient.getLastDiagnostics();
        const envStatus: Record<string, unknown> = {
          hasApifyToken:      !!(process.env.APIFY_API_TOKEN || process.env.APIFY_TOKEN),
          mockLlm:            process.env.MOCK_LLM === '1',
          telegramConfigured: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
          supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
          apifyActorId:       apifyDiag.apifyActorId,
          ...(apifyDiag.apifyErrorMessage ? { apifyLastError: apifyDiag.apifyErrorMessage } : {}),
        };
        addStep(ctx, { agent: this.name, action: 'debug_env', output: envStatus, duration_ms: 0 });
        return this.ok(
          `*Environment Status:*\n\`\`\`json\n${JSON.stringify(envStatus, null, 2)}\n\`\`\``,
          [],
          ctx,
          envStatus,
        );
      }

      default:
        return this.err(`Unknown ops command: ${cmd}`, ctx);
    }
  }

  private ok(reply: string, next_actions: string[], ctx: ExecutionContext, meta?: Record<string, unknown>): AgentResponse {
    return { status: 'success', reply, next_actions, agent: this.name, trace_id: ctx.trace_id, ...(meta ? { meta } : {}) };
  }

  private err(reply: string, ctx: ExecutionContext): AgentResponse {
    return { status: 'error', reply, next_actions: [], agent: this.name, trace_id: ctx.trace_id };
  }
}
