import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { Prisma } from '@prisma/client';

import { BadRequest, PaginationInput } from '../base';
import { BaseModel } from './base';
import type {
  ChatChunkSimilarity,
  CopilotUserDoc,
  CopilotUserFile,
  CopilotUserFileMetadata,
  DocChunkSimilarity,
  Embedding,
  FileChunkSimilarity,
} from './common';

@Injectable()
export class CopilotUserConfigModel extends BaseModel {
  @Transactional()
  async getUserEmbeddingStatus(userId: string) {
    const [fileTotal, fileEmbedded, docTotal, docEmbedded] = await Promise.all([
      this.db.aiUserFiles.count({ where: { userId } }),
      this.db.aiUserFiles.count({
        where: { userId, embeddings: { some: {} } },
      }),
      this.db.aiUserDocs.count({ where: { userId } }),
      this.db.aiUserDocs.count({
        where: { userId, embeddings: { some: {} } },
      }),
    ]);

    return {
      total: fileTotal + docTotal,
      embedded: fileEmbedded + docEmbedded,
    };
  }

  // ================ embeddings ================

  private processEmbeddings(
    userId: string,
    targetId: string,
    embeddings: Embedding[]
  ) {
    const groups = embeddings.map(e =>
      [
        userId,
        targetId,
        e.index,
        e.content,
        Prisma.raw(`'[${e.embedding.join(',')}]'`),
      ].filter(v => v !== undefined)
    );
    return Prisma.join(groups.map(row => Prisma.sql`(${Prisma.join(row)})`));
  }

  async addDoc(
    userId: string,
    sessionId: string,
    options: { title: string; content: string; metadata?: string }
  ): Promise<CopilotUserDoc> {
    const { title, content, metadata = '' } = options;
    return await this.db.aiUserDocs.create({
      data: { userId, sessionId, title, content, metadata },
    });
  }

  async addFile(
    userId: string,
    file: CopilotUserFileMetadata
  ): Promise<CopilotUserFile> {
    const fileId = randomUUID();
    const row = await this.db.aiUserFiles.create({
      data: { ...file, userId, fileId },
    });

    return row;
  }

  async getDoc(userId: string, docId: string): Promise<CopilotUserDoc | null> {
    const doc = await this.db.aiUserDocs.findFirst({
      where: { userId, docId },
    });
    if (!doc) return null;

    return {
      ...doc,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    };
  }

  async getFile(
    userId: string,
    fileId?: string,
    blobId?: string
  ): Promise<CopilotUserFile | null> {
    const file = await this.db.aiUserFiles.findFirst({
      where: { userId, fileId, blobId },
    });
    return file;
  }

  async updateDoc(
    userId: string,
    docId: string,
    options: {
      title?: string;
      content?: string;
      metadata?: string;
    }
  ) {
    if (!options.title && !options.content) {
      throw new BadRequest(
        'At least one of title or content must be provided for doc update.'
      );
    }
    const row = await this.db.aiUserDocs.update({
      where: { userId_docId: { userId, docId } },
      data: {
        title: options.title,
        content: options.content,
        metadata: options.metadata ?? '',
        updatedAt: new Date(),
      },
    });
    return row;
  }

  async updateFile(
    userId: string,
    fileId: string,
    metadata: string = ''
  ): Promise<CopilotUserFile> {
    const row = await this.db.aiUserFiles.update({
      where: { userId_fileId: { userId, fileId } },
      data: { metadata },
    });
    return row;
  }

  async removeDoc(userId: string, docId: string) {
    const { count } = await this.db.aiUserDocs.deleteMany({
      where: { userId, docId },
    });
    return count > 0;
  }

  async removeFile(userId: string, fileId: string) {
    // embeddings will be removed by foreign key constraint
    await this.db.aiUserFiles.deleteMany({
      where: {
        userId,
        fileId,
      },
    });
    return true;
  }

