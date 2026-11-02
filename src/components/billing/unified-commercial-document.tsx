"use client";

import React from "react";
import Image from "next/image";
import { Printer, ExternalLink, AlertCircle } from "lucide-react";
import logoImg from "@/components/images/LOGO.png";
import { AfipQrCode } from "@/components/common/afip-qr-code";
import { InvoiceResponse } from "@/types/invoice";
import { SaleNoteResponse, SaleNoteItem } from "@/types/sales-note";

export type CommercialDocumentType = "BUDGET" | "SALE_NOTE" | "INVOICE_C";
export type CommercialCopyType = "ORIGINAL" | "DUPLICADO" | "TRIPLICADO";

export interface UnifiedCommercialDocumentItem {
  id?: string | number;
  code?: string;
  description: string;
  itemType?: "SPARE_PART" | "LABOR" | "SERVICE";
  unitOfMeasure?: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  totalPrice?: number;
  isDiscount?: boolean;
}

export interface UnifiedCommercialDocumentProps {
  /**
   * Mode to render according to AFIP RG 1415:
   * 'BUDGET' -> Letter [ X ], "DOC. NO VÁLIDO COMO FACTURA"
   * 'SALE_NOTE' -> Letter [ X ], "DOC. NO VÁLIDO COMO FACTURA"
   * 'INVOICE_C' -> Letter [ C ], "COD. 011", CAE and official ARCA QR code
   */
  documentType: CommercialDocumentType;
  /**
   * Copy designation per ARCA RG 1415:
   * 'ORIGINAL' (Client copy)
   * 'DUPLICADO' (Issuer copy)
   * 'TRIPLICADO' (Administrative/Audit copy)
   */
  copyType?: CommercialCopyType;
  /**
   * Document identification code / serial.
   * Example: "PR-0001-00000001", "NV-0001-00000015", or formatted from Invoice.
   */
  documentNumber?: string;
  /**
   * Primary title or work order subtitle.
   */
  title?: string;
  /**
   * Issue date formatted as string (e.g., "30/10/2026" or "2026-10-30").
   */
  issueDate?: string;
  /**
   * Client / Customer information.
   */
  client: {
    name: string;
    docType?: string | number; // DNI, CUIT, Consumidor Final
    docNumber?: string | number;
    vatCondition?: string; // Consumidor Final, Resp. Inscripto, etc.
    paymentCondition?: string; // Contado, Transferencia, etc.
    phone?: string;
    address?: string;
    workOrderNumber?: string;
    deviceModel?: string;
  };
  /**
   * List of line items (services, parts, labor).
   */
  items: UnifiedCommercialDocumentItem[];
  /**
   * Financial totals.
   */
  totals: {
    subtotal: number;
    discount?: number;
    totalAmount: number;
    currency?: string;
  };
  /**
   * Fiscal attributes for INVOICE_C (ARCA).
   */
  fiscalData?: {
    pointOfSale?: number;
    invoiceNumber?: number;
    cae?: string;
    caeVto?: string;
    serviceFrom?: string;
    serviceTo?: string;
    paymentDueDate?: string;
    rawInvoice?: InvoiceResponse;
  };
  /**
   * Additional observations or warranty terms.
   */
  notes?: string;
  termsAndConditions?: string;
  /**
   * Staff member responsible for emitting document.
   */
  staffName?: string;
  /**
   * Whether to render interactive action buttons (Print, Copy QR URL).
   */
  showActions?: boolean;
}

/**
 * Static Emisor Tax & Commercial Profile (Pablo Gabriel Mirazo - Responsable Monotributo)
 * Synchronized with official ARCA / RCEL fiscal registration.
 */
export const EMISOR_PROFILE = {
  fullName: "MIRAZO PABLO GABRIEL",
  tradeName: "EL VIKINGO STORE",
  cuit: "20417952412",
  grossIncome: "20417952412",
  vatCondition: "Responsable Monotributo",
  commercialAddress: "Alemania 1896 - San Rafael, Mendoza",
  activityStart: "05/10/2026",
  phone: "2604845489",
  email: "elvikingosr@gmail.com",
};

