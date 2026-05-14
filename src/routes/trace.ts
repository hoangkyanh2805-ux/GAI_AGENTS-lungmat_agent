import { Router, Request, Response } from 'express';
import { TraceStore } from '../trace/TraceStore';

export function createTraceRouter(): Router {
  const router = Router();

  router.get('/:id', (req: Request, res: Response) => {
    const record = TraceStore.get(req.params.id);
    if (!record) {
      res.status(404).json({ status: 'error', message: 'Trace not found' });
      return;
    }
    res.json({ status: 'success', trace: record });
  });

  router.get('/', (_req: Request, res: Response) => {
    const ids = TraceStore.list().slice(0, 20); // last 20
    res.json({ status: 'success', count: ids.length, trace_ids: ids });
  });

  return router;
}
