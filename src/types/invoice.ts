/**
 * Data models and TypeScript contracts for Electronic Invoices (Facturas C - ARCA).
 * Regulated under AFIP / ARCA RG 1415, RG 4291/4892 (Official QR Code) and RG 5616 (VAT Receptor Condition).
 */

export type InvoiceConcept = 1 | 2 | 3; // 1 = Products, 2 = Services, 3 = Products & Services

export type InvoiceDocType =
  | 99 // Sin identificar / Consumidor Final
  | 96 // DNI
  | 80 // CUIT
  | 86; // CUIL

export type InvoiceVatCondition =
  | 5 // Consumidor Final (Default)
  | 1 // IVA Responsable Inscripto
  | 6 // Responsable Monotributo
  | 4; // IVA Sujeto Exento

export type InvoiceStatus = 'APPROVED' | 'REJECTED';
export type InvoiceResult = 'A' | 'R';

export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  description: string;
  item_type: 'SPARE_PART' | 'LABOR' | 'SERVICE';
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CreateInvoiceRequest {
  concepto: InvoiceConcept;
  doc_tipo: InvoiceDocType;
  doc_nro: number;
  condicion_iva_receptor_id?: InvoiceVatCondition;
  importe_total: number;
  fch_serv_desde?: string; // YYYYMMDD (Required if concepto 2 or 3)
  fch_serv_hasta?: string; // YYYYMMDD (Required if concepto 2 or 3)
  fch_vto_pago?: string; // YYYYMMDD (Required if concepto 2 or 3)
  items?: InvoiceItem[];
}

export interface ImportManualInvoiceRequest {
  punto_venta: number;
  tipo_cmp: number; // 11 for Factura C
  numero_cmp: number;
  fecha_emision: string; // YYYYMMDD
  concepto: InvoiceConcept;
  doc_tipo: InvoiceDocType;
  doc_nro: number;
  condicion_iva_receptor_id?: InvoiceVatCondition;
  importe_total: number;
  cae: string;
  cae_vto: string; // YYYYMMDD
  observaciones?: string;
  items?: InvoiceItem[];
}

export interface InvoiceResponse {
  id: number;
  user_id?: number;
  punto_venta: number;
  tipo_cmp: number;
  numero_cmp: number;
  fecha_emision: string; // YYYYMMDD
  concepto: InvoiceConcept;
  doc_tipo: InvoiceDocType;
  doc_nro: number;
  condicion_iva_receptor_id?: InvoiceVatCondition;
  importe_total: number;
  cae: string;
  cae_vto: string; // YYYYMMDD
  resultado: InvoiceResult;
  status: InvoiceStatus;
  observaciones?: string;
  items?: InvoiceItem[];
  created_at?: string;
  updated_at?: string;
}

export interface InvoicesListResponse {
  total: number;
  data: InvoiceResponse[];
}

export interface InvoicesFilterParams {
  limit?: number;
  offset?: number;
}

/**
 * Standard JSON payload encoded in Base64 for ARCA's official verification QR.
 * Formula: https://www.afip.gob.ar/fe/qr/?p=<JSON_BASE64>
 */
export interface AfipQrPayload {
  ver: number; // 1
  fecha: string; // YYYY-MM-DD
  cuit: number; // Emisor CUIT
  ptoVta: number;
  tipoCmp: number; // 11
  nroCmp: number;
  importe: number;
  moneda: 'PES';
  ctz: number; // 1
  tipoDocRec: number;
  nroDocRec: number;
  tipoCodAut: 'E'; // Electronic Authorization Code (CAE)
  codAut: number; // CAE as number
}
