interface L1Entry {
  value: unknown;
  expires_at: number | null; // epoch ms, null = no expiry
}

export class L1Memory {
  private store = new Map<string, L1Entry>();
  private timer: ReturnType<typeof setInterval>;

  constructor(sweepIntervalMs = 60_000) {
    this.timer = setInterval(() => this.sweep(), sweepIntervalMs);
    // unref so this timer doesn't keep the Node process alive
    if (typeof this.timer.unref === 'function') this.timer.unref();
  }

  set(key: string, value: unknown, ttl_ms?: number): void {
    this.store.set(key, {
      value,
      expires_at: ttl_ms != null ? Date.now() + ttl_ms : null,
    });
  }

  get(key: string): unknown | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expires_at !== null && Date.now() > entry.expires_at) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  keys(): string[] {
    this.sweep();
    return [...this.store.keys()];
  }

  size(): number {
    this.sweep();
    return this.store.size;
  }

  private sweep(): void {
    const now = Date.now();
    for (const [k, v] of this.store) {
      if (v.expires_at !== null && now > v.expires_at) {
        this.store.delete(k);
      }
    }
  }
}
