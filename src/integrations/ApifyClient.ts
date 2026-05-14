import axios from 'axios';
import { ENV } from '../config/env';
import { Article, MarketData } from '../types';

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
    if (isMock()) return mockArticles(query, limit);
    const items = (await runActor('apify/google-search-scraper', {
      queries: query,
      maxPagesPerQuery: 1,
      resultsPerPage: limit,
    })) as Array<Record<string, unknown>>;
    return items.slice(0, limit).map((item) => ({
      title: String(item.title ?? ''),
      url: String(item.url ?? ''),
      content: String(item.description ?? item.snippet ?? ''),
      source: 'google',
      published_at: new Date().toISOString(),
    }));
  },

  async scrapeMarketData(tickers: string[]): Promise<MarketData[]> {
    if (isMock()) return mockMarketData(tickers);
    const query = tickers.map((t) => `${t} stock price today`).join('\n');
    const items = (await runActor('apify/google-search-scraper', {
      queries: query,
      maxPagesPerQuery: 1,
      resultsPerPage: 3,
    })) as Array<Record<string, unknown>>;
    // Parse what we can; fall back to mock prices for missing tickers
    return tickers.map((ticker) => {
      const hit = items.find((i) => String(i.title ?? '').toUpperCase().includes(ticker));
      const priceMatch = hit ? String(hit.description ?? '').match(/\$?([\d,]+\.?\d*)/) : null;
      const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : (MOCK_PRICES[ticker] ?? 100);
      return { ticker, price, change: 0, change_pct: 0, timestamp: new Date().toISOString() };
    });
  },

  isMock,
};
