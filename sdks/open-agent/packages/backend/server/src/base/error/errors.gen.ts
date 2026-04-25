/* oxlint-disable */
// AUTO GENERATED FILE
import { createUnionType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UserFriendlyError } from './def';

export class InternalServerError extends UserFriendlyError {
  constructor(message?: string) {
    super('internal_server_error', 'internal_server_error', message);
  }
}

export class NetworkError extends UserFriendlyError {
  constructor(message?: string) {
    super('network_error', 'network_error', message);
  }
}

export class TooManyRequest extends UserFriendlyError {
  constructor(message?: string) {
    super('too_many_requests', 'too_many_request', message);
  }
}

export class NotFound extends UserFriendlyError {
  constructor(message?: string) {
    super('resource_not_found', 'not_found', message);
  }
}

export class BadRequest extends UserFriendlyError {
  constructor(message?: string) {
    super('bad_request', 'bad_request', message);
  }
}
@ObjectType()
class GraphqlBadRequestDataType {
  @Field() code!: string
  @Field() message!: string
}

export class GraphqlBadRequest extends UserFriendlyError {
  constructor(args: GraphqlBadRequestDataType, message?: string | ((args: GraphqlBadRequestDataType) => string)) {
    super('bad_request', 'graphql_bad_request', message, args);
  }
}
@ObjectType()
class HttpRequestErrorDataType {
  @Field() message!: string
}

export class HttpRequestError extends UserFriendlyError {
  constructor(args: HttpRequestErrorDataType, message?: string | ((args: HttpRequestErrorDataType) => string)) {
    super('bad_request', 'http_request_error', message, args);
  }
}

export class EmailServiceNotConfigured extends UserFriendlyError {
  constructor(message?: string) {
    super('internal_server_error', 'email_service_not_configured', message);
  }
}
@ObjectType()
class QueryTooLongDataType {
  @Field() max!: number
}

export class QueryTooLong extends UserFriendlyError {
  constructor(args: QueryTooLongDataType, message?: string | ((args: QueryTooLongDataType) => string)) {
    super('invalid_input', 'query_too_long', message, args);
  }
}
@ObjectType()
class ValidationErrorDataType {
  @Field() errors!: string
}

export class ValidationError extends UserFriendlyError {
  constructor(args: ValidationErrorDataType, message?: string | ((args: ValidationErrorDataType) => string)) {
    super('invalid_input', 'validation_error', message, args);
  }
}

export class UserNotFound extends UserFriendlyError {
  constructor(message?: string) {
    super('resource_not_found', 'user_not_found', message);
  }
}

export class UserAvatarNotFound extends UserFriendlyError {
  constructor(message?: string) {
    super('resource_not_found', 'user_avatar_not_found', message);
  }
}

export class EmailAlreadyUsed extends UserFriendlyError {
  constructor(message?: string) {
    super('resource_already_exists', 'email_already_used', message);
  }
}

export class SameEmailProvided extends UserFriendlyError {
  constructor(message?: string) {
    super('invalid_input', 'same_email_provided', message);
  }
}
@ObjectType()
class WrongSignInCredentialsDataType {
  @Field() email!: string
}

export class WrongSignInCredentials extends UserFriendlyError {
  constructor(args: WrongSignInCredentialsDataType, message?: string | ((args: WrongSignInCredentialsDataType) => string)) {
    super('invalid_input', 'wrong_sign_in_credentials', message, args);
  }
}
@ObjectType()
class UnknownOauthProviderDataType {
  @Field() name!: string
}

export class UnknownOauthProvider extends UserFriendlyError {
  constructor(args: UnknownOauthProviderDataType, message?: string | ((args: UnknownOauthProviderDataType) => string)) {
    super('invalid_input', 'unknown_oauth_provider', message, args);
  }
}

export class OauthStateExpired extends UserFriendlyError {
  constructor(message?: string) {
    super('bad_request', 'oauth_state_expired', message);
  }
}

export class InvalidOauthCallbackState extends UserFriendlyError {
  constructor(message?: string) {
    super('bad_request', 'invalid_oauth_callback_state', message);
  }
}
@ObjectType()
class InvalidOauthCallbackCodeDataType {
  @Field() status!: number
  @Field() body!: string
}

