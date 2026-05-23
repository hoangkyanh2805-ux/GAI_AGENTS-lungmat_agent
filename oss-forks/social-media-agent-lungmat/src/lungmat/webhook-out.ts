import { getBrandId, getN8nWebhookUrl, newRunId } from "./config.js";
import type { AlphaPack } from "./compliance.js";

export type WebhookBody = {
  brand: string;
  run_id: string;
  pack: AlphaPack;
};

export function buildWebhookBody(pack: AlphaPack, runId?: string): WebhookBody {
  return {
    brand: getBrandId(),
    run_id: runId ?? newRunId(),
    pack,
  };
}

export async function postPackToN8n(
  pack: AlphaPack,
  runId?: string,
): Promise<{ status: number; body: string; run_id: string }> {
  const url = getN8nWebhookUrl();
  if (!url) {
    throw new Error("N8N_WEBHOOK_URL missing");
  }
  if (/YOUR-N8N|your-n8n/i.test(url)) {
    throw new Error("N8N_WEBHOOK_URL is still a placeholder");
  }

  const body = buildWebhookBody(pack, runId);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`n8n webhook ${res.status}: ${text.slice(0, 300)}`);
  }
  return { status: res.status, body: text, run_id: body.run_id };
}
