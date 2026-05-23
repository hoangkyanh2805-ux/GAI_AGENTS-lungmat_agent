/** Firecrawl scrape — v4 SDK default export is v2; LangChain loader expects v1 scrapeUrl. */
import { FirecrawlAppV1 } from "@mendable/firecrawl-js";

export type ScrapeResult = {
  markdown: string;
  metadata?: Record<string, unknown>;
  screenshot?: string;
};

export async function scrapeUrlMarkdown(
  url: string,
  params?: { formats?: string[] },
): Promise<ScrapeResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY missing");

  const app = new FirecrawlAppV1({ apiKey });
  const response = await app.scrapeUrl(url, {
    formats: params?.formats ?? ["markdown"],
  });

  if (!response || typeof response !== "object" || !("success" in response)) {
    throw new Error(`Firecrawl: invalid response for ${url}`);
  }
  if (!response.success) {
    const err = "error" in response ? String(response.error) : "unknown";
    throw new Error(`Firecrawl scrape failed: ${err}`);
  }

  const data = response as {
    markdown?: string;
    html?: string;
    rawHtml?: string;
    metadata?: Record<string, unknown>;
    screenshot?: string;
  };

  const markdown =
    data.markdown || data.html || data.rawHtml || "";
  if (!markdown.trim()) {
    throw new Error(`Firecrawl: empty content for ${url}`);
  }

  return {
    markdown,
    metadata: data.metadata,
    screenshot: data.screenshot,
  };
}
