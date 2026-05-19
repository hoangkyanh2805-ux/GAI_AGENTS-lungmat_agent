import { ENV } from '../config/env';
import type { AgentMessage } from '../types';

/** True when request originates from founder admin Telegram DM. */
export function isAdminChat(message: AgentMessage): boolean {
  const admin = ENV.ADMIN_TELEGRAM_CHAT_ID?.trim();
  if (!admin) return false;
  const chatId = message.payload.chat_id ?? message.chat_id;
  return chatId != null && String(chatId) === admin;
}
