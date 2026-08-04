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
    const response = await apiClient.get<BudgetResponseDTO>(`/api/budget/by-work-order/${workOrderId}`, {
      params: isPublic ? { public: true } : undefined,
    });
    return response.data;
  },

  /**
   * Updates budget workflow status ('DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED').
   * @param id - Budget UUID.
   * @param status - Target status string.
   */
  updateBudgetStatus: async (id: string, status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED'): Promise<void> => {
    await apiClient.patch(`/api/budget/update-status/${id}`, { status });
  },
};
