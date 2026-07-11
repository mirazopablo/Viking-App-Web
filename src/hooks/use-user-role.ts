"use client";

import { useState, useEffect } from "react";
import { decodeJwtPayload } from "@/lib/jwt-utils";
import { apiClient } from "@/lib/api-client";

export interface UserRoleState {
  role: string;
  roleId?: string;
  isAdmin: boolean;
  isStaff: boolean;
}

/**
 * Custom hook to safely inspect the current authenticated user's RBAC role and UUID
 * from localStorage and active session token, with automatic backend verification.
 */
export function useUserRole(adminRoleUuid?: string): UserRoleState {
  const [roleState, setRoleState] = useState<UserRoleState>({
    role: "STAFF",
    isAdmin: false,
    isStaff: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("viking_jwt_token");
    if (!token) return;

    const cachedRole = localStorage.getItem("viking_user_role");
    const payload = decodeJwtPayload(token);
    const userRoleId = payload && typeof payload.roleId === "string" ? payload.roleId : undefined;

    const resolveAndSetRole = (roleStr: string) => {
      const normalized = roleStr.toUpperCase();
      const isAdminRole =
        normalized === "ADMIN" ||
        (adminRoleUuid !== undefined && userRoleId === adminRoleUuid);

      setRoleState({
        role: normalized,
        roleId: userRoleId,
        isAdmin: isAdminRole,
        isStaff: !isAdminRole,
      });
    };

    // 1. Immediately apply cached role or token payload claim if present
    if (cachedRole) {
      resolveAndSetRole(cachedRole);
    } else if (payload && typeof payload.role === "string" && payload.role !== "STAFF") {
      resolveAndSetRole(payload.role);
    }

    // 2. Asynchronously verify with backend permission endpoint to ensure fresh state
    apiClient
      .get<string>("/api/user-roles/user-permission")
      .then((res) => {
        const verifiedRole = typeof res.data === "string" ? res.data.toUpperCase() : "STAFF";
        localStorage.setItem("viking_user_role", verifiedRole);
        resolveAndSetRole(verifiedRole);
      })
      .catch(() => {
        // Fallback silently if backend endpoint fails
      });
  }, [adminRoleUuid]);

  return roleState;
}
