import type { ApprovalPlatform } from '../types';

export interface ParsedApprovalCallback {
  action: 'approve' | 'reject';
  platform: ApprovalPlatform;
  approvalId: string;
}

const PLATFORM_ALIASES: Record<string, ApprovalPlatform> = {
  tg: 'telegram',
  telegram: 'telegram',
  x: 'x',
  th: 'threads',
  threads: 'threads',
  yt: 'youtube',
  youtube: 'youtube',
};

/**
 * Parses Telegram inline callback_data:
 * - `approve:<uuid>` / `reject:<uuid>` → telegram (legacy)
 * - `approve:tg:<uuid>` / `approve:x:<uuid>` / `approve:th:<uuid>`
 */
export function parseApprovalCallback(data: string): ParsedApprovalCallback | null {
  const parts = data.split(':');
  if (parts.length < 2) return null;
  const action = parts[0];
  if (action !== 'approve' && action !== 'reject') return null;

  if (parts.length === 2) {
    return {
      action,
      platform: 'telegram',
      approvalId: parts[1]!,
    };
  }

  if (parts.length >= 3) {
    const platRaw = parts[1]!.toLowerCase();
    const platform = PLATFORM_ALIASES[platRaw];
    if (!platform) return null;
    const approvalId = parts.slice(2).join(':');
    if (!approvalId) return null;
    return { action, platform, approvalId };
  }

  return null;
}
