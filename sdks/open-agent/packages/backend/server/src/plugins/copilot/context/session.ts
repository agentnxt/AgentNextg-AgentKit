import { nanoid } from 'nanoid';

import {
  ArtifactEmbedStatus,
  ChatChunkSimilarity,
  ContextChatOrDoc,
  ContextConfig,
  ContextFile,
  ContextItem,
  DocChunkSimilarity,
  FileChunkSimilarity,
  Models,
} from '../../../models';
import { EmbeddingClient } from '../embedding';

export class ContextSession implements AsyncDisposable {
  constructor(
    private readonly client: EmbeddingClient | undefined,
    private readonly contextId: string,
    private readonly config: ContextConfig,
    private readonly models: Models,
    private readonly dispatcher?: (config: ContextConfig) => Promise<void>
  ) {}

  get id() {
    return this.contextId;
  }

  get userId() {
    return this.config.userId;
  }

  get chats() {
    return this.config.chats;
  }

  get docs() {
    return this.config.docs;
  }

  get files() {
    return this.config.files.map(f => this.fulfillFile(f));
  }

  private fulfillFile(file: ContextFile): Required<ContextFile> {
    return {
      ...file,
      mimeType: file.mimeType || 'application/octet-stream',
    };
  }

  async addChat(sessionId: string): Promise<Required<ContextChatOrDoc>> {
    const existsChat = this.config.chats.find(f => f.id === sessionId);
    if (existsChat) {
      // use exists session id if exists
      if (existsChat.status === ArtifactEmbedStatus.finished) {
        return existsChat;
      }
    } else {
      await this.saveItemRecord(sessionId, 'chats', chat => ({
        ...chat,
        chunkSize: 0,
        error: null,
        createdAt: Date.now(),
      }));
    }
    return this.getChat(sessionId) as ContextChatOrDoc;
  }

  async addDoc(docId: string): Promise<Required<ContextChatOrDoc>> {
    const existsDoc = this.config.docs.find(f => f.id === docId);
    if (existsDoc) {
      // use exists session id if exists
      if (existsDoc.status === ArtifactEmbedStatus.finished) {
        return existsDoc;
      }
    } else {
      await this.saveItemRecord(docId, 'docs', chat => ({
        ...chat,
        chunkSize: 0,
        error: null,
        createdAt: Date.now(),
      }));
    }
    return this.getDoc(docId) as ContextChatOrDoc;
  }

  async addFile(
    blobId: string,
    name: string,
    mimeType: string,
    overrideFileId?: string
  ): Promise<Required<ContextFile>> {
    let fileId = overrideFileId || nanoid();
    const existsBlob = this.config.files.find(f => f.blobId === blobId);
    if (existsBlob) {
      // use exists file id if the blob exists
      // we assume that the file content pointed to by the same blobId is consistent.
      if (existsBlob.status === ArtifactEmbedStatus.finished) {
        return this.fulfillFile(existsBlob);
      }
      fileId = existsBlob.id;
    } else {
      await this.saveItemRecord(fileId, 'files', file => ({
        ...file,
        blobId,
        chunkSize: 0,
        name,
        mimeType,
        error: null,
        createdAt: Date.now(),
      }));
    }
    return this.fulfillFile(this.getFile(fileId) as ContextFile);
  }

  getChat(sessionId: string): ContextChatOrDoc | undefined {
    return this.config.chats.find(f => f.id === sessionId);
  }

  getDoc(docId: string): ContextChatOrDoc | undefined {
    return this.config.docs.find(f => f.id === docId);
  }

  getFile(fileId: string): ContextFile | undefined {
    return this.config.files.find(f => f.id === fileId);
  }

  async removeChat(sessionId: string): Promise<boolean> {
    this.config.chats = this.config.chats.filter(f => f.id !== sessionId);
    await this.save();
    return true;
  }

  async removeDoc(docId: string): Promise<boolean> {
    this.config.docs = this.config.docs.filter(f => f.id !== docId);
    await this.save();
    return true;
  }

  async removeFile(fileId: string): Promise<boolean> {
    this.config.files = this.config.files.filter(f => f.id !== fileId);
    await this.save();
    return true;
  }

