import { Skill, SkillResult } from '../types';

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const v = value.trim();
  if (!v) return value;
  try { return JSON.parse(v); } catch { return value; }
}

interface ContentRow {
  STATUS?: string;
  status?: string;
}

export class ReportTodaySkill implements Skill {
  name = 'reportToday';
  command = '/report_today';
  description = 'Daily content system report';

  async execute(payload: Record<string, unknown>): Promise<SkillResult> {
    const raw = parseMaybeJson(payload.rows);
    const rows: ContentRow[] = Array.isArray(raw) ? raw : [];

    if (rows.length === 0) {
      return {
        reply:
          '*Content System Report (Standby)*\n\n' +
          '⚠️ No data received from Google Sheets/Supabase via n8n yet.\n\n' +
          '*Mock data for testing:*\n' +
          '✅ Created: 15\n🚀 Published: 7\n\n' +
          '_Configure payload.rows in your n8n workflow to see live data._',
        next_actions: ['fix_gsheet_node'],
      };
    }

    const total = rows.length;
    const published = rows.filter(
      (r) => String(r.STATUS ?? r.status ?? '').toUpperCase() === 'PUBLISHED'
    ).length;
    const scheduled = rows.filter(
      (r) => String(r.STATUS ?? r.status ?? '').toUpperCase() === 'SCHEDULED'
    ).length;
    const drafts = total - published - scheduled;

    return {
      reply:
        '*Content System Report (LIVE)*\n\n' +
        `📊 Total rows: ${total}\n` +
        `🚀 Published: ${published}\n` +
        `📆 Scheduled: ${scheduled}\n` +
        `📝 Drafts/other: ${drafts}\n\n` +
        '_Data from n8n workflow via payload.rows._',
      next_actions: (payload.next_actions as string[]) ?? [],
    };
  }
}
