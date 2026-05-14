import { SubAgent, AgentMessage, AgentResponse, AgentRole, ExecutionContext } from '../types';
import { TelegramClient } from '../integrations/TelegramClient';
import { ApprovalStore } from '../approval/ApprovalStore';
import { addStep, timed } from '../trace/ExecutionTrace';
import { FileLogger } from '../memory/FileLogger';
import { ENV } from '../config/env';

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
    if (approval.status === 'rejected') {
      return this.err(`Approval \`${approvalId}\` was rejected.`, ['/write_thread'], ctx);
    }
    if (approval.status === 'pending') {
      return {
        status: 'success',
        reply: `⏳ Content is awaiting human approval.\n\nApprove: \`POST /approval/${approvalId}/approve\``,
        next_actions: [`POST /approval/${approvalId}/approve`],
        agent: this.name,
        trace_id: ctx.trace_id,
        meta: { approval_id: approvalId, status: 'pending' },
      };
    }

    // Approved — publish
    const chatId =
      (message.payload.chat_id as string | undefined) ??
      message.chat_id ??
      (ENV.TELEGRAM_CHAT_ID || 'mock_chat');

    try {
      const { result, duration_ms } = await timed(() =>
        TelegramClient.sendMessage(chatId, approval.content),
      );
      addStep(ctx, {
        agent: this.name,
        action: 'publish_telegram',
        input: { approval_id: approvalId, chat_id: chatId },
        output: { message_id: result.message_id },
        duration_ms,
      });

      FileLogger.info('[TelegramPublisherAgent] published', { approval_id: approvalId, message_id: result.message_id });
      return {
        status: 'success',
        reply: `✅ Published to Telegram!\nMessage ID: \`${result.message_id}\``,
        next_actions: [],
        agent: this.name,
        trace_id: ctx.trace_id,
        meta: { message_id: result.message_id, chat_id: chatId },
      };
    } catch (err) {
      FileLogger.error('[TelegramPublisherAgent] publish failed', err);
      return this.err('Telegram publish failed.', [], ctx);
    }
  }

  private err(reply: string, next_actions: string[], ctx: ExecutionContext): AgentResponse {
    return { status: 'error', reply, next_actions, agent: this.name, trace_id: ctx.trace_id };
  }
}
