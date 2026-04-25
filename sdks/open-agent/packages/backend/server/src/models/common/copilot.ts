import { AiJobStatus, AiJobType } from '@prisma/client';
import type { JsonValue } from '@prisma/client/runtime/library';
import { z } from 'zod';

export interface CopilotJob {
  id?: string;
  blobId: string;
  createdBy?: string;
  type: AiJobType;
  status?: AiJobStatus;
  payload?: JsonValue;
}

export interface CopilotContext {
  id?: string;
  sessionId: string;
  config: JsonValue;
  createdAt: Date;
  updatedAt: Date;
}

export enum ArtifactEmbedStatus {
  processing = 'processing',
  finished = 'finished',
  failed = 'failed',
}

const ArtifactEmbedStatusSchema = z.enum([
  ArtifactEmbedStatus.processing,
  ArtifactEmbedStatus.finished,
  ArtifactEmbedStatus.failed,
]);

export const ContextChatOrDocSchema = z.object({
  id: z.string(),
  chunkSize: z.number(),
  status: ArtifactEmbedStatusSchema,
  error: z.string().nullable(),
  createdAt: z.number(),
});

export const ContextFileSchema = z.object({
  id: z.string(),
  chunkSize: z.number(),
  name: z.string(),
  mimeType: z.string().optional(),
  status: ArtifactEmbedStatusSchema,
  error: z.string().nullable(),
  blobId: z.string(),
  createdAt: z.number(),
});

export const ContextConfigSchema = z.object({
  userId: z.string(),
  chats: ContextChatOrDocSchema.array(),
  docs: ContextChatOrDocSchema.array(),
  files: ContextFileSchema.array(),
});

export const MinimalContextConfigSchema = ContextConfigSchema.pick({
  userId: true,
});

export type ContextConfig = z.infer<typeof ContextConfigSchema>;
export type ContextChatOrDoc = z.infer<typeof ContextChatOrDocSchema>;
export type ContextFile = z.infer<typeof ContextFileSchema>;
export type ContextItem = ContextChatOrDoc | ContextFile;

// embeddings

export type Embedding = {
  /**
   * The index of the embedding in the list of embeddings.
   */
  index: number;
  content: string;
  embedding: Array<number>;
};

export type ChunkSimilarity = {
  chunk: number;
  content: string;
  distance: number | null;
};

export type ChatChunkSimilarity = ChunkSimilarity & {
  sessionId: string;
};

export type DocChunkSimilarity = ChunkSimilarity & {
  docId: string;
};

export type FileChunkSimilarity = ChunkSimilarity & {
  fileId: string;
  blobId: string;
  name: string;
  mimeType: string;
};

export const CopilotUserDocSchema = z.object({
  title: z.string(),
  content: z.string(),
  metadata: z.string(),
});
export type CopilotUserDocMetadata = z.infer<typeof CopilotUserDocSchema>;
export type CopilotUserDoc = CopilotUserDocMetadata & {
  docId: string;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
};

export const CopilotUserFileSchema = z.object({
  fileName: z.string(),
  blobId: z.string(),
  mimeType: z.string(),
  size: z.number(),
  metadata: z.string(),
});

export type CopilotUserFileMetadata = z.infer<typeof CopilotUserFileSchema>;
export type CopilotUserFile = CopilotUserFileMetadata & {
  userId: string;
  fileId: string;
  createdAt: Date;
};
