import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { Schedule, JobType } from '../types';
import { FileLogger } from '../memory/FileLogger';

const SCHED_FILE = path.join(__dirname, '../../logs/schedules.json');

function ensureDir(): void {
  const dir = path.dirname(SCHED_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function load(): Schedule[] {
  ensureDir();
  if (!fs.existsSync(SCHED_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(SCHED_FILE, 'utf8')) as Schedule[]; }
  catch { return []; }
}

function save(schedules: Schedule[]): void {
  ensureDir();
  fs.writeFileSync(SCHED_FILE, JSON.stringify(schedules, null, 2), 'utf8');
}

export type ScheduleCallback = (schedule: Schedule) => Promise<void>;

export class CronScheduler {
  private tasks = new Map<string, cron.ScheduledTask>();

  constructor(private readonly onFire: ScheduleCallback) {}

  add(opts: {
    name: string;
    cron: string;
    job_type: JobType;
    payload?: Record<string, unknown>;
  }): Schedule {
    if (!cron.validate(opts.cron)) {
      throw new Error(`Invalid cron expression: "${opts.cron}"`);
    }
    const schedules = load();
    const schedule: Schedule = {
      id: randomUUID(),
      name: opts.name,
      cron: opts.cron,
      job_type: opts.job_type,
      payload: opts.payload ?? {},
      enabled: true,
      created_at: new Date().toISOString(),
    };
    schedules.push(schedule);
    save(schedules);
    this.mount(schedule);
    return schedule;
  }

  remove(id: string): boolean {
    const task = this.tasks.get(id);
    if (task) { task.stop(); this.tasks.delete(id); }
    const before = load();
    const after = before.filter((s) => s.id !== id);
    save(after);
    return before.length !== after.length;
  }

  enable(id: string): void  { this.toggle(id, true); }
  disable(id: string): void { this.toggle(id, false); }

  list(): Schedule[] { return load(); }

  start(): void {
    // Skip auto-start in test environment to avoid cron noise during E2E
    if (process.env.NODE_ENV === 'test') return;
    for (const s of load().filter((s) => s.enabled)) this.mount(s);
    FileLogger.info('[CronScheduler] started', { active: this.tasks.size });
  }

  stop(): void {
    for (const t of this.tasks.values()) t.stop();
    this.tasks.clear();
  }

  private mount(schedule: Schedule): void {
    if (this.tasks.has(schedule.id)) return; // already running
    const task = cron.schedule(schedule.cron, async () => {
      FileLogger.info('[CronScheduler] firing', { id: schedule.id, name: schedule.name });
      const schedules = load();
      const s = schedules.find((x) => x.id === schedule.id);
      if (s) { s.last_run = new Date().toISOString(); save(schedules); }
      await this.onFire(schedule).catch((e) =>
        FileLogger.error('[CronScheduler] callback error', e),
      );
    });
    this.tasks.set(schedule.id, task);
  }

  private toggle(id: string, enabled: boolean): void {
    const schedules = load();
    const s = schedules.find((x) => x.id === id);
    if (!s) return;
    s.enabled = enabled;
    save(schedules);
    if (enabled) {
      this.mount(s);
    } else {
      const task = this.tasks.get(id);
      if (task) { task.stop(); this.tasks.delete(id); }
    }
  }
}
