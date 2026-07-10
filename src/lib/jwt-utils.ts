/**
 * JWT payload structure for Viking App authentication tokens.
 */
export interface DecodedJWTPayload {
  exp?: number;
  sub?: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Safely decodes a base64url-encoded JWT payload without relying on external libraries.
 * @param token - Raw JWT string (header.payload.signature).
 * @returns Decoded payload object or null if invalid.
 */
export function decodeJwtPayload(token: string): DecodedJWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload) as DecodedJWTPayload;
  } catch {
    return null;
  }
}

/**
 * Calculates the remaining time in milliseconds before the JWT expires.
 * @param token - Raw JWT string.
 * @returns Remaining duration in milliseconds, or 0 if expired/invalid.
 */
export function getTokenRemainingTimeMs(token: string): number {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") {
    return 0;
  }

  const remainingMs = payload.exp * 1000 - Date.now();
  return Math.max(0, remainingMs);
}
