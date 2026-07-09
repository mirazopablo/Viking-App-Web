import { apiClient } from "@/lib/api-client";
import { DeviceResponseDTO, DeviceCreateDTO, DeviceUpdateDTO } from "@/types/device";

/**
 * Device Inventory Service:
 * Handles hardware registration and lookups linked to client owners.
 */
export const deviceService = {
  /**
   * Retrieves devices, optionally filtered by owner UUID or serial number.
   * @param userId - Optional Client UUID to get only their registered devices.
   * @param search - Optional hardware search string (brand, model, serial).
   */
  getDevices: async (userId?: string, search?: string): Promise<DeviceResponseDTO[]> => {
    const queryParams: Record<string, string> = {};
    if (search) queryParams.query = search;

    const response = await apiClient.get<DeviceResponseDTO[]>("/api/device/search", {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
    let devices = response.data || [];
    if (userId) {
      devices = devices.filter((d) => d.userId === userId);
    }
    return devices;
  },

  /**
   * Retrieves devices filtered by the client's DNI via /api/device/search?query=userDni&userDni={userDni}.
   * @param userDni - Client's DNI number or string.
   * @param search - Optional hardware search string (brand, model, serial).
   */
  getDevicesByUserDni: async (userDni: number | string, search?: string): Promise<DeviceResponseDTO[]> => {
    const queryParams: Record<string, string> = {
      query: search ? search : "userDni",
      userDni: String(userDni),
    };

    const response = await apiClient.get<DeviceResponseDTO[]>("/api/device/search", { params: queryParams });
    return response.data || [];
  },

  /**
   * Retrieves specific device details by UUID.
   * @param id - Device UUID.
   */
  getDeviceById: async (id: string): Promise<DeviceResponseDTO> => {
    const response = await apiClient.get<any>("/api/device/search", { params: { id } });
    const data = response.data;
    const device = Array.isArray(data) ? data[0] : data;
    if (!device) {
      throw new Error(`Device with id ${id} not found.`);
    }
    return device;
  },

  /**
   * Registers a new device linked to a user.
   * Ensures 'type' and 'userID' keys are included to satisfy backend Go validation.
   * @param data - Device creation DTO.
   */
  createDevice: async (data: DeviceCreateDTO): Promise<DeviceResponseDTO> => {
    const payload = {
      ...data,
      type: data.type || "SMARTPHONE",
      userId: data.userId,
      userID: data.userId || data.userID,
    };
    const response = await apiClient.post<DeviceResponseDTO>("/api/device/save", payload);
    return response.data;
  },

  /**
   * Updates device metadata (brand, model).
   * Note: Serial Number is readOnly in standard update flows.
   * @param id - Device UUID.
   * @param data - Partial update DTO.
   */
  updateDevice: async (id: string, data: DeviceUpdateDTO): Promise<DeviceResponseDTO> => {
    const response = await apiClient.patch<DeviceResponseDTO>(`/api/device/update/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a device by UUID.
   * @param id - Device UUID.
   */
  deleteDevice: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/device/delete/${id}`);
  },
};

