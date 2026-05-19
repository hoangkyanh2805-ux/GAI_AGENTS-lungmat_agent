import { ApprovalStore, AmbiguousPrefixError } from '../approval/ApprovalStore';
import { approveAndPublish, publishApprovedContent, PublishError } from '../publish/telegramPublish';
import {
  formatTypefullyApprovalReply,
  TypefullyClient,
} from '../integrations/TypefullyClient';
import { FileLogger } from '../memory/FileLogger';
import type { ApprovalPlatform, ApprovalRequest } from '../types';
import type { SkillResult } from '../types';

function resolvePlatform(
  payload: Record<string, unknown>,
  approval: ApprovalRequest,
): ApprovalPlatform {
  const fromPayload = payload.platform as ApprovalPlatform | undefined;
  if (fromPayload) return fromPayload;
  if (approval.platform) return approval.platform;
  return approval.type === 'publish_telegram' ? 'telegram' : 'telegram';
}

export async function approvePublish(payload: Record<string, unknown>): Promise<SkillResult> {
  const approvalId = String(payload.approval_id ?? '').trim();
  if (!approvalId) return { reply: '⚠️ Missing approval_id', next_actions: [] };

  const chatId = payload.chat_id as string | number | undefined;

  let pending: ApprovalRequest | null;
  try {
    pending = ApprovalStore.get(approvalId);
  } catch (err) {
    if (err instanceof AmbiguousPrefixError) return { reply: `⚠️ ${err.message}`, next_actions: [] };
    throw err;
  }
  if (!pending) return { reply: '⚠️ Approval not found', next_actions: [] };
  if (pending.status !== 'pending') {
    return { reply: '⚠️ Approval not found or already resolved', next_actions: [] };
  }

  const platform = resolvePlatform(payload, pending);

  let approval: ApprovalRequest | null;
  try {
    approval = ApprovalStore.approve(approvalId, 'human');
  } catch (err) {
    if (err instanceof AmbiguousPrefixError) return { reply: `⚠️ ${err.message}`, next_actions: [] };
    throw err;
  }
  if (!approval) return { reply: '⚠️ Approval not found or already resolved', next_actions: [] };

  if (platform === 'telegram') {
    try {
      const sent = await publishApprovedContent(approval, chatId);
      return {
        reply:
          `✅ Published to Telegram\n` +
          `Approval: \`${approval.id}\`\n` +
          `Brand: ${approval.brand ?? 'default'}\n` +
          `Message ID: \`${sent.message_id}\`\n` +
          `Chat: \`${sent.chat_id}\``,
        next_actions: [],
      };
    } catch (err) {
      if (err instanceof PublishError) return { reply: `⚠️ ${err.userMessage}`, next_actions: [] };
      throw err;
    }
  }

  if (platform === 'x' || platform === 'threads') {
    let extra = '';
    if (platform === 'x') {
      const handoff = await TypefullyClient.handoffXThread(approval);
      if (handoff.draftId && !handoff.copyOnly) {
        extra = `\n_Typefully draft id:_ \`${handoff.draftId}\``;
      }
    }
    FileLogger.info('[publishApproval] platform approved (copy handoff)', {
      approvalId: approval.id,
      platform,
      brand: approval.brand,
    });
    return {
      reply: formatTypefullyApprovalReply(approval, platform) + extra,
      next_actions: [],
    };
  }

  return {
    reply: `✅ Approved (\`${platform}\`) — no auto-publish for this platform.`,
    next_actions: [],
  };
}

/** Legacy one-step: approve + publish TG only. */
export async function approveAndPublishTelegram(
  payload: Record<string, unknown>,
): Promise<SkillResult> {
  return approvePublish({ ...payload, platform: 'telegram' });
}

export async function rejectPublish(payload: Record<string, unknown>): Promise<SkillResult> {
  const approvalId = String(payload.approval_id ?? '').trim();
  if (!approvalId) return { reply: '⚠️ Missing approval_id', next_actions: [] };

  try {
    const approval = ApprovalStore.reject(approvalId);
    if (!approval) return { reply: '⚠️ Approval not found or already resolved', next_actions: [] };
    FileLogger.info('[publishApproval] rejected', {
      approvalId: approval.id,
      platform: approval.platform,
    });
    const plat = approval.platform ?? 'draft';
    return { reply: `❌ Rejected (${plat}) — \`${approval.id.slice(0, 8)}…\``, next_actions: [] };
  } catch (err) {
    if (err instanceof AmbiguousPrefixError) return { reply: `⚠️ ${err.message}`, next_actions: [] };
    throw err;
  }
}
