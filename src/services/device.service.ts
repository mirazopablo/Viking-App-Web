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
    const params: Record<string, string> = {};
    if (userId) params.userId = userId;
    if (search) params.search = search;
    
    const response = await apiClient.get<DeviceResponseDTO[]>("/devices", { params });
    return response.data;
  },

  /**
   * Retrieves specific device details by UUID.
   * @param id - Device UUID.
   */
  getDeviceById: async (id: string): Promise<DeviceResponseDTO> => {
    const response = await apiClient.get<DeviceResponseDTO>(`/devices/${id}`);
    return response.data;
  },

  /**
   * Registers a new device linked to a user.
   * @param data - Device creation DTO.
   */
  createDevice: async (data: DeviceCreateDTO): Promise<DeviceResponseDTO> => {
    const response = await apiClient.post<DeviceResponseDTO>("/devices", data);
    return response.data;
  },

  /**
   * Updates device metadata (brand, model).
   * Note: Serial Number is readOnly in standard update flows.
   * @param id - Device UUID.
   * @param data - Partial update DTO.
   */
  updateDevice: async (id: string, data: DeviceUpdateDTO): Promise<DeviceResponseDTO> => {
    const response = await apiClient.patch<DeviceResponseDTO>(`/devices/${id}`, data);
    return response.data;
  },
};
