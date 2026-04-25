export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string };
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: Record<string, string>; output: Record<string, string> };
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any };
  /** The `SafeInt` scalar type represents non-fractional signed whole numeric values that are considered safe as defined by the ECMAScript specification. */
  SafeInt: { input: number; output: number };
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: File; output: File };
}

export enum AiJobStatus {
  claimed = 'claimed',
  failed = 'failed',
  finished = 'finished',
  pending = 'pending',
  running = 'running',
}

export interface AppConfigValidateResult {
  __typename?: 'AppConfigValidateResult';
  error: Maybe<Scalars['String']['output']>;
  key: Scalars['String']['output'];
  module: Scalars['String']['output'];
  valid: Scalars['Boolean']['output'];
  value: Scalars['JSON']['output'];
}

export interface BlobNotFoundDataType {
  __typename?: 'BlobNotFoundDataType';
  blobId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
}

export enum ChatHistoryOrder {
  asc = 'asc',
  desc = 'desc',
}

export interface ChatMessage {
  __typename?: 'ChatMessage';
  attachments: Maybe<Array<Scalars['String']['output']>>;
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Maybe<Scalars['ID']['output']>;
  params: Maybe<Scalars['JSON']['output']>;
  role: Scalars['String']['output'];
  streamObjects: Maybe<Array<StreamObject>>;
}

export enum ContextEmbedStatus {
  failed = 'failed',
  finished = 'finished',
  processing = 'processing',
}

export interface ContextUserEmbeddingStatus {
  __typename?: 'ContextUserEmbeddingStatus';
  embedded: Scalars['SafeInt']['output'];
  total: Scalars['SafeInt']['output'];
}

export interface Copilot {
  __typename?: 'Copilot';
  audioTranscription: Maybe<TranscriptionResultType>;
  chats: PaginatedCopilotHistoriesType;
  /** Get the context list of a session */
  contexts: Array<CopilotContext>;
  /** query user embedding status */
  embeddingStatus: ContextUserEmbeddingStatus;
  /** Get the quota of the user */
  quota: CopilotQuota;
  /** Get the session by id */
  session: CopilotSessionType;
  userId: Scalars['String']['output'];
}

export interface CopilotAudioTranscriptionArgs {
  blobId?: InputMaybe<Scalars['String']['input']>;
  jobId?: InputMaybe<Scalars['String']['input']>;
}

export interface CopilotChatsArgs {
  options?: InputMaybe<QueryChatHistoriesInput>;
  pagination: PaginationInput;
}

export interface CopilotContextsArgs {
  contextId?: InputMaybe<Scalars['String']['input']>;
  sessionId?: InputMaybe<Scalars['String']['input']>;
}

export interface CopilotSessionArgs {
  sessionId: Scalars['String']['input'];
}

export interface CopilotContext {
  __typename?: 'CopilotContext';
  /** list files in context */
  chats: Array<CopilotContextChatOrDoc>;
  /** list files in context */
  docs: Array<CopilotContextChatOrDoc>;
  /** list files in context */
  files: Array<CopilotContextFile>;
  id: Maybe<Scalars['ID']['output']>;
  /** remove a chat from context */
  removeContextChat: Scalars['Boolean']['output'];
  /** remove a doc from context */
  removeContextDoc: Scalars['Boolean']['output'];
  /** remove a file from context */
  removeContextFile: Scalars['Boolean']['output'];
  userId: Scalars['ID']['output'];
}

export interface CopilotContextRemoveContextChatArgs {
  sessionId: Scalars['String']['input'];
}

export interface CopilotContextRemoveContextDocArgs {
  docId: Scalars['String']['input'];
}

export interface CopilotContextRemoveContextFileArgs {
  fileId: Scalars['String']['input'];
}

export interface CopilotContextChatOrDoc {
  __typename?: 'CopilotContextChatOrDoc';
  chunkSize: Scalars['SafeInt']['output'];
  createdAt: Scalars['SafeInt']['output'];
  error: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  status: ContextEmbedStatus;
}

export interface CopilotContextFile {
  __typename?: 'CopilotContextFile';
  blobId: Scalars['String']['output'];
  chunkSize: Scalars['SafeInt']['output'];
  createdAt: Scalars['SafeInt']['output'];
  error: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  mimeType: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: ContextEmbedStatus;
}

export interface CopilotContextFileNotSupportedDataType {
  __typename?: 'CopilotContextFileNotSupportedDataType';
  fileName: Scalars['String']['output'];
  message: Scalars['String']['output'];
}

export interface CopilotDocNotFoundDataType {
  __typename?: 'CopilotDocNotFoundDataType';
  docId: Scalars['String']['output'];
}

export interface CopilotFailedToAddUserArtifactDataType {
  __typename?: 'CopilotFailedToAddUserArtifactDataType';
  message: Scalars['String']['output'];
  type: Scalars['String']['output'];
}

export interface CopilotFailedToGenerateEmbeddingDataType {
  __typename?: 'CopilotFailedToGenerateEmbeddingDataType';
  message: Scalars['String']['output'];
  provider: Scalars['String']['output'];
}

export interface CopilotFailedToMatchContextDataType {
  __typename?: 'CopilotFailedToMatchContextDataType';
  content: Scalars['String']['output'];
  contextId: Scalars['String']['output'];
  message: Scalars['String']['output'];
}

export interface CopilotFailedToMatchGlobalContextDataType {
  __typename?: 'CopilotFailedToMatchGlobalContextDataType';
  content: Scalars['String']['output'];
  message: Scalars['String']['output'];
  userId: Scalars['String']['output'];
}

export interface CopilotFailedToModifyContextDataType {
  __typename?: 'CopilotFailedToModifyContextDataType';
  contextId: Scalars['String']['output'];
  message: Scalars['String']['output'];
}

export interface CopilotHistories {
  __typename?: 'CopilotHistories';
  /** An mark identifying which view to use to display the session */
  action: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  messages: Array<ChatMessage>;
  metadata: Scalars['String']['output'];
  model: Scalars['String']['output'];
  optionalModels: Array<Scalars['String']['output']>;
  pinned: Scalars['Boolean']['output'];
  promptName: Scalars['String']['output'];
  sessionId: Scalars['String']['output'];
  title: Maybe<Scalars['String']['output']>;
  /** The number of tokens used in the session */
  tokens: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
}

export interface CopilotHistoriesTypeEdge {
  __typename?: 'CopilotHistoriesTypeEdge';
  cursor: Scalars['String']['output'];
  node: CopilotHistories;
}

export interface CopilotInvalidContextDataType {
  __typename?: 'CopilotInvalidContextDataType';
  contextId: Scalars['String']['output'];
}

export interface CopilotMessageNotFoundDataType {
  __typename?: 'CopilotMessageNotFoundDataType';
  messageId: Scalars['String']['output'];
}

export interface CopilotPromptConfigInput {
  frequencyPenalty?: InputMaybe<Scalars['Float']['input']>;
  presencePenalty?: InputMaybe<Scalars['Float']['input']>;
  temperature?: InputMaybe<Scalars['Float']['input']>;
  topP?: InputMaybe<Scalars['Float']['input']>;
}

export interface CopilotPromptConfigType {
  __typename?: 'CopilotPromptConfigType';
  frequencyPenalty: Maybe<Scalars['Float']['output']>;
  presencePenalty: Maybe<Scalars['Float']['output']>;
  temperature: Maybe<Scalars['Float']['output']>;
  topP: Maybe<Scalars['Float']['output']>;
}

export interface CopilotPromptMessageInput {
  content: Scalars['String']['input'];
  params?: InputMaybe<Scalars['JSON']['input']>;
  role: CopilotPromptMessageRole;
}

export enum CopilotPromptMessageRole {
  assistant = 'assistant',
  system = 'system',
  user = 'user',
}

export interface CopilotPromptMessageType {
  __typename?: 'CopilotPromptMessageType';
  content: Scalars['String']['output'];
  params: Maybe<Scalars['JSON']['output']>;
  role: CopilotPromptMessageRole;
}

export interface CopilotPromptNotFoundDataType {
  __typename?: 'CopilotPromptNotFoundDataType';
  name: Scalars['String']['output'];
}

export interface CopilotPromptType {
  __typename?: 'CopilotPromptType';
  action: Maybe<Scalars['String']['output']>;
  config: Maybe<CopilotPromptConfigType>;
  messages: Array<CopilotPromptMessageType>;
  model: Scalars['String']['output'];
  name: Scalars['String']['output'];
}

export interface CopilotProviderNotSupportedDataType {
  __typename?: 'CopilotProviderNotSupportedDataType';
  kind: Scalars['String']['output'];
  provider: Scalars['String']['output'];
}

export interface CopilotProviderSideErrorDataType {
  __typename?: 'CopilotProviderSideErrorDataType';
  kind: Scalars['String']['output'];
  message: Scalars['String']['output'];
  provider: Scalars['String']['output'];
}

export interface CopilotQuota {
  __typename?: 'CopilotQuota';
  limit: Maybe<Scalars['SafeInt']['output']>;
  used: Scalars['SafeInt']['output'];
}

export interface CopilotSessionType {
  __typename?: 'CopilotSessionType';
  id: Scalars['ID']['output'];
  model: Scalars['String']['output'];
  optionalModels: Array<Scalars['String']['output']>;
  pinned: Scalars['Boolean']['output'];
  promptName: Scalars['String']['output'];
  title: Maybe<Scalars['String']['output']>;
}

export interface CopilotUserConfig {
  __typename?: 'CopilotUserConfig';
  /** list user docs in context */
  docs: PaginatedCopilotUserDoc;
  files: PaginatedCopilotUserFile;
  userId: Scalars['String']['output'];
}

export interface CopilotUserConfigDocsArgs {
  pagination: PaginationInput;
}

export interface CopilotUserConfigFilesArgs {
  pagination: PaginationInput;
}

export interface CopilotUserDoc {
  __typename?: 'CopilotUserDoc';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  docId: Scalars['String']['output'];
  metadata: Scalars['String']['output'];
  sessionId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
}

export interface CopilotUserDocTypeEdge {
  __typename?: 'CopilotUserDocTypeEdge';
  cursor: Scalars['String']['output'];
  node: CopilotUserDoc;
}

export interface CopilotUserFile {
  __typename?: 'CopilotUserFile';
  blobId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  fileId: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
  metadata: Scalars['String']['output'];
  mimeType: Scalars['String']['output'];
  size: Scalars['SafeInt']['output'];
  userId: Scalars['String']['output'];
}

export interface CopilotUserFileTypeEdge {
  __typename?: 'CopilotUserFileTypeEdge';
  cursor: Scalars['String']['output'];
  node: CopilotUserFile;
}

export interface CreateChatMessageInput {
  blob?: InputMaybe<Scalars['Upload']['input']>;
  blobs?: InputMaybe<Array<Scalars['Upload']['input']>>;
  content?: InputMaybe<Scalars['String']['input']>;
  params?: InputMaybe<Scalars['JSON']['input']>;
  sessionId: Scalars['String']['input'];
}

