import fs from 'fs';
import path from 'path';
import { MemoryEntry } from '../types';

const STORE_FILE = path.join(__dirname, '../../logs/memory.json');

type L2Store = Record<string, MemoryEntry>;

function ensureDir(): void {
  const dir = path.dirname(STORE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function read(): L2Store {
  ensureDir();
  if (!fs.existsSync(STORE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as L2Store;
  } catch {
    return {};
  }
}

function commit(store: L2Store): void {
  ensureDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
}

export const L2Memory = {
  set(key: string, value: unknown, agent?: string, expires_at?: string): void {
    const store = read();
    const now = new Date().toISOString();
    const existing = store[key];
    store[key] = {
      key,
      value,
      agent,
      expires_at,
      set_at: existing?.set_at ?? now,
    };
    commit(store);
  },

  get(key: string): MemoryEntry | undefined {
    const entry = read()[key];
    if (!entry) return undefined;
    if (entry.expires_at && new Date() > new Date(entry.expires_at)) {
      this.delete(key);
      return undefined;
    }
    return entry;
  },

  delete(key: string): void {
    const store = read();
    delete store[key];
    commit(store);
  },

  keys(): string[] {
    return Object.keys(read());
  },

  all(): MemoryEntry[] {
    return Object.values(read());
  },
};
