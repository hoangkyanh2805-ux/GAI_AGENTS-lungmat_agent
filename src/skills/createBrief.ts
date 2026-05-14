import { Skill, SkillResult } from '../types';

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const v = value.trim();
  if (!v) return value;
  try { return JSON.parse(v); } catch { return value; }
}

interface BriefFields {
  who?: string; WHO?: string;
  what?: string; WHAT?: string;
  where?: string; WHERE?: string;
  when?: string; WHEN?: string;
  why?: string; WHY?: string;
  how?: string; HOW?: string;
}

export class CreateBriefSkill implements Skill {
  name = 'createBrief';
  command = '/create_brief';
  description = 'Generate 5W1H content brief template';

  async execute(payload: Record<string, unknown>): Promise<SkillResult> {
    const parsed = parseMaybeJson(payload.brief_fields ?? payload.fields ?? {});
    const f: BriefFields =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as BriefFields)
        : {};

    let topicFromText = '';
    if (typeof payload.text === 'string') {
      topicFromText = payload.text.replace(/^\/create_brief\b/i, '').trim();
    }

    const who   = f.who   ?? f.WHO   ?? '(Target audience or owner)';
    const what  = f.what  ?? f.WHAT  ?? (topicFromText || '(Core message or automation goal)');
    const where = f.where ?? f.WHERE ?? '(Platform: Telegram, X, Facebook, etc.)';
    const when  = f.when  ?? f.WHEN  ?? '(Deadline or trigger time)';
    const why   = f.why   ?? f.WHY   ?? '(Goal: Engagement, Leads, Info)';
    const how   = f.how   ?? f.HOW   ?? '(Tools needed & success criteria)';

    return {
      reply:
        '*Content/Automation Brief (5W1H)*\n\n' +
        `*WHO:* ${who}\n` +
        `*WHAT:* ${what}\n` +
        `*WHERE:* ${where}\n` +
        `*WHEN:* ${when}\n` +
        `*WHY:* ${why}\n` +
        `*HOW:* ${how}\n\n` +
        '_Send /create_brief <topic> or set payload.brief_fields in n8n to auto-fill._',
      next_actions: (payload.next_actions as string[]) ?? [],
    };
  }
}
