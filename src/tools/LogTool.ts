import { ExecutionContext, ToolResult } from '../types';
import { BaseTool } from './BaseTool';
import { FileLogger } from '../memory/FileLogger';

export class LogTool extends BaseTool {
  readonly name = 'log';
  readonly description = 'Write a structured log entry to the agent log file';

  async execute(
    args: Record<string, unknown>,
    _ctx: ExecutionContext
  ): Promise<ToolResult> {
    const level = String(args.level ?? 'info');
    const message = String(args.message ?? '');
    const data = (args.data as Record<string, unknown> | undefined) ?? {};

    if (level === 'error') {
      FileLogger.error(message, data);
    } else {
      FileLogger.info(message, data);
    }
    return this.ok({ logged: true, level, message });
  }
}
