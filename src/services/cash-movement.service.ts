import { apiClient } from "@/lib/api-client";
import type {
  CashMovement,
  CreateCashMovementRequest,
  CashMovementsFilterParams,
  CashMovementsListResponse,
  CashMovementSummaryResponse,
} from "@/types/cash-movement";

/**
 * Cash Movement Service:
 * Interacts with the Go REST API Cash Ledger (/api/cash-movements) for
 * listing movements, registering manual inflows/outflows, and daily cash drawer summaries.
 */
export const cashMovementService = {
  /**
   * Retrieves a paginated and filtered list of cash movements.
   * @param params - Date range, type, category, payment method, and pagination filters.
   */
  getCashMovements: async (
    params?: CashMovementsFilterParams
  ): Promise<CashMovementsListResponse> => {
    const response = await apiClient.get<CashMovementsListResponse>(
      "/api/cash-movements",
      { params }
    );
    return response.data;
  },

  /**
   * Registers a manual cash movement (e.g., spare part purchase, operating expense, or advance refund).
   * @param data - Cash movement payload with positive amount.
   */
  createCashMovement: async (
    data: CreateCashMovementRequest
  ): Promise<CashMovement> => {
    const response = await apiClient.post<CashMovement>(
      "/api/cash-movements",
      data
    );
    return response.data;
  },

  /**
   * Retrieves cash drawer summary totals grouped by payment method for a date range.
   * @param params - Optional from/to date filters (YYYY-MM-DD or RFC3339).
   */
  getCashSummary: async (params?: {
    from?: string;
    to?: string;
  }): Promise<CashMovementSummaryResponse> => {
    const response = await apiClient.get<CashMovementSummaryResponse>(
      "/api/cash-movements/summary",
      { params }
    );
    return response.data;
  },
};

