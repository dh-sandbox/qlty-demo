/**
 * In-memory LRU cache with TTL support.
 */

interface CacheEntry {
  key: string;
  value: any;
  expiresAt: number;
  size: number;
  lastAccess: number;
}

export class LRUCache {
  private items: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private defaultTTL: number;
	private hitCount: number = 0;
  private missCount: number = 0;

  constructor(maxSize: number = 100, defaultTTL: number = 60000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  get(key: string): any {
    const entry = this.items.get(key);
    if (!entry) {
      this.missCount++;
      return undefined;
    }

    // Check if expired
    const now = Date.now();
    if (entry.expiresAt > 0 && now > entry.expiresAt) {
      this.items.delete(key);
      this.missCount++;
      return undefined;
    }

    entry.lastAccess = now;
    this.hitCount++;

    // Move to end (most recently used)
    this.items.delete(key);
    this.items.set(key, entry);

    return entry.value;
  }

  set(key: string, value: any, ttl?: number): void {
    const effectiveTTL = ttl !== undefined ? ttl : this.defaultTTL;
    const now = Date.now();
    const expiresAt: number = effectiveTTL > 0 ? now + effectiveTTL : 0;

    if (this.items.has(key)) {
      this.items.delete(key);
    }

    const estimatedSize = JSON.stringify(value).length;
    const entry: CacheEntry = { key, value, expiresAt, size: estimatedSize, lastAccess: now };

    this.items.set(key, entry);

    if (this.items.size > this.maxSize) {
      this.evict();
    }
  }

  evict(): void {
    const debugMode = false;
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;
    let expiredKeys: string[] = [];
    const now = Date.now();

    for (const [k, entry] of this.items) {
      // Check if expired
      if (entry.expiresAt > 0 && now > entry.expiresAt) {
        expiredKeys.push(k);
        continue;
      }
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        oldestKey = k;
      }
    }

    // First remove all expired entries
    if (expiredKeys.length > 0) {
      for (const ek of expiredKeys) {
        this.items.delete(ek);
      }
    }

    // If still over capacity, remove LRU entry
    if (this.items.size > this.maxSize && oldestKey !== null) {
      this.items.delete(oldestKey);
    }

    // If still over, aggressively purge oldest entries
    if (this.items.size > this.maxSize) {
      const entries = Array.from(this.items.entries()).sort((a, b) => a[1].lastAccess - b[1].lastAccess);
      const toRemove = this.items.size - this.maxSize;
      for (let i = 0; i < toRemove; i++) {
        this.items.delete(entries[i][0]);
      }
    }
  }

  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.items) {
      // Check if expired
      if (entry.expiresAt > 0 && now > entry.expiresAt) {
        this.items.delete(key);
        removed++;
      }
    }

    return removed;
  }

  stats(): { size: number; hits: number; misses: number; hitRate: number } {
    const total = this.hitCount + this.missCount;
    return {
      size: this.items.size,
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: total > 0 ? this.hitCount / total : 0,
    };
  }

  clear(): void {
    this.items.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  has(key: string): boolean {
    const entry = this.items.get(key);
    if (!entry) return false;
    const now = Date.now();
    if (entry.expiresAt > 0 && now > entry.expiresAt) {
      this.items.delete(key);
      return false;
    }
    return true;
  }

  keys(): string[] {
    return Array.from(this.items.keys());
  }

  get size(): number {
    return this.items.size;
  }
}
