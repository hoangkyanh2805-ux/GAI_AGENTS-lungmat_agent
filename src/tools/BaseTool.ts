import { ExecutionContext, ToolResult } from '../types';

export abstract class BaseTool {
  abstract readonly name: string;
  abstract readonly description: string;

  abstract execute(
    args: Record<string, unknown>,
    ctx: ExecutionContext
  ): Promise<ToolResult>;

  protected ok<T>(data: T): ToolResult<T> {
    return { ok: true, data };
  }

  protected fail(error: string): ToolResult {
    return { ok: false, error };
  }
}
