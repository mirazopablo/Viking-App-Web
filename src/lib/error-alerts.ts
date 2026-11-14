import axios from "axios";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import type {
  ApiErrorCode,
  ApiErrorResponse,
  ErrorAlertConfig,
  FieldError,
  ResolvedApiError,
} from "@/types/api-error";

/**
 * Canonical mapping from backend/client error codes to Spanish UI alerts.
 */
export const ERROR_ALERT_MAP: Record<ApiErrorCode, ErrorAlertConfig> = {
  VALIDATION_ERROR: {
    title: "Datos inválidos",
    description: "Revisá los campos ingresados e intentá nuevamente.",
    variant: "warning",
  },
  INVALID_ID: {
    title: "Identificador inválido",
    description: "El enlace o identificador consultado no es válido.",
    variant: "error",
  },
  BUSINESS_RULE_VIOLATION: {
    title: "Acción no permitida",
    description: "No se pudo completar la operación por una regla del sistema.",
    variant: "warning",
    useBackendMessage: true,
  },
  AUTH_INVALID_CREDENTIALS: {
    title: "Credenciales incorrectas",
    description: "El email o la contraseña son incorrectos.",
    variant: "error",
  },
  AUTH_TOKEN_MISSING: {
    title: "Sesión requerida",
    description: "Iniciá sesión para continuar.",
    variant: "info",
    requiresLogout: true,
  },
  AUTH_TOKEN_INVALID: {
    title: "Sesión expirada",
    description: "Tu turno o sesión venció. Volvé a iniciar sesión.",
    variant: "warning",
    requiresLogout: true,
  },
  INVALID_SECURITY_CODE: {
    title: "Código inválido",
    description: "El código de seguridad ingresado no coincide con la orden.",
    variant: "error",
  },
  AUTH_FORBIDDEN: {
    title: "Sin permisos",
    description: "No tenés permisos para realizar esta acción.",
    variant: "error",
  },
  RESOURCE_NOT_FOUND: {
    title: "No encontrado",
    description: "No encontramos el registro solicitado.",
    variant: "info",
  },
  AUTH_EMAIL_EXISTS: {
    title: "Email ya registrado",
    description: "Ya existe una cuenta asociada a ese correo electrónico.",
    variant: "warning",
  },
  RESOURCE_CONFLICT: {
    title: "Conflicto de disponibilidad",
    description: "El recurso o turno ya fue modificado. Actualizá la vista.",
    variant: "warning",
  },
  RATE_LIMIT_EXCEEDED: {
    title: "Demasiados intentos",
    description: "Esperá unos minutos antes de volver a intentarlo.",
    variant: "warning",
  },
  INTERNAL_ERROR: {
    title: "Error del servidor",
    description: "Ocurrió un error inesperado. Intentá nuevamente más tarde.",
    variant: "error",
  },
  TIMEOUT_ERROR: {
    title: "Tiempo de espera agotado",
    description: "El servidor tardó demasiado en responder. Intentá nuevamente.",
    variant: "warning",
  },
  NETWORK_ERROR: {
    title: "Sin conexión",
    description: "No pudimos comunicarnos con el servidor. Verificá tu conexión.",
    variant: "error",
  },
  UNKNOWN_ERROR: {
    title: "Error inesperado",
    description: "Ocurrió un problema al procesar la solicitud.",
    variant: "error",
  },
};

function isKnownErrorCode(code: string | undefined): code is ApiErrorCode {
  return Boolean(code && Object.prototype.hasOwnProperty.call(ERROR_ALERT_MAP, code));
}

function buildResolvedError(
  code: ApiErrorCode,
  details: FieldError[] = [],
  backendMessage?: string
): ResolvedApiError {
  const config = ERROR_ALERT_MAP[code];
  const description =
    config.useBackendMessage && backendMessage?.trim()
      ? backendMessage
      : config.description;

  return {
    code,
    title: config.title,
    description,
    variant: config.variant,
    details,
    requiresLogout: Boolean(config.requiresLogout),
  };
}

/**
 * Extracts the structured backend error payload from an unknown error if present.
 */
export function extractApiErrorData(error: unknown): Partial<ApiErrorResponse> | null {
  if (!axios.isAxiosError<Partial<ApiErrorResponse>>(error)) {
    return null;
  }
  return error.response?.data ?? null;
}

/**
 * Resolves any Axios or runtime error into a normalized Spanish UI alert object
 * keyed strictly by error.code or client connectivity state.
 */
export function resolveApiError(error: unknown): ResolvedApiError {
  if (axios.isAxiosError<Partial<ApiErrorResponse>>(error)) {
    if (error.code === "ECONNABORTED") {
      return buildResolvedError("TIMEOUT_ERROR");
    }

    if (!error.response) {
      return buildResolvedError("NETWORK_ERROR");
    }

    const data = error.response.data;
    const details = Array.isArray(data?.details) ? data.details : [];

    if (isKnownErrorCode(data?.code)) {
      return buildResolvedError(data.code, details, data?.message);
    }

    if (error.response.status >= 500) {
      return buildResolvedError("INTERNAL_ERROR", details);
    }

    return buildResolvedError("UNKNOWN_ERROR", details);
  }

  return buildResolvedError("UNKNOWN_ERROR");
}

/**
 * Displays a Sonner toast matching the resolved error variant and copy.
 */
export function notifyApiError(
  error: unknown,
  overrides?: Partial<Pick<ErrorAlertConfig, "title" | "description">>
): ResolvedApiError {
  const resolved = resolveApiError(error);
  const title = overrides?.title ?? resolved.title;
  const description = overrides?.description ?? resolved.description;

  toast[resolved.variant](title, { description });
  return resolved;
}

/**
 * Applies backend field-level validation errors onto a react-hook-form instance.
 * Translates Go PascalCase field names using fieldMap or lowercase fallback.
 */
export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldMap?: Record<string, Path<T>>
): boolean {
  const { details } = resolveApiError(error);
  if (details.length === 0) {
    return false;
  }

  let applied = false;
  for (const item of details) {
    const mappedField =
      fieldMap?.[item.field] ?? (item.field.toLowerCase() as Path<T>);

    if (mappedField) {
      setError(mappedField, {
        type: "server",
        message: item.message,
      });
      applied = true;
    }
  }

  return applied;
}

