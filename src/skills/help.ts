import { Skill, SkillResult } from '../types';
import { COMMANDS } from '../config/commands';

export class HelpSkill implements Skill {
  name = 'help';
  command = '/help';
  description = 'List all available commands';

  async execute(_payload: Record<string, unknown>): Promise<SkillResult> {
    const list = Object.values(COMMANDS)
      .map((c) => `*${c.command}*: ${c.description}`)
      .join('\n');

    return {
      reply: `*Linh Cẩu Trader* 🐆 — Full menu lệnh:\n\n${list}\n\nDùng lệnh gì cứ gõ thẳng ae, em nghe 🔥`,
      next_actions: [],
    };
  }
}
