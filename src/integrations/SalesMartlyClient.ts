import { ENV } from '../config/env';
import { FileLogger } from '../memory/FileLogger';
import { TelegramClient } from './TelegramClient';

export interface SalesMartlyPayload {
  secret?: string;
  conversation_id: string;
  intent: 'TRADE_INSIGHT' | 'CONTENT_REQUEST' | 'HOT_LEAD' | 'GENERAL_SUPPORT' | string;
  category?: string;
  topic?: string;
  notes?: string;
  /** e.g. `telegram` — project scope: TG DM only */
  channel?: string;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  metadata?: Record<string, unknown>;
}

export class SalesMartlyClient {
  static isEnabled(): boolean {
    return ENV.SALESMARTLY_ENABLED;
  }

  static validate(payload: SalesMartlyPayload): boolean {
    return Boolean(payload?.secret && payload.secret === ENV.SALESMARTLY_WEBHOOK_SECRET);
  }

  static async routePayload(payload: SalesMartlyPayload): Promise<void> {
    if (!this.isEnabled()) {
      FileLogger.info('[SalesMartlyClient] disabled');
      return;
    }

    if (!this.validate(payload)) {
      FileLogger.error('[SalesMartlyClient] invalid SalesMartly secret', { payload });
      throw new Error('invalid SalesMartly secret');
    }

    const context = {
      conversation_id: payload.conversation_id,
      intent: payload.intent,
      topic: payload.topic,
      customer: payload.customer,
      metadata: payload.metadata,
      notes: payload.notes,
      source: 'salesmartly',
      received_at: new Date().toISOString(),
    };

    switch (payload.intent) {
      case 'TRADE_INSIGHT':
      case 'CONTENT_REQUEST':
        await this.dispatchToAgent(payload, context);
        break;
      case 'GENERAL_SUPPORT':
      case 'HOT_LEAD':
      default:
        await this.notifyHumanHandler(payload, context);
        break;
    }
  }

  private static async dispatchToAgent(payload: SalesMartlyPayload, context: Record<string, unknown>): Promise<void> {
    FileLogger.info('[SalesMartlyClient] insight/content request (GoClaw CSKH path)', {
      intent: payload.intent,
      topic: payload.topic,
      conversation_id: payload.conversation_id,
      channel: payload.channel ?? 'telegram',
      context,
    });
    // Intentionally no SupervisorAgent /content — sales TG DM handled by GoClaw CSKH + SM UI.
    // See docs/SALESMARTLY_GOCLAW_HUMAN_TELEGRAM_DM.md
  }

  private static async notifyHumanHandler(payload: SalesMartlyPayload, context: Record<string, unknown>): Promise<void> {
    FileLogger.info('[SalesMartlyClient] notify human handler', {
      intent: payload.intent,
      conversation_id: payload.conversation_id,
    });

    const admin = ENV.ADMIN_TELEGRAM_CHAT_ID?.trim();
    if (!admin) {
      FileLogger.error('[SalesMartlyClient] HOT_LEAD but ADMIN_TELEGRAM_CHAT_ID unset');
      return;
    }

    const name = payload.customer?.name ?? '—';
    const phone = payload.customer?.phone ?? '—';
    const brand = (payload.metadata?.brand as string | undefined) ?? '—';
    const channel = payload.channel ?? 'telegram';
    const topic = payload.topic ?? payload.notes ?? '—';

    const text =
      `🔥 *${payload.intent}* — SalesMartly\n` +
      `Channel: ${channel}\n` +
      `Brand: ${brand}\n` +
      `Conversation: \`${payload.conversation_id}\`\n` +
      `Khách: ${name} / ${phone}\n` +
      `Nội dung: ${topic}\n\n` +
      `_Trả lời trong SalesMartly (TG DM). Assign self → tắt AI._`;

    await TelegramClient.sendMessage(admin, text);
  }
}
