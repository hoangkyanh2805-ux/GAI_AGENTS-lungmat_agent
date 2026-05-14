import { ExecutionContext, MemoryEntry, ToolResult } from '../types';
import { BaseTool } from './BaseTool';
import { MemoryManager } from '../memory/MemoryManager';

export class SearchMemoryTool extends BaseTool {
  readonly name = 'search_memory';
  readonly description = 'Search agent memory by key prefix; omit prefix to list all';

  constructor(private memory: MemoryManager) {
    super();
  }

  async execute(
    args: Record<string, unknown>,
    _ctx: ExecutionContext
  ): Promise<ToolResult<MemoryEntry[]>> {
    const prefix = typeof args.prefix === 'string' ? args.prefix : '';
    const entries = this.memory.entries().filter((e) =>
      prefix ? e.key.startsWith(prefix) : true
    );
    return this.ok(entries);
  }
}
