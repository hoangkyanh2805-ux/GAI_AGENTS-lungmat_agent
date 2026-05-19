import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { ApprovalPlatform, ApprovalRequest } from '../types';
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

export class AmbiguousPrefixError extends Error {
  constructor(prefix: string, count: number) {
    super(`Prefix "${prefix}" is ambiguous — matches ${count} approvals. Use more characters.`);
    this.name = 'AmbiguousPrefixError';
  }
}

// Resolve a full UUID or a unique prefix to an ApprovalRequest.
// Returns null if not found; throws AmbiguousPrefixError if prefix matches multiple.
function resolve(all: ApprovalRequest[], idOrPrefix: string): ApprovalRequest | null {
  const exact = all.find((a) => a.id === idOrPrefix);
  if (exact) return exact;
  const matches = all.filter((a) => a.id.startsWith(idOrPrefix));
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) throw new AmbiguousPrefixError(idOrPrefix, matches.length);
  return null;
}

export const ApprovalStore = {
  create(opts: {
    trace_id: string;
    type: 'publish_telegram' | 'publish_other';
    content: string;
    agent: string;
    user: string;
    brand?: string;
    platform?: ApprovalPlatform;
    pack_id?: string;
  }): ApprovalRequest {
    const approval: ApprovalRequest = {
      id: randomUUID(),
      ...opts,
      platform: opts.platform ?? (opts.type === 'publish_telegram' ? 'telegram' : undefined),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    const all = load();
    all.push(approval);
    save(all);
    FileLogger.info('[ApprovalStore] created', { id: approval.id, type: opts.type, user: opts.user });
    return approval;
  },

  // Accepts full UUID or unique prefix. Throws AmbiguousPrefixError on ambiguous prefix.
  approve(idOrPrefix: string, reviewedBy = 'human'): ApprovalRequest | null {
    const all = load();
    const a = resolve(all, idOrPrefix);
    if (!a || a.status !== 'pending') return null;
    a.status = 'approved';
    a.reviewed_at = new Date().toISOString();
    a.reviewed_by = reviewedBy;
    save(all);
    FileLogger.info('[ApprovalStore] approved', { id: a.id, by: reviewedBy });
    return a;
  },

  // Accepts full UUID or unique prefix. Throws AmbiguousPrefixError on ambiguous prefix.
  reject(idOrPrefix: string, reviewedBy = 'human'): ApprovalRequest | null {
    const all = load();
    const a = resolve(all, idOrPrefix);
    if (!a || a.status !== 'pending') return null;
    a.status = 'rejected';
    a.reviewed_at = new Date().toISOString();
    a.reviewed_by = reviewedBy;
    save(all);
    FileLogger.info('[ApprovalStore] rejected', { id: a.id, by: reviewedBy });
    return a;
  },

  // Accepts full UUID or unique prefix. Throws AmbiguousPrefixError on ambiguous prefix.
  get(idOrPrefix: string): ApprovalRequest | null {
    return resolve(load(), idOrPrefix);
  },

  list(status?: 'pending' | 'approved' | 'rejected'): ApprovalRequest[] {
    const all = load();
    return status ? all.filter((a) => a.status === status) : all;
  },

  listByPack(packId: string): ApprovalRequest[] {
    return load().filter((a) => a.pack_id === packId);
  },
};
