/**
 * Data models and TypeScript contracts for Internal Sales Notes (Notas de Venta).
 * These documents represent internal accounting receipts (Letter [ X ], non-fiscal)
 * used for workshop deliveries, counter sales, and internal cash register control.
 */

export type SaleNotePaymentMethod =
  | 'CASH'
  | 'TRANSFER'
  | 'MERCADOPAGO'
  | 'DEBIT_CARD'
  | 'CREDIT_CARD';

export type SaleNotePaymentStatus = 'PAID' | 'PENDING';

export type SaleNoteItemType = 'SPARE_PART' | 'LABOR' | 'SERVICE';

export interface SaleNoteItem {
  id?: number;
  sale_note_id?: number;
  description: string;
  item_type: SaleNoteItemType;
  quantity: number;
  unit_price: number;
  unit_cost: number;
}

export interface CreateSaleNoteRequest {
  work_order_id?: string;
  client_name: string;
  client_dni?: number;
  client_phone?: string;
  payment_method: SaleNotePaymentMethod;
  payment_status: SaleNotePaymentStatus;
  items: SaleNoteItem[];
  discount?: number;
  total_amount: number;
  notes?: string;
}

export interface SaleNoteResponse {
  id: number;
  number: string; // e.g. "NV-0001-00000015"
  budget_id?: string | null;
  work_order_id?: string | null;
  client_name: string;
  client_dni?: number | null;
  client_phone?: string | null;
  total_amount: number;
  cost_amount: number;
  net_profit: number;
  payment_method: SaleNotePaymentMethod;
  payment_status: SaleNotePaymentStatus;
  is_fiscal: boolean;
  invoice_id?: number | null;
  notes?: string | null;
  items?: SaleNoteItem[];
  created_at: string;
  updated_at?: string;
}

export interface ConvertBudgetToSaleNoteRequest {
  payment_method: SaleNotePaymentMethod;
  payment_status: SaleNotePaymentStatus;
  notes?: string;
}

export interface ConvertBudgetToSaleNoteResponse {
  message: string;
  sale_note: SaleNoteResponse;
}

export interface FiscalizeSaleNoteRequest {
  doc_tipo: number; // 99 (Consumidor Final), 96 (DNI), 80 (CUIT), 86 (CUIL)
  doc_nro: number; // 0 for Consumidor Final or raw numeric ID
  condicion_iva_receptor_id?: number; // RG 5616: 5 (Consumidor Final, default), 1 (RI), 6 (Monotributo), 4 (Exento)
  concepto: number; // 1 (Products), 2 (Services), 3 (Both)
  fch_serv_desde?: string; // YYYYMMDD
  fch_serv_hasta?: string; // YYYYMMDD
  fch_vto_pago?: string; // YYYYMMDD
}

export interface FiscalizeSaleNoteResponse {
  message: string;
  sale_note_id: number;
  is_fiscal: boolean;
  invoice: {
    id: number;
    punto_venta: number;
    tipo_cmp: number;
    numero_cmp: number;
    fecha_emision: string;
    doc_tipo: number;
    doc_nro: number;
    importe_total: number;
    cae: string;
    cae_vto: string;
    resultado: 'A' | 'R';
    status: 'APPROVED' | 'REJECTED';
  };
}

export interface SalesNotesListResponse {
  total: number;
  data: SaleNoteResponse[];
}

export interface SalesNotesFilterParams {
  limit?: number;
  offset?: number;
  payment_method?: SaleNotePaymentMethod;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}
