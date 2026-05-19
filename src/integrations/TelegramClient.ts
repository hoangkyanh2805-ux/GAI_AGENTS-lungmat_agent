import axios from 'axios';
import { ENV } from '../config/env';
import { FileLogger } from '../memory/FileLogger';

export interface TelegramSendResult {
  message_id: number;
  chat_id: string | number;
}

export interface InlineButton {
  text: string;
  callback_data: string;   // ≤ 64 bytes per Telegram API
}

function isMock(): boolean {
  return !ENV.TELEGRAM_BOT_TOKEN || process.env.MOCK_LLM === '1';
}

export const TelegramClient = {
  async sendMessage(chatId: string | number, text: string): Promise<TelegramSendResult> {
    if (isMock()) {
      const id = Math.floor(Math.random() * 100_000);
      FileLogger.info('[TelegramClient] MOCK send', { chatId, preview: text.slice(0, 60) });
      return { message_id: id, chat_id: chatId };
    }

    // Telegram hard limit: 4096 chars/message. We chunk at 3800 to leave headroom
    // for parse_mode entities. Long messages (e.g. /content pack) hit this without
    // chunking → 400 "message is too long".
    const CHUNK = 3800;
    if (text.length > CHUNK) {
      FileLogger.info('[TelegramClient] message too long — chunking', { chatId, total: text.length, chunks: Math.ceil(text.length / CHUNK) });
      const parts: string[] = [];
      for (let i = 0; i < text.length; i += CHUNK) parts.push(text.slice(i, i + CHUNK));
      let last: TelegramSendResult | null = null;
      for (let i = 0; i < parts.length; i++) {
        const tag = parts.length > 1 ? `(${i + 1}/${parts.length}) ` : '';
        last = await this.sendOne(chatId, `${tag}${parts[i]}`);
      }
      return last!;
    }

    return this.sendOne(chatId, text);
  },

  /** Internal — send a single message with Markdown→plain-text fallback on any 400. */
  async sendOne(chatId: string | number, text: string): Promise<TelegramSendResult> {
    const url = `https://api.telegram.org/bot${ENV.TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
      const { data } = await axios.post(
        url,
        { chat_id: chatId, text, parse_mode: 'Markdown' },
        { timeout: 10_000 },
      );
      return { message_id: data.result.message_id as number, chat_id: chatId };
    } catch (err) {
      const status = (err as { response?: { status?: number; data?: { description?: string } } })
        ?.response?.status;
      const desc = (err as { response?: { data?: { description?: string } } })
        ?.response?.data?.description ?? '';
      // Any 400 → log full description + fallback plain text. We broaden beyond
      // "can't parse entities" because Telegram returns many flavours of 400 and
      // we'd rather deliver text than silently fail.
      if (status === 400) {
        FileLogger.info('[TelegramClient] 400 — retrying as plain text', {
          chatId, desc, len: text.length, preview: text.slice(0, 80),
        });
        try {
          const { data } = await axios.post(
            url,
            { chat_id: chatId, text }, // no parse_mode
            { timeout: 10_000 },
          );
          return { message_id: data.result.message_id as number, chat_id: chatId };
        } catch (err2) {
          const desc2 = (err2 as { response?: { data?: { description?: string } } })
            ?.response?.data?.description ?? '';
          FileLogger.error('[TelegramClient] plain-text retry also failed', { chatId, desc2, len: text.length });
          throw err2;
        }
      }
      throw err;
    }
  },

  async sendThread(chatId: string | number, tweets: string[]): Promise<TelegramSendResult[]> {
    const results: TelegramSendResult[] = [];
    for (const tweet of tweets) {
      results.push(await this.sendMessage(chatId, tweet));
    }
    return results;
  },

  async sendMessageWithButtons(
    chatId: string | number,
    text: string,
    buttons: InlineButton[][],
  ): Promise<TelegramSendResult> {
    if (isMock()) {
      const id = Math.floor(Math.random() * 100_000);
      FileLogger.info('[TelegramClient] MOCK send-with-buttons', { chatId, preview: text.slice(0, 60) });
      return { message_id: id, chat_id: chatId };
    }
    const { data } = await axios.post(
      `https://api.telegram.org/bot${ENV.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: buttons },
      },
      { timeout: 10_000 },
    );
    return { message_id: data.result.message_id as number, chat_id: chatId };
  },

  async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
    if (isMock()) return;
    await axios.post(
      `https://api.telegram.org/bot${ENV.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
      { callback_query_id: callbackQueryId, ...(text ? { text } : {}) },
      { timeout: 10_000 },
    ).catch((err) => FileLogger.error('[TelegramClient] answerCallback failed', err));
  },

  async editMessageText(chatId: string | number, messageId: number, text: string): Promise<void> {
    if (isMock()) return;
    await axios.post(
      `https://api.telegram.org/bot${ENV.TELEGRAM_BOT_TOKEN}/editMessageText`,
      {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
      },
      { timeout: 10_000 },
    ).catch((err) => FileLogger.error('[TelegramClient] editMessage failed', err));
  },

  /**
   * Phase 7D-5: Register an HTTPS webhook URL with Telegram. Telegram will POST
   * each update to `url` with header X-Telegram-Bot-Api-Secret-Token = secretToken.
   * drop_pending_updates=true to discard backlog accumulated while in long-poll mode.
   */
  async setWebhook(url: string, secretToken: string): Promise<void> {
    if (isMock()) {
      FileLogger.info('[TelegramClient] MOCK setWebhook', { url });
      return;
    }
    try {
      const { data } = await axios.post(
        `https://api.telegram.org/bot${ENV.TELEGRAM_BOT_TOKEN}/setWebhook`,
        {
          url,
          secret_token: secretToken,
          drop_pending_updates: true,
          allowed_updates: ['message', 'callback_query'],
        },
        { timeout: 10_000 },
      );
      FileLogger.info('[TelegramClient] setWebhook ok', { url, result: data?.result, description: data?.description });
    } catch (err) {
      const desc = (err as { response?: { data?: { description?: string } } })?.response?.data?.description ?? '';
      FileLogger.error('[TelegramClient] setWebhook failed', { url, desc, err });
      throw err;
    }
  },

  /**
   * Phase 7D-5: Remove the registered webhook. Used when switching back to
   * long-poll mode so Telegram stops POSTing to a stale URL.
   */
  async deleteWebhook(): Promise<void> {
    if (isMock()) {
      FileLogger.info('[TelegramClient] MOCK deleteWebhook');
      return;
    }
    try {
      const { data } = await axios.post(
        `https://api.telegram.org/bot${ENV.TELEGRAM_BOT_TOKEN}/deleteWebhook`,
        { drop_pending_updates: false },
        { timeout: 10_000 },
      );
      FileLogger.info('[TelegramClient] deleteWebhook ok', { result: data?.result, description: data?.description });
    } catch (err) {
      const desc = (err as { response?: { data?: { description?: string } } })?.response?.data?.description ?? '';
      FileLogger.error('[TelegramClient] deleteWebhook failed', { desc, err });
    }
  },

  isMock,
};
