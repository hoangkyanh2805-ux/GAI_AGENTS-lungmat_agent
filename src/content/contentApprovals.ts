import { randomUUID } from 'crypto';
import { ApprovalStore } from '../approval/ApprovalStore';
import { ENV } from '../config/env';
import { getBrand } from '../config/brands';
import { TelegramClient } from '../integrations/TelegramClient';
import { FileLogger } from '../memory/FileLogger';
import { ApprovalRequest } from '../types';
import type { ContentPack } from './contentPack';
import { formatTypefullyBundle } from '../integrations/TypefullyClient';

/**
 * Strip Telegram legacy Markdown special chars from text we inject into a
 * Markdown wrapper. LLM-generated content often contains unbalanced `_`, `*`,
 * `[ ]`, `` ` `` which break Telegram's parser and return 400 Bad Request.
 * We don't try to escape (\_ etc) — too fragile across arbitrary LLM output.
 */
function safePreview(s: string): string {
  return s.replace(/[_*`\[\]\\]/g, '');
}

export interface ContentPackApprovals {
  pack_id: string;
  telegram: ApprovalRequest;
  x: ApprovalRequest;
  threads: ApprovalRequest;
}

export function createContentPackApprovals(opts: {
  trace_id: string;
  pack: ContentPack;
  user: string;
  agent: string;
}): ContentPackApprovals {
  const pack_id = randomUUID();
  const { pack, trace_id, user, agent } = opts;
  const base = { trace_id, user, agent, brand: pack.brand, pack_id };

  const telegram = ApprovalStore.create({
    ...base,
    type: 'publish_telegram',
    platform: 'telegram',
    content: pack.telegram_brief,
  });
  const x = ApprovalStore.create({
    ...base,
    type: 'publish_other',
    platform: 'x',
    content: pack.x_thread,
  });
  const threads = ApprovalStore.create({
    ...base,
    type: 'publish_other',
    platform: 'threads',
    content: pack.threads_post,
  });

  FileLogger.info('[contentApprovals] created pack', {
    pack_id,
    brand: pack.brand,
    ids: { telegram: telegram.id, x: x.id, threads: threads.id },
  });

  return { pack_id, telegram, x, threads };
}

/** DM admin with per-platform approve buttons (7B). */
export async function sendContentApprovalDm(
  pack: ContentPack,
  approvals: ContentPackApprovals,
): Promise<void> {
  if (!ENV.ADMIN_TELEGRAM_CHAT_ID) {
    FileLogger.info('[contentApprovals] ADMIN_TELEGRAM_CHAT_ID not set — skip DM');
    return;
  }

  const brandCfg = getBrand(pack.brand);
  const typefully = formatTypefullyBundle(pack);
  const briefSlice = pack.telegram_brief.slice(0, 400);
  const briefEllipsis = pack.telegram_brief.length > 400 ? '…' : '';
  const typefullyLine = typefully.socialSet
    ? `Typefully set: ${safePreview(typefully.socialSet)}`
    : 'Typefully: paste manually';
  const preview =
    `📝 *Content pack — ${safePreview(brandCfg.displayName)}*\n` +
    `Topic: _${safePreview(pack.topic)}_\n` +
    `Pack: \`${approvals.pack_id.slice(0, 8)}…\`\n\n` +
    `*TG brief* (preview):\n${safePreview(briefSlice)}${briefEllipsis}\n\n` +
    `_${typefullyLine}_`;

  const tg = approvals.telegram.id;
  const xId = approvals.x.id;
  const th = approvals.threads.id;

  await TelegramClient.sendMessageWithButtons(ENV.ADMIN_TELEGRAM_CHAT_ID, preview, [
    [
      { text: '✅ TG → Channel', callback_data: `approve:tg:${tg}` },
      { text: '✅ X → Typefully', callback_data: `approve:x:${xId}` },
    ],
    [
      { text: '✅ Threads', callback_data: `approve:th:${th}` },
      { text: '❌ Reject TG', callback_data: `reject:tg:${tg}` },
    ],
  ]);
}
