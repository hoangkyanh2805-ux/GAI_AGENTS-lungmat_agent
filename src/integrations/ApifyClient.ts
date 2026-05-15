import axios from 'axios';
import { ENV } from '../config/env';
import { Article, MarketData } from '../types';
import { FileLogger } from '../memory/FileLogger';

const BASE = 'https://api.apify.com/v2';
const ACTOR_ID = 'apify/google-search-scraper';

export interface ApifyDiagnostics {
  apifyActorId: string;
  apifyMode: 'real' | 'mock';
  hasApifyToken: boolean;
  fallbackReason?: string;
  apifyErrorMessage?: string;
}

// Updated on every scrapeNews call so ResearchAgent and /debug_env can surface it.
let lastDiagnostics: ApifyDiagnostics = {
  apifyActorId: ACTOR_ID,
  apifyMode: 'mock',
  hasApifyToken: false,
};

// Re-read process.env each call — ENV is frozen at module load and would miss
// a .env that dotenv loads after module init (e.g., runtime.js late copy scenario).
function resolveToken(): string {
  return process.env.APIFY_API_TOKEN || process.env.APIFY_TOKEN || ENV.APIFY_API_TOKEN;
}

function isMock(): boolean {
  return !resolveToken() || process.env.MOCK_LLM === '1';
}

function mockArticles(query: string, limit: number): Article[] {
  return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
    title: `[Mock] ${query}: Key Development #${i + 1}`,
    url: `https://example.com/article-${i + 1}`,
    content: `Mock content for "${query}" article ${i + 1}. This covers recent trends, market movements, and expert analysis for testing purposes.`,
    source: 'mock',
    published_at: new Date().toISOString(),
  }));
}

// Normalize Apify Google Search Scraper output which may be paginated
// (each item has `organicResults[]`) or flat (each item is a result directly).
function normalizeApifyItems(items: Array<Record<string, unknown>>): Article[] {
  const out: Article[] = [];
  for (const item of items) {
    if (Array.isArray(item.organicResults)) {
      for (const r of item.organicResults as Array<Record<string, unknown>>) {
        const title = String(r.title ?? '').trim();
        if (title) {
          out.push({
            title,
            url: String(r.url ?? ''),
            content: String(r.description ?? r.snippet ?? ''),
            source: 'google',
            published_at: new Date().toISOString(),
          });
        }
      }
    } else {
      const title = String(item.title ?? '').trim();
      if (title) {
        out.push({
          title,
          url: String(item.url ?? ''),
          content: String(item.description ?? item.snippet ?? ''),
          source: 'google',
          published_at: new Date().toISOString(),
        });
      }
    }
  }
  return out;
}

const MOCK_PRICES: Record<string, number> = {
  BTC: 65000, ETH: 3200, SPY: 520, AAPL: 185, MSFT: 415, NVDA: 880,
};

function mockMarketData(tickers: string[]): MarketData[] {
  return tickers.map((ticker) => ({
    ticker,
    price: MOCK_PRICES[ticker] ?? 100 + Math.random() * 50,
    change: parseFloat((Math.random() * 10 - 5).toFixed(2)),
    change_pct: parseFloat((Math.random() * 3 - 1.5).toFixed(2)),
    volume: Math.floor(Math.random() * 50_000_000 + 1_000_000),
    timestamp: new Date().toISOString(),
  }));
}

async function runActor(actorId: string, input: Record<string, unknown>): Promise<unknown[]> {
  const token = resolveToken();
  const { data: startData } = await axios.post(
    `${BASE}/acts/${encodeURIComponent(actorId)}/runs?token=${token}`,
    input,
    { timeout: 10_000 },
  );
  const runId: string = startData.data.id;
  const datasetId: string = startData.data.defaultDatasetId;

  // Poll until complete (max 90s)
  for (let i = 0; i < 45; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const { data: info } = await axios.get(`${BASE}/actor-runs/${runId}?token=${token}`);
    const { status } = info.data;
    if (status === 'SUCCEEDED') break;
    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status as string)) {
      throw new Error(`Apify run ${runId} ended with status: ${status}`);
    }
  }

  const { data: items } = await axios.get(
    `${BASE}/datasets/${datasetId}/items?token=${token}&format=json`,
  );
  return Array.isArray(items) ? items : [];
}

