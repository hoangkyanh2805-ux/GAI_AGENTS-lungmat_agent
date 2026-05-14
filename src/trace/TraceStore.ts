import fs from 'fs';
import path from 'path';
import { TraceRecord } from '../types';

const TRACES_DIR = path.join(__dirname, '../../logs/traces');

function ensureDir(): void {
  if (!fs.existsSync(TRACES_DIR)) {
    fs.mkdirSync(TRACES_DIR, { recursive: true });
  }
}

// Called at module load so the directory exists before any request arrives.
ensureDir();

export const TraceStore = {
  save(record: TraceRecord): void {
    const file = path.join(TRACES_DIR, `${record.id}.json`);
    fs.writeFileSync(file, JSON.stringify(record, null, 2), 'utf8');
  },

  get(id: string): TraceRecord | null {
    const file = path.join(TRACES_DIR, `${id}.json`);
    if (!fs.existsSync(file)) return null;
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8')) as TraceRecord;
    } catch {
      return null;
    }
  },

  list(): string[] {
    try {
      return fs
        .readdirSync(TRACES_DIR)
        .filter((f) => f.endsWith('.json'))
        .map((f) => f.replace('.json', ''))
        .sort()
        .reverse();
    } catch {
      return [];
    }
  },
};