export interface CreateChatSessionInput {
  /** mark the session create from which doc */
  docId?: InputMaybe<Scalars['String']['input']>;
  pinned?: InputMaybe<Scalars['Boolean']['input']>;
  /** The prompt name to use for the session */
  promptName: Scalars['String']['input'];
  /** true by default, compliant for old version */
  reuseLatestChat?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface CreateCopilotPromptInput {
  action?: InputMaybe<Scalars['String']['input']>;
  config?: InputMaybe<CopilotPromptConfigInput>;
  messages: Array<CopilotPromptMessageInput>;
  model: Scalars['String']['input'];
  name: Scalars['String']['input'];
}

export interface CreateUserInput {
  email: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
}

export interface CredentialsRequirementType {
  __typename?: 'CredentialsRequirementType';
  password: PasswordLimitsType;
}

export interface DeleteAccount {
  __typename?: 'DeleteAccount';
  success: Scalars['Boolean']['output'];
}

export type ErrorDataUnion =
  | BlobNotFoundDataType
  | CopilotContextFileNotSupportedDataType
  | CopilotDocNotFoundDataType
  | CopilotFailedToAddUserArtifactDataType
  | CopilotFailedToGenerateEmbeddingDataType
  | CopilotFailedToMatchContextDataType
  | CopilotFailedToMatchGlobalContextDataType
  | CopilotFailedToModifyContextDataType
  | CopilotInvalidContextDataType
  | CopilotMessageNotFoundDataType
  | CopilotPromptNotFoundDataType
  | CopilotProviderNotSupportedDataType
  | CopilotProviderSideErrorDataType
  | GraphqlBadRequestDataType
  | HttpRequestErrorDataType
  | InvalidAppConfigDataType
  | InvalidAppConfigInputDataType
  | InvalidEmailDataType
  | InvalidOauthCallbackCodeDataType
  | InvalidOauthResponseDataType
  | InvalidPasswordLengthDataType
  | InvalidRuntimeConfigTypeDataType
  | MissingOauthQueryParameterDataType
  | NoCopilotProviderAvailableDataType
  | QueryTooLongDataType
  | RuntimeConfigNotFoundDataType
  | UnknownOauthProviderDataType
  | UnsupportedClientVersionDataType
  | ValidationErrorDataType
  | WrongSignInCredentialsDataType;

export enum ErrorNames {
  ACCESS_DENIED = 'ACCESS_DENIED',
  ACTION_FORBIDDEN = 'ACTION_FORBIDDEN',
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  BAD_REQUEST = 'BAD_REQUEST',
  BLOB_NOT_FOUND = 'BLOB_NOT_FOUND',
  BLOB_QUOTA_EXCEEDED = 'BLOB_QUOTA_EXCEEDED',
  CANNOT_DELETE_ALL_ADMIN_ACCOUNT = 'CANNOT_DELETE_ALL_ADMIN_ACCOUNT',
  CANNOT_DELETE_OWN_ACCOUNT = 'CANNOT_DELETE_OWN_ACCOUNT',
  CAPTCHA_VERIFICATION_FAILED = 'CAPTCHA_VERIFICATION_FAILED',
  COPILOT_ACTION_TAKEN = 'COPILOT_ACTION_TAKEN',
  COPILOT_CONTEXT_FILE_NOT_SUPPORTED = 'COPILOT_CONTEXT_FILE_NOT_SUPPORTED',
  COPILOT_DOCS_NOT_FOUND = 'COPILOT_DOCS_NOT_FOUND',
  COPILOT_DOC_NOT_FOUND = 'COPILOT_DOC_NOT_FOUND',
  COPILOT_EMBEDDING_UNAVAILABLE = 'COPILOT_EMBEDDING_UNAVAILABLE',
  COPILOT_FAILED_TO_ADD_USER_ARTIFACT = 'COPILOT_FAILED_TO_ADD_USER_ARTIFACT',
  COPILOT_FAILED_TO_CREATE_MESSAGE = 'COPILOT_FAILED_TO_CREATE_MESSAGE',
  COPILOT_FAILED_TO_GENERATE_EMBEDDING = 'COPILOT_FAILED_TO_GENERATE_EMBEDDING',
  COPILOT_FAILED_TO_GENERATE_TEXT = 'COPILOT_FAILED_TO_GENERATE_TEXT',
  COPILOT_FAILED_TO_MATCH_CONTEXT = 'COPILOT_FAILED_TO_MATCH_CONTEXT',
  COPILOT_FAILED_TO_MATCH_GLOBAL_CONTEXT = 'COPILOT_FAILED_TO_MATCH_GLOBAL_CONTEXT',
  COPILOT_FAILED_TO_MODIFY_CONTEXT = 'COPILOT_FAILED_TO_MODIFY_CONTEXT',
  COPILOT_INVALID_CONTEXT = 'COPILOT_INVALID_CONTEXT',
  COPILOT_MESSAGE_NOT_FOUND = 'COPILOT_MESSAGE_NOT_FOUND',
  COPILOT_PROMPT_INVALID = 'COPILOT_PROMPT_INVALID',
  COPILOT_PROMPT_NOT_FOUND = 'COPILOT_PROMPT_NOT_FOUND',
  COPILOT_PROVIDER_NOT_SUPPORTED = 'COPILOT_PROVIDER_NOT_SUPPORTED',
  COPILOT_PROVIDER_SIDE_ERROR = 'COPILOT_PROVIDER_SIDE_ERROR',
  COPILOT_QUOTA_EXCEEDED = 'COPILOT_QUOTA_EXCEEDED',
  COPILOT_SESSION_DELETED = 'COPILOT_SESSION_DELETED',
  COPILOT_SESSION_INVALID_INPUT = 'COPILOT_SESSION_INVALID_INPUT',
  COPILOT_SESSION_NOT_FOUND = 'COPILOT_SESSION_NOT_FOUND',
  COPILOT_TRANSCRIPTION_AUDIO_NOT_PROVIDED = 'COPILOT_TRANSCRIPTION_AUDIO_NOT_PROVIDED',
  COPILOT_TRANSCRIPTION_JOB_EXISTS = 'COPILOT_TRANSCRIPTION_JOB_EXISTS',
  COPILOT_TRANSCRIPTION_JOB_NOT_FOUND = 'COPILOT_TRANSCRIPTION_JOB_NOT_FOUND',
  EARLY_ACCESS_REQUIRED = 'EARLY_ACCESS_REQUIRED',
  EMAIL_ALREADY_USED = 'EMAIL_ALREADY_USED',
  EMAIL_SERVICE_NOT_CONFIGURED = 'EMAIL_SERVICE_NOT_CONFIGURED',
  EMAIL_TOKEN_NOT_FOUND = 'EMAIL_TOKEN_NOT_FOUND',
  EMAIL_VERIFICATION_REQUIRED = 'EMAIL_VERIFICATION_REQUIRED',
  GRAPHQL_BAD_REQUEST = 'GRAPHQL_BAD_REQUEST',
  HTTP_REQUEST_ERROR = 'HTTP_REQUEST_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  INVALID_APP_CONFIG = 'INVALID_APP_CONFIG',
  INVALID_APP_CONFIG_INPUT = 'INVALID_APP_CONFIG_INPUT',
  INVALID_AUTH_STATE = 'INVALID_AUTH_STATE',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_EMAIL_TOKEN = 'INVALID_EMAIL_TOKEN',
  INVALID_OAUTH_CALLBACK_CODE = 'INVALID_OAUTH_CALLBACK_CODE',
  INVALID_OAUTH_CALLBACK_STATE = 'INVALID_OAUTH_CALLBACK_STATE',
  INVALID_OAUTH_RESPONSE = 'INVALID_OAUTH_RESPONSE',
  INVALID_PASSWORD_LENGTH = 'INVALID_PASSWORD_LENGTH',
  INVALID_RUNTIME_CONFIG_TYPE = 'INVALID_RUNTIME_CONFIG_TYPE',
  LINK_EXPIRED = 'LINK_EXPIRED',
  MAILER_SERVICE_IS_NOT_CONFIGURED = 'MAILER_SERVICE_IS_NOT_CONFIGURED',
  MISSING_OAUTH_QUERY_PARAMETER = 'MISSING_OAUTH_QUERY_PARAMETER',
  NETWORK_ERROR = 'NETWORK_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  NO_COPILOT_PROVIDER_AVAILABLE = 'NO_COPILOT_PROVIDER_AVAILABLE',
  OAUTH_ACCOUNT_ALREADY_CONNECTED = 'OAUTH_ACCOUNT_ALREADY_CONNECTED',
  OAUTH_STATE_EXPIRED = 'OAUTH_STATE_EXPIRED',
  PASSWORD_REQUIRED = 'PASSWORD_REQUIRED',
  QUERY_TOO_LONG = 'QUERY_TOO_LONG',
  RUNTIME_CONFIG_NOT_FOUND = 'RUNTIME_CONFIG_NOT_FOUND',
  SAME_EMAIL_PROVIDED = 'SAME_EMAIL_PROVIDED',
  SIGN_UP_FORBIDDEN = 'SIGN_UP_FORBIDDEN',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  TOO_MANY_REQUEST = 'TOO_MANY_REQUEST',
  UNKNOWN_OAUTH_PROVIDER = 'UNKNOWN_OAUTH_PROVIDER',
  UNSPLASH_IS_NOT_CONFIGURED = 'UNSPLASH_IS_NOT_CONFIGURED',
  UNSUPPORTED_CLIENT_VERSION = 'UNSUPPORTED_CLIENT_VERSION',
  USER_AVATAR_NOT_FOUND = 'USER_AVATAR_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  WRONG_SIGN_IN_CREDENTIALS = 'WRONG_SIGN_IN_CREDENTIALS',
  WRONG_SIGN_IN_METHOD = 'WRONG_SIGN_IN_METHOD',
}

export enum FeatureType {
  Administrator = 'Administrator',
  EarlyAccess = 'EarlyAccess',
  FreePlan = 'FreePlan',
  ProPlan = 'ProPlan',
  UnlimitedCopilot = 'UnlimitedCopilot',
}

export interface GraphqlBadRequestDataType {
  __typename?: 'GraphqlBadRequestDataType';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
}

export interface HttpRequestErrorDataType {
  __typename?: 'HttpRequestErrorDataType';
  message: Scalars['String']['output'];
}

export interface ImportUsersInput {
  users: Array<CreateUserInput>;
}

export interface InvalidAppConfigDataType {
  __typename?: 'InvalidAppConfigDataType';
  hint: Scalars['String']['output'];
  key: Scalars['String']['output'];
  module: Scalars['String']['output'];
}

export interface InvalidAppConfigInputDataType {
  __typename?: 'InvalidAppConfigInputDataType';
  message: Scalars['String']['output'];
}

export interface InvalidEmailDataType {
  __typename?: 'InvalidEmailDataType';
  email: Scalars['String']['output'];
}

export interface InvalidOauthCallbackCodeDataType {
  __typename?: 'InvalidOauthCallbackCodeDataType';
  body: Scalars['String']['output'];
  status: Scalars['Int']['output'];
}

export interface InvalidOauthResponseDataType {
  __typename?: 'InvalidOauthResponseDataType';
  reason: Scalars['String']['output'];
}

export interface InvalidPasswordLengthDataType {
  __typename?: 'InvalidPasswordLengthDataType';
  max: Scalars['Int']['output'];
  min: Scalars['Int']['output'];
}

export interface InvalidRuntimeConfigTypeDataType {
  __typename?: 'InvalidRuntimeConfigTypeDataType';
  get: Scalars['String']['output'];
  key: Scalars['String']['output'];
  want: Scalars['String']['output'];
}

export interface LimitedUserType {
  __typename?: 'LimitedUserType';
  /** User email */
  email: Scalars['String']['output'];
  /** User password has been set */
  hasPassword: Maybe<Scalars['Boolean']['output']>;
}

export interface ListUserInput {
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}

export interface ManageUserInput {
  /** User email */
  email?: InputMaybe<Scalars['String']['input']>;
  /** User name */
  name?: InputMaybe<Scalars['String']['input']>;
}

export interface MissingOauthQueryParameterDataType {
  __typename?: 'MissingOauthQueryParameterDataType';
  name: Scalars['String']['output'];
}

export interface Mutation {
  __typename?: 'Mutation';
  /** add a chat to context */
  addContextChat: CopilotContextChatOrDoc;
  /** add a chat to context */
  addContextDoc: CopilotContextChatOrDoc;
  /** add a file to context */
  addContextFile: CopilotContextFile;
  /** Add user embedding doc */
  addUserDocs: CopilotUserDoc;
  /** Ban an user */
  banUser: UserType;
  changeEmail: UserType;
  changePassword: Scalars['Boolean']['output'];
  claimAudioTranscription: Maybe<TranscriptionResultType>;
  /** Create change password url */
  createChangePasswordUrl: Scalars['String']['output'];
  /** Create a context session */
  createCopilotContext: Scalars['String']['output'];
  /** Create a chat message */
  createCopilotMessage: Scalars['String']['output'];
  /** Create a copilot prompt */
  createCopilotPrompt: CopilotPromptType;
  /** Create a chat session */
  createCopilotSession: Scalars['String']['output'];
  /** Create a new user */
  createUser: UserType;
  deleteAccount: DeleteAccount;
  /** Delete a user account */
  deleteUser: DeleteAccount;
  /** Reenable an banned user */
  enableUser: UserType;
  /** import users */
  importUsers: Array<UserImportResultType>;
  /** Remove user avatar */
  removeAvatar: RemoveAvatar;
  /** Cleanup sessions */
  removeCopilotSession: Array<Scalars['String']['output']>;
  /** Remove user embedding doc */
  removeUserDocs: Scalars['Boolean']['output'];
  /** Remove user embedding files */
  removeUserFiles: Scalars['Boolean']['output'];
  retryAudioTranscription: Maybe<TranscriptionResultType>;
  sendChangeEmail: Scalars['Boolean']['output'];
  sendChangePasswordEmail: Scalars['Boolean']['output'];
  sendSetPasswordEmail: Scalars['Boolean']['output'];
  sendTestEmail: Scalars['Boolean']['output'];
  sendVerifyChangeEmail: Scalars['Boolean']['output'];
  sendVerifyEmail: Scalars['Boolean']['output'];
  submitAudioTranscription: Maybe<TranscriptionResultType>;
  /** Submit email to wishlist */
  submitWishlist: Scalars['Boolean']['output'];
  /** Trigger generate missing titles cron job */
  triggerGenerateTitleCron: Scalars['Boolean']['output'];
  /** update app configuration */
  updateAppConfig: Scalars['JSONObject']['output'];
  /** Update a copilot prompt */
  updateCopilotPrompt: CopilotPromptType;
  /** Update a chat session */
  updateCopilotSession: Scalars['String']['output'];
  updateProfile: UserType;
  /** Update user settings */
  updateSettings: Scalars['Boolean']['output'];
  /** Update an user */
  updateUser: UserType;
  /** Update user embedding doc */
  updateUserDocs: CopilotUserDoc;
  /** update user enabled feature */
  updateUserFeatures: Array<FeatureType>;
  /** Update user embedding files */
  updateUserFiles: CopilotUserFile;
  /** Upload user avatar */
  uploadAvatar: UserType;
  /** validate app configuration */
  validateAppConfig: Array<AppConfigValidateResult>;
  verifyEmail: Scalars['Boolean']['output'];
}

export interface MutationAddContextChatArgs {
  contextId: Scalars['String']['input'];
  sessionId: Scalars['String']['input'];
}

export interface MutationAddContextDocArgs {
  contextId: Scalars['String']['input'];
  docId: Scalars['String']['input'];
}

export interface MutationAddContextFileArgs {
  blobId?: InputMaybe<Scalars['String']['input']>;
  content?: InputMaybe<Scalars['Upload']['input']>;
  contextId: Scalars['String']['input'];
}

export interface MutationAddUserDocsArgs {
  content: Scalars['String']['input'];
  metadata?: InputMaybe<Scalars['String']['input']>;
  sessionId: Scalars['String']['input'];
  title: Scalars['String']['input'];
}

export interface MutationBanUserArgs {
  id: Scalars['String']['input'];
}

export interface MutationChangeEmailArgs {
  email: Scalars['String']['input'];
  token: Scalars['String']['input'];
}

export interface MutationChangePasswordArgs {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
}

export interface MutationClaimAudioTranscriptionArgs {
  jobId: Scalars['String']['input'];
}

export interface MutationCreateChangePasswordUrlArgs {
  callbackUrl: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}

export interface MutationCreateCopilotContextArgs {
  sessionId: Scalars['String']['input'];
}

export interface MutationCreateCopilotMessageArgs {
  options: CreateChatMessageInput;
}

export interface MutationCreateCopilotPromptArgs {
  input: CreateCopilotPromptInput;
}

export interface MutationCreateCopilotSessionArgs {
  options: CreateChatSessionInput;
}

export interface MutationCreateUserArgs {
  input: CreateUserInput;
}

export interface MutationDeleteUserArgs {
  id: Scalars['String']['input'];
}

export interface MutationEnableUserArgs {
  id: Scalars['String']['input'];
}

export interface MutationImportUsersArgs {
  input: ImportUsersInput;
}

export interface MutationRemoveCopilotSessionArgs {
  options: RemoveSessionInput;
}

export interface MutationRemoveUserDocsArgs {
  docId: Scalars['String']['input'];
}

export interface MutationRemoveUserFilesArgs {
  fileId: Scalars['String']['input'];
}

export interface MutationRetryAudioTranscriptionArgs {
  jobId: Scalars['String']['input'];
}

export interface MutationSendChangeEmailArgs {
  callbackUrl: Scalars['String']['input'];
}

export interface MutationSendChangePasswordEmailArgs {
  callbackUrl: Scalars['String']['input'];
}

export interface MutationSendSetPasswordEmailArgs {
  callbackUrl: Scalars['String']['input'];
}

export interface MutationSendTestEmailArgs {
  config: Scalars['JSONObject']['input'];
}

export interface MutationSendVerifyChangeEmailArgs {
  callbackUrl: Scalars['String']['input'];
  email: Scalars['String']['input'];
  token: Scalars['String']['input'];
}

export interface MutationSendVerifyEmailArgs {
  callbackUrl: Scalars['String']['input'];
}

export interface MutationSubmitAudioTranscriptionArgs {
  blob?: InputMaybe<Scalars['Upload']['input']>;
  blobId: Scalars['String']['input'];
  blobs?: InputMaybe<Array<Scalars['Upload']['input']>>;
}

export interface MutationSubmitWishlistArgs {
  email: Scalars['String']['input'];
}

export interface MutationUpdateAppConfigArgs {
  updates: Array<UpdateAppConfigInput>;
}

export interface MutationUpdateCopilotPromptArgs {
  messages: Array<CopilotPromptMessageInput>;
  name: Scalars['String']['input'];
}

export interface MutationUpdateCopilotSessionArgs {
  options: UpdateChatSessionInput;
}

export interface MutationUpdateProfileArgs {
  input: UpdateUserInput;
}

export interface MutationUpdateSettingsArgs {
  input: UpdateUserSettingsInput;
}

export interface MutationUpdateUserArgs {
  id: Scalars['String']['input'];
  input: ManageUserInput;
}

export interface MutationUpdateUserDocsArgs {
  content?: InputMaybe<Scalars['String']['input']>;
  docId: Scalars['String']['input'];
  metadata?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
}

export interface MutationUpdateUserFeaturesArgs {
  features: Array<FeatureType>;
  id: Scalars['String']['input'];
}

export interface MutationUpdateUserFilesArgs {
  fileId: Scalars['String']['input'];
  metadata: Scalars['String']['input'];
}

export interface MutationUploadAvatarArgs {
  avatar: Scalars['Upload']['input'];
}

export interface MutationValidateAppConfigArgs {
  updates: Array<UpdateAppConfigInput>;
}

export interface MutationVerifyEmailArgs {
  token: Scalars['String']['input'];
}

export interface NoCopilotProviderAvailableDataType {
  __typename?: 'NoCopilotProviderAvailableDataType';
  modelId: Scalars['String']['output'];
}

export enum OAuthProviderType {
  Apple = 'Apple',
  GitHub = 'GitHub',
  Google = 'Google',
  OIDC = 'OIDC',
}

export interface PageInfo {
  __typename?: 'PageInfo';
  endCursor: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor: Maybe<Scalars['String']['output']>;
}

export interface PaginatedCopilotHistoriesType {
  __typename?: 'PaginatedCopilotHistoriesType';
  edges: Array<CopilotHistoriesTypeEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
}

export interface PaginatedCopilotUserDoc {
  __typename?: 'PaginatedCopilotUserDoc';
  edges: Array<CopilotUserDocTypeEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
}

export interface PaginatedCopilotUserFile {
  __typename?: 'PaginatedCopilotUserFile';
  edges: Array<CopilotUserFileTypeEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
}

export interface PaginationInput {
  /** returns the elements in the list that come after the specified cursor. */
  after?: InputMaybe<Scalars['String']['input']>;
  /** returns the first n elements from the list. */
  first?: InputMaybe<Scalars['Int']['input']>;
  /** ignore the first n elements from the list. */
  offset?: InputMaybe<Scalars['Int']['input']>;
}

export interface PasswordLimitsType {
  __typename?: 'PasswordLimitsType';
  maxLength: Scalars['Int']['output'];
  minLength: Scalars['Int']['output'];
}

export interface PublicUserType {
  __typename?: 'PublicUserType';
  avatarUrl: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
}

export interface Query {
  __typename?: 'Query';
  /** get the whole app configuration */
  appConfig: Scalars['JSONObject']['output'];
  /** Get current user */
  currentUser: Maybe<UserType>;
  error: ErrorDataUnion;
  /** List all copilot prompts */
  listCopilotPrompts: Array<CopilotPromptType>;
  /** Get public user by id */
  publicUserById: Maybe<PublicUserType>;
  /** server config */
  serverConfig: ServerConfigType;
  /** Get user by email */
  user: Maybe<UserOrLimitedUser>;
  /** Get user by email for admin */
  userByEmail: Maybe<UserType>;
  /** Get user by id */
  userById: UserType;
  /** List registered users */
  users: Array<UserType>;
  /** Get users count */
  usersCount: Scalars['Int']['output'];
}

export interface QueryErrorArgs {
  name: ErrorNames;
}

export interface QueryPublicUserByIdArgs {
  id: Scalars['String']['input'];
}

export interface QueryUserArgs {
  email: Scalars['String']['input'];
}

export interface QueryUserByEmailArgs {
  email: Scalars['String']['input'];
}

export interface QueryUserByIdArgs {
  id: Scalars['String']['input'];
}

export interface QueryUsersArgs {
  filter: ListUserInput;
}

export interface QueryChatHistoriesInput {
  action?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  messageOrder?: InputMaybe<ChatHistoryOrder>;
  pinned?: InputMaybe<Scalars['Boolean']['input']>;
  sessionId?: InputMaybe<Scalars['String']['input']>;
  sessionOrder?: InputMaybe<ChatHistoryOrder>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  withMessages?: InputMaybe<Scalars['Boolean']['input']>;
  withPrompt?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface QueryTooLongDataType {
  __typename?: 'QueryTooLongDataType';
  max: Scalars['Int']['output'];
}

export interface RemoveAvatar {
  __typename?: 'RemoveAvatar';
  success: Scalars['Boolean']['output'];
}

export interface RemoveSessionInput {
  sessionId: Scalars['String']['input'];
}

export interface RuntimeConfigNotFoundDataType {
  __typename?: 'RuntimeConfigNotFoundDataType';
  key: Scalars['String']['output'];
}

export interface ServerConfigType {
  __typename?: 'ServerConfigType';
  /** Features for user that can be configured */
  availableUserFeatures: Array<FeatureType>;
  /** server base url */
  baseUrl: Scalars['String']['output'];
  /** credentials requirement */
  credentialsRequirement: CredentialsRequirementType;
  /** enabled server features */
  features: Array<ServerFeature>;
  /** whether server has been initialized */
  initialized: Scalars['Boolean']['output'];
  /** server identical name could be shown as badge on user interface */
  name: Scalars['String']['output'];
  oauthProviders: Array<OAuthProviderType>;
  /** server type */
  type: ServerDeploymentType;
  /** server version */
  version: Scalars['String']['output'];
}

export enum ServerDeploymentType {
  AgentServer = 'AgentServer',
}

export enum ServerFeature {
  Captcha = 'Captcha',
  Copilot = 'Copilot',
  OAuth = 'OAuth',
}

export interface StreamObject {
  __typename?: 'StreamObject';
  args: Maybe<Scalars['JSON']['output']>;
  result: Maybe<Scalars['JSON']['output']>;
  textDelta: Maybe<Scalars['String']['output']>;
  toolCallId: Maybe<Scalars['String']['output']>;
  toolName: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
}

export interface TranscriptionItemType {
  __typename?: 'TranscriptionItemType';
  end: Scalars['String']['output'];
  speaker: Scalars['String']['output'];
  start: Scalars['String']['output'];
  transcription: Scalars['String']['output'];
}

export interface TranscriptionResultType {
  __typename?: 'TranscriptionResultType';
  actions: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  status: AiJobStatus;
  summary: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
  transcription: Maybe<Array<TranscriptionItemType>>;
}

export interface UnknownOauthProviderDataType {
  __typename?: 'UnknownOauthProviderDataType';
  name: Scalars['String']['output'];
}

export interface UnsupportedClientVersionDataType {
  __typename?: 'UnsupportedClientVersionDataType';
  clientVersion: Scalars['String']['output'];
  requiredVersion: Scalars['String']['output'];
}

export interface UpdateAppConfigInput {
  key: Scalars['String']['input'];
  module: Scalars['String']['input'];
  value: Scalars['JSON']['input'];
}

export interface UpdateChatSessionInput {
  /** Client custom metadata for the session */
  metadata?: InputMaybe<Scalars['String']['input']>;
  /** Whether to pin the session */
  pinned?: InputMaybe<Scalars['Boolean']['input']>;
  /** The prompt name to use for the session */
  promptName?: InputMaybe<Scalars['String']['input']>;
  sessionId: Scalars['String']['input'];
}

export interface UpdateUserInput {
  /** User name */
  name?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateUserSettingsInput {
  /** Receive comment email */
  receiveCommentEmail?: InputMaybe<Scalars['Boolean']['input']>;
  /** Receive invitation email */
  receiveInvitationEmail?: InputMaybe<Scalars['Boolean']['input']>;
  /** Receive mention email */
  receiveMentionEmail?: InputMaybe<Scalars['Boolean']['input']>;
}

export interface UserImportFailedType {
  __typename?: 'UserImportFailedType';
  email: Scalars['String']['output'];
  error: Scalars['String']['output'];
}

export type UserImportResultType = UserImportFailedType | UserType;

export type UserOrLimitedUser = LimitedUserType | UserType;

export interface UserQuotaHumanReadableType {
  __typename?: 'UserQuotaHumanReadableType';
  blobLimit: Scalars['String']['output'];
  copilotLimit: Scalars['String']['output'];
  name: Scalars['String']['output'];
  storageQuota: Scalars['String']['output'];
  usedStorageQuota: Scalars['String']['output'];
}

export interface UserQuotaType {
  __typename?: 'UserQuotaType';
  blobLimit: Scalars['SafeInt']['output'];
  copilotLimit: Maybe<Scalars['SafeInt']['output']>;
  humanReadable: UserQuotaHumanReadableType;
  name: Scalars['String']['output'];
  storageQuota: Scalars['SafeInt']['output'];
  usedStorageQuota: Scalars['SafeInt']['output'];
}

export interface UserSettingsType {
  __typename?: 'UserSettingsType';
  /** Receive comment email */
  receiveCommentEmail: Scalars['Boolean']['output'];
  /** Receive invitation email */
  receiveInvitationEmail: Scalars['Boolean']['output'];
  /** Receive mention email */
  receiveMentionEmail: Scalars['Boolean']['output'];
}

export interface UserType {
  __typename?: 'UserType';
  /** User avatar url */
  avatarUrl: Maybe<Scalars['String']['output']>;
  copilot: Copilot;
  /** User is disabled */
  disabled: Scalars['Boolean']['output'];
  /** User email */
  email: Scalars['String']['output'];
  /** User email verified */
  emailVerified: Scalars['Boolean']['output'];
  embedding: CopilotUserConfig;
  /** Enabled features of a user */
  features: Array<FeatureType>;
  /** User password has been set */
  hasPassword: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  /** User name */
  name: Scalars['String']['output'];
  quota: UserQuotaType;
  /** Get user settings */
  settings: UserSettingsType;
}

export interface ValidationErrorDataType {
  __typename?: 'ValidationErrorDataType';
  errors: Scalars['String']['output'];
}

export interface WrongSignInCredentialsDataType {
  __typename?: 'WrongSignInCredentialsDataType';
  email: Scalars['String']['output'];
}

export type AdminServerConfigQueryVariables = Exact<{ [key: string]: never }>;

export type AdminServerConfigQuery = {
  __typename?: 'Query';
  serverConfig: {
    __typename?: 'ServerConfigType';
    version: string;
    baseUrl: string;
    name: string;
    features: Array<ServerFeature>;
    type: ServerDeploymentType;
    initialized: boolean;
    availableUserFeatures: Array<FeatureType>;
    credentialsRequirement: {
      __typename?: 'CredentialsRequirementType';
      password: {
        __typename?: 'PasswordLimitsType';
        minLength: number;
        maxLength: number;
      };
    };
  };
};

export type CreateChangePasswordUrlMutationVariables = Exact<{
  callbackUrl: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}>;

export type CreateChangePasswordUrlMutation = {
  __typename?: 'Mutation';
  createChangePasswordUrl: string;
};

export type AppConfigQueryVariables = Exact<{ [key: string]: never }>;

export type AppConfigQuery = { __typename?: 'Query'; appConfig: any };

export type GetPromptsQueryVariables = Exact<{ [key: string]: never }>;

export type GetPromptsQuery = {
  __typename?: 'Query';
  listCopilotPrompts: Array<{
    __typename?: 'CopilotPromptType';
    name: string;
    model: string;
    action: string | null;
    config: {
      __typename?: 'CopilotPromptConfigType';
      frequencyPenalty: number | null;
      presencePenalty: number | null;
      temperature: number | null;
      topP: number | null;
    } | null;
    messages: Array<{
      __typename?: 'CopilotPromptMessageType';
      role: CopilotPromptMessageRole;
      content: string;
      params: Record<string, string> | null;
    }>;
  }>;
};

export type UpdatePromptMutationVariables = Exact<{
  name: Scalars['String']['input'];
  messages: Array<CopilotPromptMessageInput> | CopilotPromptMessageInput;
}>;

export type UpdatePromptMutation = {
  __typename?: 'Mutation';
  updateCopilotPrompt: {
    __typename?: 'CopilotPromptType';
    name: string;
    model: string;
    action: string | null;
    config: {
      __typename?: 'CopilotPromptConfigType';
      frequencyPenalty: number | null;
      presencePenalty: number | null;
      temperature: number | null;
      topP: number | null;
    } | null;
    messages: Array<{
      __typename?: 'CopilotPromptMessageType';
      role: CopilotPromptMessageRole;
      content: string;
      params: Record<string, string> | null;
    }>;
  };
};

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;

export type CreateUserMutation = {
  __typename?: 'Mutation';
  createUser: { __typename?: 'UserType'; id: string };
};

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;

export type DeleteUserMutation = {
  __typename?: 'Mutation';
  deleteUser: { __typename?: 'DeleteAccount'; success: boolean };
};

export type DisableUserMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;

export type DisableUserMutation = {
  __typename?: 'Mutation';
  banUser: { __typename?: 'UserType'; email: string; disabled: boolean };
};

export type EnableUserMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;

export type EnableUserMutation = {
  __typename?: 'Mutation';
  enableUser: { __typename?: 'UserType'; email: string; disabled: boolean };
};

export type GetUserByEmailQueryVariables = Exact<{
  email: Scalars['String']['input'];
}>;

export type GetUserByEmailQuery = {
  __typename?: 'Query';
  userByEmail: {
    __typename?: 'UserType';
    id: string;
    name: string;
    email: string;
    features: Array<FeatureType>;
    hasPassword: boolean | null;
    emailVerified: boolean;
    avatarUrl: string | null;
    disabled: boolean;
  } | null;
};

export type ImportUsersMutationVariables = Exact<{
  input: ImportUsersInput;
}>;

export type ImportUsersMutation = {
  __typename?: 'Mutation';
  importUsers: Array<
    | { __typename: 'UserImportFailedType'; email: string; error: string }
    | { __typename: 'UserType'; id: string; name: string; email: string }
  >;
};

export type ListUsersQueryVariables = Exact<{
  filter: ListUserInput;
}>;

export type ListUsersQuery = {
  __typename?: 'Query';
  usersCount: number;
  users: Array<{
    __typename?: 'UserType';
    id: string;
    name: string;
    email: string;
    disabled: boolean;
    features: Array<FeatureType>;
    hasPassword: boolean | null;
    emailVerified: boolean;
    avatarUrl: string | null;
  }>;
};

export type SendTestEmailMutationVariables = Exact<{
  host: Scalars['String']['input'];
  port: Scalars['Int']['input'];
  sender: Scalars['String']['input'];
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
  ignoreTLS: Scalars['Boolean']['input'];
}>;

export type SendTestEmailMutation = {
  __typename?: 'Mutation';
  sendTestEmail: boolean;
};

export type UpdateAccountFeaturesMutationVariables = Exact<{
  userId: Scalars['String']['input'];
  features: Array<FeatureType> | FeatureType;
}>;

export type UpdateAccountFeaturesMutation = {
  __typename?: 'Mutation';
  updateUserFeatures: Array<FeatureType>;
};

export type UpdateAccountMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: ManageUserInput;
}>;

export type UpdateAccountMutation = {
  __typename?: 'Mutation';
  updateUser: {
    __typename?: 'UserType';
    id: string;
    name: string;
    email: string;
  };
};

export type UpdateAppConfigMutationVariables = Exact<{
  updates: Array<UpdateAppConfigInput> | UpdateAppConfigInput;
}>;

export type UpdateAppConfigMutation = {
  __typename?: 'Mutation';
  updateAppConfig: any;
};

export type ValidateConfigMutationVariables = Exact<{
  updates: Array<UpdateAppConfigInput> | UpdateAppConfigInput;
}>;

export type ValidateConfigMutation = {
  __typename?: 'Mutation';
  validateAppConfig: Array<{
    __typename?: 'AppConfigValidateResult';
    module: string;
    key: string;
    value: Record<string, string>;
    valid: boolean;
    error: string | null;
  }>;
};

export type ChangeEmailMutationVariables = Exact<{
  token: Scalars['String']['input'];
  email: Scalars['String']['input'];
}>;

export type ChangeEmailMutation = {
  __typename?: 'Mutation';
  changeEmail: { __typename?: 'UserType'; id: string; email: string };
};

export type ChangePasswordMutationVariables = Exact<{
  token: Scalars['String']['input'];
  userId: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;

export type ChangePasswordMutation = {
  __typename?: 'Mutation';
  changePassword: boolean;
};

export type AddContextChatMutationVariables = Exact<{
  contextId: Scalars['String']['input'];
  sessionId: Scalars['String']['input'];
}>;

export type AddContextChatMutation = {
  __typename?: 'Mutation';
  addContextChat: {
    __typename?: 'CopilotContextChatOrDoc';
    id: string;
    createdAt: number;
    chunkSize: number;
    error: string | null;
    status: ContextEmbedStatus;
  };
};

export type RemoveContextChatQueryVariables = Exact<{
  contextId: Scalars['String']['input'];
  sessionId: Scalars['String']['input'];
}>;

export type RemoveContextChatQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    copilot: {
      __typename?: 'Copilot';
      contexts: Array<{
        __typename?: 'CopilotContext';
        removeContextChat: boolean;
      }>;
    };
  } | null;
};

export type CreateCopilotContextMutationVariables = Exact<{
  sessionId: Scalars['String']['input'];
}>;

export type CreateCopilotContextMutation = {
  __typename?: 'Mutation';
  createCopilotContext: string;
};

export type AddContextDocMutationVariables = Exact<{
  contextId: Scalars['String']['input'];
  docId: Scalars['String']['input'];
}>;

export type AddContextDocMutation = {
  __typename?: 'Mutation';
  addContextDoc: {
    __typename?: 'CopilotContextChatOrDoc';
    id: string;
    createdAt: number;
    chunkSize: number;
    error: string | null;
    status: ContextEmbedStatus;
  };
};

export type RemoveContextDocQueryVariables = Exact<{
  contextId: Scalars['String']['input'];
  docId: Scalars['String']['input'];
}>;

export type RemoveContextDocQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    copilot: {
      __typename?: 'Copilot';
      contexts: Array<{
        __typename?: 'CopilotContext';
        removeContextDoc: boolean;
      }>;
    };
  } | null;
};

