import { SubAgent, AgentMessage, AgentResponse, AgentRole, ExecutionContext } from '../types';
import { ApifyClient } from '../integrations/ApifyClient';
import { AnthropicClient } from '../integrations/AnthropicClient';
import { RAGStore } from '../rag/RAGStore';
import { addStep, timed } from '../trace/ExecutionTrace';
import { FileLogger } from '../memory/FileLogger';
import { withPersona } from '../llm/persona';
import { EconomicCalendarClient, type CalendarEvent } from '../integrations/EconomicCalendarClient';

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

      // ── Phase 6: macro context ─────────────────────────────────────────────
      const { result: macroBundle, duration_ms: macroMs } = await timed(async () => {
        const [news, intraday, calendar] = await Promise.all([
          ApifyClient.scrapeNews('Fed CPI DXY gold outlook XAUUSD inflation', 5).catch(() => []),
          ApifyClient.scrapeForexIntraday(tickers[0] ?? 'XAUUSD', 24).catch(() => []),
          EconomicCalendarClient.getUpcomingEvents({ hoursAhead: 24, currency: 'USD', minImpact: 'High' }).catch(() => []),
        ]);
        return { news, intraday, calendar };
      });
      addStep(ctx, {
        agent: this.name,
        action: 'fetch_macro_context',
        input: { tickers },
        output: { news: macroBundle.news.length, intraday: macroBundle.intraday.length, events: macroBundle.calendar.length },
        duration_ms: macroMs,
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

      // Append macro sections (raw — fed to Claude, not shown in reply)
      let macroText = '';
      if (macroBundle.intraday.length > 0) {
        const recent = macroBundle.intraday.slice(-12);
        const lines = recent.map((k) => {
          const hh = k.time_iso.slice(11, 16);
          return `  ${hh} UTC: O=${k.o.toFixed(2)} H=${k.h.toFixed(2)} L=${k.l.toFixed(2)} C=${k.c.toFixed(2)}`;
        }).join('\n');
        macroText += `\n\nLast 12 H1 candles (UTC):\n${lines}`;
      }
      if (macroBundle.news.length > 0) {
        const newsLines = macroBundle.news.slice(0, 5).map((a) => `  - ${a.title}`).join('\n');
        macroText += `\n\nMacro news headlines (Apify, 24h):\n${newsLines}`;
      }
      if (macroBundle.calendar.length > 0) {
        const evLines = macroBundle.calendar.slice(0, 6).map((e: CalendarEvent) => {
          const t = e.date_iso.slice(11, 16);
          const hu = e.hours_until != null ? ` (in ${e.hours_until}h)` : '';
          const fp = e.forecast || e.previous ? ` [F:${e.forecast ?? '?'} P:${e.previous ?? '?'}]` : '';
          return `  - ${t} UTC ${e.country} ${e.impact}: ${e.title}${hu}${fp}`;
        }).join('\n');
        macroText += `\n\nUSD high-impact events (next 24h, ForexFactory):\n${evLines}`;
      } else {
        macroText += `\n\nUSD high-impact events (next 24h): (none scheduled)`;
      }

      const fullDataText = `${dataText}${macroText}`;

      const { result: summary, duration_ms: llmMs } = await timed(() =>
        AnthropicClient.chat(
          [{ role: 'user', content: `Phân tích dữ liệu XAUUSD:\n\n${fullDataText}` }],
          {
            system: withPersona(
              'Bạn ở vai trò Forex/Commodities analyst chuyên gold (XAU/USD). Dữ liệu giá đến từ COMEX Gold Futures (GC=F).\n\n' +
              'Anh sẽ nhận 4 LỚP data:\n' +
              '  1. Spot + daily 5 candles — trend tổng quan\n' +
              '  2. H1 intraday (12 candles gần nhất) — momentum trong ngày\n' +
              '  3. Macro news headlines — Fed/CPI/DXY context\n' +
              '  4. Economic calendar — events sắp tới trong 24h\n\n' +
              'Format reply (Markdown):\n' +
              '## 📊 Trạng thái hiện tại\n' +
              '   [Spot price + change% + daily range. 1-2 câu nhận xét lầy nếu có drama. CHÍNH XÁC về số.]\n\n' +
              '## ⏱ H1 intraday\n' +
              '   [Đọc 12 H1 candles: momentum, breakout/pullback, vùng giao tranh. Có thể slang.]\n\n' +
              '## 📰 Macro context\n' +
              '   [Tóm 2-3 dòng từ news headlines. Nếu thấy keyword Fed/DXY/CPI liên quan price action, NÊU RÕ.]\n\n' +
              '## 📅 Events tới 24h\n' +
              '   [List ngắn events high-impact. Đặc biệt note nếu < 6h tới — đó là trade-time risk.]\n\n' +
              '## 🎯 Key levels & Sentiment\n' +
              '   - Support: [từ candles thật, daily + H1]\n' +
              '   - Resistance: [tương tự]\n' +
              '   - Sentiment: [slang OK ở đây]\n\n' +
              '## ⚠️ Cảnh báo (nếu có)\n' +
              '   [Chỉ thêm khi có risk rõ — break support, event < 6h, news major]\n\n' +
              'KHÔNG đưa khuyến nghị buy/sell. KHÔNG nói "anh nên mua giá X". ' +
              'KHI events high-impact < 6h tới: cảnh báo KHÔNG hold position qua event. ' +
              'KHI macro news không có hoặc không liên quan: viết "Macro yên ắng, focus pure price action". ' +
              'Sử dụng tiếng Việt thuần. KHÔNG chèn từ Hàn/Trung.',
            ),
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
        content: `${fullDataText}\n\n${summary}`,
        source: 'market_summary',
        tags: ['market', 'summary', 'macro', ...tickers],
      });

      FileLogger.info('[MarketSummaryAgent] done', { tickers });
      return {
        status: 'success',
        reply: `*Market Summary*\n\n${dataText}\n\n${summary}`,
        next_actions: ['/write_thread', '/publish_telegram'],
        agent: this.name,
        trace_id: ctx.trace_id,
        meta: {
          tickers,
          data_points: marketData.length,
          h1_candles: macroBundle.intraday.length,
          news_articles: macroBundle.news.length,
          upcoming_events: macroBundle.calendar.length,
        },
      };
    } catch (err) {
      FileLogger.error('[MarketSummaryAgent] failed', err);
      return { status: 'error', reply: 'Market summary failed.', next_actions: [], agent: this.name, trace_id: ctx.trace_id };
    }
  }
}
