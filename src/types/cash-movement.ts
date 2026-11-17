import type { SaleNotePaymentMethod } from './sales-note';

/**
 * Data models and TypeScript contracts for the Cash Ledger (cash_movements).
 * Tracks real-time cash and digital inflows/outflows across budgets, sales notes, and manual expenses.
 */

export type CashMovementType = 'INCOME' | 'EXPENSE';

export type CashMovementCategory =
  | 'BUDGET_ADVANCE'
  | 'SALE_NOTE_PAYMENT'
  | 'INVOICE_PAYMENT'
  | 'SPARE_PART_PURCHASE'
  | 'OPERATING_EXPENSE'
  | 'REFUND';

export type CashMovementReferenceType =
  | 'BUDGET'
  | 'SALE_NOTE'
  | 'INVOICE'
  | 'WORK_ORDER'
  | 'MANUAL';

export interface CashMovement {
  id: number;
  type: CashMovementType;
  category: CashMovementCategory;
  payment_method: SaleNotePaymentMethod;
  amount: number;
  description: string;
  reference_type?: CashMovementReferenceType | null;
  reference_id?: string | null;
  external_payment_key?: string | null;
  work_order_id?: string | null;
  created_by_staff_id?: string | null;
  created_at: string;
}

export interface CreateCashMovementRequest {
  type: CashMovementType;
  category: CashMovementCategory;
  payment_method: SaleNotePaymentMethod;
  amount: number;
  description: string;
  reference_type?: CashMovementReferenceType;
  reference_id?: string;
  work_order_id?: string;
}

export interface CashMovementsFilterParams {
  from?: string;
  to?: string;
  type?: CashMovementType;
  category?: CashMovementCategory;
  payment_method?: SaleNotePaymentMethod;
  work_order_id?: string;
  limit?: number;
  offset?: number;
}

export interface CashMovementsListResponse {
  data: CashMovement[];
  total: number;
  limit: number;
  offset: number;
}

export interface PaymentMethodSummary {
  income: number;
  expense: number;
  net: number;
}

export interface CashMovementSummaryResponse {
  total_income: number;
  total_expense: number;
  net_total: number;
  by_payment_method: Record<SaleNotePaymentMethod, PaymentMethodSummary>;
}

