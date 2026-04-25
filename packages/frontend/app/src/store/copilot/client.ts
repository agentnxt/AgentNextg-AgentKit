import type { UserFriendlyError } from '@afk/error';
import {
  addContextChatMutation,
  addContextDocMutation,
  addContextFileExistsMutation,
  addContextFileMutation,
  createCopilotContextMutation,
  createCopilotMessageMutation,
  createCopilotSessionMutation,
  getCopilotHistoriesQuery,
  getCopilotHistoryIdsQuery,
  getCopilotRecentSessionsQuery,
  getCopilotSessionQuery,
  getCopilotSessionsQuery,
  type GraphQLQuery,
  listContextObjectQuery,
  listContextQuery,
  type PaginationInput,
  type QueryOptions,
  type QueryResponse,
  removeContextChatQuery,
  removeContextDocQuery,
  removeContextFileQuery,
  removeCopilotSessionMutation,
  type RequestOptions,
  updateCopilotSessionMutation,
} from '@afk/graphql';

import { gql } from '@/lib/gql';

import {
  GeneralNetworkError,
  PaymentRequiredError,
  UnauthorizedError,
} from './error';

export enum Endpoint {
  Stream = 'stream',
  StreamObject = 'stream-object',
  Workflow = 'workflow',
  Images = 'images',
}

type OptionsField<T extends GraphQLQuery> =
  RequestOptions<T>['variables'] extends { options: infer U } ? U : never;

function codeToError(error: UserFriendlyError) {
  switch (error.status) {
    case 401:
      return new UnauthorizedError();
    case 402:
      return new PaymentRequiredError();
    default:
      return new GeneralNetworkError(
        error.code
          ? `${error.code}: ${error.message}\nIdentify: ${error.name}`
          : error.message
      );
  }
}

export function resolveError(err: any) {
  return codeToError(err);
}

export class CopilotClient {
  constructor(
    readonly gql: <Query extends GraphQLQuery>(
      options: QueryOptions<Query>
    ) => Promise<QueryResponse<Query>>,
    readonly fetcher: (input: string, init?: RequestInit) => Promise<Response>,
    readonly eventSource: (
      url: string,
      eventSourceInitDict?: EventSourceInit
    ) => EventSource
  ) {}

  async createSession(
    options: OptionsField<typeof createCopilotSessionMutation>
  ) {
    try {
      const res = await this.gql({
        query: createCopilotSessionMutation,
        variables: {
          options,
        },
      });
      return res.createCopilotSession;
    } catch (err) {
      throw resolveError(err);
    }
  }

  async updateSession(
    options: OptionsField<typeof updateCopilotSessionMutation>
  ) {
    try {
      const res = await this.gql({
        query: updateCopilotSessionMutation,
        variables: {
          options,
        },
      });
      return res.updateCopilotSession;
    } catch (err) {
      throw resolveError(err);
    }
  }

  async createMessage(
    options: OptionsField<typeof createCopilotMessageMutation>
  ) {
    try {
      const res = await this.gql({
        query: createCopilotMessageMutation,
        variables: {
          options,
        },
      });
      return res.createCopilotMessage;
    } catch (err) {
      throw resolveError(err);
    }
  }

  async getSession(sessionId: string) {
    try {
      const res = await this.gql({
        query: getCopilotSessionQuery,
        variables: { sessionId },
      });
      return res.currentUser?.copilot?.chats?.edges?.[0]?.node;
    } catch (err) {
      throw resolveError(err);
    }
  }

  async getSessions(
    pagination: PaginationInput,
    options?: RequestOptions<
      typeof getCopilotSessionsQuery
    >['variables']['options'],
    signal?: AbortSignal
  ) {
    try {
      const res = await this.gql({
        query: getCopilotSessionsQuery,
        variables: {
          pagination,
          options,
        },
        signal,
      });
      return res.currentUser?.copilot?.chats.edges.map(e => e.node);
    } catch (err) {
      throw resolveError(err);
    }
  }

  async getRecentSessions(
    workspaceId: string,
    limit?: number,
    offset?: number
  ) {
    try {
      const res = await this.gql({
        query: getCopilotRecentSessionsQuery,
        variables: {
          workspaceId,
          limit,
          offset,
        },
      });
      return res.currentUser?.copilot?.chats.edges.map(e => e.node);
    } catch (err) {
      throw resolveError(err);
    }
  }

  async getHistories(
    pagination: PaginationInput,
    options?: RequestOptions<
      typeof getCopilotHistoriesQuery
    >['variables']['options']
  ) {
    try {
      const res = await this.gql({
        query: getCopilotHistoriesQuery,
        variables: {
          pagination,
          options,
        },
      });

      return res.currentUser?.copilot?.chats.edges.map(e => e.node);
    } catch (err) {
      throw resolveError(err);
    }
  }

  async getHistoryIds(
    pagination: PaginationInput,
    options?: RequestOptions<
      typeof getCopilotHistoryIdsQuery
    >['variables']['options']
  ) {
    try {
      const res = await this.gql({
        query: getCopilotHistoryIdsQuery,
        variables: {
          pagination,
          options,
        },
      });

      return res.currentUser?.copilot?.chats.edges.map(e => e.node);
    } catch (err) {
      throw resolveError(err);
    }
  }

