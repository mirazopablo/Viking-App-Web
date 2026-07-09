import { apiClient } from "@/lib/api-client";
import { UserResponseDTO, UserCreateDTO, UserUpdateDTO } from "@/types/user";

/**
 * User / Client Service:
 * Manages CRUD operations and debounced search lookups for registered clients and staff.
 */
export const userService = {
  /**
   * Fetches a paginated or filtered list of users.
   * Can be filtered by query string (matching DNI, Name, or Email) or specific field selector.
   * @param search - Optional search string or DNI query.
   * @param field - Optional field selector mode ('dni', 'name', 'email', 'phone').
   */
  getUsers: async (
    search?: string,
    field?: "dni" | "name" | "email" | "phone"
  ): Promise<UserResponseDTO[]> => {
    const params: Record<string, string> = {};
    if (search) {
      if (field) {
        params.query = field;
        params[field] = search;
      } else {
        params.query = search;
      }
    }

    const response = await apiClient.get<UserResponseDTO[]>("/api/user/search", {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    let users = response.data || [];
    if (search && users.length > 0) {
      const lower = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name?.toLowerCase().includes(lower) ||
          u.email?.toLowerCase().includes(lower) ||
          u.dni?.toString().includes(lower) ||
          u.phoneNumber?.includes(lower)
      );
    }
    return users;
  },

  /**
   * Retrieves user details by UUID.
   * @param id - User UUID.
   */
  getUserById: async (id: string): Promise<UserResponseDTO> => {
    const response = await apiClient.get<UserResponseDTO>("/api/user/search", { params: { id } });
    return response.data;
  },

  /**
   * Registers a new client or staff member.
   * @param data - User creation DTO including DNI and email.
   */
  createUser: async (data: UserCreateDTO): Promise<UserResponseDTO> => {
    const response = await apiClient.post<UserResponseDTO>("/api/user/save", data);
    return response.data;
  },

  /**
   * Updates user metadata.
   * Note: DNI and Email are omitted in frontend forms to respect immutable PII rules.
   * @param id - User UUID.
   * @param data - Partial update DTO.
   */
  updateUser: async (id: string, data: UserUpdateDTO): Promise<UserResponseDTO> => {
    const response = await apiClient.patch<UserResponseDTO>(`/api/user/update/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a user by UUID.
   * @param id - User UUID.
   */
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/user/delete/${id}`);
  },
};

