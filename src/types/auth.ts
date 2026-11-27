/**
 * Authentication, JWT session payloads, and Role-Based Access Control (RBAC) contracts.
 */

export interface LoginRequestDTO {
  email: string;
  password?: string;          // Optional in DTO for external OAuth or token flows
}

export interface LoginResponseDTO {
  token: string;              // JWT Bearer Token
  user: {
    id: string;
    email: string;
    name: string;
    role: string;             // e.g., "STAFF", "ADMIN", "CLIENT"
  };
}

export type SystemRoleCode = "ADMIN" | "STAFF" | "CLIENT";

export const ROLE_DISPLAY_LABELS: Record<SystemRoleCode, string> = {
  ADMIN: "ADMINISTRADOR",
  STAFF: "TÉCNICO / STAFF",
  CLIENT: "CLIENTE",
};

/**
 * Translates an internal English role identifier (ADMIN, STAFF, CLIENT)
 * into its Spanish UI display label while preserving the underlying value.
 */
export function getRoleDisplayLabel(roleCode?: string | null): string {
  if (!roleCode) return "ROL";
  const normalized = roleCode.trim().toUpperCase() as SystemRoleCode;
  return ROLE_DISPLAY_LABELS[normalized] || roleCode;
}

export interface RoleDTO {
  id: string;
  name: string;
  description?: string;
}

export interface JwtPayloadDTO {
  sub: string;                // User UUID
  email: string;
  role: string;
  exp: number;                // Expiration timestamp
  iat: number;                // Issued at timestamp
}
