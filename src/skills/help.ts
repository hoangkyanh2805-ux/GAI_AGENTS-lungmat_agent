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
      reply: `*Available Commands:*\n\n${list}`,
      next_actions: [],
    };
  }
}
