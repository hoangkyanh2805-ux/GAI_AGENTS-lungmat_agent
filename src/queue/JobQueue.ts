import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { Job, JobStatus, JobType } from '../types';

const QUEUE_FILE = path.join(__dirname, '../../logs/jobs.json');

function ensureDir(): void {
  const dir = path.dirname(QUEUE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function load(): Job[] {
  ensureDir();
  if (!fs.existsSync(QUEUE_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8')) as Job[]; }
  catch { return []; }
}

function save(jobs: Job[]): void {
  ensureDir();
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(jobs, null, 2), 'utf8');
}

export const JobQueue = {
  enqueue(type: JobType, payload: Record<string, unknown> = {}): Job {
    const jobs = load();
    const job: Job = {
      id: randomUUID(),
      type,
      payload,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    jobs.push(job);
    save(jobs);
    return job;
  },

  dequeue(): Job | null {
    const jobs = load();
    const job = jobs.find((j) => j.status === 'pending');
    if (!job) return null;
    job.status = 'running';
    job.started_at = new Date().toISOString();
    save(jobs);
    return job;
  },

  update(id: string, updates: Partial<Job>): void {
    const jobs = load();
    const idx = jobs.findIndex((j) => j.id === id);
    if (idx < 0) return;
    jobs[idx] = { ...jobs[idx], ...updates };
    save(jobs);
  },

  get(id: string): Job | null {
    return load().find((j) => j.id === id) ?? null;
  },

  list(status?: JobStatus): Job[] {
    const jobs = load();
    return status ? jobs.filter((j) => j.status === status) : jobs;
  },

  // Keep only the last N jobs to prevent unbounded file growth
  prune(keep = 200): void {
    const jobs = load();
    if (jobs.length > keep) save(jobs.slice(-keep));
  },
};
