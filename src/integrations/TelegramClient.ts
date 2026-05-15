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
    const { data } = await axios.post(
      `https://api.telegram.org/bot${ENV.TELEGRAM_BOT_TOKEN}/sendMessage`,
      { chat_id: chatId, text, parse_mode: 'Markdown' },
      { timeout: 10_000 },
    );
    return { message_id: data.result.message_id as number, chat_id: chatId };
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

  isMock,
};
