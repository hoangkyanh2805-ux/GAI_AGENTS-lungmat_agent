/**
 * Alpha F0 — invoke generate_post graph with one URL (FireCrawl → report → post → n8n).
 *
 * Prereq: yarn langgraph:in_mem:up
 * Env: .env with LUNGMAT_WEBHOOK_ONLY=true, ANTHROPIC_API_KEY, N8N_WEBHOOK_URL, LUNGMAT_PERSONA_PATH
 */
import "dotenv/config";
import { Client } from "@langchain/langgraph-sdk";
import {
  SKIP_CONTENT_RELEVANCY_CHECK,
  SKIP_USED_URLS_CHECK,
  TEXT_ONLY_MODE,
} from "../src/agents/generate-post/constants.js";
import { getAlphaContentUrl } from "../src/lungmat/config.js";

async function main() {
  const link =
    process.argv[2]?.trim() ||
    getAlphaContentUrl() ||
    "https://www.fxstreet.com/news/gold";

  if (!process.env.LUNGMAT_WEBHOOK_ONLY) {
    console.warn(
      "Set LUNGMAT_WEBHOOK_ONLY=true in .env to skip X/LinkedIn publish",
    );
  }

  const client = new Client({
    apiUrl: process.env.LANGGRAPH_API_URL || "http://localhost:54367",
  });

  console.log(`[alpha] generate_post links=[${link}]`);
  const { thread_id } = await client.threads.create();
  await client.runs.create(thread_id, "generate_post", {
    input: { links: [link] },
    config: {
      configurable: {
        [TEXT_ONLY_MODE]: true,
        [SKIP_CONTENT_RELEVANCY_CHECK]: true,
        [SKIP_USED_URLS_CHECK]: true,
      },
    },
  });
  console.log(`[alpha] run started thread_id=${thread_id}`);
  console.log(
    "Approve in Agent Inbox (humanNode) → schedulePost → n8n webhook",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
