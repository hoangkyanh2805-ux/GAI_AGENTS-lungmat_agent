import { MemoryEntry, MemorySetOptions } from '../types';
import { L1Memory } from './L1Memory';
import { L2Memory } from './L2Memory';

const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 min L1 TTL

export class MemoryManager {
  private l1 = new L1Memory();

  set(key: string, value: unknown, opts: MemorySetOptions = {}): void {
    const { ttl_ms = DEFAULT_TTL_MS, persist = true, agent } = opts;
    this.l1.set(key, value, ttl_ms);
    if (persist) {
      L2Memory.set(key, value, agent);
    }
  }

  get(key: string): unknown | undefined {
    const hit = this.l1.get(key);
    if (hit !== undefined) return hit;

    // L1 miss — warm from L2
    const l2 = L2Memory.get(key);
    if (l2 !== undefined) {
      this.l1.set(key, l2.value, DEFAULT_TTL_MS);
      return l2.value;
    }
    return undefined;
  }

  delete(key: string): void {
    this.l1.delete(key);
    L2Memory.delete(key);
  }

  keys(): string[] {
    const combined = new Set([...L2Memory.keys(), ...this.l1.keys()]);
    return [...combined].sort();
  }

  entries(): MemoryEntry[] {
    return L2Memory.all();
  }
}
