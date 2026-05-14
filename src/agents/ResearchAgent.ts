import { SubAgent, AgentMessage, AgentResponse, AgentRole, ExecutionContext } from '../types';
import { ApifyClient } from '../integrations/ApifyClient';
import { RAGStore } from '../rag/RAGStore';
import { addStep, timed } from '../trace/ExecutionTrace';
import { FileLogger } from '../memory/FileLogger';

export class ResearchAgent implements SubAgent {
  readonly name = 'ResearchAgent';
  readonly role: AgentRole = 'research';

  async process(message: AgentMessage, ctx: ExecutionContext): Promise<AgentResponse> {
    const rawTopic = (message.payload.topic as string | undefined) ?? message.content.replace('/research', '').trim();
    const topic = rawTopic || 'AI market trends';
    const limit = (message.payload.limit as number | undefined) ?? 5;

    try {
      const { result: articles, duration_ms: scrapeMs } = await timed(() =>
        ApifyClient.scrapeNews(topic, limit),
      );
      addStep(ctx, {
        agent: this.name,
        action: 'scrape_news',
        input: { topic, limit },
        output: { count: articles.length },
        duration_ms: scrapeMs,
      });

      const combined = articles.map((a) => `## ${a.title}\n${a.content}`).join('\n\n---\n\n');
      const doc = RAGStore.ingest({
        title: `Research: ${topic}`,
        content: combined,
        source: 'apify',
        tags: [topic, 'research', 'news'],
      });
      addStep(ctx, {
        agent: this.name,
        action: 'ingest_rag',
        input: { doc_id: doc.id },
        output: { ingested: true },
        duration_ms: 0,
      });

      FileLogger.info('[ResearchAgent] done', { topic, articles: articles.length, doc_id: doc.id });

      const preview = articles.slice(0, 3).map((a) => `• ${a.title}`).join('\n');
      return {
        status: 'success',
        reply: `*Research complete: ${topic}*\n\n${preview}\n\n+${Math.max(0, articles.length - 3)} more → ingested as doc \`${doc.id}\``,
        next_actions: ['/market_summary', '/write_thread'],
        agent: this.name,
        trace_id: ctx.trace_id,
        meta: { doc_id: doc.id, article_count: articles.length, topic },
      };
    } catch (err) {
      FileLogger.error('[ResearchAgent] failed', err);
      return { status: 'error', reply: 'Research failed. Please try again.', next_actions: [], agent: this.name, trace_id: ctx.trace_id };
    }
  }
}