export type AddContextFileExistsMutationVariables = Exact<{
  contextId: Scalars['String']['input'];
  blobId: Scalars['String']['input'];
}>;

export type AddContextFileExistsMutation = {
  __typename?: 'Mutation';
  addContextFile: {
    __typename?: 'CopilotContextFile';
    id: string;
    createdAt: number;
    name: string;
    mimeType: string;
    chunkSize: number;
    error: string | null;
    status: ContextEmbedStatus;
    blobId: string;
  };
};

export type AddContextFileMutationVariables = Exact<{
  contextId: Scalars['String']['input'];
  content: Scalars['Upload']['input'];
}>;

export type AddContextFileMutation = {
  __typename?: 'Mutation';
  addContextFile: {
    __typename?: 'CopilotContextFile';
    id: string;
    createdAt: number;
    name: string;
    mimeType: string;
    chunkSize: number;
    error: string | null;
    status: ContextEmbedStatus;
    blobId: string;
  };
};

export type RemoveContextFileQueryVariables = Exact<{
  contextId: Scalars['String']['input'];
  fileId: Scalars['String']['input'];
}>;

export type RemoveContextFileQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    copilot: {
      __typename?: 'Copilot';
      contexts: Array<{
        __typename?: 'CopilotContext';
        removeContextFile: boolean;
      }>;
    };
  } | null;
};

