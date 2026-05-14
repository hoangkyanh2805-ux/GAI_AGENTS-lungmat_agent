import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const ENV = {
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  AGENT_SHARED_SECRET: process.env.AGENT_SHARED_SECRET ?? '',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  SUPABASE_URL: process.env.SUPABASE_URL ?? '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
} as const;

export function validateEnv(): void {
  if (!ENV.AGENT_SHARED_SECRET) {
    console.error('CRITICAL: AGENT_SHARED_SECRET is not set in .env — exiting.');
    process.exit(1);
  }
}
