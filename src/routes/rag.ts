import { Router, Request, Response } from 'express';
import { RAGStore } from '../rag/RAGStore';

export function createRAGRouter(): Router {
  const router = Router();

  // GET /rag/search?q=<query>&limit=<n>
  router.get('/search', (req: Request, res: Response): void => {
    const query = String(req.query.q ?? '').trim();
    const limit = Math.min(parseInt(String(req.query.limit ?? '5'), 10), 20);
    if (!query) {
      res.status(400).json({ status: 'error', message: 'q parameter is required' });
      return;
    }
    const results = RAGStore.search(query, limit);
    res.json({ status: 'success', query, count: results.length, results });
  });

  // GET /rag/documents?limit=<n>
  router.get('/documents', (req: Request, res: Response): void => {
    const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10), 100);
    const docs = RAGStore.list(limit);
    res.json({ status: 'success', count: docs.length, documents: docs });
  });

  return router;
}
