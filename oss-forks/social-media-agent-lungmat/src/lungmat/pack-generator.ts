import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ChatAnthropic } from "@langchain/anthropic";
import {
  getAnthropicModel,
  getBrandId,
  getPackPromptPath,
} from "./config.js";
import { validatePack, type AlphaPack } from "./compliance.js";

const DEFAULT_PACK_PROMPT = `Bạn là Alpha Content Writer. Trả ĐÚNG MỘT JSON object, không markdown.
Fields: brand, topic, telegram_brief, x_thread (array ≤280), threads_post (≤450), youtube_pack, compliance, data_status.
Tuân compliance Alpha: không entry/SL/TP, không URL trong tweet, institutional XAUUSD.`;

function loadSystemPrompt(): string {
  const candidates = [
    getPackPromptPath(),
    resolve(
      process.cwd(),
      "../../../services/alpha-factory/prompts/alpha_writer.md",
    ),
    resolve(
      process.cwd(),
      "../../services/alpha-factory/prompts/alpha_writer.md",
    ),
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    try {
      return readFileSync(p.startsWith("/") || /^[A-Za-z]:/.test(p) ? p : resolve(process.cwd(), p), "utf-8");
    } catch {
      /* try next */
    }
  }
  return DEFAULT_PACK_PROMPT;
}

function extractJson(text: string): AlphaPack {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("No JSON object in model response");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as AlphaPack;
}

function clip(text: unknown, limit: number): string {
  const value = String(text ?? "").trim();
  if (value.length <= limit) return value;
  return value.slice(0, limit - 3).trimEnd() + "...";
}

export type GeneratePackInput = {
  topic: string;
  report?: string;
  post?: string;
  complexPost?: { main_post: string; reply_post: string };
  links?: string[];
};

/** Haiku one-shot → alpha-content-pack (SSOT schema fields). */
export async function generateAlphaPack(
  input: GeneratePackInput,
): Promise<AlphaPack> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY missing");
  }

  const draft =
    input.complexPost != null
      ? `Main: ${input.complexPost.main_post}\nReply: ${input.complexPost.reply_post}`
      : input.post || "";

  const research = [
    input.report ? `Report:\n${input.report}` : "",
    draft ? `Draft post:\n${draft}` : "",
    input.links?.length ? `URLs:\n${input.links.join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const model = new ChatAnthropic({
    model: getAnthropicModel(),
    apiKey,
    maxTokens: 8192,
  });

  const user = `Topic: ${input.topic}

${research}

Sinh full Alpha content pack JSON theo system prompt. compliance.status phải PASS nếu tuân rules.`;

  const response = await model.invoke([
    { role: "system", content: loadSystemPrompt() },
    { role: "user", content: user },
  ]);

  const text =
    typeof response.content === "string"
      ? response.content
      : response.content
          .map((c) => ("text" in c ? c.text : ""))
          .join("");

  const pack = extractJson(text);
  pack.brand = getBrandId();
  pack.topic = input.topic;

  if (!Array.isArray(pack.x_thread)) {
    pack.x_thread =
      typeof pack.x_thread === "string"
        ? String(pack.x_thread)
            .split("\n")
            .filter((t) => t.trim())
        : draft
          ? [clip(draft, 280)]
          : [];
  }
  pack.x_thread = (pack.x_thread as string[]).map((t) => clip(t, 280));
  pack.threads_post = clip(pack.threads_post, 450);

  if (!pack.youtube_pack || typeof pack.youtube_pack !== "object") {
    pack.youtube_pack = {
      title: `XAUUSD brief — ${input.topic.slice(0, 60)}`,
      description: String(pack.telegram_brief ?? "").slice(0, 500),
      tags: ["XAUUSD", "gold", "macro"],
      shorts_script: String(pack.threads_post ?? ""),
      thumbnail_brief: "Gold chart, institutional tone, no price hype",
    };
  }

  if (!pack.image_prompts) {
    pack.image_prompts = [];
  }

  if (!pack.meta || typeof pack.meta !== "object") {
    pack.meta = {
      data_status: pack.data_status ?? "unverified",
      sources: (input.links ?? []).map((url) => ({ name: "url", url })),
      compliance: "PASS",
    };
  }

  return validatePack(pack);
}
