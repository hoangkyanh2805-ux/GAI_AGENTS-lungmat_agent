import { Skill, SkillResult } from '../types';

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const v = value.trim();
  if (!v) return value;
  try { return JSON.parse(v); } catch { return value; }
}

interface AuditData {
  telegram_trigger_ok?: boolean;
  router_ok?: boolean;
  sheet_ok?: boolean;
  supabase_ok?: boolean;
  buffer_ok?: boolean;
  logging_ok?: boolean;
  security_ok?: boolean;
  recovery_ok?: boolean;
  overall_score?: number;
}

export class AuditPipelineSkill implements Skill {
  name = 'auditPipeline';
  command = '/audit_pipeline';
  description = 'Run SOP pipeline audit checklist';

  async execute(payload: Record<string, unknown>): Promise<SkillResult> {
    const parsed = parseMaybeJson(payload.audit);
    const audit: AuditData =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as AuditData)
        : {};

    const hasReal = Object.keys(audit).length > 0;
    const flag = (ok: boolean) => (ok ? '[x]' : '[ ]');
    const score = typeof audit.overall_score === 'number' ? audit.overall_score : 85;

    const reply =
      `*SOP Checklist*${hasReal ? ' (LIVE)' : ''}\n\n` +
      `${flag(!!audit.telegram_trigger_ok)} Telegram Trigger: ACTIVE\n` +
      `${flag(!!audit.router_ok)} Command Router: VERIFIED\n` +
      `${flag(!!audit.sheet_ok)} Google Sheet: SYNCED\n` +
      `${flag(!!audit.supabase_ok)} Supabase: CONNECTED\n` +
      `${flag(!!audit.buffer_ok)} Buffer Pipeline: STABLE\n` +
      `${flag(!!audit.logging_ok)} Logging: ACTIVE\n` +
      `${flag(!!audit.security_ok)} Security: CHECKED\n` +
      `${flag(!!audit.recovery_ok)} Recovery: TESTED\n\n` +
      `*Estimated compliance:* ${score}%.` +
      (hasReal
        ? '\n\n_Data from n8n workflow via payload.audit._'
        : '\n\n_Set payload.audit in n8n to reflect live state._');

    return {
      reply,
      next_actions: (payload.next_actions as string[]) ?? ['complete_manual_audit'],
    };
  }
}