  async removeSession(input: { sessionId: string }) {
    try {
      const res = await this.gql({
        query: removeCopilotSessionMutation,
        variables: {
          options: {
            sessionId: input.sessionId,
          },
        },
      });
      return res.removeCopilotSession;
    } catch (err) {
      throw resolveError(err);
    }
  }

  async createContext(sessionId: string) {
    const res = await this.gql({
      query: createCopilotContextMutation,
      variables: {
        sessionId,
      },
    });
    return res.createCopilotContext;
  }

  async getContextId(sessionId: string) {
    const res = await this.gql({
      query: listContextQuery,
      variables: {
        sessionId,
      },
    });
    return res.currentUser?.copilot?.contexts?.[0]?.id || undefined;
  }

  async addContextFile(content: File, contextId: string) {
    const res = await this.gql({
      query: addContextFileMutation,
      variables: {
        content,
        contextId,
      },
      timeout: 60000,
    });
    return res.addContextFile;
  }

  async addContextFileExists(blobId: string, contextId: string) {
    const res = await this.gql({
      query: addContextFileExistsMutation,
      variables: {
        blobId,
        contextId,
      },
    });
    return res.addContextFile;
  }

  async removeContextFile(contextId: string, fileId: string) {
    const res = await this.gql({
      query: removeContextFileQuery,
      variables: {
        contextId,
        fileId,
      },
    });
    return res.currentUser?.copilot?.contexts?.[0];
  }

  async getContextFiles(sessionId: string, contextId: string) {
    const res = await this.gql({
      query: listContextObjectQuery,
      variables: {
        sessionId,
        contextId,
      },
    });
    return res.currentUser?.copilot?.contexts?.[0];
  }

  async chatText({
    sessionId,
    messageId,
    reasoning,
    webSearch,
    modelId,
    signal,
  }: {
    sessionId: string;
    messageId?: string;
    reasoning?: boolean;
    webSearch?: boolean;
    modelId?: string;
    signal?: AbortSignal;
  }) {
    let url = `/api/copilot/chat/${sessionId}`;
    const queryString = this.paramsToQueryString({
      messageId,
      reasoning,
      webSearch,
      modelId,
    });
    if (queryString) {
      url += `?${queryString}`;
    }
    const response = await this.fetcher(url.toString(), { signal });
    return response.text();
  }

  // Text or image to text
  chatTextStream(
    {
      sessionId,
      messageId,
      reasoning,
      webSearch,
      modelId,
      signal,
      tools,
      model,
    }: {
      sessionId: string;
      messageId?: string;
      reasoning?: boolean;
      webSearch?: boolean;
      modelId?: string;
      signal?: AbortSignal;
      tools?: string[];
      model?: string;
    },
    endpoint = Endpoint.StreamObject
  ) {
    let url = `/api/copilot/chat/${sessionId}/${endpoint}`;
    const queryString = this.paramsToQueryString({
      messageId,
      reasoning,
      webSearch,
      modelId,
      tools,
      model,
    });
    if (queryString) {
      url += `?${queryString}`;
    }
    return this.eventSource(url);
  }

  // Text or image to images
  imagesStream(
    sessionId: string,
    messageId?: string,
    seed?: string,
    endpoint = Endpoint.Images
  ) {
    let url = `/api/copilot/chat/${sessionId}/${endpoint}`;
    const queryString = this.paramsToQueryString({
      messageId,
      seed,
    });
    if (queryString) {
      url += `?${queryString}`;
    }
    return this.eventSource(url);
  }

  paramsToQueryString(
    params: Record<string, string | boolean | undefined | string[]>
  ) {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => {
          queryString.append(key, v);
        });
      } else if (typeof value === 'boolean') {
        if (value) {
          queryString.append(key, 'true');
        }
      } else if (typeof value === 'string') {
        queryString.append(key, value);
      }
    });
    return queryString.toString();
  }

  async addContextChat(contextId: string, sessionId: string) {
    const res = await this.gql({
      query: addContextChatMutation,
      variables: {
        contextId,
        sessionId,
      },
    });
    return res.addContextChat;
  }

  async removeContextChat(contextId: string, sessionId: string) {
    const res = await this.gql({
      query: removeContextChatQuery,
      variables: {
        contextId,
        sessionId,
      },
    });
    return res.currentUser?.copilot?.contexts?.[0];
  }

  async addContextDoc(contextId: string, docId: string) {
    const res = await this.gql({
      query: addContextDocMutation,
      variables: {
        contextId,
        docId,
      },
    });
    return res.addContextDoc;
  }

  async removeContextDoc(contextId: string, docId: string) {
    const res = await this.gql({
      query: removeContextDocQuery,
      variables: {
        contextId,
        docId,
      },
    });
    return res.currentUser?.copilot?.contexts?.[0];
  }
}

export const copilotClient = new CopilotClient(
  gql,
  window.fetch,
  (url: string, eventSourceInitDict?: EventSourceInit) => {
    return new EventSource(url, eventSourceInitDict);
  }
);