export class InvalidOauthCallbackCode extends UserFriendlyError {
  constructor(args: InvalidOauthCallbackCodeDataType, message?: string | ((args: InvalidOauthCallbackCodeDataType) => string)) {
    super('bad_request', 'invalid_oauth_callback_code', message, args);
  }
}

export class InvalidAuthState extends UserFriendlyError {
  constructor(message?: string) {
    super('bad_request', 'invalid_auth_state', message);
  }
}
@ObjectType()
class MissingOauthQueryParameterDataType {
  @Field() name!: string
}

export class MissingOauthQueryParameter extends UserFriendlyError {
  constructor(args: MissingOauthQueryParameterDataType, message?: string | ((args: MissingOauthQueryParameterDataType) => string)) {
    super('bad_request', 'missing_oauth_query_parameter', message, args);
  }
}

export class OauthAccountAlreadyConnected extends UserFriendlyError {
  constructor(message?: string) {
    super('bad_request', 'oauth_account_already_connected', message);
  }
}
@ObjectType()
class InvalidOauthResponseDataType {
  @Field() reason!: string
}

export class InvalidOauthResponse extends UserFriendlyError {
  constructor(args: InvalidOauthResponseDataType, message?: string | ((args: InvalidOauthResponseDataType) => string)) {
    super('bad_request', 'invalid_oauth_response', message, args);
  }
}
@ObjectType()
class InvalidEmailDataType {
  @Field() email!: string
}

export class InvalidEmail extends UserFriendlyError {
  constructor(args: InvalidEmailDataType, message?: string | ((args: InvalidEmailDataType) => string)) {
    super('invalid_input', 'invalid_email', message, args);
  }
}
@ObjectType()
class InvalidPasswordLengthDataType {
  @Field() min!: number
  @Field() max!: number
}

export class InvalidPasswordLength extends UserFriendlyError {
  constructor(args: InvalidPasswordLengthDataType, message?: string | ((args: InvalidPasswordLengthDataType) => string)) {
    super('invalid_input', 'invalid_password_length', message, args);
  }
}

export class PasswordRequired extends UserFriendlyError {
  constructor(message?: string) {
    super('invalid_input', 'password_required', message);
  }
}

export class WrongSignInMethod extends UserFriendlyError {
  constructor(message?: string) {
    super('invalid_input', 'wrong_sign_in_method', message);
  }
}

export class EarlyAccessRequired extends UserFriendlyError {
  constructor(message?: string) {
    super('action_forbidden', 'early_access_required', message);
  }
}

export class SignUpForbidden extends UserFriendlyError {
  constructor(message?: string) {
    super('action_forbidden', 'sign_up_forbidden', message);
  }
}

export class EmailTokenNotFound extends UserFriendlyError {
  constructor(message?: string) {
    super('invalid_input', 'email_token_not_found', message);
  }
}

export class InvalidEmailToken extends UserFriendlyError {
  constructor(message?: string) {
    super('invalid_input', 'invalid_email_token', message);
  }
}

export class LinkExpired extends UserFriendlyError {
  constructor(message?: string) {
    super('bad_request', 'link_expired', message);
  }
}

export class AuthenticationRequired extends UserFriendlyError {
  constructor(message?: string) {
    super('authentication_required', 'authentication_required', message);
  }
}

export class ActionForbidden extends UserFriendlyError {
  constructor(message?: string) {
    super('action_forbidden', 'action_forbidden', message);
  }
}

export class AccessDenied extends UserFriendlyError {
  constructor(message?: string) {
    super('no_permission', 'access_denied', message);
  }
}

export class EmailVerificationRequired extends UserFriendlyError {
  constructor(message?: string) {
    super('action_forbidden', 'email_verification_required', message);
  }
}

export class CopilotSessionNotFound extends UserFriendlyError {
  constructor(message?: string) {
    super('resource_not_found', 'copilot_session_not_found', message);
  }
}

export class CopilotSessionInvalidInput extends UserFriendlyError {
  constructor(message?: string) {
    super('invalid_input', 'copilot_session_invalid_input', message);
  }
}