  async listDocs(
    userId: string,
    options?: PaginationInput
  ): Promise<CopilotUserDoc[]> {
    const docs = await this.db.aiUserDocs.findMany({
      where: { userId },
      select: {
        docId: true,
        sessionId: true,
        title: true,
        content: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: options?.offset,
      take: options?.first,
    });
    return docs;
  }

  async listFiles(
    userId: string,
    options?: {
      includeRead?: boolean;
    } & PaginationInput
  ): Promise<CopilotUserFile[]> {
    const files = await this.db.aiUserFiles.findMany({
      where: { userId },
      select: {
        userId: true,
        fileId: true,
        fileName: true,
        blobId: true,
        mimeType: true,
        size: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: options?.offset,
      take: options?.first,
    });
    return files;
  }

  async countDocs(userId: string): Promise<number> {
    const count = await this.db.aiUserDocs.count({
      where: { userId },
    });
    return count;
  }

  async countFiles(userId: string): Promise<number> {
    const count = await this.db.aiUserFiles.count({
      where: { userId },
    });
    return count;
  }

  @Transactional()
  async insertChatEmbeddings(
    userId: string,
    sessionId: string,
    embeddings: Embedding[]
  ) {
    if (embeddings.length === 0) {
      this.logger.warn(
        `No embeddings provided for userId: ${userId}, sessionId: ${sessionId}. Skipping insertion.`
      );
      return;
    }

    const values = this.processEmbeddings(userId, sessionId, embeddings);
    await this.db.$executeRaw`
          INSERT INTO "ai_user_chat_embeddings"
          ("user_id", "session_id", "chunk", "content", "embedding") VALUES ${values}
          ON CONFLICT (user_id, session_id, chunk) DO NOTHING;
      `;
  }

  @Transactional()
  async insertDocEmbedding(
    userId: string,
    docId: string,
    embeddings: Embedding[]
  ) {
    if (embeddings.length === 0) {
      this.logger.warn(
        `No embeddings provided for userId: ${userId}, docId: ${docId}. Skipping insertion.`
      );
      return;
    }

    const values = this.processEmbeddings(userId, docId, embeddings);

    await this.db.$executeRaw`
      INSERT INTO "ai_user_doc_embeddings"
      ("user_id", "doc_id", "chunk", "content", "embedding") VALUES ${values}
      ON CONFLICT (user_id, doc_id, chunk) DO UPDATE SET
      content = EXCLUDED.content, embedding = EXCLUDED.embedding;
    `;
  }

  @Transactional()
  async insertFileEmbeddings(
    userId: string,
    fileId: string,
    embeddings: Embedding[]
  ) {
    if (embeddings.length === 0) {
      this.logger.warn(
        `No embeddings provided for userId: ${userId}, fileId: ${fileId}. Skipping insertion.`
      );
      return;
    }

    const values = this.processEmbeddings(userId, fileId, embeddings);
    await this.db.$executeRaw`
          INSERT INTO "ai_user_file_embeddings"
          ("user_id", "file_id", "chunk", "content", "embedding") VALUES ${values}
          ON CONFLICT (user_id, file_id, chunk) DO NOTHING;
      `;
  }

  async matchChatEmbedding(
    embedding: number[],
    userId: string,
    topK: number,
    threshold: number
  ): Promise<ChatChunkSimilarity[]> {
    const similarityChunks = await this.db.$queryRaw<
      Array<ChatChunkSimilarity>
    >`
      SELECT "session_id" as "sessionId", "chunk", "content", "embedding" <=> ${embedding}::vector as "distance" 
      FROM "ai_user_chat_embeddings"
      WHERE user_id = ${userId}
      ORDER BY "distance" ASC
      LIMIT ${topK};
    `;
    return similarityChunks.filter(c => Number(c.distance) <= threshold);
  }

  async matchDocEmbedding(
    embedding: number[],
    userId: string,
    topK: number,
    threshold: number
  ): Promise<Omit<DocChunkSimilarity, 'title'>[]> {
    const similarityChunks = await this.db.$queryRaw<
      Array<Omit<DocChunkSimilarity, 'title'>>
    >`
      SELECT "doc_id" as "docId", "chunk", "content", "embedding" <=> ${embedding}::vector as "distance" 
      FROM "ai_user_doc_embeddings"
      WHERE user_id = ${userId}
      ORDER BY "distance" ASC
      LIMIT ${topK};
    `;
    return similarityChunks.filter(c => Number(c.distance) <= threshold);
  }

  async matchFileEmbedding(
    embedding: number[],
    userId: string,
    topK: number,
    threshold: number
  ): Promise<FileChunkSimilarity[]> {
    const similarityChunks = await this.db.$queryRaw<
      Array<FileChunkSimilarity>
    >`
      SELECT
        e."file_id" as "fileId",
        f."file_name" as "name",
        f."blob_id" as "blobId",
        f."mime_type" as "mimeType",
        e."chunk",
        e."content",
        e."embedding" <=> ${embedding}::vector as "distance" 
      FROM "ai_user_file_embeddings" e
      JOIN "ai_user_files" f
        ON e."user_id" = f."user_id"
        AND e."file_id" = f."file_id"
      WHERE e."user_id" = ${userId}
      ORDER BY "distance" ASC
      LIMIT ${topK};
    `;
    return similarityChunks.filter(c => Number(c.distance) <= threshold);
  }
}
