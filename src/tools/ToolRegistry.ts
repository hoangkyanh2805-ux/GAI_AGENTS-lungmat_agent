import { ExecutionContext, ToolResult } from '../types';
import { BaseTool } from './BaseTool';
import { FileLogger } from '../memory/FileLogger';

export class ToolRegistry {
  private tools = new Map<string, BaseTool>();

  register(tool: BaseTool): this {
    this.tools.set(tool.name, tool);
    return this;
  }

  async call(
    name: string,
    args: Record<string, unknown>,
    ctx: ExecutionContext
  ): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      FileLogger.error(`[ToolRegistry] Unknown tool: ${name}`);
      return { ok: false, error: `Tool '${name}' not registered` };
    }
    try {
      return await tool.execute(args, ctx);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      FileLogger.error(`[ToolRegistry] Tool ${name} threw`, err);
      return { ok: false, error: msg };
    }
  }

  list(): string[] {
    return [...this.tools.keys()];
  }
}