/**
 * Formats a number with leading zeroes.
 */
function padZero(num: number | string | undefined, length: number): string {
  if (num === undefined || num === null) return "".padStart(length, "0");
  return String(num).padStart(length, "0");
}

/**
 * Formats YYYYMMDD to DD/MM/YYYY.
 */
function formatAfipDate(dateStr?: string): string {
  if (!dateStr) return "";
  if (dateStr.length === 8) {
    return `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}/${dateStr.substring(0, 4)}`;
  }
  return dateStr;
}

/**
 * Formats numerical monetary amounts into legal Argentine locale representation:
 * Dot (.) for thousands separator, comma (,) for 2 decimal places (e.g. 15.000,00).
 */
function formatArgentineCurrency(amount: number | undefined | null): string {
  const safeAmount = Number(amount) || 0;
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

/**
 * Helper to generate a standardized, human-readable PDF filename:
 * Format: <Tipo>_<PtoVenta-NroCmp>_<Fecha>_<DocCliente>[_Copia].pdf
 * Example: Factura_00001-00000003_31-10-2026_CF.pdf
 */
export function generateCommercialDocumentFilename(
  props: UnifiedCommercialDocumentProps,
  copy?: CommercialCopyType
): string {
  const typePrefix =
    props.documentType === "INVOICE_C"
      ? "Factura"
      : props.documentType === "SALE_NOTE"
        ? "NotaVenta"
        : "Presupuesto";

  let serialStr = "00001-00000001";
  if (props.documentType === "INVOICE_C" && props.fiscalData) {
    const pto = padZero(props.fiscalData.pointOfSale || 1, 5);
    const num = padZero(props.fiscalData.invoiceNumber || 1, 8);
    serialStr = `${pto}-${num}`;
  } else if (props.documentNumber) {
    serialStr = props.documentNumber
      .replace(/^Comp\.\s*Nro:\s*/i, "")
      .replace(/[^a-zA-Z0-9-]/g, "_");
  }

  const cleanDate = (props.issueDate || new Date().toLocaleDateString("es-AR"))
    .replace(/\//g, "-")
    .replace(/\s+/g, "");

  const clientDoc =
    props.client?.docNumber && String(props.client.docNumber) !== "0"
      ? String(props.client.docNumber)
      : "CF";

  const copyPart = copy ? `_${copy}` : "";
  return `${typePrefix}_${serialStr}_${cleanDate}_${clientDoc}${copyPart}`;
}

/**
 * UnifiedCommercialDocument Component:
 * The single master receipt component adhering strictly to Argentine Tax Authority (ARCA)
 * General Resolution 1415/03. Dynamically adapts between Internal Quotes, Workshop Sales Notes,
 * and Official Facturas C with legal CAE and QR validation.
 */
export const UnifiedCommercialDocument: React.FC<UnifiedCommercialDocumentProps> = ({
  documentType,
  copyType = "ORIGINAL",
  documentNumber,
  title,
  issueDate,
  client,
  items,
  totals,
  fiscalData,
  notes,
  termsAndConditions,
  staffName = "Pablo Mirazo",
  showActions = true,
}) => {
  const isFiscal = documentType === "INVOICE_C";
  const currency = totals.currency || "$";

  // Compute visual header letter and subtitle
  const headerLetter = isFiscal ? "C" : "X";
  const letterCode = isFiscal ? "COD. 011" : "DOC. NO VÁLIDO COMO FACTURA";
  const documentTypeLabel =
    documentType === "INVOICE_C"
      ? "FACTURA"
      : documentType === "SALE_NOTE"
        ? "NOTA DE VENTA"
        : "PRESUPUESTO";

  // Formatted invoice serial per AFIP / Tiendanube RG 1415 standard: "Comp. Nro: 00001-00000003"
  const formattedSerial = isFiscal
    ? `Comp. Nro: ${padZero(fiscalData?.pointOfSale || 1, 5)}-${padZero(
      fiscalData?.invoiceNumber || 1,
      8
    )}`
    : documentNumber?.startsWith("Comp.") || documentNumber?.startsWith("NV") || documentNumber?.startsWith("PR")
      ? documentNumber
      : `Comp. Nro: ${documentNumber || "00001-00000001"}`;

  const displayIssueDate = issueDate || new Date().toLocaleDateString("es-AR");

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      const originalTitle = document.title;
      const cleanFileName = generateCommercialDocumentFilename(
        {
          documentType,
          documentNumber,
          issueDate: displayIssueDate,
          client,
          items,
          totals,
          fiscalData,
        },
        copyType
      );
      document.title = cleanFileName;
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 print:max-w-none print:m-0 print:p-0 print:space-y-0">
      {/* Interactive Actions Header (Hidden when printing) */}
      {showActions && (
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-3 rounded-xl shadow-md border border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${isFiscal ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-200"
                }`}
            >
              Letra [{headerLetter}] • {documentTypeLabel}
            </span>
            <span className="text-xs text-slate-400 font-mono">{formattedSerial}</span>
            <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-700 font-mono">
              {copyType}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Guardar PDF
            </button>
          </div>
        </div>
      )}

      {/* Official Master Document Container (A4 Printable Layout) */}
      <div
        id="unified-commercial-document"
        className="bg-white text-slate-900 font-sans p-6 sm:p-8 rounded-lg shadow-sm border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none text-xs flex flex-col justify-between print:min-h-[270mm] min-h-[720px] space-y-2.5"
      >
        <div className="space-y-2.5">
          {/* =================================================================== */}
          {/* 1. TOP HEADER SECTION (ARCA RG 1415 + Viking Imprint)               */}
          {/* =================================================================== */}
          <div className="border-2 border-slate-900 rounded-none overflow-hidden print-avoid-break bg-white">
            {/* 1.0 Full-Width Copy Designation Banner (ORIGINAL / DUPLICADO / TRIPLICADO) */}
            <div className="border-b-2 border-slate-900 py-1 px-3 flex items-center justify-center text-center bg-slate-100/80">
              <span className="font-black text-xs sm:text-sm uppercase tracking-[0.2em] text-slate-950 font-mono">
                {copyType}
              </span>
            </div>

            {/* 1.1 Main Split Header Body (Emisor | [ C ] | Comprobante) */}
            <div className="relative flex min-h-[132px]">
              {/* Center Floating Letter Box [ C ] / [ X ] anchored to top-center divider */}
              <div className="w-16 sm:w-20 shrink-0 flex flex-col items-center self-stretch">
                <div className="w-full border-x-2 border-b-2 border-slate-900 bg-slate-50 py-1.5 px-1 flex flex-col items-center justify-center text-center shadow-2xs">
                  <span className="font-black text-2xl sm:text-3xl text-slate-950 leading-none">
                    {headerLetter}
                  </span>
                  <span className="text-[7px] font-extrabold uppercase tracking-tight text-slate-800 mt-1 leading-tight">
                    {letterCode}
                  </span>
                </div>
                {/* Central Vertical Divider Line below [ C ] Box */}
                <div className="flex-1 w-0 border-r-2 border-slate-900" />
              </div>

              {/* Left Panel: Emisor Identity & Fiscal Address (Ordered first visually via order) */}
              <div className="flex-1 order-first px-3 py-2.5 flex flex-col justify-between min-w-0">
                <div className="flex items-center gap-3">
                  {/* Viking Signature Black Box Logo */}
                  <div className="bg-black p-1 rounded-lg border border-slate-800 shrink-0 w-14 h-14 flex items-center justify-center shadow-xs">
                    <Image
                      src={logoImg}
                      alt="Logo El Vikingo Store"
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain"
                      priority
                    />
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                      {EMISOR_PROFILE.tradeName}
                    </span>
                    <h1 className="font-black text-sm sm:text-base tracking-tight text-slate-950 uppercase leading-snug">
                      {EMISOR_PROFILE.fullName}
                    </h1>
                  </div>
                </div>

                <div className="text-[9.5px] text-slate-800 space-y-0.5 pt-2 mt-1.5 border-t border-slate-200">
                  <p>
                    <span className="font-bold text-slate-950">Razón Social:</span>{" "}
                    {EMISOR_PROFILE.fullName}
                  </p>
                  <p>
                    <span className="font-bold text-slate-950">Domicilio Comercial:</span>{" "}
                    {EMISOR_PROFILE.commercialAddress}
                  </p>
                  <p className="text-[8.5px] font-mono text-slate-600">
                    <span className="font-bold text-slate-800">Tel:</span> {EMISOR_PROFILE.phone} •{" "}
                    <span className="font-bold text-slate-800">Email:</span> {EMISOR_PROFILE.email}
                  </p>
                  <p>
                    <span className="font-bold text-slate-950">Condición frente al IVA:</span>{" "}
                    <span className="font-bold text-slate-950">{EMISOR_PROFILE.vatCondition}</span>
                  </p>
                </div>
              </div>

              {/* Right Panel: Document Type, Point of Sale, Number & Issuer Tax IDs */}
              <div className="flex-1 px-3 py-2.5 pl-4 flex flex-col justify-between text-left min-w-0">
                <div>
                  <h2 className="font-black text-lg sm:text-xl uppercase tracking-wider text-slate-950 leading-none">
                    {documentTypeLabel}
                  </h2>

                  {isFiscal ? (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-1.5 text-[10px] font-mono text-slate-950">
                      <p>
                        <span className="font-bold">Punto de Venta:</span>{" "}
                        <span className="font-black">{padZero(fiscalData?.pointOfSale || 1, 5)}</span>
                      </p>
                      <p>
                        <span className="font-bold">Comp. Nro:</span>{" "}
                        <span className="font-black">{padZero(fiscalData?.invoiceNumber || 1, 8)}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="font-mono font-black text-xs text-slate-950 mt-1 tracking-wide">
                      {formattedSerial}
                    </p>
                  )}

                  <p className="text-[10px] font-mono text-slate-900 mt-1">
                    <span className="font-bold text-slate-950">Fecha de Emisión:</span>{" "}
                    <span className="font-black">{displayIssueDate}</span>
                  </p>
                </div>

                <div className="text-[9.5px] font-mono text-slate-800 space-y-0.5 pt-2 mt-1.5 border-t border-slate-200">
                  <p>
                    <span className="font-bold text-slate-950">CUIT:</span>{" "}
                    <span className="font-semibold text-slate-900">{EMISOR_PROFILE.cuit}</span>
                  </p>
                  <p>
                    <span className="font-bold text-slate-950">Ingresos Brutos:</span>{" "}
                    <span className="font-semibold text-slate-900">{EMISOR_PROFILE.grossIncome}</span>
                  </p>
                  <p>
                    <span className="font-bold text-slate-950">Fecha de Inicio de Actividades:</span>{" "}
                    <span className="font-semibold text-slate-900">{EMISOR_PROFILE.activityStart}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 1.2 Full-Width Service Billing Period & Payment Due Strip (ARCA RCEL Standard) */}
            <div className="border-t-2 border-slate-900 bg-slate-50/90 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[9.5px] font-mono text-slate-900">
              {isFiscal ? (
                <>
                  <p>
                    <span className="font-bold text-slate-950">Período Facturado Desde:</span>{" "}
                    <span>{formatAfipDate(fiscalData?.serviceFrom) || displayIssueDate}</span>
                  </p>
                  <p>
                    <span className="font-bold text-slate-950">Hasta:</span>{" "}
                    <span>{formatAfipDate(fiscalData?.serviceTo) || displayIssueDate}</span>
                  </p>
                  <p>
                    <span className="font-bold text-slate-950">Fecha de Vto. para el pago:</span>{" "}
                    <span>{formatAfipDate(fiscalData?.paymentDueDate) || displayIssueDate}</span>
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <span className="font-bold text-slate-950">Validez de Oferta:</span> 7 días corridos
                  </p>
                  <p className="text-amber-800 font-bold uppercase">
                    Comprobante No Válido como Factura
                  </p>
                </>
              )}
            </div>
          </div>

          {/* =================================================================== */}
          {/* 2. RECEPTOR / CLIENT SECTION (Corporate & Consumer Support)         */}
          {/* =================================================================== */}
          <div className="border-2 border-slate-900 rounded-none p-3 bg-slate-50/40 space-y-1.5 text-[10px] print-avoid-break">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <span className="font-bold text-slate-950 mr-1">
                  {client.docType ? `${client.docType}:` : "CUIT / Doc:"}
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {client.docNumber && String(client.docNumber) !== "0"
                    ? client.docNumber
                    : "Sin Identificar"}
                </span>
              </div>
              <div className="col-span-7">
                <span className="font-bold text-slate-950 mr-1">
                  Apellido y Nombre / Razón Social:
                </span>
                <span className="font-bold text-slate-950 text-[10.5px]">
                  {client.name || "Consumidor Final"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 pt-1 border-t border-slate-200">
              <div className="col-span-5">
                <span className="font-bold text-slate-950 mr-1">Condición frente al IVA:</span>
                <span className="font-semibold text-slate-900">
                  {client.vatCondition || "Consumidor Final"}
                </span>
              </div>
              <div className="col-span-7">
                <span className="font-bold text-slate-950 mr-1">Domicilio:</span>
                <span className="font-medium text-slate-900">
                  {client.address || "-"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 pt-1 border-t border-slate-200">
              <div className="col-span-5">
                <span className="font-bold text-slate-950 mr-1">Condición de venta:</span>
                <span className="font-semibold text-slate-900">
                  {client.paymentCondition || "Contado / Transferencia Bancaria"}
                </span>
              </div>
              <div className="col-span-7 flex flex-wrap items-center gap-x-4">
                {client.phone && (
                  <span>
                    <strong className="text-slate-950">Tel:</strong>{" "}
                    <span className="font-mono text-slate-800">{client.phone}</span>
                  </span>
                )}
                {client.deviceModel && (
                  <span>
                    <strong className="text-slate-950">Equipo:</strong>{" "}
                    <span className="font-semibold text-slate-900">{client.deviceModel}</span>
                  </span>
                )}
                {client.workOrderNumber && (
                  <span>
                    <strong className="text-slate-950">OT:</strong>{" "}
                    <span className="font-mono font-bold text-slate-900">{client.workOrderNumber}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Optional Document Title / Work Order Scope */}
          {title && (
            <div className="px-1 py-0.5 print-avoid-break">
              <h3 className="font-bold text-[11px] text-slate-800 uppercase tracking-wide">
                {title}
              </h3>
            </div>
          )}

          {/* =================================================================== */}
          {/* 3. LINE ITEMS / SERVICES & SPARE PARTS TABLE (Full 8-Col ARCA Grid) */}
          {/* =================================================================== */}
          <div className="overflow-hidden border-2 border-slate-900 rounded-none">
            <table className="w-full border-collapse text-[10px]">
              <thead className="print:table-header-group">
                <tr className="bg-slate-900 text-white font-bold uppercase text-[8.5px] tracking-wider">
                  <th className="p-2 text-center w-14 border-r border-slate-700">Código</th>
                  <th className="p-2 text-left border-r border-slate-700">Producto / Servicio</th>
                  <th className="p-2 text-right w-16 border-r border-slate-700">Cantidad</th>
                  <th className="p-2 text-center w-20 border-r border-slate-700">U. Medida</th>
                  <th className="p-2 text-right w-24 border-r border-slate-700">Precio Unit.</th>
                  <th className="p-2 text-right w-16 border-r border-slate-700">% Bonif</th>
                  <th className="p-2 text-right w-20 border-r border-slate-700">Imp. Bonif.</th>
                  <th className="p-2 text-right w-24">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items && items.length > 0 ? (
                  items.map((item, idx) => {
                    const qty = item.quantity || 1;
                    const unitPrice = item.unitPrice || 0;
                    const bonusPct = item.discountPercentage || 0;
                    const bonusAmt = item.discountAmount || 0;
                    const lineTotal =
                      item.totalPrice !== undefined
                        ? item.totalPrice
                        : qty * unitPrice - bonusAmt;

                    const unitMeasureLabel =
                      item.unitOfMeasure ||
                      (item.itemType === "LABOR" || item.itemType === "SERVICE"
                        ? "unidades"
                        : "unidades");

                    const itemCode = item.code || padZero(idx + 1, 3);

                    return (
                      <tr
                        key={item.id || idx}
                        className={`print-avoid-break ${item.isDiscount ? "bg-emerald-50 text-emerald-950" : "hover:bg-slate-50"}`}
                      >
                        <td className="p-2 text-center font-mono text-[9px] text-slate-600">
                          {itemCode}
                        </td>
                        <td className="p-2">
                          <span className="font-medium text-slate-900 whitespace-pre-line">
                            {item.description}
                          </span>
                          {item.itemType && (
                            <span className="ml-2 text-[8px] uppercase font-mono px-1 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">
                              {item.itemType === "SPARE_PART"
                                ? "REPUESTO"
                                : item.itemType === "LABOR"
                                  ? "MANO DE OBRA"
                                  : "SERVICIO"}
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-800">
                          {formatArgentineCurrency(qty)}
                        </td>
                        <td className="p-2 text-center font-mono text-[9px] text-slate-700">
                          {unitMeasureLabel}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-800">
                          {formatArgentineCurrency(unitPrice)}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-600">
                          {formatArgentineCurrency(bonusPct)}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-600">
                          {formatArgentineCurrency(bonusAmt)}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-950">
                          {item.isDiscount ? "-" : ""}
                          {formatArgentineCurrency(Math.abs(lineTotal))}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-slate-500 italic">
                      Sin ítems cargados en el comprobante.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 4. BOTTOM TOTALS, OBSERVATIONS & ARCA VALIDATION BLOCK              */}
        {/* =================================================================== */}
        <div className="space-y-2.5 mt-auto pt-2 print-avoid-break">
          {/* 4.1 Official ARCA Full-Width Totals Box */}
          <div className="border-2 border-slate-900 rounded-none p-3 bg-slate-50/70 flex justify-end">
            <div className="w-72 space-y-1 text-[10.5px]">
              <div className="flex justify-between text-slate-800 font-semibold">
                <span>Subtotal: {currency}</span>
                <span className="font-mono font-bold text-slate-950">
                  {formatArgentineCurrency(totals.subtotal)}
                </span>
              </div>

              {totals.discount !== undefined && totals.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Bonificaciones / Descuentos: {currency}</span>
                  <span className="font-mono">
                    -{formatArgentineCurrency(totals.discount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-800 font-semibold">
                <span>Importe Otros Tributos: {currency}</span>
                <span className="font-mono font-bold text-slate-950">
                  {formatArgentineCurrency(0)}
                </span>
              </div>

              <div className="flex justify-between font-black text-xs sm:text-sm text-slate-950 border-t-2 border-slate-900 pt-1.5 mt-1">
                <span>Importe Total: {currency}</span>
                <span className="font-mono">
                  {formatArgentineCurrency(totals.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* 4.2 Observations / Emitter Legend Box (Matching ARCA Middle Strip) */}
          {(notes || termsAndConditions || isFiscal) && (
            <div className="border border-slate-400 rounded-none px-3 py-1.5 text-[9.5px] text-slate-700 bg-white">
              {notes || termsAndConditions ? (
                <div className="space-y-1">
                  {notes && (
                    <div>
                      <span className="font-bold text-slate-900 uppercase text-[9px] mr-1">
                        Observaciones:
                      </span>
                      <span className="whitespace-pre-line">{notes}</span>
                    </div>
                  )}
                  {termsAndConditions && (
                    <div>
                      <span className="font-bold text-slate-900 uppercase text-[9px] mr-1">
                        Términos y Garantía:
                      </span>
                      <span className="whitespace-pre-line">{termsAndConditions}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center italic font-medium text-slate-800">
                  &ldquo;Pablo Gabriel Mirazo • El Vikingo Store&rdquo;
                </p>
              )}
            </div>
          )}

          {/* 4.3 Official ARCA QR, Page Counter & CAE Block */}
          <div className="pt-1">
            {isFiscal && fiscalData?.cae ? (
              <div className="flex items-center justify-between gap-4 bg-slate-50/90 border-2 border-slate-900 rounded-none p-3">
                {/* Left: Official QR Code, ARCA Logo & Statutory Disclaimer */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="shrink-0">
                    <AfipQrCode
                      invoice={fiscalData.rawInvoice}
                      size={100}
                      className="bg-white p-1 rounded border border-slate-300 shadow-xs"
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <img
                      src="/ARCA_logo.png"
                      alt="ARCA - Agencia de Recaudación y Control Aduanero"
                      className="h-8 sm:h-9 max-w-[190px] w-auto object-contain"
                    />
                    <div className="space-y-0.5">
                      <p className="font-black italic text-[10.5px] text-slate-950 tracking-wide">
                        Comprobante Autorizado
                      </p>
                      <p className="text-[7.5px] italic font-semibold text-slate-700 leading-tight max-w-[290px]">
                        Esta Agencia no se responsabiliza por los datos ingresados en el detalle de la operación
                      </p>
                    </div>
                  </div>
                </div>

                {/* Center: Page Counter (Pág. 1/1) */}
                <div className="hidden sm:flex flex-col items-center justify-center shrink-0 px-2">
                  <span className="font-bold text-[10.5px] text-slate-950 font-mono">
                    Pág. 1/1
                  </span>
                </div>

                {/* Right: CAE Number & Due Date */}
                <div className="text-right space-y-1 shrink-0 min-w-[190px]">
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-bold text-slate-950">
                      CAE N°:{" "}
                    </span>
                    <span className="font-mono font-normal text-[11px] text-slate-950 tracking-wide">
                      {fiscalData.cae}
                    </span>
                  </div>
                  <div className="space-y-0.5 pt-1 border-t border-slate-200">
                    <span className="text-[9.5px] font-bold text-slate-950">
                      Fecha de Vto. de CAE:{" "}
                    </span>
                    <span className="font-mono font-normal text-[11px] text-slate-950">
                      {formatAfipDate(fiscalData.caeVto)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 py-1 border-t border-slate-300">
                <div className="flex items-center gap-1.5 text-amber-900">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-semibold">
                    DOCUMENTO NO VÁLIDO COMO FACTURA • REGISTRO DE TALLER
                  </span>
                </div>
                <p>Emitido por: {staffName}</p>
              </div>
            )}

            {/* Micro Footer Sign-off */}
            <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
              <span>Viking-App Service System • Software de Gestión</span>
              <span className="font-semibold text-slate-600 uppercase">¡Muchas Gracias Por Su Confianza!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
