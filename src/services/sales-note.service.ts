import { apiClient } from "@/lib/api-client";
import {
  CreateSaleNoteRequest,
  SaleNoteResponse,
  ConvertBudgetToSaleNoteRequest,
  ConvertBudgetToSaleNoteResponse,
  FiscalizeSaleNoteRequest,
  FiscalizeSaleNoteResponse,
  SalesNotesListResponse,
  SalesNotesFilterParams,
} from "@/types/sales-note";

/**
 * Sales Note Service:
 * Manages internal workshop sales notes (Letter [ X ]), budget-to-sale conversions,
 * and direct fiscalization triggers into ARCA Facturas C.
 */
export const salesNoteService = {
  /**
   * Creates a direct sales note without a prior budget (e.g., direct over-the-counter sale).
   * @param data - Direct sales note payload.
   */
  createDirectSaleNote: async (data: CreateSaleNoteRequest): Promise<SaleNoteResponse> => {
    const response = await apiClient.post<SaleNoteResponse>("/api/v1/sales-notes", data);
    return response.data;
  },

  /**
   * Converts an approved budget into an internal sales note automatically.
   * Marks the budget as CONVERTED and records cash flow.
   * @param budgetId - Budget UUID.
   * @param data - Payment and conversion metadata.
   */
  convertBudgetToSaleNote: async (
    budgetId: string,
    data: ConvertBudgetToSaleNoteRequest
  ): Promise<ConvertBudgetToSaleNoteResponse> => {
    const response = await apiClient.post<ConvertBudgetToSaleNoteResponse>(
      `/api/budget/${budgetId}/convert-to-sale-note`,
      data
    );
    return response.data;
  },

  /**
   * Retrieves a paginated list of internal sales notes with optional filters.
   * @param params - Pagination and filtering parameters.
   */
  getSalesNotes: async (params?: SalesNotesFilterParams): Promise<SalesNotesListResponse> => {
    const response = await apiClient.get<SalesNotesListResponse>("/api/v1/sales-notes", {
      params,
    });
    return response.data;
  },

  /**
   * Retrieves a single sales note by its primary ID.
   * @param id - Sales note ID.
   */
  getSaleNoteById: async (id: number | string): Promise<SaleNoteResponse> => {
    const response = await apiClient.get<SaleNoteResponse>(`/api/v1/sales-notes/${id}`);
    return response.data;
  },

  /**
   * Fiscalizes an existing internal sales note by requesting CAE from ARCA.
   * Converts internal document into a legal Factura C.
   * @param id - Sales note ID.
   * @param data - Fiscal receptor and service date parameters.
   */
  fiscalizeSaleNote: async (
    id: number | string,
    data: FiscalizeSaleNoteRequest
  ): Promise<FiscalizeSaleNoteResponse> => {
    const response = await apiClient.post<FiscalizeSaleNoteResponse>(
      `/api/v1/sales-notes/${id}/fiscalize`,
      data
    );
    return response.data;
  },
};
