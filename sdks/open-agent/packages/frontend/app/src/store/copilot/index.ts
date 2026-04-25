export { CopilotClient, Endpoint, resolveError } from './client';
export {
  type AIError,
  AIErrorType,
  GeneralNetworkError,
  PaymentRequiredError,
  RequestTimeoutError,
  UnauthorizedError,
} from './error';
export { type AffineTextEvent, toTextStream } from './event-source';

// ---------------- New chat session stores ----------------
export { createChatSessionStore } from './session-store';
export {
  type ChatSessionsState,
  createChatSessionsStore,
} from './sessions-store';
