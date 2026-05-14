import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { RAGDocument, RAGSearchResult } from '../types';

const RAG_DIR = path.join(__dirname, '../../logs/rag');
const RAG_FILE = path.join(RAG_DIR, 'documents.json');

function ensureDir(): void {
  if (!fs.existsSync(RAG_DIR)) fs.mkdirSync(RAG_DIR, { recursive: true });
}

function load(): RAGDocument[] {
  ensureDir();
  if (!fs.existsSync(RAG_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(RAG_FILE, 'utf8')) as RAGDocument[]; }
  catch { return []; }
}

function save(docs: RAGDocument[]): void {
  ensureDir();
  fs.writeFileSync(RAG_FILE, JSON.stringify(docs, null, 2), 'utf8');
}

function scoreDoc(doc: RAGDocument, tokens: string[]): number {
  const corpus = `${doc.title} ${doc.content} ${doc.tags.join(' ')}`.toLowerCase();
  return tokens.reduce((sum, tok) => {
    const escaped = tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return sum + (corpus.match(new RegExp(escaped, 'gi')) ?? []).length;
  }, 0);
}

export const RAGStore = {
  ingest(opts: Omit<RAGDocument, 'id' | 'ingested_at'>): RAGDocument {
    const docs = load();
    const doc: RAGDocument = { ...opts, id: randomUUID(), ingested_at: new Date().toISOString() };
    docs.push(doc);
    save(docs);
    return doc;
  },

  search(query: string, limit = 5): RAGSearchResult[] {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    return load()
      .map((doc) => ({ document: doc, score: scoreDoc(doc, tokens) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },

  get(id: string): RAGDocument | null {
    return load().find((d) => d.id === id) ?? null;
  },

  list(limit = 20): RAGDocument[] {
    return load()
      .sort((a, b) => b.ingested_at.localeCompare(a.ingested_at))
      .slice(0, limit);
  },

  count(): number { return load().length; },
};
