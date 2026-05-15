import axios from 'axios';
import { ENV } from '../config/env';
import { FileLogger } from '../memory/FileLogger';
import { TelegramClient } from './TelegramClient';

// Compatible with SupervisorAgent.process — see src/agents/SupervisorAgent.ts.
// We use a minimal duck-typed interface so this module doesn't import the
// concrete SupervisorAgent class (keeps unit testing easier).
export interface TelegramReceiverProcessor {
  process(
    command: string,
    payload: Record<string, unknown>,
    meta: { user: string; source: string; project?: string }
  ): Promise<{ reply: string; status: string; agent: string; trace_id: string }>;
}

interface TgUser { id: number; first_name?: string; username?: string }
interface TgChat { id: number; type: string }
interface TgMessage { message_id: number; from?: TgUser; chat: TgChat; text?: string; date: number }
interface TgUpdate { update_id: number; message?: TgMessage }
interface TgGetUpdatesResp { ok: boolean; result?: TgUpdate[]; description?: string }

export class TelegramReceiver {
  private offset = 0;
  private running = false;
  private readonly baseUrl: string;

  constructor(private processor: TelegramReceiverProcessor) {
    this.baseUrl = `https://api.telegram.org/bot${ENV.TELEGRAM_BOT_TOKEN}`;
  }

  start(): void {
    if (!ENV.TELEGRAM_BOT_TOKEN) {
      FileLogger.info('[TelegramReceiver] disabled (no TELEGRAM_BOT_TOKEN)');
      return;
    }
    if (process.env.MOCK_LLM === '1') {
      FileLogger.info('[TelegramReceiver] disabled (MOCK_LLM=1)');
      return;
    }
    this.running = true;
    FileLogger.info('[TelegramReceiver] starting long-poll loop');
    // Fire-and-forget — caller does not await.
    void this.loop();
  }

  stop(): void {
    this.running = false;
    FileLogger.info('[TelegramReceiver] stopped');
  }

  private async loop(): Promise<void> {
    while (this.running) {
      try {
        const { data } = await axios.get<TgGetUpdatesResp>(`${this.baseUrl}/getUpdates`, {
          params: { offset: this.offset, timeout: 30 },
          timeout: 35_000,
        });
        if (!data.ok) {
          FileLogger.error('[TelegramReceiver] getUpdates !ok', data.description ?? 'unknown');
          await this.sleep(3_000);
          continue;
        }
        for (const update of data.result ?? []) {
          this.offset = update.update_id + 1;
          await this.handleUpdate(update);
        }
      } catch (err) {
        FileLogger.error('[TelegramReceiver] poll error', err);
        await this.sleep(3_000);
      }
    }
  }

  private async handleUpdate(update: TgUpdate): Promise<void> {
    const msg = update.message;
    if (!msg?.text) return;
    const text = msg.text.trim();
    if (!text.startsWith('/')) return;

    const chatId = msg.chat.id;
    const user = String(msg.from?.id ?? 'unknown');
    const [rawCmd, ...rest] = text.split(/\s+/);
    const command = (rawCmd ?? '').split('@')[0];        // /research@MyBot → /research
    const args = rest.join(' ').trim();
    const payload: Record<string, unknown> = { chat_id: chatId };
    if (args) {
      // Convention: ResearchAgent reads payload.topic. Other agents read payload.text or ignore.
      payload.topic = args;
      payload.text = args;
    }

    FileLogger.info('[TelegramReceiver] command in', { chatId, command, user, hasArgs: !!args });

    try {
      const result = await this.processor.process(command, payload, { user, source: 'telegram' });
      const reply = (result.reply ?? '').trim() || '(empty reply)';
      await TelegramClient.sendMessage(chatId, reply);
      FileLogger.info('[TelegramReceiver] reply sent', {
        chatId, command, status: result.status, agent: result.agent, trace_id: result.trace_id,
      });
    } catch (err) {
      FileLogger.error('[TelegramReceiver] handler crashed', err);
      try {
        await TelegramClient.sendMessage(chatId, '⚠️ Lệnh lỗi nội bộ, vui lòng thử lại sau.');
      } catch (sendErr) {
        FileLogger.error('[TelegramReceiver] failed to send error message', sendErr);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}