export type ListContextObjectQueryVariables = Exact<{
  sessionId: Scalars['String']['input'];
  contextId: Scalars['String']['input'];
}>;

export type ListContextObjectQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    copilot: {
      __typename?: 'Copilot';
      contexts: Array<{
        __typename?: 'CopilotContext';
        chats: Array<{
          __typename?: 'CopilotContextChatOrDoc';
          id: string;
          chunkSize: number;
          error: string | null;
          status: ContextEmbedStatus;
          createdAt: number;
        }>;
        docs: Array<{
          __typename?: 'CopilotContextChatOrDoc';
          id: string;
          chunkSize: number;
          error: string | null;
          status: ContextEmbedStatus;
          createdAt: number;
        }>;
        files: Array<{
          __typename?: 'CopilotContextFile';
          id: string;
          name: string;
          mimeType: string;
          blobId: string;
          chunkSize: number;
          error: string | null;
          status: ContextEmbedStatus;
          createdAt: number;
        }>;
      }>;
    };
  } | null;
};

export type ListContextQueryVariables = Exact<{
  sessionId: Scalars['String']['input'];
}>;

export type ListContextQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    copilot: {
      __typename?: 'Copilot';
      contexts: Array<{ __typename?: 'CopilotContext'; id: string | null }>;
    };
  } | null;
};

