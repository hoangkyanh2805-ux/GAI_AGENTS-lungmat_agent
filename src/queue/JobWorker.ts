import { Job } from '../types';
import { JobQueue } from './JobQueue';
import { FileLogger } from '../memory/FileLogger';

export type JobHandler = (job: Job) => Promise<unknown>;

export class JobWorker {
  private handlers = new Map<string, JobHandler>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private busy = false;

  register(type: string, handler: JobHandler): this {
    this.handlers.set(type, handler);
    return this;
  }

  start(intervalMs = 5000): void {
    this.timer = setInterval(() => { void this.tick(); }, intervalMs);
    // unref so the timer doesn't keep the process alive when tests exit
    if (this.timer.unref) this.timer.unref();
    FileLogger.info('[JobWorker] started', { intervalMs, handlers: [...this.handlers.keys()] });
  }

  stop(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  async runPending(): Promise<number> {
    let count = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const job = JobQueue.dequeue();
      if (!job) break;
      await this.process(job);
      count++;
    }
    return count;
  }

  private async tick(): Promise<void> {
    if (this.busy) return;
    const job = JobQueue.dequeue();
    if (!job) return;
    this.busy = true;
    try { await this.process(job); }
    finally { this.busy = false; }
  }

  private async process(job: Job): Promise<void> {
    const handler = this.handlers.get(job.type);
    if (!handler) {
      JobQueue.update(job.id, {
        status: 'failed',
        error: `No handler registered for job type: ${job.type}`,
        finished_at: new Date().toISOString(),
      });
      FileLogger.error('[JobWorker] no handler', { id: job.id, type: job.type });
      return;
    }
    try {
      FileLogger.info('[JobWorker] processing', { id: job.id, type: job.type });
      const result = await handler(job);
      JobQueue.update(job.id, { status: 'done', result, finished_at: new Date().toISOString() });
      FileLogger.info('[JobWorker] done', { id: job.id });
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      JobQueue.update(job.id, { status: 'failed', error, finished_at: new Date().toISOString() });
      FileLogger.error('[JobWorker] failed', { id: job.id, error });
    }
  }
}
