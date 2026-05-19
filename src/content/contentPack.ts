import type { BrandId } from '../config/brands';
import type { ContentPackApprovals } from './contentApprovals';

export interface YoutubePack {
  title: string;
  description: string;
  tags: string[];
  /** Voiceover + optional [on-screen] cues — 45–60s Shorts */
  shorts_script: string;
  thumbnail_brief: string;
  /** Generated thumbnail image URL (OpenAI gpt-image-2) */
  thumbnail_image_url?: string;
}

export interface ContentPack {
  brand: BrandId;
  topic: string;
  telegram_brief: string;
  x_thread: string;
  threads_post: string;
  youtube_pack: YoutubePack;
  /** Generated content/post image URL (OpenAI gpt-image-2) */
  content_image_url?: string;
}

const REQUIRED_KEYS = [
  'telegram_brief',
  'x_thread',
  'threads_post',
  'youtube_pack',
] as const;

export function extractJsonObject(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? raw).trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end <= start) {
    throw new Error('No JSON object found in LLM response');
  }
  return JSON.parse(candidate.slice(start, end + 1)) as unknown;
}

export function parseContentPack(raw: string, brand: BrandId, topic: string): ContentPack {
  const obj = extractJsonObject(raw) as Record<string, unknown>;
  for (const k of REQUIRED_KEYS) {
    if (!(k in obj)) throw new Error(`Missing field: ${k}`);
  }
  const yp = obj.youtube_pack as Record<string, unknown>;
  if (!yp || typeof yp !== 'object') throw new Error('youtube_pack must be object');
  if (typeof yp.shorts_script !== 'string' || !yp.shorts_script.trim()) {
    throw new Error('youtube_pack.shorts_script is required');
  }

  return {
    brand,
    topic,
    telegram_brief: String(obj.telegram_brief),
    x_thread: String(obj.x_thread),
    threads_post: String(obj.threads_post),
    youtube_pack: {
      title: String(yp.title ?? `${topic} | ${brand}`),
      description: String(yp.description ?? ''),
      tags: Array.isArray(yp.tags) ? yp.tags.map(String) : [],
      shorts_script: String(yp.shorts_script),
      thumbnail_brief: String(yp.thumbnail_brief ?? ''),
    },
  };
}

export function mockContentPack(brand: BrandId, topic: string): ContentPack {
  return {
    brand,
    topic,
    telegram_brief: `*${brand.toUpperCase()} Brief (mock)*\n\nTopic: ${topic}\n\nMock Telegram body for testing.`,
    x_thread: [
      '1/ Mock thread opener — gold markets in focus.',
      '2/ Context line for testing content pack.',
      '3/ Takeaway for traders watching XAUUSD.',
      '4/ No financial advice — narrative only.',
      '5/ #XAUUSD #Gold',
    ].join('\n\n'),
    threads_post: `Mock Threads post: ${topic.slice(0, 120)} — #gold`,
    youtube_pack: {
      title: `[MOCK Shorts] ${topic.slice(0, 50)}`,
      description: `Mock YouTube description for ${brand}. CTA: join Telegram channel.`,
      tags: ['XAUUSD', 'gold', 'trading', brand],
      shorts_script: [
        '[0-3s HOOK] "Ae có thấy vàng đang kể chuyện gì không?"',
        '[3-15s] Mock setup — chart liquidity / session context.',
        '[15-45s] 2–3 điểm chính từ topic — không khuyến nghị entry.',
        '[45-60s] CTA: follow channel, risk disclaimer.',
      ].join('\n'),
      thumbnail_brief: 'Dark finance aesthetic, bold text hook, gold chart blur background',
    },
  };
}

export function formatContentReply(pack: ContentPack, approvals?: ContentPackApprovals): string {
  const y = pack.youtube_pack;
  const tags = y.tags.length ? y.tags.join(', ') : '(none)';
  let body =
    `*Content Pack — ${pack.brand.toUpperCase()}*\n` +
    `Topic: _${pack.topic}_\n\n` +
    `---\n*📱 Telegram brief*\n${pack.telegram_brief}\n\n` +
    `---\n*𝕏 X thread* _(→ Typefully)_\n${pack.x_thread}\n\n` +
    `---\n*🧵 Threads*\n${pack.threads_post}\n\n` +
    `---\n*▶️ YouTube Shorts* _(→ Studio)_\n` +
    `*Title:* ${y.title}\n` +
    `*Tags:* ${tags}\n\n` +
    `*Script:*\n${y.shorts_script}\n\n` +
    `*Thumbnail:* ${y.thumbnail_brief}\n\n` +
    `*Description:*\n${y.description}`;

  if (pack.youtube_pack.thumbnail_image_url) {
    body += `\n\n*🖼 Thumbnail Image:* ${pack.youtube_pack.thumbnail_image_url}`;
  }
  if (pack.content_image_url) {
    body += `\n*🖼 Content Image:* ${pack.content_image_url}`;
  }

  if (approvals) {
    body +=
      `\n\n⏳ *Approvals* (pack \`${approvals.pack_id.slice(0, 8)}…\`)\n` +
      `• TG: \`${approvals.telegram.id}\` — nút *Publish TG* trên admin DM\n` +
      `• X: \`${approvals.x.id}\` — approve → copy Typefully\n` +
      `• Threads: \`${approvals.threads.id}\`\n` +
      `_YouTube: paste script vào Studio (không cần approve trong bot)._`;
  }
  return body;
}