export type GetEmbeddingStatusQueryVariables = Exact<{ [key: string]: never }>;

export type GetEmbeddingStatusQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    copilot: {
      __typename?: 'Copilot';
      embeddingStatus: {
        __typename?: 'ContextUserEmbeddingStatus';
        total: number;
        embedded: number;
      };
    };
  } | null;
};

export type GetCopilotHistoryIdsQueryVariables = Exact<{
  pagination: PaginationInput;
  options?: InputMaybe<QueryChatHistoriesInput>;
}>;

export type GetCopilotHistoryIdsQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    copilot: {
      __typename?: 'Copilot';
      chats: {
        __typename?: 'PaginatedCopilotHistoriesType';
        pageInfo: {
          __typename?: 'PageInfo';
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          startCursor: string | null;
          endCursor: string | null;
        };
        edges: Array<{
          __typename?: 'CopilotHistoriesTypeEdge';
          cursor: string;
          node: {
            __typename?: 'CopilotHistories';
            sessionId: string;
            pinned: boolean;
            messages: Array<{
              __typename?: 'ChatMessage';
              id: string | null;
              role: string;
              createdAt: string;
            }>;
          };
        }>;
      };
    };
  } | null;
};

export type GetCopilotPinnedSessionsQueryVariables = Exact<{
  messageOrder?: InputMaybe<ChatHistoryOrder>;
  withPrompt?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export type GetCopilotPinnedSessionsQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    copilot: {
      __typename?: 'Copilot';
      chats: {
        __typename?: 'PaginatedCopilotHistoriesType';
        pageInfo: {
          __typename?: 'PageInfo';
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          startCursor: string | null;
          endCursor: string | null;
        };
        edges: Array<{
          __typename?: 'CopilotHistoriesTypeEdge';
          cursor: string;
          node: {
            __typename?: 'CopilotHistories';
            sessionId: string;
            promptName: string;
            model: string;
            optionalModels: Array<string>;
            action: string | null;
            pinned: boolean;
            title: string | null;
            metadata: string;
            tokens: number;
            createdAt: string;
            updatedAt: string;
            messages: Array<{
              __typename?: 'ChatMessage';
              id: string | null;
              role: string;
              content: string;
              attachments: Array<string> | null;
              createdAt: string;
              streamObjects: Array<{
                __typename?: 'StreamObject';
                type: string;
                textDelta: string | null;
                toolCallId: string | null;
                toolName: string | null;
                args: Record<string, string> | null;
                result: Record<string, string> | null;
              }> | null;
            }>;
          };
        }>;
      };
    };
  } | null;
};

export type GetCopilotUserSessionsQueryVariables = Exact<{
  pagination: PaginationInput;
  messageOrder?: InputMaybe<ChatHistoryOrder>;
  withPrompt?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export type GetCopilotUserSessionsQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    copilot: {
      __typename?: 'Copilot';
      chats: {
        __typename?: 'PaginatedCopilotHistoriesType';
        pageInfo: {
          __typename?: 'PageInfo';
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          startCursor: string | null;
          endCursor: string | null;
        };
        edges: Array<{
          __typename?: 'CopilotHistoriesTypeEdge';
          cursor: string;
          node: {
            __typename?: 'CopilotHistories';
            sessionId: string;
            promptName: string;
            model: string;
            optionalModels: Array<string>;
            action: string | null;
            pinned: boolean;
            title: string | null;
            metadata: string;
            tokens: number;
            createdAt: string;
            updatedAt: string;
            messages: Array<{
              __typename?: 'ChatMessage';
              id: string | null;
              role: string;
              content: string;
              attachments: Array<string> | null;
              createdAt: string;
              streamObjects: Array<{
                __typename?: 'StreamObject';
                type: string;
                textDelta: string | null;
                toolCallId: string | null;
                toolName: string | null;
                args: Record<string, string> | null;
                result: Record<string, string> | null;
              }> | null;
            }>;
          };
        }>;
      };
    };
  } | null;
};

