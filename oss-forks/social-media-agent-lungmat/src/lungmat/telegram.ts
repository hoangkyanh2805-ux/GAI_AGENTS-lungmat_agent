import { getTelegramAdminChatId, getTelegramBotToken } from "./config.js";
import type { AlphaPack } from "./compliance.js";

function previewText(pack: AlphaPack, runId: string): string {
  const tweets = Array.isArray(pack.x_thread) ? pack.x_thread : [];
  const threadPreview = tweets
    .slice(0, 3)
    .map((t, i) => `${i + 1}. ${String(t).slice(0, 120)}`)
    .join("\n");
  return [
    "🟡 *Alpha factory — pack sent to n8n*",
    `run_id: \`${runId}\``,
    `compliance: *${(pack.compliance as { status?: string })?.status ?? "?"}*`,
    "",
    "*Telegram brief (excerpt):*",
    String(pack.telegram_brief ?? "").slice(0, 400),
    "",
    "*X thread (preview):*",
    threadPreview || "(empty)",
    "",
    "Duyệt trên n8n workflow → OK đăng → Zernio.",
  ].join("\n");
}

/** Notify admin TG — replaces Slack schedule notification in webhook-only mode. */
export async function sendTelegramPackNotice(
  pack: AlphaPack,
  runId: string,
): Promise<void> {
  const token = getTelegramBotToken();
  const chatId = getTelegramAdminChatId();
  if (!token || !chatId) {
    console.warn(
      "[lungmat] TELEGRAM_BOT_TOKEN or N8N_TELEGRAM_ADMIN_CHAT_ID missing — skip TG notify",
    );
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: previewText(pack, runId),
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("[lungmat] Telegram notify failed:", err.slice(0, 300));
  }
}
