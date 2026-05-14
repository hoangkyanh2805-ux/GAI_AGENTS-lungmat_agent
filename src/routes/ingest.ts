import { Router, Request, Response } from 'express';
import { RAGStore } from '../rag/RAGStore';

export function createIngestRouter(): Router {
  const router = Router();

  // POST /ingest — ingest a document into RAG
  router.post('/', (req: Request, res: Response): void => {
    const { title, content, source = 'api', tags = [] } = req.body as {
      title?: string;
      content?: string;
      source?: string;
      tags?: string[];
    };

    if (!title || !content) {
      res.status(400).json({ status: 'error', message: 'title and content are required' });
      return;
    }

    const doc = RAGStore.ingest({ title, content, source, tags });
    res.json({ status: 'success', doc });
  });

  return router;
}
