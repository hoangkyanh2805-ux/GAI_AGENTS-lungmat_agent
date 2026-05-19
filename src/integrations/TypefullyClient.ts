import axios from 'axios';
import type { BrandId } from '../config/brands';
import { getBrand } from '../config/brands';
import type { ContentPack } from '../content/contentPack';
import { ApprovalRequest } from '../types';
import { FileLogger } from '../memory/FileLogger';

const TYPEFULLY_API = 'https://api.typefully.com/v1';

export interface TypefullyBundle {
  brand: BrandId;
  socialSet?: string;
  xHandle?: string;
  x_thread: string;
  threads_post: string;
  copy_block: string;
  typefully_copy_ready: true;
}

/** Formatted text for manual paste into Typefully editor (7C fallback). */
export function formatTypefullyBundle(pack: ContentPack): TypefullyBundle {
  const cfg = getBrand(pack.brand);
  const header = [
    `=== Typefully handoff — ${cfg.displayName} ===`,
    cfg.typefullySet ? `Social set: ${cfg.typefullySet}` : '(configure typefullySet in brands.json)',
    cfg.xHandle ? `X: ${cfg.xHandle}` : '',
    `Topic: ${pack.topic}`,
    '',
  ]
    .filter(Boolean)
    .join('\n');

  const copy_block =
    header +
    '\n--- X THREAD (paste as thread) ---\n' +
    pack.x_thread +
    '\n\n--- THREADS POST ---\n' +
    pack.threads_post;

  return {
    brand: pack.brand,
    socialSet: cfg.typefullySet,
    xHandle: cfg.xHandle,
    x_thread: pack.x_thread,
    threads_post: pack.threads_post,
    copy_block,
    typefully_copy_ready: true,
  };
}

export function formatTypefullyApprovalReply(
  approval: ApprovalRequest,
  platform: 'x' | 'threads',
): string {
  const cfg = approval.brand ? getBrand(approval.brand as BrandId) : null;
  const setLine = cfg?.typefullySet ? `\n*Typefully set:* \`${cfg.typefullySet}\`` : '';
  const label = platform === 'x' ? 'X thread' : 'Threads post';

  return (
    `✅ *${label} approved* — copy vào Typefully${setLine}\n\n` +
    `\`\`\`\n${approval.content.slice(0, 3500)}\n\`\`\`\n\n` +
    `_Không auto-post qua API — schedule trong Typefully UI._`
  );
}

export const TypefullyClient = {
  isConfigured(): boolean {
    return !!(process.env.TYPEFULLY_API_KEY ?? '').trim();
  },

  isMock(): boolean {
    return !this.isConfigured() || process.env.MOCK_LLM === '1';
  },

  /**
   * Optional: create draft via Typefully API when TYPEFULLY_API_KEY is set.
   * Returns null in mock — operator uses copy_block from formatTypefullyBundle.
   */
  async createDraft(opts: {
    content: string;
    socialSet?: string;
    scheduleDate?: string;
  }): Promise<{ id: string; url?: string } | null> {
    if (this.isMock()) {
      FileLogger.info('[TypefullyClient] mock draft', { socialSet: opts.socialSet });
      return { id: 'mock_typefully_draft', url: undefined };
    }

    const apiKey = process.env.TYPEFULLY_API_KEY!.trim();
    try {
      const { data } = await axios.post<{ id?: string; url?: string }>(
        `${TYPEFULLY_API}/drafts/`,
        {
          content: opts.content,
          ...(opts.scheduleDate ? { schedule_date: opts.scheduleDate } : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15_000,
        },
      );
      return { id: String(data.id ?? 'unknown'), url: data.url };
    } catch (err) {
      FileLogger.error('[TypefullyClient] createDraft failed', err);
      return null;
    }
  },

  /** After X approval — try API draft for thread text. */
  async handoffXThread(approval: ApprovalRequest): Promise<{ draftId?: string; copyOnly: boolean }> {
    const brand = approval.brand as BrandId | undefined;
    const socialSet = brand ? getBrand(brand).typefullySet : undefined;
    if (this.isMock()) return { copyOnly: true };

    const draft = await this.createDraft({
      content: approval.content,
      socialSet,
    });
    if (!draft) return { copyOnly: true };
    return { draftId: draft.id, copyOnly: false };
  },
};
