import { apiClient } from "@/lib/api-client";
import {
  AccountingDashboardResponse,
  AccountingDashboardQueryParams,
} from "@/types/accounting";

/**
 * Accounting Service:
 * Retrieves financial insights, real workshop cash flow, and Monotributo category tracking
 * from the Go backend.
 */
export const accountingService = {
  /**
   * Fetches unified accounting dashboard metrics for a given date range.
   * @param params - Optional date range { from: "YYYY-MM-DD", to: "YYYY-MM-DD" }.
   */
  getDashboardMetrics: async (
    params?: AccountingDashboardQueryParams
  ): Promise<AccountingDashboardResponse> => {
    const response = await apiClient.get<AccountingDashboardResponse>(
      "/api/v1/accounting/dashboard",
      { params }
    );
    return response.data;
  },
};
