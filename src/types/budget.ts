/**
 * Data models and TypeScript contracts for the Dynamic Budget Creator & Simulator.
 * Supports Maintenance/Repair & New Equipment modes, dynamic content blocks,
 * and flexible table row types (regular, bonification, group subtotal, hidden unit price, spare part with margin).
 */

export type BudgetMode = 'MAINTENANCE' | 'NEW_EQUIPMENT';

export type ContentBlockType = 'TEXT_PARAGRAPH' | 'BULLET_LIST' | 'WARNING_NOTE';

export type WarningSeverity = 'info' | 'warning' | 'important';

export type TableRowType =
  | 'REGULAR_ITEM'
  | 'BONIFICATION'
  | 'SUBTOTAL_GROUP'
  | 'HIDDEN_UNIT_PRICE_ITEM'
  | 'SPARE_PART_ITEM';

export interface DynamicContentBlock {
  id: string;
  type: ContentBlockType;
  title?: string;
  content?: string; // For TEXT_PARAGRAPH and WARNING_NOTE
  items?: string[]; // For BULLET_LIST
  severity?: WarningSeverity; // For WARNING_NOTE
}

export interface BudgetTableRow {
  id: string;
  rowType: TableRowType;
  description: string;
  quantity: number;
  unitPrice: number; // Final customer unit price
  costPrice?: number; // Internal cost price (for SPARE_PART_ITEM)
  profitMarginPercentage?: number; // Profit margin % (for SPARE_PART_ITEM)
  profitAmount?: number; // Total net profit amount (for SPARE_PART_ITEM)
  discountAmount?: number;
  isPercentageDiscount?: boolean;
  isFree?: boolean; // For $0 / BONIFICADO badge
  vendorGroup?: string; // e.g. "Vendor A", "Store B", "Imported"
  groupTitle?: string; // For SUBTOTAL_GROUP headers
  showUnitPrice?: boolean; // Toggle unit price visibility for HIDDEN_UNIT_PRICE_ITEM
  lineTotal?: number;
}

export interface BudgetLaborCost {
  description: string;
  amount: number;
}

export interface BudgetTotals {
  itemsSubtotal: number;
  hiddenPriceSubtotal: number;
  totalDiscounts: number;
  laborTotal: number;
  taxAmount: number;
  taxPercentage: number;
  grandTotal: number;
  totalSparePartsCost: number;
  totalSparePartsProfit: number;
  totalEstimatedProfit: number; // Labor total + Spare parts profit
}

export interface BudgetFormValues {
  workOrderId: string;
  title: string;
  mode: BudgetMode;
  clientName: string;
  clientDni?: number | string;
  clientAddress?: string;
  clientPhoneNumber?: string;
  clientEmail?: string;
  deviceModel: string;
  deviceSerialNumber?: string;
  blocks: DynamicContentBlock[];
  items: BudgetTableRow[];
  labors: BudgetLaborCost[];
  taxPercentage: number;
  notes?: string;
  termsAndConditions?: string;
  currency: string;
}

export interface BudgetResponseDTO extends BudgetFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
  totals: BudgetTotals;
}

export interface BudgetCreateDTO extends Omit<BudgetFormValues, 'workOrderId'> {
  workOrderId: string;
}
