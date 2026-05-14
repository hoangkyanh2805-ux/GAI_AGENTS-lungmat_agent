import { Skill, SkillResult } from '../types';

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const v = value.trim();
  if (!v) return value;
  try { return JSON.parse(v); } catch { return value; }
}

interface LeadData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  note?: string;
}

export class LeadCaptureSkill implements Skill {
  name = 'leadCapture';
  command = '/lead_capture';
  description = 'Capture a new sales lead from payload';

  async execute(payload: Record<string, unknown>): Promise<SkillResult> {
    const raw = parseMaybeJson(payload.lead ?? payload);
    const lead: LeadData =
      raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as LeadData) : {};

    if (!lead.name && !lead.email) {
      return {
        reply:
          '*Lead Capture*\n\n' +
          '⚠️ No lead data provided. Send via payload.lead:\n\n' +
          '```json\n{"name":"...", "email":"...", "company":"..."}\n```',
        next_actions: ['fill_lead_form'],
      };
    }

    const fields = [
      lead.name    ? `👤 Name: ${lead.name}`       : null,
      lead.email   ? `📧 Email: ${lead.email}`     : null,
      lead.phone   ? `📞 Phone: ${lead.phone}`     : null,
      lead.company ? `🏢 Company: ${lead.company}` : null,
      lead.source  ? `📌 Source: ${lead.source}`   : null,
      lead.note    ? `📝 Note: ${lead.note}`       : null,
    ]
      .filter(Boolean)
      .join('\n');

    return {
      reply: `*Lead Captured ✅*\n\n${fields}\n\n_Add to your CRM or follow-up pipeline._`,
      next_actions: ['add_to_crm', 'schedule_followup'],
    };
  }
}
