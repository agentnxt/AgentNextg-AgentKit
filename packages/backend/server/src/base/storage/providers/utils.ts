import { isReadable, Readable } from 'node:stream';
import { buffer as streamToBuffer } from 'node:stream/consumers';

import { crc32 } from '@node-rs/crc32';

import { getMime } from '../../../native';
import { BlobInputType, PutObjectMetadata } from './provider';

export async function toBuffer(input: BlobInputType): Promise<Buffer> {
  if (Buffer.isBuffer(input)) return input;

  if (
    typeof input === 'string' ||
    ArrayBuffer.isView(input) ||
    input instanceof ArrayBuffer
  ) {
    return Buffer.from(input as any);
  }

  // 3. Node Readable
  if (isReadable(input)) {
    return streamToBuffer(input as Readable);
  }

  // 4. Web ReadableStream
  if (typeof (input as any)?.getReader === 'function') {
    const ab = await new Response(
      input as unknown as ReadableStream
    ).arrayBuffer();
    return Buffer.from(ab);
  }

  throw new TypeError('Unsupported input type for toBuffer');
}

export function autoMetadata(
  blob: Buffer,
  raw: PutObjectMetadata = {}
): PutObjectMetadata {
  const metadata = {
    ...raw,
  };

  if (!metadata.contentLength) {
    metadata.contentLength = blob.byteLength;
  }

  try {
    // checksum
    if (!metadata.checksumCRC32) {
      metadata.checksumCRC32 = crc32(blob).toString(16);
    }

    // mime type
    if (!metadata.contentType) {
      metadata.contentType = getMime(blob);
    }
  } catch {
    // noop
  }

  return metadata;
}

export const SIGNED_URL_EXPIRED = 60 * 60; // 1 hour
