#!/usr/bin/env npx tsx
/**
 * Alpha Content Pack Generator — Layer 1 (OFF n8n)
 * Usage: npx tsx scripts/alpha-generate-pack.ts --topic "XAUUSD brief Fed DXY"
 * Output: output/alpha/{date}/{runId}.pack.json + {runId}.json (run stub)
 *
 * n8n picks up the stub via webhook or file-read node — no AI inside n8n.
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const topicIdx = args.indexOf("--topic");
const topic =
  topicIdx >= 0
    ? args[topicIdx + 1]
    : undefined;

const ROOT = path.resolve(__dirname, "..");

// ── Load config ───────────────────────────────────────────────────────────────
const systemPrompt = fs.readFileSync(
  path.join(ROOT, "config/n8n/prompts/alpha-writer-system.md"),
  "utf-8"
);

const brands = JSON.parse(
  fs.readFileSync(path.join(ROOT, "config/n8n/brands.json"), "utf-8")
);
const alpha = brands.brands.find((b: any) => b.id === "alpha-trading-lab");
if (!alpha) throw new Error("alpha-trading-lab not found in brands.json");

const effectiveTopic = topic ?? alpha.topic_default;

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeRunId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const hhmm = now.toTimeString().slice(0, 5).replace(":", "");
  const rand = Math.random().toString(36).slice(2, 6);
  return `alpha-${date}-${hhmm}-${rand}`;
}

function validatePack(pack: any): string[] {
  const errors: string[] = [];

  if (!pack.telegram_brief || pack.telegram_brief.length < 20)
    errors.push("telegram_brief too short");

  if (!Array.isArray(pack.x_thread) || pack.x_thread.length === 0)
    errors.push("x_thread empty");

  for (const tweet of pack.x_thread ?? []) {
    if (typeof tweet !== "string") { errors.push("x_thread item not string"); continue; }
    if (tweet.length > 280) errors.push(`tweet >280 chars (${tweet.length}): "${tweet.slice(0, 40)}..."`);
    if (/https?:\/\//.test(tweet)) errors.push("tweet contains URL");
  }

  if (!pack.threads_post || typeof pack.threads_post !== "string")
    errors.push("threads_post missing");
  else if (pack.threads_post.length > 500)
    errors.push(`threads_post >500 chars (${pack.threads_post.length})`);

  if (!pack.meta?.compliance)
    errors.push("meta.compliance missing");

  // Signal check
  const signalRe = /vào long|vào short|entry\s*@|SL\s*:|TP\s*:|lot size|chắc ăn|100%|guaranteed/i;
  if (signalRe.test(JSON.stringify(pack)))
    errors.push("signal/promise keyword detected");

  return errors;
}

function extractJson(raw: string): any {
  // Strip code fence if present
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonStr = fenced ? fenced[1] : raw.trim();
  return JSON.parse(jsonStr);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const client = new Anthropic();
  const runId = makeRunId();
  const dateStr = new Date().toISOString().slice(0, 10);
  const outDir = path.join(ROOT, "output/alpha", dateStr);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`[alpha-pack] runId   = ${runId}`);
  console.log(`[alpha-pack] topic   = ${effectiveTopic}`);
  console.log(`[alpha-pack] model   = claude-sonnet-4-5`);

  const userMessage = [
    `Topic: ${effectiveTopic}`,
    `Brand: ${alpha.name}`,
    `Persona: ${alpha.persona}`,
    `Hashtags: ${alpha.hashtags.join(", ")}`,
    `Rules: x_max_chars=${alpha.rules.x_max_chars}, threads_max_chars=${alpha.rules.threads_max_chars}, no_trade_signal=true`,
    ``,
    `Generate full content pack JSON only. No markdown wrapper.`,
  ].join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const rawText =
    response.content[0].type === "text" ? response.content[0].text : "";

  let pack: any;
  try {
    pack = extractJson(rawText);
  } catch (e) {
    console.error("[alpha-pack] JSON parse error:", (e as Error).message);
    console.error("[alpha-pack] raw (first 600):", rawText.slice(0, 600));
    process.exit(1);
  }

  const errors = validatePack(pack);
  const compliance = errors.length === 0 ? "PASS" : "FAIL";
  if (pack.meta) pack.meta.compliance = compliance;

  // Write pack.json
  const packPath = path.join(outDir, `${runId}.pack.json`);
  fs.writeFileSync(packPath, JSON.stringify(pack, null, 2));

  console.log(`[alpha-pack] compliance = ${compliance}`);
  if (errors.length > 0) console.warn("[alpha-pack] errors:", errors);
  console.log(`[alpha-pack] pack  → ${packPath}`);

  // Write run stub (n8n webhook payload)
  const stub = {
    run_id: runId,
    brand_id: "alpha-trading-lab",
    date: dateStr,
    topic: effectiveTopic,
    status: compliance === "PASS" ? "pack_ready" : "compliance_fail",
    pack_path: packPath,
    compliance: { status: compliance, errors },
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      cost_usd_estimate: +(
        response.usage.input_tokens * 0.000003 +
        response.usage.output_tokens * 0.000015
      ).toFixed(5),
    },
  };

  const stubPath = path.join(outDir, `${runId}.json`);
  fs.writeFileSync(stubPath, JSON.stringify(stub, null, 2));
  console.log(`[alpha-pack] stub  → ${stubPath}`);

  // Print n8n webhook payload
  console.log("\n[alpha-pack] n8n webhook payload:");
  console.log(JSON.stringify({ runId, packPath, stubPath, compliance, errors }, null, 2));

  if (compliance === "FAIL") process.exit(2);
}

main().catch((e) => {
  console.error("[alpha-pack] fatal:", e);
  process.exit(1);
});
