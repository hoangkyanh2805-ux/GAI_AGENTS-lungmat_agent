import { Router, Request, Response } from 'express';
import { JobQueue } from '../queue/JobQueue';
import { JobStatus } from '../types';

export function createQueueRouter(): Router {
  const router = Router();

  // GET /queue?status=<status>
  router.get('/', (req: Request, res: Response): void => {
    const status = req.query.status as JobStatus | undefined;
    const jobs = JobQueue.list(status);
    const summary = {
      pending: jobs.filter((j) => j.status === 'pending').length,
      running: jobs.filter((j) => j.status === 'running').length,
      done:    jobs.filter((j) => j.status === 'done').length,
      failed:  jobs.filter((j) => j.status === 'failed').length,
    };
    res.json({ status: 'success', summary, jobs });
  });

  // GET /queue/:id
  router.get('/:id', (req: Request, res: Response): void => {
    const job = JobQueue.get(req.params.id);
    if (!job) { res.status(404).json({ status: 'error', message: 'Job not found' }); return; }
    res.json({ status: 'success', job });
  });

  return router;
}
