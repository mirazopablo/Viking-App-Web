/**
 * Represents a single field validation failure returned by the backend.
 */
export interface FieldError {
  field: string;
  reason: string;
  message: string;
}

/**
 * Canonical error codes returned by the Viking App Go backend.
 */
export type BackendErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_ID"
  | "BUSINESS_RULE_VIOLATION"
  | "AUTH_INVALID_CREDENTIALS"
  | "AUTH_TOKEN_MISSING"
  | "AUTH_TOKEN_INVALID"
  | "INVALID_SECURITY_CODE"
  | "AUTH_FORBIDDEN"
  | "RESOURCE_NOT_FOUND"
  | "AUTH_EMAIL_EXISTS"
  | "RESOURCE_CONFLICT"
  | "RATE_LIMIT_EXCEEDED"
  | "INTERNAL_ERROR";

/**
 * Client-side error codes for connectivity, timeout, or unmapped failures.
 */
export type ClientErrorCode = "TIMEOUT_ERROR" | "NETWORK_ERROR" | "UNKNOWN_ERROR";

export type ApiErrorCode = BackendErrorCode | ClientErrorCode;

/**
 * Standard error payload returned by the backend for 4xx/5xx responses.
 */
export interface ApiErrorResponse {
  success: false;
  code: BackendErrorCode | string;
  message: string;
  details?: FieldError[] | null;
}

export type AlertVariant = "error" | "warning" | "info";

/**
 * UI alert configuration mapped to an ApiErrorCode.
 */
export interface ErrorAlertConfig {
  title: string;
  description: string;
  variant: AlertVariant;
  requiresLogout?: boolean;
  useBackendMessage?: boolean;
}

/**
 * Normalized error result ready to be consumed by UI components and forms.
 */
export interface ResolvedApiError {
  code: ApiErrorCode;
  title: string;
  description: string;
  variant: AlertVariant;
  details: FieldError[];
  requiresLogout: boolean;
}