export class CopilotSessionDeleted extends UserFriendlyError {
  constructor(message?: string) {
    super('action_forbidden', 'copilot_session_deleted', message);
  }
}
@ObjectType()
class NoCopilotProviderAvailableDataType {
  @Field() modelId!: string
}

export class NoCopilotProviderAvailable extends UserFriendlyError {
  constructor(args: NoCopilotProviderAvailableDataType, message?: string | ((args: NoCopilotProviderAvailableDataType) => string)) {
    super('internal_server_error', 'no_copilot_provider_available', message, args);
  }
}

export class CopilotFailedToGenerateText extends UserFriendlyError {
  constructor(message?: string) {
    super('internal_server_error', 'copilot_failed_to_generate_text', message);
  }
}
@ObjectType()
class CopilotFailedToGenerateEmbeddingDataType {
  @Field() provider!: string
  @Field() message!: string
}

export class CopilotFailedToGenerateEmbedding extends UserFriendlyError {
  constructor(args: CopilotFailedToGenerateEmbeddingDataType, message?: string | ((args: CopilotFailedToGenerateEmbeddingDataType) => string)) {
    super('internal_server_error', 'copilot_failed_to_generate_embedding', message, args);
  }
}

export class CopilotFailedToCreateMessage extends UserFriendlyError {
  constructor(message?: string) {
    super('internal_server_error', 'copilot_failed_to_create_message', message);
  }
}

export class UnsplashIsNotConfigured extends UserFriendlyError {
  constructor(message?: string) {
    super('internal_server_error', 'unsplash_is_not_configured', message);
  }
}

export class CopilotActionTaken extends UserFriendlyError {
  constructor(message?: string) {
    super('action_forbidden', 'copilot_action_taken', message);
  }
}
@ObjectType()
class CopilotDocNotFoundDataType {
  @Field() docId!: string
}

export class CopilotDocNotFound extends UserFriendlyError {
  constructor(args: CopilotDocNotFoundDataType, message?: string | ((args: CopilotDocNotFoundDataType) => string)) {
    super('resource_not_found', 'copilot_doc_not_found', message, args);
  }
}

export class CopilotDocsNotFound extends UserFriendlyError {
  constructor(message?: string) {
    super('resource_not_found', 'copilot_docs_not_found', message);
  }
}
@ObjectType()
class CopilotMessageNotFoundDataType {
  @Field() messageId!: string
}

export class CopilotMessageNotFound extends UserFriendlyError {
  constructor(args: CopilotMessageNotFoundDataType, message?: string | ((args: CopilotMessageNotFoundDataType) => string)) {
    super('resource_not_found', 'copilot_message_not_found', message, args);
  }
}
@ObjectType()
class CopilotPromptNotFoundDataType {
  @Field() name!: string
}

export class CopilotPromptNotFound extends UserFriendlyError {
  constructor(args: CopilotPromptNotFoundDataType, message?: string | ((args: CopilotPromptNotFoundDataType) => string)) {
    super('resource_not_found', 'copilot_prompt_not_found', message, args);
  }
}

export class CopilotPromptInvalid extends UserFriendlyError {
  constructor(message?: string) {
    super('invalid_input', 'copilot_prompt_invalid', message);
  }
}
@ObjectType()
class CopilotProviderNotSupportedDataType {
  @Field() provider!: string
  @Field() kind!: string
}

export class CopilotProviderNotSupported extends UserFriendlyError {
  constructor(args: CopilotProviderNotSupportedDataType, message?: string | ((args: CopilotProviderNotSupportedDataType) => string)) {
    super('invalid_input', 'copilot_provider_not_supported', message, args);
  }
}
@ObjectType()
class CopilotProviderSideErrorDataType {
  @Field() provider!: string
  @Field() kind!: string
  @Field() message!: string
}

export class CopilotProviderSideError extends UserFriendlyError {
  constructor(args: CopilotProviderSideErrorDataType, message?: string | ((args: CopilotProviderSideErrorDataType) => string)) {
    super('internal_server_error', 'copilot_provider_side_error', message, args);
  }
}
@ObjectType()
class CopilotInvalidContextDataType {
  @Field() contextId!: string
}

