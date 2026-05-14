import { SubAgent, AgentMessage, AgentResponse, AgentRole, ExecutionContext } from '../types';
import { ApifyClient } from '../integrations/ApifyClient';
import { AnthropicClient } from '../integrations/AnthropicClient';
import { RAGStore } from '../rag/RAGStore';
import { addStep, timed } from '../trace/ExecutionTrace';
import { FileLogger } from '../memory/FileLogger';

const DEFAULT_TICKERS = ['BTC', 'ETH', 'SPY', 'AAPL', 'MSFT'];

export class MarketSummaryAgent implements SubAgent {
  readonly name = 'MarketSummaryAgent';
  readonly role: AgentRole = 'market_summary';

  async process(message: AgentMessage, ctx: ExecutionContext): Promise<AgentResponse> {
    const raw = message.payload.tickers;
    const tickers: string[] = Array.isArray(raw) ? (raw as string[]) : DEFAULT_TICKERS;

    try {
      const { result: marketData, duration_ms: fetchMs } = await timed(() =>
        ApifyClient.scrapeMarketData(tickers),
      );
      addStep(ctx, {
        agent: this.name,
        action: 'fetch_market_data',
        input: { tickers },
        output: { count: marketData.length },
        duration_ms: fetchMs,
      });

      const dataText = marketData
        .map((d) => `${d.ticker}: $${d.price.toFixed(2)} (${d.change_pct >= 0 ? '+' : ''}${d.change_pct.toFixed(2)}%)`)
        .join('\n');

      const { result: summary, duration_ms: llmMs } = await timed(() =>
        AnthropicClient.chat(
          [{ role: 'user', content: `Analyze this market data:\n\n${dataText}` }],
          { system: 'You are a concise market analyst. Provide a 2-paragraph market summary with key takeaways.' },
        ),
      );
      addStep(ctx, {
        agent: this.name,
        action: 'generate_summary',
        input: { tickers },
        output: { length: summary.length },
        duration_ms: llmMs,
      });

      RAGStore.ingest({
        title: `Market Summary ${new Date().toISOString().slice(0, 10)}`,
        content: `${dataText}\n\n${summary}`,
        source: 'market_summary',
        tags: ['market', 'summary', ...tickers],
      });

      FileLogger.info('[MarketSummaryAgent] done', { tickers });
      return {
        status: 'success',
        reply: `*Market Summary*\n\n${dataText}\n\n${summary}`,
        next_actions: ['/write_thread', '/publish_telegram'],
        agent: this.name,
        trace_id: ctx.trace_id,
        meta: { tickers, data_points: marketData.length },
      };
    } catch (err) {
      FileLogger.error('[MarketSummaryAgent] failed', err);
      return { status: 'error', reply: 'Market summary failed.', next_actions: [], agent: this.name, trace_id: ctx.trace_id };
    }
  }
}
