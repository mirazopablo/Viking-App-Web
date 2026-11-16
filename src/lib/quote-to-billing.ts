import { QuickQuoteFormSchemaType } from "@/lib/validations/quick-quote";
import { InvoiceConcept, InvoiceDocType, InvoiceItem } from "@/types/invoice";
import { SaleNoteItem } from "@/types/sales-note";

const BILLING_PREFILL_STORAGE_KEY = "viking_billing_prefill_draft";

export interface BillingPrefillFromQuote {
  sourceTitle: string;
  clientName: string;
  clientDni: string;
  clientAddress: string;
  clientPhone: string;
  notes: string;
  discount: number;
  invoiceConcept: InvoiceConcept;
  docTipo: InvoiceDocType;
  docNro: string;
  invoiceItems: InvoiceItem[];
  saleNoteItems: SaleNoteItem[];
}

function sanitizeDigits(value: string | number | undefined): string {
  if (value === undefined || value === null) return "";
  return String(value).replace(/\D/g, "");
}

/**
 * Maps a Quick Quote form payload into prefilled data structures for both
 * ARCA Invoice C (/billing/new) and Internal Sale Note X (/billing/sales-notes/new).
 */
export function buildBillingPrefillFromQuote(
  quote: QuickQuoteFormSchemaType
): BillingPrefillFromQuote {
  const rawDni = sanitizeDigits(quote.clientDni);
  let docTipo: InvoiceDocType = 96; // Default to DNI so staff is prompted to verify/enter it for Factura C
  let docNro = rawDni;

  if (rawDni.length === 11) {
    docTipo = 80; // CUIT
  } else if (rawDni.length >= 7 && rawDni.length <= 8) {
    docTipo = 96; // DNI
  } else if (!rawDni) {
    docTipo = 96;
    docNro = "";
  }

  const invoiceItems: InvoiceItem[] = [];
  const saleNoteItems: SaleNoteItem[] = [];
  let totalDiscount = 0;
  let hasProducts = false;
  let hasServices = false;

  (quote.items || []).forEach((item) => {
    if (item.rowType === "SUBTOTAL_GROUP") return;

    if (item.rowType === "BONIFICATION") {
      if (!item.isFree && (item.discountAmount || 0) > 0) {
        totalDiscount += Number(item.discountAmount) || 0;
      }
      return;
    }

    const qty = Math.max(1, Number(item.quantity) || 1);
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    const unitCost =
      item.rowType === "SPARE_PART_ITEM" ? Math.max(0, Number(item.costPrice) || 0) : 0;

    hasProducts = true;

    invoiceItems.push({
      description: item.description?.trim() || "Repuesto / Producto",
      item_type: "SPARE_PART",
      quantity: qty,
      unit_price: unitPrice,
      total_price: qty * unitPrice,
    });

    saleNoteItems.push({
      description: item.description?.trim() || "Repuesto / Producto",
      item_type: item.rowType === "SPARE_PART_ITEM" ? "SPARE_PART" : "ACCESSORY",
      quantity: qty,
      unit_price: unitPrice,
      unit_cost: unitCost,
    });
  });

  (quote.labors || []).forEach((labor) => {
    const amount = Math.max(0, Number(labor.amount) || 0);
    if (!labor.description?.trim() && amount === 0) return;

    hasServices = true;

    invoiceItems.push({
      description: labor.description?.trim() || "Mano de Obra Técnica",
      item_type: "SERVICE",
      quantity: 1,
      unit_price: amount,
      total_price: amount,
    });

    saleNoteItems.push({
      description: labor.description?.trim() || "Mano de Obra Técnica",
      item_type: "SERVICE",
      quantity: 1,
      unit_price: amount,
      unit_cost: 0,
    });
  });

  if (invoiceItems.length === 0) {
    hasServices = true;
    invoiceItems.push({
      description: quote.title?.trim() || "Servicio Técnico y Reparación",
      item_type: "SERVICE",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    });
  }

  if (saleNoteItems.length === 0) {
    saleNoteItems.push({
      description: quote.title?.trim() || "Servicio Técnico y Reparación",
      item_type: "SERVICE",
      quantity: 1,
      unit_price: 0,
      unit_cost: 0,
    });
  }

  const invoiceConcept: InvoiceConcept =
    hasProducts && hasServices ? 3 : hasProducts ? 1 : 2;

  return {
    sourceTitle: quote.title?.trim() || "Presupuesto",
    clientName: quote.clientName?.trim() || "",
    clientDni: rawDni,
    clientAddress: quote.clientAddress?.trim() || "",
    clientPhone: quote.clientPhoneNumber?.trim() || "",
    notes: quote.notes?.trim() || "",
    discount: totalDiscount,
    invoiceConcept,
    docTipo,
    docNro,
    invoiceItems,
    saleNoteItems,
  };
}

export function saveBillingPrefillFromQuote(quote: QuickQuoteFormSchemaType): void {
  if (typeof window === "undefined") return;
  const payload = buildBillingPrefillFromQuote(quote);
  sessionStorage.setItem(BILLING_PREFILL_STORAGE_KEY, JSON.stringify(payload));
}

export function consumeBillingPrefill(): BillingPrefillFromQuote | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(BILLING_PREFILL_STORAGE_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(BILLING_PREFILL_STORAGE_KEY);
  try {
    return JSON.parse(raw) as BillingPrefillFromQuote;
  } catch {
    return null;
  }
}

