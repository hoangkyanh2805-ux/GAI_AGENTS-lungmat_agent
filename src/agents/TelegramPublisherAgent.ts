import { SubAgent, AgentMessage, AgentResponse, AgentRole, ExecutionContext } from '../types';
import { ApprovalStore } from '../approval/ApprovalStore';
import { addStep, timed } from '../trace/ExecutionTrace';
import { FileLogger } from '../memory/FileLogger';
import { publishApprovedContent, PublishError } from '../publish/telegramPublish';

export class TelegramPublisherAgent implements SubAgent {
  readonly name = 'TelegramPublisherAgent';
  readonly role: AgentRole = 'telegram_publisher';

  async process(message: AgentMessage, ctx: ExecutionContext): Promise<AgentResponse> {
    const approvalId = message.payload.approval_id as string | undefined;

    if (!approvalId) {
      return this.err('Missing `approval_id` in payload. Run /write_thread first.', ['/write_thread'], ctx);
    }

    const approval = ApprovalStore.get(approvalId);
    if (!approval) {
      return this.err(`Approval \`${approvalId}\` not found.`, [], ctx);
    }
    if (approval.status === 'pending') {
      return {
        status: 'success',
        reply:
          `⏳ Content is awaiting human approval.\n\n` +
          `• One-step: \`/approve_publish\` with \`approval_id\`\n` +
          `• Or: \`POST /approval/${approvalId}/approve\` then run \`/publish_telegram\` again`,
        next_actions: [`/approve_publish`, `POST /approval/${approvalId}/approve`],
        agent: this.name,
        trace_id: ctx.trace_id,
        meta: { approval_id: approvalId, status: 'pending' },
      };
    }

    const chatId =
      (message.payload.chat_id as string | number | undefined) ??
      message.chat_id;

    try {
      const { result, duration_ms } = await timed(() =>
        publishApprovedContent(approval, chatId),
      );
      addStep(ctx, {
        agent: this.name,
        action: 'publish_telegram',
        input: { approval_id: approvalId, chat_id: result.chat_id },
        output: { message_id: result.message_id },
        duration_ms,
      });

      return {
        status: 'success',
        reply: `✅ Published to Telegram!\nMessage ID: \`${result.message_id}\``,
        next_actions: [],
        agent: this.name,
        trace_id: ctx.trace_id,
        meta: { message_id: result.message_id, chat_id: result.chat_id },
      };
    } catch (err) {
      if (err instanceof PublishError) {
        return this.err(err.userMessage, approval.status === 'rejected' ? ['/write_thread'] : [], ctx);
      }
      FileLogger.error('[TelegramPublisherAgent] publish failed', err);
      return this.err('Telegram publish failed.', [], ctx);
    }
  }

  private err(reply: string, next_actions: string[], ctx: ExecutionContext): AgentResponse {
    return { status: 'error', reply, next_actions, agent: this.name, trace_id: ctx.trace_id };
  }
}
