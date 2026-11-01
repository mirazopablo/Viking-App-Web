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
  description: string;
  itemType?: "SPARE_PART" | "LABOR" | "SERVICE";
  unitOfMeasure?: string;
  quantity: number;
  unitPrice: number;
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
 */
export const EMISOR_PROFILE = {
  fullName: "PABLO GABRIEL MIRAZO",
  cuit: "20-41795241-2",
  vatCondition: "RESPONSABLE MONOTRIBUTO",
  commercialAddress: "Alemania 1896, San Rafael, Mendoza",
  activityStart: "09/2026",
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
        className="bg-white text-slate-900 font-sans p-6 sm:p-8 rounded-lg shadow-sm border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none text-xs flex flex-col justify-between print:min-h-[270mm] min-h-[720px] space-y-3"
      >
        <div className="space-y-3">
          {/* =================================================================== */}
          {/* 1. TOP HEADER SECTION (RG 1415 Normalized Tri-Panel Header)         */}
          {/* =================================================================== */}
          <div className="border-2 border-slate-900 rounded-md overflow-hidden flex min-h-[125px] print-avoid-break bg-white">
            {/* 1.1 Left Panel: Emisor Fiscal & Commercial Data */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              {/* Copy Designation Header Band (Edge-to-edge RG 1415) */}
              <div className="border-b-2 border-slate-900 py-1 px-3 flex items-center justify-center text-center bg-slate-50/50">
                <span className="font-black text-xs uppercase tracking-widest text-slate-900 font-mono">
                  {copyType}
                </span>
              </div>

              <div className="px-3 py-2 flex-1 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  {/* Black Box Logo Container */}
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

                  <div className="py-1 space-y-0.5 min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                      Razón Social:
                    </span>
                    <h1 className="font-black text-sm sm:text-base tracking-tight text-slate-950 uppercase leading-snug">
                      {EMISOR_PROFILE.fullName}
                    </h1>
                  </div>
                </div>

                <div className="text-[9px] font-mono text-slate-600 space-y-0.5 pt-1.5 border-t border-slate-200 mt-1.5">
                  <p>
                    <span className="font-semibold text-slate-700">Dom. Comercial:</span> {EMISOR_PROFILE.commercialAddress}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Tel:</span> {EMISOR_PROFILE.phone} • <span className="font-semibold text-slate-700">Email:</span> {EMISOR_PROFILE.email}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Inicio de Actividades:</span> {EMISOR_PROFILE.activityStart}
                  </p>
                </div>
              </div>
            </div>

            {/* 1.2 Center Panel: Normalized Letter Box [ C ] vs [ X ] (RG 1415) */}
            <div className="w-24 shrink-0 border-x-2 border-slate-900 bg-slate-50 flex flex-col items-center justify-center p-2 text-center self-stretch">
              <div className="w-12 h-12 border-2 border-slate-900 bg-white rounded flex items-center justify-center shadow-xs">
                <span className="font-black text-2xl text-slate-950 leading-none">{headerLetter}</span>
              </div>
              <span className="text-[7.5px] font-extrabold uppercase tracking-tight text-slate-900 mt-1.5 leading-tight">
                {letterCode}
              </span>
            </div>

            {/* 1.3 Right Panel: Document Identification, Date & Period (Normalized AFIP/RG 1415 Left Alignment) */}
            <div className="flex-1 px-3 py-2 pl-4 flex flex-col justify-between text-left min-w-0">
              <div className="space-y-1">
                <div>
                  <h2 className="font-black text-base uppercase tracking-wider text-slate-950 leading-tight">
                    {documentTypeLabel}
                  </h2>
                  <p className="font-mono font-black text-xs text-slate-950 mt-0.5 tracking-wide">
                    {formattedSerial}
                  </p>
                </div>

                <div className="text-[9.5px] font-mono text-slate-700 space-y-0.5 pt-1">
                  <p>
                    <span className="font-semibold text-slate-600">Fecha de Emisión:</span>{" "}
                    <span className="font-bold text-slate-950">{displayIssueDate}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-600">CUIT:</span>{" "}
                    <span className="font-bold text-slate-950">{EMISOR_PROFILE.cuit}</span>
                  </p>
                  <p className="font-semibold text-slate-700">
                    {EMISOR_PROFILE.vatCondition}
                  </p>
                </div>
              </div>

              {/* Fiscal Period vs Internal Validity */}
              <div className="text-[9px] font-mono text-slate-600 space-y-0.5 pt-1.5 border-t border-slate-200 mt-1.5">
                {isFiscal ? (
                  <>
                    <p>
                      <span className="font-semibold text-slate-700">Período Facturado:</span>{" "}
                      <span className="font-bold text-slate-800">
                        {formatAfipDate(fiscalData?.serviceFrom) || displayIssueDate} al{" "}
                        {formatAfipDate(fiscalData?.serviceTo) || displayIssueDate}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Vto. para el Pago:</span>{" "}
                      <span className="font-bold text-slate-800">
                        {formatAfipDate(fiscalData?.paymentDueDate) || displayIssueDate}
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <p>Validez de Oferta: 7 días corridos</p>
                    <p className="text-amber-800 font-semibold">
                      Comprobante No Válido como Factura
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* 2. RECEPTOR / CLIENT SECTION                                        */}
          {/* =================================================================== */}
          <div className="border-2 border-slate-900 rounded-md p-3 bg-slate-50/50 space-y-1.5 text-[10px] print-avoid-break">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-7">
                <span className="font-bold text-slate-500 uppercase mr-1">Razón Social / Titular:</span>
                <span className="font-bold text-slate-950 text-[11px]">{client.name}</span>
              </div>
              <div className="col-span-5 text-right">
                <span className="font-bold text-slate-500 uppercase mr-1">Condición Frente al IVA:</span>
                <span className="font-semibold text-slate-900">
                  {client.vatCondition || "Consumidor Final"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 pt-1 border-t border-slate-300">
              <div className="col-span-7">
                <span className="font-bold text-slate-500 uppercase mr-1">
                  {client.docType ? `Doc (${client.docType}):` : "Documento / CUIT:"}
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {client.docNumber || "Sin Identificar"}
                </span>
                {client.phone && (
                  <span className="ml-3 text-slate-600">
                    Tel: <span className="font-mono">{client.phone}</span>
                  </span>
                )}
              </div>
              <div className="col-span-5 text-right">
                <span className="font-bold text-slate-500 uppercase mr-1">Condición de Venta:</span>
                <span className="font-semibold text-slate-900">
                  {client.paymentCondition || "Contado / Transferencia"}
                </span>
              </div>
            </div>

            {client.address && (
              <div className="pt-1 border-t border-slate-300">
                <span className="font-bold text-slate-500 uppercase mr-1">Domicilio Comercial / Fiscal:</span>
                <span className="font-medium text-slate-900">{client.address}</span>
              </div>
            )}

            {(client.deviceModel || client.workOrderNumber) && (
              <div className="grid grid-cols-12 gap-2 pt-1 border-t border-slate-300 text-slate-700">
                {client.deviceModel && (
                  <div className="col-span-7">
                    <span className="font-bold text-slate-500 uppercase mr-1">Equipo en Taller:</span>
                    <span className="font-semibold text-slate-900">{client.deviceModel}</span>
                  </div>
                )}
                {client.workOrderNumber && (
                  <div className="col-span-5 text-right">
                    <span className="font-bold text-slate-500 uppercase mr-1">Orden de Trabajo:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {client.workOrderNumber}
                    </span>
                  </div>
                )}
              </div>
            )}
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
          {/* 3. LINE ITEMS / SERVICES & SPARE PARTS TABLE                        */}
          {/* =================================================================== */}
          <div className="overflow-hidden border-2 border-slate-900 rounded-md">
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="print:table-header-group">
                <tr className="bg-slate-900 text-white font-bold uppercase text-[9px] tracking-wider">
                  <th className="p-2 text-left">Descripción de Productos / Servicios</th>
                  <th className="p-2 text-center w-16">Cant.</th>
                  <th className="p-2 text-center w-24">U. Medida</th>
                  <th className="p-2 text-right w-28">Precio Unit.</th>
                  <th className="p-2 text-right w-28">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items && items.length > 0 ? (
                  items.map((item, idx) => {
                    const lineTotal =
                      item.totalPrice !== undefined
                        ? item.totalPrice
                        : (item.quantity || 1) * (item.unitPrice || 0);

                    const unitMeasureLabel =
                      item.unitOfMeasure ||
                      (item.itemType === "LABOR" || item.itemType === "SERVICE"
                        ? "otras unidades"
                        : "unidades");

                    return (
                      <tr
                        key={item.id || idx}
                        className={`print-avoid-break ${item.isDiscount ? "bg-emerald-50 text-emerald-950" : "hover:bg-slate-50"}`}
                      >
                        <td className="p-2">
                          <span className="font-medium text-slate-900">{item.description}</span>
                          {item.itemType && (
                            <span className="ml-2 text-[8.5px] uppercase font-mono px-1 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">
                              {item.itemType === "SPARE_PART"
                                ? "REPUESTO"
                                : item.itemType === "LABOR"
                                  ? "MANO DE OBRA"
                                  : "SERVICIO"}
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-center font-mono text-slate-700">{item.quantity}</td>
                        <td className="p-2 text-center font-mono text-[9.5px] text-slate-600 lowercase">
                          {unitMeasureLabel}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-700">
                          {currency} {formatArgentineCurrency(item.unitPrice)}
                        </td>
                        <td className="p-2 text-right font-mono font-semibold text-slate-900">
                          {item.isDiscount ? `-${currency} ` : `${currency} `}
                          {formatArgentineCurrency(Math.abs(lineTotal))}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500 italic">
                      Sin ítems cargados en el comprobante.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* =================================================================== */}
          {/* 4. TOTALS SUMMARY BOX                                               */}
          {/* =================================================================== */}
          <div className="flex justify-end pt-1 print-avoid-break">
            <div className="w-72 bg-slate-50 border-2 border-slate-900 rounded-md p-2.5 space-y-1 text-[10.5px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Neto:</span>
                <span className="font-mono">
                  {currency} {formatArgentineCurrency(totals.subtotal)}
                </span>
              </div>

              {totals.discount !== undefined && totals.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium border-t border-slate-200 pt-1">
                  <span>Bonificaciones / Descuentos:</span>
                  <span className="font-mono">
                    -{currency} {formatArgentineCurrency(totals.discount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between font-black text-sm text-slate-950 border-t-2 border-slate-900 pt-1 mt-1">
                <span>TOTAL {isFiscal ? "A PAGAR" : "FINAL"}:</span>
                <span className="font-mono">
                  {currency} {formatArgentineCurrency(totals.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* 5. NOTES AND WARRANTY CONDITIONS                                    */}
          {/* =================================================================== */}
          {(notes || termsAndConditions) && (
            <div className="border-t border-slate-300 pt-2 space-y-1.5 text-[9.5px] text-slate-600 print-avoid-break">
              {notes && (
                <div>
                  <span className="font-bold text-slate-800 uppercase text-[9px] mr-1">
                    Observaciones:
                  </span>
                  <span className="whitespace-pre-line">{notes}</span>
                </div>
              )}
              {termsAndConditions && (
                <div>
                  <span className="font-bold text-slate-800 uppercase text-[9px] mr-1">
                    Términos y Garantía:
                  </span>
                  <span className="whitespace-pre-line">{termsAndConditions}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* =================================================================== */}
        {/* 6. BOTTOM FISCAL / ARCA VALIDATION BLOCK (RG 4291 / RG 1415)        */}
        {/* =================================================================== */}
        <div className="border-t-2 border-slate-900 pt-3 mt-auto print-avoid-break">
          {isFiscal && fiscalData?.cae ? (
            <div className="flex items-center justify-between gap-4 bg-slate-50/90 border-2 border-slate-900 rounded-lg p-3">
              {/* Left: Official QR Code, ARCA Logo & Statutory Disclaimer */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="shrink-0">
                  <AfipQrCode
                    invoice={fiscalData.rawInvoice}
                    size={105}
                    className="bg-white p-1 rounded border border-slate-300 shadow-xs"
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <img
                    src="/ARCA_logo.png"
                    alt="ARCA - Agencia de Recaudación y Control Aduanero"
                    className="h-8 sm:h-9 max-w-[200px] w-auto object-contain"
                  />
                  <div className="space-y-0.5">
                    <p className="font-black italic text-[10.5px] text-slate-900 tracking-wide">
                      Comprobante Autorizado
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: CAE Number & Due Date */}
              <div className="text-right space-y-1 shrink-0 min-w-[195px]">
                <div className="space-y-0.5">
                  <span className="text-[8.5px] font-bold text-slate-500 uppercase block">
                    CAE N° (Autorización Electrónica):
                  </span>
                  <span className="font-mono font-black text-xs sm:text-sm text-slate-950 tracking-wider block">
                    {fiscalData.cae}
                  </span>
                </div>
                <div className="space-y-0.5 pt-1 border-t border-slate-200">
                  <span className="text-[8.5px] font-bold text-slate-500 uppercase block">
                    Fecha de Vto. de CAE:
                  </span>
                  <span className="font-mono font-bold text-xs text-slate-900 block">
                    {formatAfipDate(fiscalData.caeVto)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 py-1">
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
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 pt-2 border-t border-slate-200 mt-2">
            <span>Viking-App Service System • Software de Gestión</span>
            <span className="font-semibold text-slate-600 uppercase">¡Muchas Gracias Por Su Confianza!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
