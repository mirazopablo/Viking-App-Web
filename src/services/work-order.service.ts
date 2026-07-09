import { apiClient } from "@/lib/api-client";
import { WorkOrderResponseDTO, WorkOrderCreateDTO, WorkOrderStatusUpdateDTO } from "@/types/work-order";

/**
 * Work Order Service:
 * Handles repair order creation, retrieval, and status updates.
 */
export const workOrderService = {
  /**
   * Retrieves all work orders for workshop dashboard triage.
   * Can be filtered by status, clientId, clientDni, or search term.
   */
  getWorkOrders: async (params?: {
    status?: string;
    search?: string;
    clientId?: string;
    clientDni?: number | string;
  }): Promise<WorkOrderResponseDTO[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.search) queryParams.query = params.search;
    if (params?.clientDni !== undefined) {
      queryParams.query = params.search || "clientDni";
      queryParams.clientDni = String(params.clientDni);
    }

    const response = await apiClient.get<WorkOrderResponseDTO[]>("/api/work-order/search", {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
    let orders = response.data || [];

    if (params?.status && params.status !== "ALL") {
      orders = orders.filter((o) => o.repairStatus === params.status);
    }
    return orders;
  },

  /**
   * Retrieves work orders filtered by client DNI via /api/work-order/search?query=clientDni&clientDni={clientDni}.
   * @param clientDni - Client's DNI number or string.
   */
  getWorkOrdersByClientDni: async (clientDni: number | string): Promise<WorkOrderResponseDTO[]> => {
    const queryParams: Record<string, string> = {
      query: "clientDni",
      clientDni: String(clientDni),
    };
    const response = await apiClient.get<WorkOrderResponseDTO[]>("/api/work-order/search", { params: queryParams });
    return response.data || [];
  },

  /**
   * Retrieves a single work order by ID.
   * @param id - Work Order UUID.
   */
  getWorkOrderById: async (id: string): Promise<WorkOrderResponseDTO> => {
    const orders = await workOrderService.getWorkOrders();
    const order = orders.find((o) => o.id === id);
    if (!order) {
      throw new Error(`Work order with id ${id} not found.`);
    }
    return order;
  },

  /**
   * Creates a new work order.
   * Backend generates the unique securityCode (WOVIK-XXXXX) upon successful creation.
   * @param data - Creation DTO.
   */
  createWorkOrder: async (data: WorkOrderCreateDTO): Promise<WorkOrderResponseDTO> => {
    const response = await apiClient.post<WorkOrderResponseDTO>("/api/work-order/save", data);
    return response.data;
  },

  /**
   * Updates work order status or reassigns hardware/client via partial PATCH.
   * @param id - Work Order UUID.
   * @param data - Partial update DTO.
   */
  updateWorkOrder: async (id: string, data: WorkOrderStatusUpdateDTO): Promise<WorkOrderResponseDTO> => {
    const response = await apiClient.patch<WorkOrderResponseDTO>(`/api/work-order/update/${id}`, data);
    return response.data;
  },

  /**
   * Regenerates the WOVIK security tracking code for a work order.
   * @param id - Work Order UUID.
   */
  regenerateSecurityCode: async (id: string): Promise<WorkOrderResponseDTO> => {
    const response = await apiClient.patch<WorkOrderResponseDTO>(`/api/work-order/regenerate-code/${id}`);
    return response.data;
  },

  /**
   * Deletes a work order by UUID.
   * @param id - Work Order UUID.
   */
  deleteWorkOrder: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/work-order/delete/${id}`);
  },
};

