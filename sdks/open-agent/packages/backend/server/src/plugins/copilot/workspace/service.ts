import { createHash } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { FileUpload, JobQueue, PaginationInput } from '../../../base';
import { Models } from '../../../models';
import { CopilotStorage } from '../storage';
import { readStream } from '../utils';

@Injectable()
export class CopilotUserService {
  constructor(
    private readonly models: Models,
    private readonly queue: JobQueue,
    private readonly storage: CopilotStorage
  ) {}

  async addDoc(
    userId: string,
    sessionId: string,
    options: { title: string; content: string; metadata?: string }
  ) {
    return await this.models.copilotUser.addDoc(userId, sessionId, options);
  }

  async addFile(userId: string, content: FileUpload, metadata: string = '') {
    const fileName = content.filename;
    const buffer = await readStream(content.createReadStream());
    const blobId = createHash('sha256').update(buffer).digest('base64url');
    await this.storage.put(userId, blobId, buffer);
    const file = await this.models.copilotUser.addFile(userId, {
      fileName,
      blobId,
      mimeType: content.mimetype,
      size: buffer.length,
      metadata,
    });
    return { blobId, file };
  }

  async updateDoc(
    userId: string,
    docId: string,
    update: { title?: string; content?: string; metadata?: string }
  ) {
    return await this.models.copilotUser.updateDoc(userId, docId, update);
  }

  async updateFile(userId: string, fileId: string, metadata: string) {
    return await this.models.copilotUser.updateFile(userId, fileId, metadata);
  }

  async getDoc(userId: string, docId: string) {
    return await this.models.copilotUser.getDoc(userId, docId);
  }

  async getFile(userId: string, options: { fileId?: string; blobId?: string }) {
    if (!options.fileId && !options.blobId) {
      throw new Error('File ID or Blob ID is required');
    }
    return await this.models.copilotUser.getFile(
      userId,
      options.fileId,
      options.blobId
    );
  }

  async listDocs(
    userId: string,
    pagination?: {
      includeRead?: boolean;
    } & PaginationInput
  ) {
    return await Promise.all([
      this.models.copilotUser.listDocs(userId, pagination),
      this.models.copilotUser.countDocs(userId),
    ]);
  }

  async listFiles(
    userId: string,
    pagination?: {
      includeRead?: boolean;
    } & PaginationInput
  ) {
    return await Promise.all([
      this.models.copilotUser.listFiles(userId, pagination),
      this.models.copilotUser.countFiles(userId),
    ]);
  }

  async queueChatEmbedding(chat: Jobs['copilot.embedding.chats']) {
    const { contextId, userId, sessionId } = chat;
    await this.queue.add('copilot.embedding.chats', {
      contextId,
      userId,
      sessionId,
    });
  }

  async queueDocEmbedding(doc: Jobs['copilot.embedding.docs']) {
    const { contextId, userId, docId } = doc;
    await this.queue.add('copilot.embedding.docs', {
      contextId,
      userId,
      docId,
    });
  }

  async queueFileEmbedding(file: Jobs['copilot.embedding.files']) {
    const { contextId, userId, blobId, fileId, fileName } = file;
    await this.queue.add('copilot.embedding.files', {
      contextId,
      userId,
      blobId,
      fileId,
      fileName,
    });
  }

  async removeDoc(userId: string, docId: string) {
    return await this.models.copilotUser.removeDoc(userId, docId);
  }

  async removeFile(userId: string, fileId: string) {
    return await this.models.copilotUser.removeFile(userId, fileId);
  }
}
