import { apiClient } from "@/lib/api-client";
import { WorkOrderPublicQueryRequestDTO, WorkOrderPublicStatusResponseDTO } from "@/types/work-order";

/**
 * Public Work Order Service:
 * Manages unauthenticated client lookups for work order status and diagnostic timelines.
 */
export const publicWorkOrderService = {
  /**
   * Fetches work order status and diagnostic history using Client DNI and Security Code.
   * Matches screen 121240 (Consulta de estado de reparación).
   * 
   * @param query - Request DTO containing clientDni (int32) and securityCode (e.g. WOVIK-XXXXX).
   * @returns Promise containing work order details and diagnostic timeline.
   */
  getStatusByDni: async (query: WorkOrderPublicQueryRequestDTO): Promise<WorkOrderPublicStatusResponseDTO> => {
    const response = await apiClient.post<WorkOrderPublicStatusResponseDTO>(
      "/public/work-order/status-by-dni",
      query
    );
    return response.data;
  },

  /**
   * Fetches work order status using order ID and security code directly.
   * @param id - Work Order UUID.
   * @param securityCode - WOVIK-XXXXX verification code.
   */
  getStatusById: async (id: string, securityCode: string): Promise<WorkOrderPublicStatusResponseDTO> => {
    const response = await apiClient.post<WorkOrderPublicStatusResponseDTO>(
      "/public/work-order/status",
      { id, securityCode }
    );
    return response.data;
  },
};