  /**
   * Match the input text with the chat chunks
   * @param content input text to match
   * @param topK number of similar chunks to return, default 5
   * @param signal abort signal
   * @param threshold relevance threshold for the similarity score, higher threshold means more similar chunks, default 0.7, good enough based on prior experiments
   * @returns list of similar chunks
   */
  async matchChats(
    content: string,
    topK: number = 5,
    signal?: AbortSignal,
    threshold: number = 0.85
  ): Promise<ChatChunkSimilarity[]> {
    if (!this.client) return [];
    const embedding = await this.client.getEmbedding(content, signal);
    if (!embedding) return [];

    const context = await this.models.copilotUser.matchChatEmbedding(
      embedding,
      this.userId,
      topK * 2,
      threshold
    );

    const chats = new Set(this.chats.map(c => c.id));

    return this.client.reRank(
      content,
      context.filter(c => chats.has(c.sessionId)),
      topK,
      signal
    );
  }

  /**
   * Match the input text with the doc chunks
   * @param content input text to match
   * @param topK number of similar chunks to return, default 5
   * @param signal abort signal
   * @param threshold relevance threshold for the similarity score, higher threshold means more similar chunks, default 0.7, good enough based on prior experiments
   * @returns list of similar chunks
   */
  async matchDocs(
    content: string,
    topK: number = 5,
    signal?: AbortSignal,
    threshold: number = 0.85
  ): Promise<DocChunkSimilarity[]> {
    if (!this.client) return [];
    const embedding = await this.client.getEmbedding(content, signal);
    if (!embedding) return [];

    const context = await this.models.copilotUser.matchDocEmbedding(
      embedding,
      this.userId,
      topK * 2,
      threshold
    );

    const docs = new Set(this.docs.map(d => d.id));

    return this.client.reRank(
      content,
      context.filter(d => docs.has(d.docId)),
      topK,
      signal
    );
  }

  /**
   * Match the input text with the file chunks
   * @param content input text to match
   * @param topK number of similar chunks to return, default 5
   * @param signal abort signal
   * @param threshold relevance threshold for the similarity score, higher threshold means more similar chunks, default 0.7, good enough based on prior experiments
   * @returns list of similar chunks
   */
  async matchFiles(
    content: string,
    topK: number = 5,
    signal?: AbortSignal,
    threshold: number = 0.85
  ): Promise<FileChunkSimilarity[]> {
    if (!this.client) return [];
    const embedding = await this.client.getEmbedding(content, signal);
    if (!embedding) return [];

    const context = await this.models.copilotUser.matchFileEmbedding(
      embedding,
      this.userId,
      topK * 2,
      threshold
    );
    const files = new Map(this.files.map(f => [f.id, f]));

    return this.client.reRank(
      content,
      [
        ...context
          .filter(f => files.has(f.fileId))
          .map(c => {
            const { blobId, name, mimeType } = files.get(
              c.fileId
            ) as Required<ContextFile>;
            return { ...c, blobId, name, mimeType };
          }),
        ...context.filter(f => !files.has(f.fileId)),
      ],
      topK,
      signal
    );
  }

  async saveItemRecord(
    chatOrFileId: string,
    type: 'chats' | 'docs' | 'files',
    cb: (
      record: Pick<ContextItem, 'id' | 'status'> &
        Partial<Omit<ContextItem, 'id' | 'status'>>
    ) => Partial<typeof type extends 'chats' ? ContextChatOrDoc : ContextFile>
  ) {
    const items = this.config[type];
    const item = items.find(f => f.id === chatOrFileId);
    if (item) {
      Object.assign(item, cb({ ...item }));
    } else {
      const file = { id: chatOrFileId, status: ArtifactEmbedStatus.processing };
      items.push(
        cb(file) as typeof type extends 'chats' ? ContextChatOrDoc : ContextFile
      );
    }
    await this.save();
  }

  async save() {
    await this.dispatcher?.(this.config);
  }

  async [Symbol.asyncDispose]() {
    await this.save();
  }
}
