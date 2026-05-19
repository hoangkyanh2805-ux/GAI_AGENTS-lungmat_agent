import { ENV } from '../config/env';
import { FileLogger } from '../memory/FileLogger';

export interface SalesMartlyPayload {
  secret?: string;
  conversation_id: string;
  intent: 'TRADE_INSIGHT' | 'CONTENT_REQUEST' | 'HOT_LEAD' | 'GENERAL_SUPPORT' | string;
  category?: string;
  topic?: string;
  notes?: string;
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
    FileLogger.info('[SalesMartlyClient] dispatching to agent', { intent: payload.intent, topic: payload.topic, conversation_id: payload.conversation_id });

    // TODO: wire this into the supervisor / agent command dispatch path.
    // Example:
    // await SupervisorAgent.process({
    //   id: crypto.randomUUID(),
    //   content: payload.topic ?? 'salesmartly request',
    //   command: '/content',
    //   payload: { payload, context },
    //   user: `salesmartly:${payload.conversation_id}`,
    //   source: 'salesmartly',
    //   timestamp: new Date().toISOString(),
    // }, createContext(...));
  }

  private static async notifyHumanHandler(payload: SalesMartlyPayload, context: Record<string, unknown>): Promise<void> {
    FileLogger.info('[SalesMartlyClient] notify human handler', { intent: payload.intent, conversation_id: payload.conversation_id });

    // TODO: notify admin or human handler through Telegram / CRM / task queue.
    // Example:
    // await TelegramClient.sendMessage(ENV.ADMIN_TELEGRAM_CHAT_ID, messageText);
  }
}
