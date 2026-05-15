import { SubAgent, AgentMessage, AgentResponse, AgentRole, ExecutionContext } from '../types';
import { ApifyClient } from '../integrations/ApifyClient';
import { AnthropicClient } from '../integrations/AnthropicClient';
import { RAGStore } from '../rag/RAGStore';
import { addStep, timed } from '../trace/ExecutionTrace';
import { FileLogger } from '../memory/FileLogger';

const DEFAULT_TICKERS = ['XAUUSD'];

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
        .map((d) => {
          let line = `${d.ticker}: $${d.price.toFixed(2)} (${d.change_pct >= 0 ? '+' : ''}${d.change_pct.toFixed(2)}%)`;
          if (d.extra) {
            if (d.extra.day_high != null && d.extra.day_low != null) {
              line += `\n  Daily range: ${d.extra.day_low.toFixed(2)} – ${d.extra.day_high.toFixed(2)}`;
            }
            if (d.extra.candles_5d && d.extra.candles_5d.length > 0) {
              const c = d.extra.candles_5d
                .map((k) => `${k.date}: O=${k.o.toFixed(2)} H=${k.h.toFixed(2)} L=${k.l.toFixed(2)} C=${k.c.toFixed(2)}`)
                .join('\n  ');
              line += `\n  Recent 5d candles:\n  ${c}`;
            }
          }
          return line;
        })
        .join('\n');

      const { result: summary, duration_ms: llmMs } = await timed(() =>
        AnthropicClient.chat(
          [{ role: 'user', content: `Phân tích dữ liệu XAUUSD:\n\n${dataText}` }],
          {
            system:
              'Bạn là Forex/Commodities analyst chuyên gold (XAU/USD). Dữ liệu giá đến từ COMEX Gold Futures (GC=F), ' +
              'sát với spot trong khoảng ±$20. Tóm tắt 2 đoạn ngắn (tiếng Việt): ' +
              '(1) trạng thái hiện tại — giá futures, daily range, change% vs prev close. ' +
              '(2) key levels — support/resistance gần nhất từ 5 candle vừa qua, sentiment chung. ' +
              'KHÔNG đưa ra recommendation buy/sell cụ thể. Sử dụng tiếng Việt thuần — KHÔNG chèn từ tiếng Hàn/Trung.',
          },
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
