import { Router, Request, Response } from 'express';
import { FileLogger } from '../memory/FileLogger';
import { SalesMartlyClient, SalesMartlyPayload } from '../integrations/SalesMartlyClient';

export function createSalesMartlyRouter(): Router {
  const router = Router();

  router.post('/salesmartly/webhook', (req: Request, res: Response): void => {
    const payload = req.body as SalesMartlyPayload;
    if (!SalesMartlyClient.isEnabled()) {
      res.status(503).json({ status: 'error', message: 'SalesMartly integration disabled' });
      return;
    }

    if (!SalesMartlyClient.validate(payload)) {
      FileLogger.error('[salesmartly] invalid secret', { ip: req.ip, payload });
      res.status(401).json({ status: 'error', message: 'invalid secret' });
      return;
    }

    res.status(200).json({ status: 'ok' });

    SalesMartlyClient.routePayload(payload)
      .catch((err) => {
        FileLogger.error('[salesmartly] routePayload failed', err);
      });
  });

  return router;
}
