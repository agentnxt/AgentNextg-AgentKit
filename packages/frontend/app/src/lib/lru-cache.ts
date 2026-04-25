// A simple generic Least-Recently-Used (LRU) cache based on Map.
// Maintains insertion order to track recency. When the number of entries
// exceeds `capacity`, the least-recently-used (oldest) entry is evicted.

export interface LRUOptions<K, V> {
  /**
   * Called synchronously right before an entry is evicted.
   */
  onEvict?: (key: K, value: V) => void;
}

export class LRUCache<K, V> {
  private readonly capacity: number;
  private readonly map: Map<K, V>;
  private readonly onEvict?: (key: K, value: V) => void;

  constructor(capacity: number, options: LRUOptions<K, V> = {}) {
    if (capacity <= 0) throw new Error('LRUCache capacity must be > 0');
    this.capacity = capacity;
    this.map = new Map();
    this.onEvict = options.onEvict;
  }

  get(key: K): V | undefined {
    const value = this.map.get(key);
    if (value === undefined) return undefined;
    // Update recency by reinserting.
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    }
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const oldestKey = this.map.keys().next().value as K;
      const oldestValue = this.map.get(oldestKey) as V;
      this.map.delete(oldestKey);
      this.onEvict?.(oldestKey, oldestValue);
    }
  }

  delete(key: K): boolean {
    return this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  size(): number {
    return this.map.size;
  }

  keys(): K[] {
    return Array.from(this.map.keys());
  }

  values(): V[] {
    return Array.from(this.map.values());
  }

  entries(): [K, V][] {
    return Array.from(this.map.entries());
  }
} 