export type GetCopilotHistoriesQueryVariables = Exact<{
  pagination: PaginationInput;
  options?: InputMaybe<QueryChatHistoriesInput>;
}>;

export type GetCopilotHistoriesQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    copilot: {
      __typename?: 'Copilot';
      chats: {
        __typename?: 'PaginatedCopilotHistoriesType';
        pageInfo: {
          __typename?: 'PageInfo';
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          startCursor: string | null;
          endCursor: string | null;
        };
        edges: Array<{
          __typename?: 'CopilotHistoriesTypeEdge';
          cursor: string;
          node: {
            __typename?: 'CopilotHistories';
            sessionId: string;
            promptName: string;
            model: string;
            optionalModels: Array<string>;
            action: string | null;
            pinned: boolean;
            title: string | null;
            metadata: string;
            tokens: number;
            createdAt: string;
            updatedAt: string;
            messages: Array<{
              __typename?: 'ChatMessage';
              id: string | null;
              role: string;
              content: string;
              attachments: Array<string> | null;
              createdAt: string;
              streamObjects: Array<{
                __typename?: 'StreamObject';
                type: string;
                textDelta: string | null;
                toolCallId: string | null;
                toolName: string | null;
                args: Record<string, string> | null;
                result: Record<string, string> | null;
              }> | null;
            }>;
          };
        }>;
      };
    };
  } | null;
};

export type SubmitAudioTranscriptionMutationVariables = Exact<{
  blobId: Scalars['String']['input'];
  blob?: InputMaybe<Scalars['Upload']['input']>;
  blobs?: InputMaybe<
    Array<Scalars['Upload']['input']> | Scalars['Upload']['input']
  >;
}>;

export type SubmitAudioTranscriptionMutation = {
  __typename?: 'Mutation';
  submitAudioTranscription: {
    __typename?: 'TranscriptionResultType';
    id: string;
    status: AiJobStatus;
  } | null;
};

export type ClaimAudioTranscriptionMutationVariables = Exact<{
  jobId: Scalars['String']['input'];
}>;

export type ClaimAudioTranscriptionMutation = {
  __typename?: 'Mutation';
  claimAudioTranscription: {
    __typename?: 'TranscriptionResultType';
    id: string;
    status: AiJobStatus;
    title: string | null;
    summary: string | null;
    actions: string | null;
    transcription: Array<{
      __typename?: 'TranscriptionItemType';
      speaker: string;
      start: string;
      end: string;
      transcription: string;
    }> | null;
  } | null;
};

export type GetAudioTranscriptionQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  jobId?: InputMaybe<Scalars['String']['input']>;
  blobId?: InputMaybe<Scalars['String']['input']>;
}>;

export type GetAudioTranscriptionQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    copilot: {
      __typename?: 'Copilot';
      audioTranscription: {
        __typename?: 'TranscriptionResultType';
        id: string;
        status: AiJobStatus;
        title: string | null;
        summary: string | null;
        transcription: Array<{
          __typename?: 'TranscriptionItemType';
          speaker: string;
          start: string;
          end: string;
          transcription: string;
        }> | null;
      } | null;
    };
  } | null;
};

export type RetryAudioTranscriptionMutationVariables = Exact<{
  jobId: Scalars['String']['input'];
}>;

export type RetryAudioTranscriptionMutation = {
  __typename?: 'Mutation';
  retryAudioTranscription: {
    __typename?: 'TranscriptionResultType';
    id: string;
    status: AiJobStatus;
  } | null;
};

export type CreateCopilotMessageMutationVariables = Exact<{
  options: CreateChatMessageInput;
}>;

export type CreateCopilotMessageMutation = {
  __typename?: 'Mutation';
  createCopilotMessage: string;
};

export type CopilotQuotaQueryVariables = Exact<{ [key: string]: never }>;

export type CopilotQuotaQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    copilot: {
      __typename?: 'Copilot';
      quota: {
        __typename?: 'CopilotQuota';
        limit: number | null;
        used: number;
      };
    };
  } | null;
};

export type CreateCopilotSessionMutationVariables = Exact<{
  options: CreateChatSessionInput;
}>;

export type CreateCopilotSessionMutation = {
  __typename?: 'Mutation';
  createCopilotSession: string;
};

export type GetCopilotLatestDocSessionQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetCopilotLatestDocSessionQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    copilot: {
      __typename?: 'Copilot';
      chats: {
        __typename?: 'PaginatedCopilotHistoriesType';
        pageInfo: {
          __typename?: 'PageInfo';
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          startCursor: string | null;
          endCursor: string | null;
        };
        edges: Array<{
          __typename?: 'CopilotHistoriesTypeEdge';
          cursor: string;
          node: {
            __typename?: 'CopilotHistories';
            sessionId: string;
            promptName: string;
            model: string;
            optionalModels: Array<string>;
            action: string | null;
            pinned: boolean;
            title: string | null;
            metadata: string;
            tokens: number;
            createdAt: string;
            updatedAt: string;
            messages: Array<{
              __typename?: 'ChatMessage';
              id: string | null;
              role: string;
              content: string;
              attachments: Array<string> | null;
              createdAt: string;
              streamObjects: Array<{
                __typename?: 'StreamObject';
                type: string;
                textDelta: string | null;
                toolCallId: string | null;
                toolName: string | null;
                args: Record<string, string> | null;
                result: Record<string, string> | null;
              }> | null;
            }>;
          };
        }>;
      };
    };
  } | null;
};

export type GetCopilotSessionQueryVariables = Exact<{
  sessionId: Scalars['String']['input'];
}>;

export type GetCopilotSessionQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    copilot: {
      __typename?: 'Copilot';
      chats: {
        __typename?: 'PaginatedCopilotHistoriesType';
        pageInfo: {
          __typename?: 'PageInfo';
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          startCursor: string | null;
          endCursor: string | null;
        };
        edges: Array<{
          __typename?: 'CopilotHistoriesTypeEdge';
          cursor: string;
          node: {
            __typename?: 'CopilotHistories';
            sessionId: string;
            promptName: string;
            model: string;
            optionalModels: Array<string>;
            action: string | null;
            pinned: boolean;
            title: string | null;
            metadata: string;
            tokens: number;
            createdAt: string;
            updatedAt: string;
            messages: Array<{
              __typename?: 'ChatMessage';
              id: string | null;
              role: string;
              content: string;
              attachments: Array<string> | null;
              createdAt: string;
              streamObjects: Array<{
                __typename?: 'StreamObject';
                type: string;
                textDelta: string | null;
                toolCallId: string | null;
                toolName: string | null;
                args: Record<string, string> | null;
                result: Record<string, string> | null;
              }> | null;
            }>;
          };
        }>;
      };
    };
  } | null;
};

export type GetCopilotRecentSessionsQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetCopilotRecentSessionsQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    copilot: {
      __typename?: 'Copilot';
      chats: {
        __typename?: 'PaginatedCopilotHistoriesType';
        pageInfo: {
          __typename?: 'PageInfo';
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          startCursor: string | null;
          endCursor: string | null;
        };
        edges: Array<{
          __typename?: 'CopilotHistoriesTypeEdge';
          cursor: string;
          node: {
            __typename?: 'CopilotHistories';
            sessionId: string;
            promptName: string;
            model: string;
            optionalModels: Array<string>;
            action: string | null;
            pinned: boolean;
            title: string | null;
            metadata: string;
            tokens: number;
            createdAt: string;
            updatedAt: string;
            messages: Array<{
              __typename?: 'ChatMessage';
              id: string | null;
              role: string;
              content: string;
              attachments: Array<string> | null;
              createdAt: string;
              streamObjects: Array<{
                __typename?: 'StreamObject';
                type: string;
                textDelta: string | null;
                toolCallId: string | null;
                toolName: string | null;
                args: Record<string, string> | null;
                result: Record<string, string> | null;
              }> | null;
            }>;
          };
        }>;
      };
    };
  } | null;
};

export type RemoveCopilotSessionMutationVariables = Exact<{
  options: RemoveSessionInput;
}>;

export type RemoveCopilotSessionMutation = {
  __typename?: 'Mutation';
  removeCopilotSession: Array<string>;
};

export type UpdateCopilotSessionMutationVariables = Exact<{
  options: UpdateChatSessionInput;
}>;

export type UpdateCopilotSessionMutation = {
  __typename?: 'Mutation';
  updateCopilotSession: string;
};

export type GetCopilotSessionsQueryVariables = Exact<{
  pagination: PaginationInput;
  options?: InputMaybe<QueryChatHistoriesInput>;
}>;

export type GetCopilotSessionsQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    copilot: {
      __typename?: 'Copilot';
      chats: {
        __typename?: 'PaginatedCopilotHistoriesType';
        pageInfo: {
          __typename?: 'PageInfo';
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          startCursor: string | null;
          endCursor: string | null;
        };
        edges: Array<{
          __typename?: 'CopilotHistoriesTypeEdge';
          cursor: string;
          node: {
            __typename?: 'CopilotHistories';
            sessionId: string;
            promptName: string;
            model: string;
            optionalModels: Array<string>;
            action: string | null;
            pinned: boolean;
            title: string | null;
            metadata: string;
            tokens: number;
            createdAt: string;
            updatedAt: string;
            messages: Array<{
              __typename?: 'ChatMessage';
              id: string | null;
              role: string;
              content: string;
              attachments: Array<string> | null;
              createdAt: string;
              streamObjects: Array<{
                __typename?: 'StreamObject';
                type: string;
                textDelta: string | null;
                toolCallId: string | null;
                toolName: string | null;
                args: Record<string, string> | null;
                result: Record<string, string> | null;
              }> | null;
            }>;
          };
        }>;
      };
    };
  } | null;
};

export type AddUserDocsMutationVariables = Exact<{
  sessionId: Scalars['String']['input'];
  title: Scalars['String']['input'];
  content: Scalars['String']['input'];
  metadata?: InputMaybe<Scalars['String']['input']>;
}>;

export type AddUserDocsMutation = {
  __typename?: 'Mutation';
  addUserDocs: {
    __typename?: 'CopilotUserDoc';
    sessionId: string;
    docId: string;
    title: string;
    content: string;
    metadata: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type GetUserDocsQueryVariables = Exact<{
  pagination: PaginationInput;
}>;

export type GetUserDocsQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    embedding: {
      __typename?: 'CopilotUserConfig';
      docs: {
        __typename?: 'PaginatedCopilotUserDoc';
        totalCount: number;
        pageInfo: {
          __typename?: 'PageInfo';
          endCursor: string | null;
          hasNextPage: boolean;
        };
        edges: Array<{
          __typename?: 'CopilotUserDocTypeEdge';
          node: {
            __typename?: 'CopilotUserDoc';
            sessionId: string;
            docId: string;
            title: string;
            content: string;
            metadata: string;
            createdAt: string;
            updatedAt: string;
          };
        }>;
      };
    };
  } | null;
};