export const ApifyClient = {
  async scrapeNews(query: string, limit = 5): Promise<Article[]> {
    const hasToken = !!resolveToken();
    if (isMock()) {
      const fallbackReason = !hasToken ? 'no_token' : 'mock_llm_flag';
      lastDiagnostics = { apifyActorId: ACTOR_ID, apifyMode: 'mock', hasApifyToken: hasToken, fallbackReason };
      FileLogger.info('[ApifyClient] scrapeNews mock mode', { query, limit, fallbackReason });
      return mockArticles(query, limit);
    }
    lastDiagnostics = { apifyActorId: ACTOR_ID, apifyMode: 'real', hasApifyToken: true };
    FileLogger.info('[ApifyClient] scrapeNews using real Apify', { query, limit, hasToken: true });
    try {
      const raw = (await runActor(ACTOR_ID, {
        queries: query,
        maxPagesPerQuery: 1,
        resultsPerPage: limit,
      })) as Array<Record<string, unknown>>;
      const articles = normalizeApifyItems(raw).slice(0, limit);
      if (articles.length === 0) {
        lastDiagnostics = { apifyActorId: ACTOR_ID, apifyMode: 'mock', hasApifyToken: true, fallbackReason: 'empty_results' };
        FileLogger.info('[ApifyClient] scrapeNews Apify returned 0 results — falling back to mock', {
          query, fallbackReason: 'empty_results',
        });
        return mockArticles(query, limit);
      }
      FileLogger.info('[ApifyClient] scrapeNews Apify complete', { count: articles.length });
      return articles;
    } catch (err) {
      const apifyErrorMessage = err instanceof Error ? err.message : String(err);
      lastDiagnostics = { apifyActorId: ACTOR_ID, apifyMode: 'mock', hasApifyToken: true, fallbackReason: 'api_error', apifyErrorMessage };
      FileLogger.info('[ApifyClient] scrapeNews Apify failed — falling back to mock', {
        query, apifyErrorMessage, fallbackReason: 'api_error',
      });
      return mockArticles(query, limit);
    }
  },

  async scrapeMarketData(tickers: string[]): Promise<MarketData[]> {
    // Forex/commodity tickers go through Yahoo Finance — better quality than Google Search scraping
    const FOREX_TICKERS = new Set(['XAUUSD', 'XAGUSD', 'EURUSD', 'GBPUSD', 'USDJPY']);
    if (tickers.every((t) => FOREX_TICKERS.has(t))) return this.scrapeForexData(tickers);

    if (isMock()) {
      const fallbackReason = !resolveToken() ? 'no_token' : 'mock_llm_flag';
      FileLogger.info('[ApifyClient] scrapeMarketData mock mode', { tickers, fallbackReason });
      return mockMarketData(tickers);
    }
    FileLogger.info('[ApifyClient] scrapeMarketData using real Apify', { tickers, hasToken: true });
    try {
      const query = tickers.map((t) => `${t} stock price today`).join('\n');
      const raw = (await runActor('apify/google-search-scraper', {
        queries: query,
        maxPagesPerQuery: 1,
        resultsPerPage: 3,
      })) as Array<Record<string, unknown>>;
      const items = normalizeApifyItems(raw);
      // Parse what we can; fall back to mock prices for missing tickers
      return tickers.map((ticker) => {
        const hit = items.find((i) => i.title.toUpperCase().includes(ticker));
        const priceMatch = hit ? String(hit.content ?? '').match(/\$?([\d,]+\.?\d*)/) : null;
        const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : (MOCK_PRICES[ticker] ?? 100);
        return { ticker, price, change: 0, change_pct: 0, timestamp: new Date().toISOString() };
      });
    } catch (err) {
      const apifyError = err instanceof Error ? err.message : String(err);
      FileLogger.info('[ApifyClient] scrapeMarketData Apify failed — falling back to mock', {
        tickers, apifyError, fallbackReason: 'api_error',
      });
      return mockMarketData(tickers);
    }
  },

  async scrapeForexData(tickers: string[]): Promise<MarketData[]> {
    const FOREX_MAP: Record<string, string> = {
      XAUUSD: 'XAUUSD=X',
      XAGUSD: 'XAGUSD=X',
      EURUSD: 'EURUSD=X',
      GBPUSD: 'GBPUSD=X',
      USDJPY: 'USDJPY=X',
    };

    if (isMock()) {
      FileLogger.info('[ApifyClient] scrapeForexData mock mode', { tickers });
      return tickers.map((t) => ({
        ticker: t,
        price: t === 'XAUUSD' ? 2350.50 : 1.0,
        change: 0,
        change_pct: 0,
        timestamp: new Date().toISOString(),
      }));
    }

    const out: MarketData[] = [];
    for (const t of tickers) {
      const yahooSymbol = FOREX_MAP[t] ?? `${t}=X`;
      try {
        const { data } = await axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`,
          {
            params: { interval: '1d', range: '5d' },
            timeout: 10_000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          },
        );
        const result = data?.chart?.result?.[0];
        const meta   = result?.meta;
        const quotes = result?.indicators?.quote?.[0];
        if (meta && typeof meta.regularMarketPrice === 'number') {
          const price    = meta.regularMarketPrice as number;
          const prev     = typeof meta.chartPreviousClose === 'number' ? meta.chartPreviousClose as number : price;
          const change   = price - prev;
          const change_pct = prev ? (change / prev) * 100 : 0;

          const candles: Array<{ date: string; o: number; h: number; l: number; c: number }> = [];
          if (quotes && Array.isArray(result.timestamp)) {
            for (let i = 0; i < (result.timestamp as number[]).length; i++) {
              const o = (quotes.open  as number[])?.[i];
              const h = (quotes.high  as number[])?.[i];
              const l = (quotes.low   as number[])?.[i];
              const c = (quotes.close as number[])?.[i];
              if (o != null && h != null && l != null && c != null) {
                candles.push({
                  date: new Date((result.timestamp as number[])[i] * 1000).toISOString().slice(0, 10),
                  o, h, l, c,
                });
              }
            }
          }

          out.push({
            ticker: t,
            price,
            change,
            change_pct,
            timestamp: new Date().toISOString(),
            extra: {
              day_high:   meta.regularMarketDayHigh  ?? null,
              day_low:    meta.regularMarketDayLow   ?? null,
              prev_close: prev,
              candles_5d: candles,
            },
          });
          FileLogger.info('[ApifyClient] scrapeForexData ok', {
            ticker: t, price, change_pct: change_pct.toFixed(2),
          });
        } else {
          FileLogger.info('[ApifyClient] scrapeForexData no data — using mock price', { ticker: t });
          out.push({ ticker: t, price: t === 'XAUUSD' ? 2350 : 1, change: 0, change_pct: 0, timestamp: new Date().toISOString() });
        }
      } catch (err) {
        FileLogger.error('[ApifyClient] scrapeForexData failed', { ticker: t, err: String(err) });
        out.push({ ticker: t, price: t === 'XAUUSD' ? 2350 : 1, change: 0, change_pct: 0, timestamp: new Date().toISOString() });
      }
    }
    return out;
  },

  isMock,
  getLastDiagnostics(): ApifyDiagnostics { return { ...lastDiagnostics }; },
};
