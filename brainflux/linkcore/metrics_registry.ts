export interface MetricEntry {
  key: string
  value: number
  updatedAt: number
  tags?: string[]
  source?: string
}

export class MetricsCache {
  private cache = new Map<string, MetricEntry>()

  get(key: string): MetricEntry | undefined {
    return this.cache.get(key)
  }

  set(key: string, value: number, tags?: string[], source?: string): void {
    this.cache.set(key, { key, value, updatedAt: Date.now(), tags, source })
  }

  hasRecent(key: string, maxAgeMs: number): boolean {
    const entry = this.cache.get(key)
    return !!entry && Date.now() - entry.updatedAt < maxAgeMs
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  entries(): MetricEntry[] {
    return Array.from(this.cache.values())
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  size(): number {
    return this.cache.size
  }

  prune(maxAgeMs: number): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.updatedAt > maxAgeMs) {
        this.cache.delete(key)
      }
    }
  }

  toJSON(): string {
    return JSON.stringify(this.entries(), null, 2)
  }
}
