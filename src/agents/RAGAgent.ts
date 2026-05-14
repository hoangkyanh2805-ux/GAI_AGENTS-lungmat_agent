import { SubAgent, AgentMessage, AgentResponse, AgentRole, ExecutionContext } from '../types';
import { RAGStore } from '../rag/RAGStore';
import { addStep } from '../trace/ExecutionTrace';

export class RAGAgent implements SubAgent {
  readonly name = 'RAGAgent';
  readonly role: AgentRole = 'rag';

  async process(message: AgentMessage, ctx: ExecutionContext): Promise<AgentResponse> {
    const cmd = message.command ?? '';
    const { payload } = message;

    switch (cmd) {
      case '/rag_search': {
        const query =
          (payload.query as string | undefined) ??
          message.content.replace('/rag_search', '').trim();
        if (!query) return this.err('payload.query is required for /rag_search', ctx);

        const limit = (payload.limit as number | undefined) ?? 5;
        const results = RAGStore.search(query, limit);
        addStep(ctx, {
          agent: this.name,
          action: 'rag_search',
          input: { query, limit },
          output: { count: results.length },
          duration_ms: 0,
        });

        if (!results.length) {
          return this.ok(`*RAG Search:* \`${query}\`\n\nNo results found. Try /research to ingest data first.`, [], ctx);
        }
        const list = results
          .map((r, i) => `${i + 1}. **${r.document.title}** (score: ${r.score})\n   \`${r.document.id}\``)
          .join('\n');
        return {
          status: 'success',
          reply: `*RAG Search: "${query}"*\n\n${list}`,
          next_actions: [],
          agent: this.name,
          trace_id: ctx.trace_id,
          meta: { query, results: results.map((r) => ({ id: r.document.id, title: r.document.title, score: r.score })) },
        };
      }

      case '/rag_ingest': {
        const title = payload.title as string | undefined;
        const content = payload.content as string | undefined;
        const source = (payload.source as string | undefined) ?? 'manual';
        const tags = (payload.tags as string[] | undefined) ?? [];

        if (!title || !content) return this.err('payload.title and payload.content are required for /rag_ingest', ctx);

        const doc = RAGStore.ingest({ title, content, source, tags });
        addStep(ctx, {
          agent: this.name,
          action: 'rag_ingest',
          input: { title, source },
          output: { doc_id: doc.id },
          duration_ms: 0,
        });
        return this.ok(`*Document Ingested* ✅\n\nID: \`${doc.id}\`\nTitle: ${doc.title}\nSource: ${doc.source}`, [], ctx, { doc_id: doc.id });
      }

      default:
        return this.err(`Unknown RAG command: ${cmd}`, ctx);
    }
  }

  private ok(reply: string, next_actions: string[], ctx: ExecutionContext, meta?: Record<string, unknown>): AgentResponse {
    return { status: 'success', reply, next_actions, agent: this.name, trace_id: ctx.trace_id, ...(meta ? { meta } : {}) };
  }

  private err(reply: string, ctx: ExecutionContext): AgentResponse {
    return { status: 'error', reply, next_actions: [], agent: this.name, trace_id: ctx.trace_id };
  }
}
