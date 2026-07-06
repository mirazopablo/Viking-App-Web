import { apiClient } from "@/lib/api-client";
import { UserResponseDTO, UserCreateDTO, UserUpdateDTO } from "@/types/user";

/**
 * User / Client Service:
 * Manages CRUD operations and debounced search lookups for registered clients and staff.
 */
export const userService = {
  /**
   * Fetches a paginated or filtered list of users.
   * Can be filtered by query string (matching DNI, Name, or Email).
   * @param search - Optional search string or DNI query.
   */
  getUsers: async (search?: string): Promise<UserResponseDTO[]> => {
    const params = search ? { search } : {};
    const response = await apiClient.get<UserResponseDTO[]>("/users", { params });
    return response.data;
  },

  /**
   * Retrieves user details by UUID.
   * @param id - User UUID.
   */
  getUserById: async (id: string): Promise<UserResponseDTO> => {
    const response = await apiClient.get<UserResponseDTO>(`/users/${id}`);
    return response.data;
  },

  /**
   * Registers a new client or staff member.
   * @param data - User creation DTO including DNI and email.
   */
  createUser: async (data: UserCreateDTO): Promise<UserResponseDTO> => {
    const response = await apiClient.post<UserResponseDTO>("/users", data);
    return response.data;
  },

  /**
   * Updates user metadata.
   * Note: DNI and Email are omitted in frontend forms to respect immutable PII rules.
   * @param id - User UUID.
   * @param data - Partial update DTO.
   */
  updateUser: async (id: string, data: UserUpdateDTO): Promise<UserResponseDTO> => {
    const response = await apiClient.patch<UserResponseDTO>(`/users/${id}`, data);
    return response.data;
  },
};
