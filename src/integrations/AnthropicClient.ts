import Anthropic from '@anthropic-ai/sdk';
import { ENV } from '../config/env';

export interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  model?: string;
  maxTokens?: number;
  system?: string;
}

function isMock(): boolean {
  return !ENV.ANTHROPIC_API_KEY || process.env.MOCK_LLM === '1';
}

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: ENV.ANTHROPIC_API_KEY });
  return _client;
}

function mockResponse(messages: LLMMessage[], opts: LLMOptions): string {
  const lastMsg = messages[messages.length - 1]?.content ?? '';
  const sys = (opts.system ?? '').toLowerCase();
  if (sys.includes('content pack') || sys.includes('youtube_pack') || sys.includes('shorts_script')) {
    const brand = sys.includes('raymond') ? 'raymond' : sys.includes('vip') ? 'vip10x' : 'alpha';
    const topic = lastMsg.slice(0, 80) || 'XAUUSD gold';
    return JSON.stringify({
      telegram_brief: `*MOCK ${brand} TG*\n\n${topic}`,
      x_thread: '1/ Mock X opener\n\n2/ Context\n\n3/ Takeaway\n\n4/ Detail\n\n5/ #XAUUSD #Gold',
      threads_post: `Mock Threads — ${topic.slice(0, 100)}`,
      youtube_pack: {
        title: `[MOCK Shorts] ${topic.slice(0, 40)}`,
        description: 'Mock YT description. Not financial advice.',
        tags: ['XAUUSD', 'gold', brand],
        shorts_script:
          '[0-3s HOOK] "Ae thấy vàng đang nói gì không?"\n' +
          '[3-20s] Mock chart context — liquidity / session.\n' +
          '[20-50s] 2 điểm chính — không khuyến nghị entry.\n' +
          '[50-60s] CTA + risk disclaimer.',
        thumbnail_brief: 'Dark chart, bold hook text, gold accent',
      },
    });
  }
  if (sys.includes('thread')) {
    return [
      '1/ The AI landscape is shifting fast — here\'s what you need to know. 🧵',
      '2/ Market signals are pointing to a major consolidation among mid-tier players.',
      '3/ Open-source models are closing the gap with proprietary ones at 10x less cost.',
      '4/ Smart founders are betting on vertical AI, not horizontal infrastructure.',
      '5/ The playbook: pick a niche, build distribution, own the data flywheel. #AI #Startups',
    ].join('\n\n');
  }
  if (sys.includes('market') || sys.includes('summary') || sys.includes('analyst')) {
    return 'MOCK MARKET SUMMARY: Key indices are showing mixed signals today. Tech sector leads with a +1.8% gain while energy remains flat. BTC holds above key support levels amid moderate volume. Outlook remains cautiously optimistic for the remainder of the week.';
  }
  if (sys.includes('lửng mật') || sys.includes('coach admin') || sys.includes('media os')) {
    return (
      'MOCK COACH (Lửng Mật): Anh chạy `/debug_env` trước — cần `mockLlm:false`, `hasAdminChatId:true`. ' +
      'Verify live: market_summary 6 sections → `/content alpha …` → 3 nút approve. Chưa mở 7D cron trước verify. 🦡'
    );
  }
  return `MOCK LLM RESPONSE: Processed "${lastMsg.slice(0, 60)}" — returning mock output for testing.`;
}

export const AnthropicClient = {
  async chat(messages: LLMMessage[], opts: LLMOptions = {}): Promise<string> {
    if (isMock()) return mockResponse(messages, opts);

    const response = await getClient().messages.create({
      model: opts.model ?? ENV.ANTHROPIC_MODEL,
      max_tokens: opts.maxTokens ?? 2048,
      ...(opts.system ? { system: opts.system } : {}),
      messages,
    });

    const block = response.content[0];
    if (block.type !== 'text') throw new Error('Unexpected non-text response from Anthropic');
    return block.text;
  },

  isMock,
};