export class CopilotInvalidContext extends UserFriendlyError {
  constructor(args: CopilotInvalidContextDataType, message?: string | ((args: CopilotInvalidContextDataType) => string)) {
    super('invalid_input', 'copilot_invalid_context', message, args);
  }
}
@ObjectType()
class CopilotContextFileNotSupportedDataType {
  @Field() fileName!: string
  @Field() message!: string
}

export class CopilotContextFileNotSupported extends UserFriendlyError {
  constructor(args: CopilotContextFileNotSupportedDataType, message?: string | ((args: CopilotContextFileNotSupportedDataType) => string)) {
    super('bad_request', 'copilot_context_file_not_supported', message, args);
  }
}
@ObjectType()
class CopilotFailedToModifyContextDataType {
  @Field() contextId!: string
  @Field() message!: string
}

export class CopilotFailedToModifyContext extends UserFriendlyError {
  constructor(args: CopilotFailedToModifyContextDataType, message?: string | ((args: CopilotFailedToModifyContextDataType) => string)) {
    super('internal_server_error', 'copilot_failed_to_modify_context', message, args);
  }
}
@ObjectType()
class CopilotFailedToMatchContextDataType {
  @Field() contextId!: string
  @Field() content!: string
  @Field() message!: string
}

export class CopilotFailedToMatchContext extends UserFriendlyError {
  constructor(args: CopilotFailedToMatchContextDataType, message?: string | ((args: CopilotFailedToMatchContextDataType) => string)) {
    super('internal_server_error', 'copilot_failed_to_match_context', message, args);
  }
}
@ObjectType()
class CopilotFailedToMatchGlobalContextDataType {
  @Field() userId!: string
  @Field() content!: string
  @Field() message!: string
}

export class CopilotFailedToMatchGlobalContext extends UserFriendlyError {
  constructor(args: CopilotFailedToMatchGlobalContextDataType, message?: string | ((args: CopilotFailedToMatchGlobalContextDataType) => string)) {
    super('internal_server_error', 'copilot_failed_to_match_global_context', message, args);
  }
}

export class CopilotEmbeddingUnavailable extends UserFriendlyError {
  constructor(message?: string) {
    super('action_forbidden', 'copilot_embedding_unavailable', message);
  }
}

export class CopilotTranscriptionJobExists extends UserFriendlyError {
  constructor(message?: string) {
    super('bad_request', 'copilot_transcription_job_exists', message);
  }
}

export class CopilotTranscriptionJobNotFound extends UserFriendlyError {
  constructor(message?: string) {
    super('bad_request', 'copilot_transcription_job_not_found', message);
  }
}

export class CopilotTranscriptionAudioNotProvided extends UserFriendlyError {
  constructor(message?: string) {
    super('bad_request', 'copilot_transcription_audio_not_provided', message);
  }
}
@ObjectType()
class CopilotFailedToAddUserArtifactDataType {
  @Field() message!: string
  @Field() type!: string
}

export class CopilotFailedToAddUserArtifact extends UserFriendlyError {
  constructor(args: CopilotFailedToAddUserArtifactDataType, message?: string | ((args: CopilotFailedToAddUserArtifactDataType) => string)) {
    super('internal_server_error', 'copilot_failed_to_add_user_artifact', message, args);
  }
}
@ObjectType()
class BlobNotFoundDataType {
  @Field() userId!: string
  @Field() blobId!: string
}

export class BlobNotFound extends UserFriendlyError {
  constructor(args: BlobNotFoundDataType, message?: string | ((args: BlobNotFoundDataType) => string)) {
    super('resource_not_found', 'blob_not_found', message, args);
  }
}

export class BlobQuotaExceeded extends UserFriendlyError {
  constructor(message?: string) {
    super('quota_exceeded', 'blob_quota_exceeded', message);
  }
}

export class StorageQuotaExceeded extends UserFriendlyError {
  constructor(message?: string) {
    super('quota_exceeded', 'storage_quota_exceeded', message);
  }
}

export class CopilotQuotaExceeded extends UserFriendlyError {
  constructor(message?: string) {
    super('quota_exceeded', 'copilot_quota_exceeded', message);
  }
}
@ObjectType()
class RuntimeConfigNotFoundDataType {
  @Field() key!: string
}

