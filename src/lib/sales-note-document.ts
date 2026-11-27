import { UnifiedCommercialDocumentProps } from "@/components/billing/unified-commercial-document";
import { getDocumentDisplayInfo } from "@/lib/document-utils";
import {
  SaleNotePaymentMethod,
  SaleNotePaymentStatus,
  SaleNoteResponse,
} from "@/types/sales-note";

export const SALE_NOTE_PAYMENT_METHOD_LABELS: Record<SaleNotePaymentMethod, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia Bancaria",
  MERCADOPAGO: "MercadoPago",
  DEBIT: "Tarjeta de Débito",
  CREDIT: "Tarjeta de Crédito",
};

export const SALE_NOTE_PAYMENT_STATUS_LABELS: Record<SaleNotePaymentStatus, string> = {
  PAID: "Pagado",
  PENDING: "Pendiente",
  PARTIAL: "Pago Parcial",
};

/**
 * Maps a SaleNoteResponse into UnifiedCommercialDocumentProps for A4 preview and PDF export.
 */
export function mapSaleNoteToCommercialDocument(
  sn: SaleNoteResponse
): UnifiedCommercialDocumentProps {
  const paymentLabel =
    SALE_NOTE_PAYMENT_METHOD_LABELS[sn.payment_method] || sn.payment_method;
  const statusLabel =
    SALE_NOTE_PAYMENT_STATUS_LABELS[sn.payment_status] || sn.payment_status;

  const items =
    sn.items && sn.items.length > 0
      ? sn.items.map((it) => ({
          id: it.id,
          description: it.description,
          itemType: it.item_type,
          quantity: it.quantity,
          unitPrice: it.unit_price,
          totalPrice:
            it.total_price !== undefined
              ? it.total_price
              : (it.quantity || 1) * (it.unit_price || 0),
        }))
      : [
          {
            description: "Venta / Mano de Obra",
            quantity: 1,
            unitPrice: sn.total_amount,
            totalPrice: sn.total_amount,
          },
        ];

  const computedSubtotal =
    sn.subtotal !== undefined
      ? sn.subtotal
      : items.reduce((sum, it) => sum + (it.totalPrice || 0), 0);

  const docInfo = getDocumentDisplayInfo(sn.client_dni);

  return {
    documentType: "SALE_NOTE",
    documentNumber: sn.number,
    issueDate: new Date(sn.created_at).toLocaleDateString("es-AR"),
    client: {
      name: sn.client_name || "Consumidor Final",
      docType: sn.client_dni && sn.client_dni !== 0 ? docInfo.label : "Sin Identificar",
      docNumber: sn.client_dni && sn.client_dni !== 0 ? docInfo.formatted : 0,
      phone: sn.client_phone || undefined,
      paymentCondition: `${paymentLabel} (${statusLabel})`,
    },
    items,
    totals: {
      subtotal: computedSubtotal,
      discount: sn.discount || 0,
      totalAmount: sn.total_amount,
    },
    notes: sn.notes || undefined,
    termsAndConditions:
      "Garantía del servicio: 90 días sobre mano de obra. Conserve este comprobante para cualquier reclamo.",
  };
}

