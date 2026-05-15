import axios from 'axios';
import { ENV } from '../config/env';
import { Article, MarketData } from '../types';
import { FileLogger } from '../memory/FileLogger';

const BASE = 'https://api.apify.com/v2';

function isMock(): boolean {
  return !ENV.APIFY_API_TOKEN || process.env.MOCK_LLM === '1';
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
  const token = ENV.APIFY_API_TOKEN;
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
    if (isMock()) {
      FileLogger.info('[ApifyClient] scrapeNews mock mode', { query, limit });
      return mockArticles(query, limit);
    }
    FileLogger.info('[ApifyClient] scrapeNews real Apify', { query, limit });
    try {
      const raw = (await runActor('apify/google-search-scraper', {
        queries: query,
        maxPagesPerQuery: 1,
        resultsPerPage: limit,
      })) as Array<Record<string, unknown>>;
      const articles = normalizeApifyItems(raw).slice(0, limit);
      if (articles.length === 0) {
        FileLogger.info('[ApifyClient] scrapeNews Apify returned 0 results — falling back to mock', { query });
        return mockArticles(query, limit);
      }
      FileLogger.info('[ApifyClient] scrapeNews Apify complete', { count: articles.length });
      return articles;
    } catch (err) {
      FileLogger.info('[ApifyClient] scrapeNews Apify failed — falling back to mock', {
        query, error: err instanceof Error ? err.message : String(err),
      });
      return mockArticles(query, limit);
    }
  },

  async scrapeMarketData(tickers: string[]): Promise<MarketData[]> {
    if (isMock()) {
      FileLogger.info('[ApifyClient] scrapeMarketData mock mode', { tickers });
      return mockMarketData(tickers);
    }
    FileLogger.info('[ApifyClient] scrapeMarketData real Apify', { tickers });
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
      FileLogger.info('[ApifyClient] scrapeMarketData Apify failed — falling back to mock', {
        tickers, error: err instanceof Error ? err.message : String(err),
      });
      return mockMarketData(tickers);
    }
  },

  isMock,
};