export type RemoveUserDocsMutationVariables = Exact<{
  docId: Scalars['String']['input'];
}>;

export type RemoveUserDocsMutation = {
  __typename?: 'Mutation';
  removeUserDocs: boolean;
};

export type UpdateUserDocsMutationVariables = Exact<{
  docId: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['String']['input']>;
}>;

export type UpdateUserDocsMutation = {
  __typename?: 'Mutation';
  updateUserDocs: {
    __typename?: 'CopilotUserDoc';
    sessionId: string;
    docId: string;
    title: string;
    content: string;
    metadata: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type GetUserFilesQueryVariables = Exact<{
  pagination: PaginationInput;
}>;

export type GetUserFilesQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    embedding: {
      __typename?: 'CopilotUserConfig';
      files: {
        __typename?: 'PaginatedCopilotUserFile';
        totalCount: number;
        pageInfo: {
          __typename?: 'PageInfo';
          endCursor: string | null;
          hasNextPage: boolean;
        };
        edges: Array<{
          __typename?: 'CopilotUserFileTypeEdge';
          node: {
            __typename?: 'CopilotUserFile';
            fileId: string;
            fileName: string;
            blobId: string;
            mimeType: string;
            size: number;
            createdAt: string;
            metadata: string;
          };
        }>;
      };
    };
  } | null;
};

export type RemoveUserFilesMutationVariables = Exact<{
  fileId: Scalars['String']['input'];
}>;

export type RemoveUserFilesMutation = {
  __typename?: 'Mutation';
  removeUserFiles: boolean;
};

export type UpdateUserFilesMutationVariables = Exact<{
  fileId: Scalars['String']['input'];
  metadata: Scalars['String']['input'];
}>;

export type UpdateUserFilesMutation = {
  __typename?: 'Mutation';
  updateUserFiles: {
    __typename?: 'CopilotUserFile';
    fileId: string;
    fileName: string;
    blobId: string;
    mimeType: string;
    size: number;
    metadata: string;
    createdAt: string;
  };
};

export type DeleteAccountMutationVariables = Exact<{ [key: string]: never }>;

export type DeleteAccountMutation = {
  __typename?: 'Mutation';
  deleteAccount: { __typename?: 'DeleteAccount'; success: boolean };
};

export type CopilotChatMessageFragment = {
  __typename?: 'ChatMessage';
  id: string | null;
  role: string;
  content: string;
  attachments: Array<string> | null;
  createdAt: string;
  streamObjects: Array<{
    __typename?: 'StreamObject';
    type: string;
    textDelta: string | null;
    toolCallId: string | null;
    toolName: string | null;
    args: Record<string, string> | null;
    result: Record<string, string> | null;
  }> | null;
};

export type CopilotChatHistoryFragment = {
  __typename?: 'CopilotHistories';
  sessionId: string;
  promptName: string;
  model: string;
  optionalModels: Array<string>;
  action: string | null;
  pinned: boolean;
  title: string | null;
  metadata: string;
  tokens: number;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    __typename?: 'ChatMessage';
    id: string | null;
    role: string;
    content: string;
    attachments: Array<string> | null;
    createdAt: string;
    streamObjects: Array<{
      __typename?: 'StreamObject';
      type: string;
      textDelta: string | null;
      toolCallId: string | null;
      toolName: string | null;
      args: Record<string, string> | null;
      result: Record<string, string> | null;
    }> | null;
  }>;
};

export type PaginatedCopilotChatsFragment = {
  __typename?: 'PaginatedCopilotHistoriesType';
  pageInfo: {
    __typename?: 'PageInfo';
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  edges: Array<{
    __typename?: 'CopilotHistoriesTypeEdge';
    cursor: string;
    node: {
      __typename?: 'CopilotHistories';
      sessionId: string;
      promptName: string;
      model: string;
      optionalModels: Array<string>;
      action: string | null;
      pinned: boolean;
      title: string | null;
      metadata: string;
      tokens: number;
      createdAt: string;
      updatedAt: string;
      messages: Array<{
        __typename?: 'ChatMessage';
        id: string | null;
        role: string;
        content: string;
        attachments: Array<string> | null;
        createdAt: string;
        streamObjects: Array<{
          __typename?: 'StreamObject';
          type: string;
          textDelta: string | null;
          toolCallId: string | null;
          toolName: string | null;
          args: Record<string, string> | null;
          result: Record<string, string> | null;
        }> | null;
      }>;
    };
  }>;
};

export type CredentialsRequirementsFragment = {
  __typename?: 'CredentialsRequirementType';
  password: {
    __typename?: 'PasswordLimitsType';
    minLength: number;
    maxLength: number;
  };
};

export type PasswordLimitsFragment = {
  __typename?: 'PasswordLimitsType';
  minLength: number;
  maxLength: number;
};

export type GetCurrentUserFeaturesQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetCurrentUserFeaturesQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    avatarUrl: string | null;
    features: Array<FeatureType>;
  } | null;
};

export type GetCurrentUserQueryVariables = Exact<{ [key: string]: never }>;

export type GetCurrentUserQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    avatarUrl: string | null;
    hasPassword: boolean | null;
  } | null;
};

export type OauthProvidersQueryVariables = Exact<{ [key: string]: never }>;

export type OauthProvidersQuery = {
  __typename?: 'Query';
  serverConfig: {
    __typename?: 'ServerConfigType';
    oauthProviders: Array<OAuthProviderType>;
  };
};

export type GetPublicUserByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;

export type GetPublicUserByIdQuery = {
  __typename?: 'Query';
  publicUserById: {
    __typename?: 'PublicUserType';
    id: string;
    avatarUrl: string | null;
    name: string;
  } | null;
};

export type GetUserFeaturesQueryVariables = Exact<{ [key: string]: never }>;

export type GetUserFeaturesQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    id: string;
    features: Array<FeatureType>;
  } | null;
};

export type GetUserSettingsQueryVariables = Exact<{ [key: string]: never }>;

export type GetUserSettingsQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    settings: {
      __typename?: 'UserSettingsType';
      receiveInvitationEmail: boolean;
      receiveMentionEmail: boolean;
      receiveCommentEmail: boolean;
    };
  } | null;
};

export type GetUserQueryVariables = Exact<{
  email: Scalars['String']['input'];
}>;

export type GetUserQuery = {
  __typename?: 'Query';
  user:
    | {
        __typename: 'LimitedUserType';
        email: string;
        hasPassword: boolean | null;
      }
    | {
        __typename: 'UserType';
        id: string;
        name: string;
        avatarUrl: string | null;
        email: string;
        hasPassword: boolean | null;
      }
    | null;
};

export type QuotaQueryVariables = Exact<{ [key: string]: never }>;

export type QuotaQuery = {
  __typename?: 'Query';
  currentUser: {
    __typename?: 'UserType';
    id: string;
    quota: {
      __typename?: 'UserQuotaType';
      name: string;
      blobLimit: number;
      storageQuota: number;
      usedStorageQuota: number;
      copilotLimit: number | null;
      humanReadable: {
        __typename?: 'UserQuotaHumanReadableType';
        name: string;
        blobLimit: string;
        storageQuota: string;
        usedStorageQuota: string;
        copilotLimit: string;
      };
    };
  } | null;
};

export type RemoveAvatarMutationVariables = Exact<{ [key: string]: never }>;

export type RemoveAvatarMutation = {
  __typename?: 'Mutation';
  removeAvatar: { __typename?: 'RemoveAvatar'; success: boolean };
};

export type SendChangeEmailMutationVariables = Exact<{
  callbackUrl: Scalars['String']['input'];
}>;

export type SendChangeEmailMutation = {
  __typename?: 'Mutation';
  sendChangeEmail: boolean;
};

export type SendChangePasswordEmailMutationVariables = Exact<{
  callbackUrl: Scalars['String']['input'];
}>;

export type SendChangePasswordEmailMutation = {
  __typename?: 'Mutation';
  sendChangePasswordEmail: boolean;
};

export type SendSetPasswordEmailMutationVariables = Exact<{
  callbackUrl: Scalars['String']['input'];
}>;

export type SendSetPasswordEmailMutation = {
  __typename?: 'Mutation';
  sendSetPasswordEmail: boolean;
};

export type SendVerifyChangeEmailMutationVariables = Exact<{
  token: Scalars['String']['input'];
  email: Scalars['String']['input'];
  callbackUrl: Scalars['String']['input'];
}>;

export type SendVerifyChangeEmailMutation = {
  __typename?: 'Mutation';
  sendVerifyChangeEmail: boolean;
};

export type SendVerifyEmailMutationVariables = Exact<{
  callbackUrl: Scalars['String']['input'];
}>;

export type SendVerifyEmailMutation = {
  __typename?: 'Mutation';
  sendVerifyEmail: boolean;
};

export type ServerConfigQueryVariables = Exact<{ [key: string]: never }>;

export type ServerConfigQuery = {
  __typename?: 'Query';
  serverConfig: {
    __typename?: 'ServerConfigType';
    version: string;
    baseUrl: string;
    name: string;
    features: Array<ServerFeature>;
    type: ServerDeploymentType;
    initialized: boolean;
    credentialsRequirement: {
      __typename?: 'CredentialsRequirementType';
      password: {
        __typename?: 'PasswordLimitsType';
        minLength: number;
        maxLength: number;
      };
    };
  };
};

export type SubmitWishlistMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;

export type SubmitWishlistMutation = {
  __typename?: 'Mutation';
  submitWishlist: boolean;
};

export type UpdateUserProfileMutationVariables = Exact<{
  input: UpdateUserInput;
}>;

export type UpdateUserProfileMutation = {
  __typename?: 'Mutation';
  updateProfile: { __typename?: 'UserType'; id: string; name: string };
};

export type UpdateUserSettingsMutationVariables = Exact<{
  input: UpdateUserSettingsInput;
}>;

export type UpdateUserSettingsMutation = {
  __typename?: 'Mutation';
  updateSettings: boolean;
};

export type UploadAvatarMutationVariables = Exact<{
  avatar: Scalars['Upload']['input'];
}>;

export type UploadAvatarMutation = {
  __typename?: 'Mutation';
  uploadAvatar: {
    __typename?: 'UserType';
    id: string;
    name: string;
    avatarUrl: string | null;
    email: string;
  };
};

export type VerifyEmailMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;

export type VerifyEmailMutation = {
  __typename?: 'Mutation';
  verifyEmail: boolean;
};

