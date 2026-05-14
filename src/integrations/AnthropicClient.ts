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
