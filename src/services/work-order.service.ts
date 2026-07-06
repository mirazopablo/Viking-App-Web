import { apiClient } from "@/lib/api-client";
import { WorkOrderResponseDTO, WorkOrderCreateDTO, WorkOrderStatusUpdateDTO } from "@/types/work-order";

/**
 * Work Order Service:
 * Handles repair order creation, retrieval, and status updates.
 */
export const workOrderService = {
  /**
   * Retrieves all work orders for workshop dashboard triage.
   * Can be filtered by status, clientId, or search term.
   */
  getWorkOrders: async (params?: { status?: string; search?: string; clientId?: string }): Promise<WorkOrderResponseDTO[]> => {
    const response = await apiClient.get<WorkOrderResponseDTO[]>("/work-orders", { params });
    return response.data;
  },

  /**
   * Retrieves a single work order by ID.
   * @param id - Work Order UUID.
   */
  getWorkOrderById: async (id: string): Promise<WorkOrderResponseDTO> => {
    const response = await apiClient.get<WorkOrderResponseDTO>(`/work-orders/${id}`);
    return response.data;
  },

  /**
   * Creates a new work order.
   * Backend generates the unique securityCode (WOVIK-XXXXX) upon successful creation.
   * @param data - Creation DTO.
   */
  createWorkOrder: async (data: WorkOrderCreateDTO): Promise<WorkOrderResponseDTO> => {
    const response = await apiClient.post<WorkOrderResponseDTO>("/work-orders", data);
    return response.data;
  },

  /**
   * Updates work order status or reassigns hardware/client via partial PATCH.
   * @param id - Work Order UUID.
   * @param data - Partial update DTO.
   */
  updateWorkOrder: async (id: string, data: WorkOrderStatusUpdateDTO): Promise<WorkOrderResponseDTO> => {
    const response = await apiClient.patch<WorkOrderResponseDTO>(`/work-orders/${id}`, data);
    return response.data;
  },
};
