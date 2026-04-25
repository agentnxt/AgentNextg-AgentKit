import { useEffect, useState } from 'react';

/**
 * Generic hook to manage resources backed by a ref-count registry.
 *
 * @param key   Dependency key to decide when to re-acquire / release.
 * @param acquire  Function that increments refCount and returns the resource.
 * @param release  Function that decrements refCount (and possibly disposes) the resource.
 */
export function useRefCounted<R>(
  key: unknown,
  acquire: () => R,
  release: () => void
) {
  const [resource, setResource] = useState<R | null>(null);

  useEffect(() => {
    const res = acquire();
    setResource(res);

    return () => {
      release();
      setResource(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return resource;
}
