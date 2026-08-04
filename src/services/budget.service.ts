import { apiClient } from "@/lib/api-client";
import { BudgetResponseDTO } from "@/types/budget";
import { BudgetFormSchemaType } from "@/lib/validations/budget";

/**
 * Budget Service:
 * Interconnects with the Go REST API for budget persistence, status updates,
 * and JSON structured document retrieval.
 */
export const budgetService = {
  /**
   * Saves or updates a dynamic budget for a work order and automatically
   * triggers a BUDGET_SUMMARY diagnostic point entry on the Go backend.
   * @param data - Full form values DTO.
   */
  saveBudget: async (data: BudgetFormSchemaType & { status?: string }): Promise<BudgetResponseDTO> => {
    const payload = {
      ...data,
      status: data.status || 'SENT',
    };
    const response = await apiClient.post<BudgetResponseDTO>("/api/budget/save", payload);
    return response.data;
  },

  /**
   * Retrieves stored budget JSON document by work order UUID.
   * @param workOrderId - Work order UUID.
   * @param isPublic - Optional flag to sanitize internal profit metrics.
   */
  getBudgetByWorkOrder: async (workOrderId: string, isPublic = false): Promise<BudgetResponseDTO> => {
    const endpoint = isPublic
      ? `/public/work-order/budget/${workOrderId}`
      : `/api/budget/by-work-order/${workOrderId}`;

    console.log(`📡 [budgetService.getBudgetByWorkOrder] Fetching via endpoint: ${endpoint}, isPublic: ${isPublic}`);
    try {
      const response = await apiClient.get<BudgetResponseDTO>(endpoint);
      console.log('✅ [budgetService.getBudgetByWorkOrder] Response status:', response.status);
      console.log('📦 [budgetService.getBudgetByWorkOrder] Response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [budgetService.getBudgetByWorkOrder] Request failed:', {
        endpoint,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
      });
      throw error;
    }
  },

  /**
   * Updates budget workflow status ('DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED').
   * @param id - Budget UUID.
   * @param status - Target status string.
   */
  updateBudgetStatus: async (id: string, status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED'): Promise<void> => {
    await apiClient.patch(`/api/budget/update-status/${id}`, { status });
  },

  /**
   * Hard deletes a budget permanently from PostgreSQL database by budget UUID.
   * Endpoint: DELETE /api/budget/delete/:id
   * @param id - Budget UUID.
   */
  deleteBudget: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/budget/delete/${id}`);
  },
};
