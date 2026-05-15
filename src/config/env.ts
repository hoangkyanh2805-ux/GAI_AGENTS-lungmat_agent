import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const ENV = {
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  AGENT_SHARED_SECRET: process.env.AGENT_SHARED_SECRET ?? '',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  SUPABASE_URL: process.env.SUPABASE_URL ?? '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  // LLM — optional; falls back to mock if absent
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? '',
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001',
  // Apify — optional; falls back to mock if absent. Supports both APIFY_API_TOKEN and APIFY_TOKEN.
  APIFY_API_TOKEN: process.env.APIFY_API_TOKEN ?? process.env.APIFY_TOKEN ?? '',
  // Telegram — optional; falls back to mock if absent
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? '',
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID ?? '',
} as const;

export function validateEnv(): void {
  if (!ENV.AGENT_SHARED_SECRET) {
    console.error('CRITICAL: AGENT_SHARED_SECRET is not set in .env — exiting.');
    process.exit(1);
  }
}

export function logEnvStatus(): void {
  const status = {
    hasApifyToken:      !!(process.env.APIFY_API_TOKEN || process.env.APIFY_TOKEN),
    apifyMode:          (process.env.APIFY_API_TOKEN || process.env.APIFY_TOKEN) && process.env.MOCK_LLM !== '1' ? 'real' : 'mock',
    mockLlm:            process.env.MOCK_LLM === '1',
    telegramConfigured: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasAnthropicKey:    !!process.env.ANTHROPIC_API_KEY,
  };
  console.log(`[ENV] startup ${JSON.stringify(status)}`);
}
