import { apiClient } from "@/lib/api-client";
import {
  CreateInvoiceRequest,
  ImportManualInvoiceRequest,
  InvoiceResponse,
  InvoicesListResponse,
  InvoicesFilterParams,
  AfipQrPayload,
} from "@/types/invoice";

/**
 * Default workshop tax ID (CUIT) for Pablo Gabriel Mirazo.
 */
export const DEFAULT_EMISOR_CUIT = 20417952412;

/**
 * Invoice Service:
 * Interfaces with ARCA WSFEv1 electronic billing endpoints on the Go backend,
 * supports manual invoice imports, and generates normative AFIP QR verification links.
 */
export const invoiceService = {
  /**
   * Emits a new Factura C directly to ARCA, persists the CAE, and stores line items.
   * @param data - Invoice creation request payload.
   */
  createInvoice: async (data: CreateInvoiceRequest): Promise<InvoiceResponse> => {
    const response = await apiClient.post<InvoiceResponse>("/api/v1/invoices", data);
    return response.data;
  },

  /**
   * Imports an external invoice issued manually via ARCA web portal (RCEL / Facturador).
   * Persists CAE and items locally for unified accounting.
   * @param data - Manual invoice import request payload.
   */
  importManualInvoice: async (data: ImportManualInvoiceRequest): Promise<InvoiceResponse> => {
    const response = await apiClient.post<InvoiceResponse>("/api/v1/invoices/import-manual", data);
    return response.data;
  },

  /**
   * Retrieves a paginated list of electronic invoices emitted by the system.
   * @param params - Pagination parameters (limit, offset).
   */
  getInvoices: async (params?: InvoicesFilterParams): Promise<InvoicesListResponse> => {
    const response = await apiClient.get<InvoicesListResponse>("/api/v1/invoices", {
      params,
    });
    return response.data;
  },

  /**
   * Retrieves full invoice details and line items by ID for receipt/PDF rendering.
   * @param id - Invoice primary ID.
   */
  getInvoiceById: async (id: number | string): Promise<InvoiceResponse> => {
    const response = await apiClient.get<InvoiceResponse>(`/api/v1/invoices/${id}`);
    return response.data;
  },

  /**
   * Constructs the official AFIP / ARCA verification QR URL per RG 4291 / 4892.
   * Encodes standard JSON metadata into Base64 for the public verification portal.
   * Formula: https://www.afip.gob.ar/fe/qr/?p=<JSON_BASE64>
   *
   * @param invoice - Approved invoice with CAE.
   * @param emisorCuit - CUIT of the taxpayer (defaults to Pablo Gabriel Mirazo: 20417952412).
   */
  generateAfipQrUrl: (invoice: InvoiceResponse, emisorCuit = DEFAULT_EMISOR_CUIT): string => {
    // 1. Format date from YYYYMMDD to YYYY-MM-DD
    let formattedDate = invoice.fecha_emision;
    if (invoice.fecha_emision && invoice.fecha_emision.length === 8) {
      const y = invoice.fecha_emision.substring(0, 4);
      const m = invoice.fecha_emision.substring(4, 6);
      const d = invoice.fecha_emision.substring(6, 8);
      formattedDate = `${y}-${m}-${d}`;
    }

    // 2. Build normative payload
    const qrData: AfipQrPayload = {
      ver: 1,
      fecha: formattedDate,
      cuit: emisorCuit,
      ptoVta: invoice.punto_venta,
      tipoCmp: invoice.tipo_cmp || 11,
      nroCmp: invoice.numero_cmp,
      importe: invoice.importe_total,
      moneda: "PES",
      ctz: 1,
      tipoDocRec: invoice.doc_tipo,
      nroDocRec: invoice.doc_nro,
      tipoCodAut: "E",
      codAut: Number(invoice.cae) || 0,
    };

    // 3. Serialize and encode to Base64 (browser & isomorphic safe)
    const jsonString = JSON.stringify(qrData);
    let base64Data = "";
    if (typeof window !== "undefined" && typeof window.btoa === "function") {
      base64Data = window.btoa(jsonString);
    } else {
      base64Data = Buffer.from(jsonString).toString("base64");
    }

    // 4. Return official ARCA validation URL
    return `https://www.afip.gob.ar/fe/qr/?p=${base64Data}`;
  },
};
