import { ApprovalStore, AmbiguousPrefixError } from '../approval/ApprovalStore';
import { ApprovalRequest } from '../types';
import { TelegramClient } from '../integrations/TelegramClient';
import { ENV } from '../config/env';
import { FileLogger } from '../memory/FileLogger';
import { resolveBrandId, getBrandTelegramChatId } from '../config/brands';

/** User-facing message — safe to return in agent replies. */
export class PublishError extends Error {
  constructor(public readonly userMessage: string) {
    super(userMessage);
    this.name = 'PublishError';
  }
}

export interface PublishResult {
  message_id: number;
  chat_id: string | number;
}

export function resolvePublishChatId(
  override?: string | number,
  brandRaw?: string,
): string | number {
  if (override != null && String(override).trim() !== '') return override;
  if (brandRaw) {
    const id = resolveBrandId(brandRaw);
    if (id) {
      const chat = getBrandTelegramChatId(id);
      if (chat) return chat;
    }
  }
  if (ENV.TELEGRAM_CHAT_ID) return ENV.TELEGRAM_CHAT_ID;
  if (TelegramClient.isMock()) return 'mock_chat';
  throw new PublishError('TELEGRAM_CHAT_ID not configured');
}

/** Send approved content to channel — single publish implementation for all entry points. */
export async function publishApprovedContent(
  approval: ApprovalRequest,
  chatId?: string | number,
): Promise<PublishResult> {
  if (approval.status === 'rejected') {
    throw new PublishError(`Approval \`${approval.id}\` was rejected.`);
  }
  if (approval.status === 'pending') {
    throw new PublishError(
      `Approval \`${approval.id}\` is still pending. Approve first (\`POST /approval/${approval.id}/approve\` or \`/approve_publish\`).`,
    );
  }

  const plat = approval.platform ?? 'telegram';
  if (plat !== 'telegram') {
    throw new PublishError(
      `Approval \`${approval.id}\` is for platform \`${plat}\` — use approve flow for Typefully copy, not Telegram publish.`,
    );
  }

  const targetChatId = resolvePublishChatId(chatId, approval.brand);
  const result = await TelegramClient.sendMessage(targetChatId, approval.content);
  FileLogger.info('[telegramPublish] published', {
    approvalId: approval.id,
    chatId: targetChatId,
    message_id: result.message_id,
  });
  return { message_id: result.message_id, chat_id: targetChatId };
}

/** Approve then publish — used by Telegram inline buttons and /approve_publish. */
export async function approveAndPublish(
  approvalId: string,
  reviewedBy = 'human',
  chatId?: string | number,
): Promise<{ approval: ApprovalRequest } & PublishResult> {
  let approval: ApprovalRequest | null;
  try {
    approval = ApprovalStore.approve(approvalId, reviewedBy);
  } catch (err) {
    if (err instanceof AmbiguousPrefixError) {
      throw new PublishError(err.message);
    }
    throw err;
  }
  if (!approval) {
    throw new PublishError('Approval not found or already resolved');
  }
  const sent = await publishApprovedContent(approval, chatId);
  return { approval, ...sent };
}
