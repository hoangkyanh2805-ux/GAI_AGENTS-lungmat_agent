import { Router, Request, Response } from 'express';
import { ENV } from '../config/env';
import { FileLogger } from '../memory/FileLogger';
import { TelegramReceiver, TgUpdate } from '../integrations/TelegramReceiver';

/**
 * Phase 7D-5: Telegram webhook endpoint.
 *
 * Telegram POSTs each update to https://<host>/telegram/webhook with header
 * `X-Telegram-Bot-Api-Secret-Token`. We:
 *  1. Verify the secret token (defence-in-depth — anyone discovering the URL
 *     could otherwise inject fake updates).
 *  2. ACK Telegram immediately (200 ok) — Telegram retries on non-2xx within
 *     60s, so processing must NOT block the response.
 *  3. Dispatch the update asynchronously via the existing TelegramReceiver
 *     code path, identical to the long-poll loop.
 *
 * Note: this route is mounted BEFORE the x-agent-secret middleware path-skip
 * list would normally apply. Telegram does not (and cannot) send our
 * x-agent-secret header, so the route is mounted on `app` directly with its
 * own auth (the secret_token header).
 */
export function createTelegramWebhookRouter(receiver: TelegramReceiver): Router {
  const router = Router();

  router.post('/telegram/webhook', (req: Request, res: Response): void => {
    // 1. Verify secret token
    const provided = req.header('X-Telegram-Bot-Api-Secret-Token');
    if (!ENV.TELEGRAM_WEBHOOK_SECRET || provided !== ENV.TELEGRAM_WEBHOOK_SECRET) {
      FileLogger.error('[7D-5] [telegramWebhook] invalid secret token', { ip: req.ip });
      res.status(401).json({ error: 'invalid secret token' });
      return;
    }

    // 2. ACK Telegram immediately (must respond <60s, ideally <1s)
    res.status(200).json({ ok: true });

    // 3. Process update asynchronously — do NOT await before responding
    const update = req.body as TgUpdate;
    receiver.handleUpdate(update).catch((err) => {
      FileLogger.error('[7D-5] [telegramWebhook] dispatch failed', err);
    });
  });

  return router;
}
