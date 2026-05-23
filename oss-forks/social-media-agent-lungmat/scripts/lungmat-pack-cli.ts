/**
 * Standalone: research text → Haiku pack → n8n (+ optional TG notify).
 * Use when LangGraph is not running.
 *
 *   yarn lungmat:pack -- "headline context here"
 */
import "dotenv/config";
import { generateAlphaPack } from "../src/lungmat/pack-generator.js";
import { postPackToN8n } from "../src/lungmat/webhook-out.js";
import { sendTelegramPackNotice } from "../src/lungmat/telegram.js";

const dryRun = process.argv.includes("--dry-run");
const topic =
  process.env.TOPIC?.trim() ||
  "XAUUSD daily brief — liquidity và macro (Fed, DXY)";
const research =
  process.argv
    .slice(2)
    .filter((a) => a !== "--dry-run")
    .join("\n")
    .trim() || "Manual run — no URL ingest.";

async function main() {
  const pack = await generateAlphaPack({ topic, report: research });
  console.log(JSON.stringify(pack, null, 2).slice(0, 2500));
  console.log("compliance:", (pack.compliance as { status?: string })?.status);

  if ((pack.compliance as { status?: string })?.status !== "PASS") {
    process.exit(1);
  }
  if (dryRun) {
    console.log("--dry-run: skip webhook");
    return;
  }
  const { run_id } = await postPackToN8n(pack);
  await sendTelegramPackNotice(pack, run_id);
  console.log("run_id:", run_id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
