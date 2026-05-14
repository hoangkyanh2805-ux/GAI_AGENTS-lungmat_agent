import { Skill, SkillResult } from '../types';

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const v = value.trim();
  if (!v) return value;
  try { return JSON.parse(v); } catch { return value; }
}

interface ErrorEntry {
  workflow?: string;
  workflowName?: string;
  node?: string;
  nodeName?: string;
  message?: string;
  error?: string;
  severity?: string;
  lastRunAt?: string;
  timestamp?: string;
}

export class CheckErrorsSkill implements Skill {
  name = 'checkErrors';
  command = '/check_errors';
  description = 'Check system errors and incidents';

  async execute(payload: Record<string, unknown>): Promise<SkillResult> {
    const parsed = parseMaybeJson(payload.errors);
    const errors: ErrorEntry[] = Array.isArray(parsed) ? parsed : [];

    if (errors.length === 0) {
      return {
        reply:
          '*System Error Summary (Standby)*\n\n' +
          '1. *Buffer Auth Error*: Refresh token expired for Profile Alpha_X.\n' +
          '2. *Missing IMAGE_URL*: 3 rows in GSheet CONTENT_CALENDAR.\n' +
          '3. *n8n Execution Error*: Workflow Buffer_Publisher failed at HTTP Request node.\n\n' +
          '*Fix Hints:* Re-auth Buffer in n8n and check image generation logs.\n\n' +
          '_Map payload.errors in your n8n error collector node for live data._',
        next_actions: ['reauth_buffer', 'check_image_logs'],
      };
    }

    const lines = errors.map((err, i) => {
      const workflow = err.workflow ?? err.workflowName ?? 'Unknown workflow';
      const node = err.node ?? err.nodeName ?? 'Unknown node';
      const msg = err.message ?? err.error ?? 'No details';
      const severity = (err.severity ?? 'unknown').toUpperCase();
      const ts = err.lastRunAt ?? err.timestamp ?? null;
      let line = `${i + 1}. *${workflow}* → node *${node}* [${severity}]\n   • Error: ${msg}`;
      if (ts) line += `\n   • Last run: ${ts}`;
      return line;
    });

    return {
      reply:
        '*System Error Summary (LIVE)*\n\n' +
        lines.join('\n\n') +
        '\n\n_Data from n8n workflow via payload.errors._',
      next_actions: (payload.next_actions as string[]) ?? ['open_n8n_error_view'],
    };
  }
}
