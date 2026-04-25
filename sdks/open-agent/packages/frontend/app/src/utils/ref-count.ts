export interface RefEntry<T> {
  value: T;
  refCount: number;
}

export function createRefCounter<K, V>(options?: { maxCacheSize?: number }) {
  // Maximum number of entries allowed in the cache (including those with non-zero ref count).
  // Defaults to Infinity which behaves like the previous implementation (no eviction).
  const maxCacheSize = options?.maxCacheSize ?? Infinity;

  // `Map` preserves insertion order, so we can treat it as an LRU list by
  // re-inserting keys whenever they are accessed. The *oldest* item will be
  // at the beginning of the map.
  const map = new Map<K, RefEntry<V>>();

  function acquire(key: K, factory: () => V): V {
    const entry = map.get(key);
    if (entry) {
      // Bump ref count and move the entry to the *most-recently-used* position.
      entry.refCount += 1;
      map.delete(key);
      map.set(key, entry);
      return entry.value;
    }

    // Create new entry.
    const value = factory();
    map.set(key, { value, refCount: 1 });
    return value;
  }

  function release(key: K, onZero?: (value: V) => void) {
    const entry = map.get(key);
    if (!entry) return;
    entry.refCount -= 1;

    // Move the entry to the MRU end even when releasing — this counts as an
    // access event.
    map.delete(key);
    map.set(key, entry);

    // Fire `onZero` when the ref count hits zero (preserving existing
    // semantics), but *keep* the entry so it can be reused later.
    if (entry.refCount === 0) {
      onZero?.(entry.value);
    }

    // Evict the least-recently-used *zero-ref* entries once we exceed the
    // cache capacity.
    if (map.size > maxCacheSize) {
      // Iterate from oldest -> newest until we find an unused entry.
      for (const [oldKey, oldEntry] of map) {
        if (oldEntry.refCount === 0) {
          map.delete(oldKey);
          break;
        }
      }
    }
  }

  function get(key: K): V | undefined {
    return map.get(key)?.value;
  }

  function list(): K[] {
    return Array.from(map.keys());
  }

  return { acquire, release, get, list } as const;
}
