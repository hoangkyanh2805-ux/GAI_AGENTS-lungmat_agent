import { Router, Request, Response } from 'express';
import { CronScheduler } from '../scheduler/CronScheduler';
import { JobType } from '../types';

// Scheduler instance is injected at startup; use a setter to avoid circular deps.
let _scheduler: CronScheduler | null = null;

export function setScheduler(s: CronScheduler): void { _scheduler = s; }

export function createScheduleRouter(): Router {
  const router = Router();

  // GET /schedule
  router.get('/', (_req: Request, res: Response): void => {
    const schedules = _scheduler ? _scheduler.list() : [];
    res.json({ status: 'success', count: schedules.length, schedules });
  });

  // POST /schedule — create a new schedule
  router.post('/', (req: Request, res: Response): void => {
    if (!_scheduler) {
      res.status(503).json({ status: 'error', message: 'Scheduler not initialized' });
      return;
    }
    const { name, cron, job_type, payload } = req.body as {
      name?: string;
      cron?: string;
      job_type?: string;
      payload?: Record<string, unknown>;
    };

    if (!name || !cron || !job_type) {
      res.status(400).json({ status: 'error', message: 'name, cron, and job_type are required' });
      return;
    }

    const validJobTypes: JobType[] = ['research', 'market_summary', 'write_thread', 'publish', 'daily_report'];
    if (!validJobTypes.includes(job_type as JobType)) {
      res.status(400).json({ status: 'error', message: `job_type must be one of: ${validJobTypes.join(', ')}` });
      return;
    }

    try {
      const schedule = _scheduler.add({ name, cron, job_type: job_type as JobType, payload });
      res.json({ status: 'success', schedule });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create schedule';
      res.status(400).json({ status: 'error', message });
    }
  });

  // DELETE /schedule/:id
  router.delete('/:id', (req: Request, res: Response): void => {
    if (!_scheduler) { res.status(503).json({ status: 'error', message: 'Scheduler not initialized' }); return; }
    const removed = _scheduler.remove(req.params.id);
    res.json({ status: 'success', removed });
  });

  return router;
}