export class RuntimeConfigNotFound extends UserFriendlyError {
  constructor(args: RuntimeConfigNotFoundDataType, message?: string | ((args: RuntimeConfigNotFoundDataType) => string)) {
    super('resource_not_found', 'runtime_config_not_found', message, args);
  }
}
@ObjectType()
class InvalidRuntimeConfigTypeDataType {
  @Field() key!: string
  @Field() want!: string
  @Field() get!: string
}

export class InvalidRuntimeConfigType extends UserFriendlyError {
  constructor(args: InvalidRuntimeConfigTypeDataType, message?: string | ((args: InvalidRuntimeConfigTypeDataType) => string)) {
    super('invalid_input', 'invalid_runtime_config_type', message, args);
  }
}

export class MailerServiceIsNotConfigured extends UserFriendlyError {
  constructor(message?: string) {
    super('internal_server_error', 'mailer_service_is_not_configured', message);
  }
}

export class CannotDeleteAllAdminAccount extends UserFriendlyError {
  constructor(message?: string) {
    super('action_forbidden', 'cannot_delete_all_admin_account', message);
  }
}

export class CannotDeleteOwnAccount extends UserFriendlyError {
  constructor(message?: string) {
    super('action_forbidden', 'cannot_delete_own_account', message);
  }
}

export class CaptchaVerificationFailed extends UserFriendlyError {
  constructor(message?: string) {
    super('bad_request', 'captcha_verification_failed', message);
  }
}
@ObjectType()
class UnsupportedClientVersionDataType {
  @Field() clientVersion!: string
  @Field() requiredVersion!: string
}

export class UnsupportedClientVersion extends UserFriendlyError {
  constructor(args: UnsupportedClientVersionDataType, message?: string | ((args: UnsupportedClientVersionDataType) => string)) {
    super('action_forbidden', 'unsupported_client_version', message, args);
  }
}
@ObjectType()
class InvalidAppConfigDataType {
  @Field() module!: string
  @Field() key!: string
  @Field() hint!: string
}

export class InvalidAppConfig extends UserFriendlyError {
  constructor(args: InvalidAppConfigDataType, message?: string | ((args: InvalidAppConfigDataType) => string)) {
    super('invalid_input', 'invalid_app_config', message, args);
  }
}
@ObjectType()
class InvalidAppConfigInputDataType {
  @Field() message!: string
}

