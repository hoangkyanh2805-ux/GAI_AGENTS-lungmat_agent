import { LangGraphRunnableConfig } from "@langchain/langgraph";
import {
  BaseGeneratePostState,
  BaseGeneratePostUpdate,
} from "../agents/shared/nodes/generate-post/types.js";
import { generateAlphaPack } from "./pack-generator.js";
import { postPackToN8n } from "./webhook-out.js";
import { sendTelegramPackNotice } from "./telegram.js";

const DEFAULT_TOPIC =
  process.env.TOPIC?.trim() ||
  "XAUUSD daily brief — liquidity và macro (Fed, DXY)";

/**
 * LungMat F0: skip upload_post / X / LinkedIn — Haiku pack → n8n → TG notify.
 */
export async function schedulePostLungmat<
  State extends BaseGeneratePostState = BaseGeneratePostState,
  Update = BaseGeneratePostUpdate,
>(state: State, _config: LangGraphRunnableConfig): Promise<Update> {
  if (!state.post && !state.complexPost) {
    throw new Error("No post to export for LungMat webhook");
  }

  const topic =
    state.links?.[0]?.includes("gold") || state.links?.[0]?.includes("xau")
      ? DEFAULT_TOPIC
      : DEFAULT_TOPIC;

  console.log("[lungmat] Generating alpha-content-pack (Haiku)...");
  const pack = await generateAlphaPack({
    topic,
    report: state.report,
    post: state.post,
    complexPost: state.complexPost,
    links: state.links,
  });

  const status = (pack.compliance as { status?: string })?.status;
  if (status !== "PASS") {
    throw new Error(
      `Pack compliance FAIL: ${JSON.stringify(pack.compliance)}`,
    );
  }

  console.log("[lungmat] POST n8n webhook...");
  const { run_id } = await postPackToN8n(pack);

  try {
    await sendTelegramPackNotice(pack, run_id);
  } catch (e) {
    console.error("[lungmat] Telegram notify error:", e);
  }

  console.log(`[lungmat] Done run_id=${run_id} compliance=PASS`);
  return {} as Update;
}
