import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { ApprovalRequest } from '../types';
import { FileLogger } from '../memory/FileLogger';

const APPROVAL_FILE = path.join(__dirname, '../../logs/approvals.json');

function ensureDir(): void {
  const dir = path.dirname(APPROVAL_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function load(): ApprovalRequest[] {
  ensureDir();
  if (!fs.existsSync(APPROVAL_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(APPROVAL_FILE, 'utf8')) as ApprovalRequest[]; }
  catch { return []; }
}

function save(approvals: ApprovalRequest[]): void {
  ensureDir();
  fs.writeFileSync(APPROVAL_FILE, JSON.stringify(approvals, null, 2), 'utf8');
}

export const ApprovalStore = {
  create(opts: {
    trace_id: string;
    type: 'publish_telegram' | 'publish_other';
    content: string;
    agent: string;
    user: string;
  }): ApprovalRequest {
    const approval: ApprovalRequest = {
      id: randomUUID(),
      ...opts,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    const all = load();
    all.push(approval);
    save(all);
    FileLogger.info('[ApprovalStore] created', { id: approval.id, type: opts.type, user: opts.user });
    return approval;
  },

  approve(id: string, reviewedBy = 'human'): ApprovalRequest | null {
    const all = load();
    const a = all.find((x) => x.id === id);
    if (!a || a.status !== 'pending') return null;
    a.status = 'approved';
    a.reviewed_at = new Date().toISOString();
    a.reviewed_by = reviewedBy;
    save(all);
    FileLogger.info('[ApprovalStore] approved', { id, by: reviewedBy });
    return a;
  },

  reject(id: string, reviewedBy = 'human'): ApprovalRequest | null {
    const all = load();
    const a = all.find((x) => x.id === id);
    if (!a || a.status !== 'pending') return null;
    a.status = 'rejected';
    a.reviewed_at = new Date().toISOString();
    a.reviewed_by = reviewedBy;
    save(all);
    FileLogger.info('[ApprovalStore] rejected', { id, by: reviewedBy });
    return a;
  },

  get(id: string): ApprovalRequest | null {
    return load().find((a) => a.id === id) ?? null;
  },

  list(status?: 'pending' | 'approved' | 'rejected'): ApprovalRequest[] {
    const all = load();
    return status ? all.filter((a) => a.status === status) : all;
  },
};