export class InvalidAppConfigInput extends UserFriendlyError {
  constructor(args: InvalidAppConfigInputDataType, message?: string | ((args: InvalidAppConfigInputDataType) => string)) {
    super('invalid_input', 'invalid_app_config_input', message, args);
  }
}
export enum ErrorNames {
  INTERNAL_SERVER_ERROR,
  NETWORK_ERROR,
  TOO_MANY_REQUEST,
  NOT_FOUND,
  BAD_REQUEST,
  GRAPHQL_BAD_REQUEST,
  HTTP_REQUEST_ERROR,
  EMAIL_SERVICE_NOT_CONFIGURED,
  QUERY_TOO_LONG,
  VALIDATION_ERROR,
  USER_NOT_FOUND,
  USER_AVATAR_NOT_FOUND,
  EMAIL_ALREADY_USED,
  SAME_EMAIL_PROVIDED,
  WRONG_SIGN_IN_CREDENTIALS,
  UNKNOWN_OAUTH_PROVIDER,
  OAUTH_STATE_EXPIRED,
  INVALID_OAUTH_CALLBACK_STATE,
  INVALID_OAUTH_CALLBACK_CODE,
  INVALID_AUTH_STATE,
  MISSING_OAUTH_QUERY_PARAMETER,
  OAUTH_ACCOUNT_ALREADY_CONNECTED,
  INVALID_OAUTH_RESPONSE,
  INVALID_EMAIL,
  INVALID_PASSWORD_LENGTH,
  PASSWORD_REQUIRED,
  WRONG_SIGN_IN_METHOD,
  EARLY_ACCESS_REQUIRED,
  SIGN_UP_FORBIDDEN,
  EMAIL_TOKEN_NOT_FOUND,
  INVALID_EMAIL_TOKEN,
  LINK_EXPIRED,
  AUTHENTICATION_REQUIRED,
  ACTION_FORBIDDEN,
  ACCESS_DENIED,
  EMAIL_VERIFICATION_REQUIRED,
  COPILOT_SESSION_NOT_FOUND,
  COPILOT_SESSION_INVALID_INPUT,
  COPILOT_SESSION_DELETED,
  NO_COPILOT_PROVIDER_AVAILABLE,
  COPILOT_FAILED_TO_GENERATE_TEXT,
  COPILOT_FAILED_TO_GENERATE_EMBEDDING,
  COPILOT_FAILED_TO_CREATE_MESSAGE,
  UNSPLASH_IS_NOT_CONFIGURED,
  COPILOT_ACTION_TAKEN,
  COPILOT_DOC_NOT_FOUND,
  COPILOT_DOCS_NOT_FOUND,
  COPILOT_MESSAGE_NOT_FOUND,
  COPILOT_PROMPT_NOT_FOUND,
  COPILOT_PROMPT_INVALID,
  COPILOT_PROVIDER_NOT_SUPPORTED,
  COPILOT_PROVIDER_SIDE_ERROR,
  COPILOT_INVALID_CONTEXT,
  COPILOT_CONTEXT_FILE_NOT_SUPPORTED,
  COPILOT_FAILED_TO_MODIFY_CONTEXT,
  COPILOT_FAILED_TO_MATCH_CONTEXT,
  COPILOT_FAILED_TO_MATCH_GLOBAL_CONTEXT,
  COPILOT_EMBEDDING_UNAVAILABLE,
  COPILOT_TRANSCRIPTION_JOB_EXISTS,
  COPILOT_TRANSCRIPTION_JOB_NOT_FOUND,
  COPILOT_TRANSCRIPTION_AUDIO_NOT_PROVIDED,
  COPILOT_FAILED_TO_ADD_USER_ARTIFACT,
  BLOB_NOT_FOUND,
  BLOB_QUOTA_EXCEEDED,
  STORAGE_QUOTA_EXCEEDED,
  COPILOT_QUOTA_EXCEEDED,
  RUNTIME_CONFIG_NOT_FOUND,
  INVALID_RUNTIME_CONFIG_TYPE,
  MAILER_SERVICE_IS_NOT_CONFIGURED,
  CANNOT_DELETE_ALL_ADMIN_ACCOUNT,
  CANNOT_DELETE_OWN_ACCOUNT,
  CAPTCHA_VERIFICATION_FAILED,
  UNSUPPORTED_CLIENT_VERSION,
  INVALID_APP_CONFIG,
  INVALID_APP_CONFIG_INPUT
}
registerEnumType(ErrorNames, {
  name: 'ErrorNames'
})

export const ErrorDataUnionType = createUnionType({
  name: 'ErrorDataUnion',
  types: () =>
    [GraphqlBadRequestDataType, HttpRequestErrorDataType, QueryTooLongDataType, ValidationErrorDataType, WrongSignInCredentialsDataType, UnknownOauthProviderDataType, InvalidOauthCallbackCodeDataType, MissingOauthQueryParameterDataType, InvalidOauthResponseDataType, InvalidEmailDataType, InvalidPasswordLengthDataType, NoCopilotProviderAvailableDataType, CopilotFailedToGenerateEmbeddingDataType, CopilotDocNotFoundDataType, CopilotMessageNotFoundDataType, CopilotPromptNotFoundDataType, CopilotProviderNotSupportedDataType, CopilotProviderSideErrorDataType, CopilotInvalidContextDataType, CopilotContextFileNotSupportedDataType, CopilotFailedToModifyContextDataType, CopilotFailedToMatchContextDataType, CopilotFailedToMatchGlobalContextDataType, CopilotFailedToAddUserArtifactDataType, BlobNotFoundDataType, RuntimeConfigNotFoundDataType, InvalidRuntimeConfigTypeDataType, UnsupportedClientVersionDataType, InvalidAppConfigDataType, InvalidAppConfigInputDataType] as const,
});
