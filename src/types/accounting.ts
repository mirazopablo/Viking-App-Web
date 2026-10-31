/**
 * Data models and TypeScript contracts for the Unified Accounting Dashboard.
 * Merges real workshop cash flow metrics against fiscal Monotributo category thresholds.
 */

export interface AccountingPeriod {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

export interface CashFlowMetrics {
  gross_income: number;
  spare_parts_cost: number;
  net_profit: number;
  profit_margin_percentage: number;
}

export interface FiscalVsInternalMetrics {
  fiscal_invoiced_total: number;
  internal_sales_notes_total: number;
  fiscal_percentage: number;
}

export interface MonotributoControlMetrics {
  current_category: string; // e.g. "A", "B", etc.
  category_annual_limit: number;
  accumulated_last_12_months: number;
  remaining_before_next_category: number;
  usage_percentage: number;
}

export interface AccountingDashboardResponse {
  period: AccountingPeriod;
  cash_flow: CashFlowMetrics;
  fiscal_vs_internal: FiscalVsInternalMetrics;
  monotributo_control: MonotributoControlMetrics;
  by_payment_method: Record<string, number>;
}

export interface AccountingDashboardQueryParams {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}