export type Queries =
  | {
      name: 'adminServerConfigQuery';
      variables: AdminServerConfigQueryVariables;
      response: AdminServerConfigQuery;
    }
  | {
      name: 'appConfigQuery';
      variables: AppConfigQueryVariables;
      response: AppConfigQuery;
    }
  | {
      name: 'getPromptsQuery';
      variables: GetPromptsQueryVariables;
      response: GetPromptsQuery;
    }
  | {
      name: 'getUserByEmailQuery';
      variables: GetUserByEmailQueryVariables;
      response: GetUserByEmailQuery;
    }
  | {
      name: 'listUsersQuery';
      variables: ListUsersQueryVariables;
      response: ListUsersQuery;
    }
  | {
      name: 'removeContextChatQuery';
      variables: RemoveContextChatQueryVariables;
      response: RemoveContextChatQuery;
    }
  | {
      name: 'removeContextDocQuery';
      variables: RemoveContextDocQueryVariables;
      response: RemoveContextDocQuery;
    }
  | {
      name: 'removeContextFileQuery';
      variables: RemoveContextFileQueryVariables;
      response: RemoveContextFileQuery;
    }
  | {
      name: 'listContextObjectQuery';
      variables: ListContextObjectQueryVariables;
      response: ListContextObjectQuery;
    }
  | {
      name: 'listContextQuery';
      variables: ListContextQueryVariables;
      response: ListContextQuery;
    }
  | {
      name: 'getEmbeddingStatusQuery';
      variables: GetEmbeddingStatusQueryVariables;
      response: GetEmbeddingStatusQuery;
    }
  | {
      name: 'getCopilotHistoryIdsQuery';
      variables: GetCopilotHistoryIdsQueryVariables;
      response: GetCopilotHistoryIdsQuery;
    }
  | {
      name: 'getCopilotPinnedSessionsQuery';
      variables: GetCopilotPinnedSessionsQueryVariables;
      response: GetCopilotPinnedSessionsQuery;
    }
  | {
      name: 'getCopilotUserSessionsQuery';
      variables: GetCopilotUserSessionsQueryVariables;
      response: GetCopilotUserSessionsQuery;
    }
  | {
      name: 'getCopilotHistoriesQuery';
      variables: GetCopilotHistoriesQueryVariables;
      response: GetCopilotHistoriesQuery;
    }
  | {
      name: 'getAudioTranscriptionQuery';
      variables: GetAudioTranscriptionQueryVariables;
      response: GetAudioTranscriptionQuery;
    }
  | {
      name: 'copilotQuotaQuery';
      variables: CopilotQuotaQueryVariables;
      response: CopilotQuotaQuery;
    }
  | {
      name: 'getCopilotLatestDocSessionQuery';
      variables: GetCopilotLatestDocSessionQueryVariables;
      response: GetCopilotLatestDocSessionQuery;
    }
  | {
      name: 'getCopilotSessionQuery';
      variables: GetCopilotSessionQueryVariables;
      response: GetCopilotSessionQuery;
    }
  | {
      name: 'getCopilotRecentSessionsQuery';
      variables: GetCopilotRecentSessionsQueryVariables;
      response: GetCopilotRecentSessionsQuery;
    }
  | {
      name: 'getCopilotSessionsQuery';
      variables: GetCopilotSessionsQueryVariables;
      response: GetCopilotSessionsQuery;
    }
  | {
      name: 'getUserDocsQuery';
      variables: GetUserDocsQueryVariables;
      response: GetUserDocsQuery;
    }
  | {
      name: 'getUserFilesQuery';
      variables: GetUserFilesQueryVariables;
      response: GetUserFilesQuery;
    }
  | {
      name: 'getCurrentUserFeaturesQuery';
      variables: GetCurrentUserFeaturesQueryVariables;
      response: GetCurrentUserFeaturesQuery;
    }
  | {
      name: 'getCurrentUserQuery';
      variables: GetCurrentUserQueryVariables;
      response: GetCurrentUserQuery;
    }
  | {
      name: 'oauthProvidersQuery';
      variables: OauthProvidersQueryVariables;
      response: OauthProvidersQuery;
    }
  | {
      name: 'getPublicUserByIdQuery';
      variables: GetPublicUserByIdQueryVariables;
      response: GetPublicUserByIdQuery;
    }
  | {
      name: 'getUserFeaturesQuery';
      variables: GetUserFeaturesQueryVariables;
      response: GetUserFeaturesQuery;
    }
  | {
      name: 'getUserSettingsQuery';
      variables: GetUserSettingsQueryVariables;
      response: GetUserSettingsQuery;
    }
  | {
      name: 'getUserQuery';
      variables: GetUserQueryVariables;
      response: GetUserQuery;
    }
  | {
      name: 'quotaQuery';
      variables: QuotaQueryVariables;
      response: QuotaQuery;
    }
  | {
      name: 'serverConfigQuery';
      variables: ServerConfigQueryVariables;
      response: ServerConfigQuery;
    };

export type Mutations =
  | {
      name: 'createChangePasswordUrlMutation';
      variables: CreateChangePasswordUrlMutationVariables;
      response: CreateChangePasswordUrlMutation;
    }
  | {
      name: 'updatePromptMutation';
      variables: UpdatePromptMutationVariables;
      response: UpdatePromptMutation;
    }
  | {
      name: 'createUserMutation';
      variables: CreateUserMutationVariables;
      response: CreateUserMutation;
    }
  | {
      name: 'deleteUserMutation';
      variables: DeleteUserMutationVariables;
      response: DeleteUserMutation;
    }
  | {
      name: 'disableUserMutation';
      variables: DisableUserMutationVariables;
      response: DisableUserMutation;
    }
  | {
      name: 'enableUserMutation';
      variables: EnableUserMutationVariables;
      response: EnableUserMutation;
    }
  | {
      name: 'importUsersMutation';
      variables: ImportUsersMutationVariables;
      response: ImportUsersMutation;
    }
  | {
      name: 'sendTestEmailMutation';
      variables: SendTestEmailMutationVariables;
      response: SendTestEmailMutation;
    }
  | {
      name: 'updateAccountFeaturesMutation';
      variables: UpdateAccountFeaturesMutationVariables;
      response: UpdateAccountFeaturesMutation;
    }
  | {
      name: 'updateAccountMutation';
      variables: UpdateAccountMutationVariables;
      response: UpdateAccountMutation;
    }
  | {
      name: 'updateAppConfigMutation';
      variables: UpdateAppConfigMutationVariables;
      response: UpdateAppConfigMutation;
    }
  | {
      name: 'validateConfigMutation';
      variables: ValidateConfigMutationVariables;
      response: ValidateConfigMutation;
    }
  | {
      name: 'changeEmailMutation';
      variables: ChangeEmailMutationVariables;
      response: ChangeEmailMutation;
    }
  | {
      name: 'changePasswordMutation';
      variables: ChangePasswordMutationVariables;
      response: ChangePasswordMutation;
    }
  | {
      name: 'addContextChatMutation';
      variables: AddContextChatMutationVariables;
      response: AddContextChatMutation;
    }
  | {
      name: 'createCopilotContextMutation';
      variables: CreateCopilotContextMutationVariables;
      response: CreateCopilotContextMutation;
    }
  | {
      name: 'addContextDocMutation';
      variables: AddContextDocMutationVariables;
      response: AddContextDocMutation;
    }
  | {
      name: 'addContextFileExistsMutation';
      variables: AddContextFileExistsMutationVariables;
      response: AddContextFileExistsMutation;
    }
  | {
      name: 'addContextFileMutation';
      variables: AddContextFileMutationVariables;
      response: AddContextFileMutation;
    }
  | {
      name: 'submitAudioTranscriptionMutation';
      variables: SubmitAudioTranscriptionMutationVariables;
      response: SubmitAudioTranscriptionMutation;
    }
  | {
      name: 'claimAudioTranscriptionMutation';
      variables: ClaimAudioTranscriptionMutationVariables;
      response: ClaimAudioTranscriptionMutation;
    }
  | {
      name: 'retryAudioTranscriptionMutation';
      variables: RetryAudioTranscriptionMutationVariables;
      response: RetryAudioTranscriptionMutation;
    }
  | {
      name: 'createCopilotMessageMutation';
      variables: CreateCopilotMessageMutationVariables;
      response: CreateCopilotMessageMutation;
    }
  | {
      name: 'createCopilotSessionMutation';
      variables: CreateCopilotSessionMutationVariables;
      response: CreateCopilotSessionMutation;
    }
  | {
      name: 'removeCopilotSessionMutation';
      variables: RemoveCopilotSessionMutationVariables;
      response: RemoveCopilotSessionMutation;
    }
  | {
      name: 'updateCopilotSessionMutation';
      variables: UpdateCopilotSessionMutationVariables;
      response: UpdateCopilotSessionMutation;
    }
  | {
      name: 'addUserDocsMutation';
      variables: AddUserDocsMutationVariables;
      response: AddUserDocsMutation;
    }
  | {
      name: 'removeUserDocsMutation';
      variables: RemoveUserDocsMutationVariables;
      response: RemoveUserDocsMutation;
    }
  | {
      name: 'updateUserDocsMutation';
      variables: UpdateUserDocsMutationVariables;
      response: UpdateUserDocsMutation;
    }
  | {
      name: 'removeUserFilesMutation';
      variables: RemoveUserFilesMutationVariables;
      response: RemoveUserFilesMutation;
    }
  | {
      name: 'updateUserFilesMutation';
      variables: UpdateUserFilesMutationVariables;
      response: UpdateUserFilesMutation;
    }
  | {
      name: 'deleteAccountMutation';
      variables: DeleteAccountMutationVariables;
      response: DeleteAccountMutation;
    }
  | {
      name: 'removeAvatarMutation';
      variables: RemoveAvatarMutationVariables;
      response: RemoveAvatarMutation;
    }
  | {
      name: 'sendChangeEmailMutation';
      variables: SendChangeEmailMutationVariables;
      response: SendChangeEmailMutation;
    }
  | {
      name: 'sendChangePasswordEmailMutation';
      variables: SendChangePasswordEmailMutationVariables;
      response: SendChangePasswordEmailMutation;
    }
  | {
      name: 'sendSetPasswordEmailMutation';
      variables: SendSetPasswordEmailMutationVariables;
      response: SendSetPasswordEmailMutation;
    }
  | {
      name: 'sendVerifyChangeEmailMutation';
      variables: SendVerifyChangeEmailMutationVariables;
      response: SendVerifyChangeEmailMutation;
    }
  | {
      name: 'sendVerifyEmailMutation';
      variables: SendVerifyEmailMutationVariables;
      response: SendVerifyEmailMutation;
    }
  | {
      name: 'submitWishlistMutation';
      variables: SubmitWishlistMutationVariables;
      response: SubmitWishlistMutation;
    }
  | {
      name: 'updateUserProfileMutation';
      variables: UpdateUserProfileMutationVariables;
      response: UpdateUserProfileMutation;
    }
  | {
      name: 'updateUserSettingsMutation';
      variables: UpdateUserSettingsMutationVariables;
      response: UpdateUserSettingsMutation;
    }
  | {
      name: 'uploadAvatarMutation';
      variables: UploadAvatarMutationVariables;
      response: UploadAvatarMutation;
    }
  | {
      name: 'verifyEmailMutation';
      variables: VerifyEmailMutationVariables;
      response: VerifyEmailMutation;
    };
