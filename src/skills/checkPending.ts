import { Skill, SkillResult } from '../types';

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const v = value.trim();
  if (!v) return value;
  try { return JSON.parse(v); } catch { return value; }
}

interface PendingStats {
  rows_waiting_approval?: number;
  missing_image_urls?: number;
  drafts_needing_review?: number;
  failed_jobs_to_retry?: number;
}

export class CheckPendingSkill implements Skill {
  name = 'checkPending';
  command = '/check_pending';
  description = 'List pending tasks and approvals';

  async execute(payload: Record<string, unknown>): Promise<SkillResult> {
    const parsed = parseMaybeJson(payload.pending_stats);
    const stats: PendingStats =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as PendingStats)
        : {};

    if (!Object.keys(stats).length) {
      return {
        reply:
          '*Pending Tasks Summary (Standby)*\n\n' +
          '- 📝 5 rows awaiting approval in GSheet.\n' +
          '- 🖼️ 2 posts missing image URLs.\n' +
          '- 👁️ 4 drafts need final review.\n' +
          '- 🔄 1 failed job needs retry.\n\n' +
          '*Suggestion:* Review 3 priority rows to clear the queue.\n\n' +
          '_Map payload.pending_stats in n8n to show live numbers._',
        next_actions: ['approve_rows', 'fix_missing_urls'],
      };
    }

    return {
      reply:
        '*Pending Tasks Summary (LIVE)*\n\n' +
        `- 📝 Rows awaiting approval: ${stats.rows_waiting_approval ?? 0}\n` +
        `- 🖼️ Posts missing image URLs: ${stats.missing_image_urls ?? 0}\n` +
        `- 👁️ Drafts needing review: ${stats.drafts_needing_review ?? 0}\n` +
        `- 🔄 Failed jobs to retry: ${stats.failed_jobs_to_retry ?? 0}\n\n` +
        '_Stats from n8n workflow via payload.pending_stats._',
      next_actions: (payload.next_actions as string[]) ?? ['approve_rows', 'fix_missing_urls'],
    };
  }
}
