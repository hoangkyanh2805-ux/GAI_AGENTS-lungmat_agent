import OpenAI from 'openai';
import { ENV } from '../config/env';

const client = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });

// gpt-image-2 supported sizes only
export type ImageSize = '1024x1024' | '1024x1536' | '1536x1024';

export const ImageClient = {
  isMock(): boolean {
    return !ENV.OPENAI_API_KEY;
  },

  async generate(prompt: string, size: ImageSize = '1024x1024'): Promise<string> {
    if (ImageClient.isMock()) {
      return `https://placehold.co/${size}/1a1a2e/FFD700?text=mock+thumbnail`;
    }
    const response = await client.images.generate({
      model: 'gpt-image-2',
      prompt,
      size,
      n: 1,
    });
    const url = response.data?.[0]?.url;
    if (!url) throw new Error('ImageClient: no URL in response');
    return url;
  },
};

export function buildImagePrompt(
  brandDisplayName: string,
  topic: string,
  thumbnailBrief: string,
): { thumbnail: string; content: string } {
  const base = `Premium gold trading visual for "${brandDisplayName}". Topic: ${topic}.`;
  const style =
    'Style: dark finance aesthetic, gold accent, clean chart background, no fake profit claims.';

  const thumbnail =
    `${base} ${style} ` +
    `Bold headline text overlay: "${thumbnailBrief}". ` +
    `Format: YouTube Shorts thumbnail / Telegram visual, 16:9 widescreen.`;

  const content =
    `${base} ${style} ` +
    `Square post graphic with subtle chart motif. ` +
    `Minimal text, brand-consistent gold color palette, suitable for X/Threads feed.`;

  return { thumbnail, content };
}
