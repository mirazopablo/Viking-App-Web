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
