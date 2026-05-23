/** LungMat Alpha F0 — env helpers (webhook-only factory, no direct X/LI publish). */

export function isLungmatWebhookOnly(): boolean {
  return process.env.LUNGMAT_WEBHOOK_ONLY === "true";
}

export function getBrandId(): string {
  return process.env.BRAND_ID?.trim() || "alpha";
}

export function getN8nWebhookUrl(): string {
  return process.env.N8N_WEBHOOK_URL?.trim() || "";
}

export function getAnthropicModel(): string {
  return (
    process.env.ANTHROPIC_MODEL?.trim() || "claude-haiku-4-5-20251001"
  );
}

export function getTelegramBotToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
}

export function getTelegramAdminChatId(): string {
  return (
    process.env.N8N_TELEGRAM_ADMIN_CHAT_ID?.trim() ||
    process.env.TELEGRAM_ADMIN_CHAT_ID?.trim() ||
    ""
  );
}

export function getPersonaPath(): string | undefined {
  const p = process.env.LUNGMAT_PERSONA_PATH?.trim();
  return p || undefined;
}

export function getPackPromptPath(): string | undefined {
  return process.env.LUNGMAT_PACK_PROMPT_PATH?.trim() || undefined;
}

export function getAlphaContentUrl(): string | undefined {
  return process.env.ALPHA_CONTENT_URL?.trim() || undefined;
}

export function newRunId(): string {
  const now = new Date();
  const d = now.toISOString().slice(0, 10);
  const t = now.toISOString().slice(11, 16).replace(":", "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `alpha-${d}-${t}-${suffix}`;
}
