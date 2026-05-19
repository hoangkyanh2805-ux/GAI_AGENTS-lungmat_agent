import fs from 'fs';
import path from 'path';
import { ENV } from './env';

export type BrandId = 'alpha' | 'raymond' | 'vip10x';

export const BRAND_IDS: BrandId[] = ['alpha', 'raymond', 'vip10x'];

export interface BrandConfig {
  id: BrandId;
  displayName: string;
  /** Env var name holding Telegram channel chat id for this brand */
  telegramChatIdEnv: string;
  personaId: BrandId;
  xHandle?: string;
  typefullySet?: string;
}

const BRANDS_FILE = path.join(__dirname, '../../config/brands.json');

function loadBrandMap(): Record<BrandId, BrandConfig> {
  const raw = JSON.parse(fs.readFileSync(BRANDS_FILE, 'utf8')) as Record<string, BrandConfig>;
  const out = {} as Record<BrandId, BrandConfig>;
  for (const id of BRAND_IDS) {
    if (raw[id]) out[id] = raw[id];
  }
  return out;
}

const BRANDS = loadBrandMap();

/** Map user input → canonical brand id */
export function resolveBrandId(raw: string): BrandId | null {
  const n = raw.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (n === 'alpha' || n === 'alphatradinglab') return 'alpha';
  if (n === 'raymond' || n === 'raymondgold') return 'raymond';
  if (n === 'vip10x' || n === 'vip' || n === '10x' || n === 'goldmaster') return 'vip10x';
  return BRAND_IDS.includes(n as BrandId) ? (n as BrandId) : null;
}

export function getBrand(id: BrandId): BrandConfig {
  const b = BRANDS[id];
  if (!b) throw new Error(`Unknown brand: ${id}`);
  return b;
}

export function listBrands(): BrandConfig[] {
  return BRAND_IDS.map((id) => BRANDS[id]).filter(Boolean);
}

/** Channel id for publish — brand env, else fallback global TELEGRAM_CHAT_ID */
export function getBrandTelegramChatId(id: BrandId): string {
  const cfg = getBrand(id);
  const fromBrand = process.env[cfg.telegramChatIdEnv] ?? '';
  if (fromBrand) return fromBrand;
  return ENV.TELEGRAM_CHAT_ID;
}

/**
 * Strict brand chat id lookup — returns the brand-specific TELEGRAM_CHAT_ID_<BRAND>
 * if present and non-empty, otherwise null. Used by 7D-1 cron to skip publish when
 * a brand's channel is not yet configured (e.g. raymond/vip10x pre-launch).
 */
export function resolveBrandChatId(brand: BrandId): string | null {
  const cfg = BRANDS[brand];
  if (!cfg) return null;
  const chatId = process.env[cfg.telegramChatIdEnv];
  return chatId && chatId.trim() ? chatId : null;
}

export interface ParsedContentInput {
  brand: BrandId;
  topic: string;
}

/** Parse /content <brand> <topic...> from payload or message tail */
export function parseContentInput(
  messageContent: string,
  payload: Record<string, unknown>,
): ParsedContentInput | { error: string } {
  const explicitBrand = payload.brand as string | undefined;
  if (explicitBrand) {
    const brand = resolveBrandId(explicitBrand);
    if (!brand) {
      return { error: `Unknown brand \`${explicitBrand}\`. Use: alpha, raymond, vip10x` };
    }
    const topic =
      (payload.topic as string | undefined)?.trim() ||
      (payload.text as string | undefined)?.trim() ||
      messageContent.replace(/^\/content\b/i, '').replace(explicitBrand, '').trim() ||
      defaultTopic(brand);
    return { brand, topic };
  }

  const raw =
    (payload.topic as string | undefined)?.trim() ||
    (payload.text as string | undefined)?.trim() ||
    messageContent.replace(/^\/content\b/i, '').trim();

  if (!raw) {
    return { error: 'Usage: `/content <brand> <topic>`\nBrands: `alpha`, `raymond`, `vip10x`' };
  }

  const parts = raw.split(/\s+/);
  const first = parts[0] ?? '';
  const brand = resolveBrandId(first);
  if (!brand) {
    return {
      error: `First word must be brand: alpha | raymond | vip10x\nGot: \`${first}\``,
    };
  }
  const topic = parts.slice(1).join(' ').trim() || defaultTopic(brand);
  return { brand, topic };
}

function defaultTopic(brand: BrandId): string {
  const defaults: Record<BrandId, string> = {
    alpha: 'XAUUSD liquidity structure and smart money context',
    raymond: 'gold trading discipline and psychology for retail traders',
    vip10x: 'London session gold volatility and momentum narrative',
  };
  return defaults[brand];
}
