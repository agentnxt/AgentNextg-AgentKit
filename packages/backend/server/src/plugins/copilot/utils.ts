import { Readable } from 'node:stream';
import { ReadableStreamReadResult } from 'node:stream/web';

import type { Request } from 'express';

import { readBufferWithLimit } from '../../base';
import { MAX_EMBEDDABLE_SIZE } from './types';

export function readStream(
  readable: Readable,
  maxSize = MAX_EMBEDDABLE_SIZE
): Promise<Buffer> {
  return readBufferWithLimit(readable, maxSize);
}

type RequestClosedCallback = (isAborted: boolean) => void;
type SignalReturnType = {
  signal: AbortSignal;
  onConnectionClosed: (cb: RequestClosedCallback) => void;
};

export function getSignal(req: Request): SignalReturnType {
  const controller = new AbortController();

  let hasEnded = false;
  let callback: ((isAborted: boolean) => void) | undefined = undefined;

  const onSocketEnd = () => {
    hasEnded = true;
  };
  const onSocketClose = (hadError: boolean) => {
    req.socket.off('end', onSocketEnd);
    req.socket.off('close', onSocketClose);
    // NOTE: the connection is considered abnormally interrupted:
    // 1. there is an error when the socket is closed.
    // 2. the connection is closed directly without going through the normal end process (the client disconnects actively).
    const aborted = hadError || !hasEnded;
    if (aborted) {
      controller.abort();
    }

    callback?.(aborted);
  };

  req.socket.on('end', onSocketEnd);
  req.socket.on('close', onSocketClose);

  return {
    signal: controller.signal,
    onConnectionClosed: cb => (callback = cb),
  };
}

export async function* mergeStreams<F, S>(
  first: ReadableStream<F>,
  second: ReadableStream<S>
): AsyncGenerator<F | S> {
  type IndexedRead = { idx: number; result: ReadableStreamReadResult<F | S> };

  const readers = [first, second].map(s => s.getReader());
  const reads: Promise<IndexedRead>[] = readers.map((r, idx) =>
    r.read().then(result => ({ idx, result }))
  );
  const readerStates = readers.map(() => ({ locked: true, released: false }));

  const safeReleaseLock = (
    reader: ReadableStreamDefaultReader<F | S>,
    idx: number
  ) => {
    try {
      if (readerStates[idx].locked && !readerStates[idx].released) {
        reader.releaseLock();
        readerStates[idx].released = true;
        readerStates[idx].locked = false;
      }
    } catch (error) {
      // Reader might already be released or in an invalid state
      readerStates[idx].released = true;
      readerStates[idx].locked = false;
    }
  };

  try {
    while (reads.length) {
      const { idx, result } = await Promise.race(reads);

      if (result.done) {
        if (idx === 0) {
          // Release all readers when first stream is done
          readers.forEach((reader, i) => safeReleaseLock(reader, i));
          break;
        } else {
          // Release only the finished reader
          safeReleaseLock(readers[idx], idx);
          reads.splice(idx, 1);
          readers.splice(idx, 1);
          readerStates.splice(idx, 1);

          // Adjust indices for remaining reads
          for (let i = idx; i < reads.length; i++) {
            reads[i] = reads[i].then(({ idx: old, result }) => ({
              idx: old - 1,
              result,
            }));
          }
          continue;
        }
      }

      reads[idx] = readers[idx].read().then(result => ({ idx, result }));
      yield result.value!;
    }
  } finally {
    // Safe cleanup of all remaining readers
    readers.forEach((reader, idx) => safeReleaseLock(reader, idx));
  }
}
