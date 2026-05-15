import { ApprovalStore, AmbiguousPrefixError } from '../approval/ApprovalStore';
import { TelegramClient } from '../integrations/TelegramClient';
import { ENV } from '../config/env';
import { FileLogger } from '../memory/FileLogger';
import type { SkillResult } from '../types';

export async function approvePublish(payload: Record<string, unknown>): Promise<SkillResult> {
  const approvalId = String(payload.approval_id ?? '').trim();
  if (!approvalId) return { reply: '⚠️ Missing approval_id', next_actions: [] };

  let approval;
  try { approval = ApprovalStore.approve(approvalId); }
  catch (err) {
    if (err instanceof AmbiguousPrefixError) return { reply: `⚠️ ${err.message}`, next_actions: [] };
    throw err;
  }
  if (!approval) return { reply: '⚠️ Approval not found or already resolved', next_actions: [] };

  if (!ENV.TELEGRAM_CHAT_ID) {
    FileLogger.error('[publishApproval] TELEGRAM_CHAT_ID not set — cannot publish', {});
    return { reply: '⚠️ TELEGRAM_CHAT_ID not configured', next_actions: [] };
  }

  try {
    await TelegramClient.sendMessage(ENV.TELEGRAM_CHAT_ID, approval.content);
    FileLogger.info('[publishApproval] published', { approvalId: approval.id, chatId: ENV.TELEGRAM_CHAT_ID });
    return { reply: '✅ Published to channel', next_actions: [] };
  } catch (err) {
    FileLogger.error('[publishApproval] send failed', err);
    return { reply: '⚠️ Publish failed (Telegram send error)', next_actions: [] };
  }
}

export async function rejectPublish(payload: Record<string, unknown>): Promise<SkillResult> {
  const approvalId = String(payload.approval_id ?? '').trim();
  if (!approvalId) return { reply: '⚠️ Missing approval_id', next_actions: [] };

  try {
    const approval = ApprovalStore.reject(approvalId);
    if (!approval) return { reply: '⚠️ Approval not found or already resolved', next_actions: [] };
    FileLogger.info('[publishApproval] rejected', { approvalId: approval.id });
    return { reply: '❌ Rejected — draft discarded', next_actions: [] };
  } catch (err) {
    if (err instanceof AmbiguousPrefixError) return { reply: `⚠️ ${err.message}`, next_actions: [] };
    throw err;
  }
}
