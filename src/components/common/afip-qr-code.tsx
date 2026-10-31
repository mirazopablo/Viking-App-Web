"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { InvoiceResponse } from "@/types/invoice";
import { invoiceService } from "@/services/invoice.service";

export interface AfipQrCodeProps {
  /**
   * Complete invoice object with CAE and fiscal data.
   */
  invoice?: InvoiceResponse;
  /**
   * Pre-computed ARCA validation URL (if provided directly).
   */
  qrUrl?: string;
  /**
   * Dimensions in pixels (default: 130px per ARCA recommendation).
   */
  size?: number;
  /**
   * Additional container CSS classes.
   */
  className?: string;
  /**
   * QR Error correction level (default: 'M' per RG 4291/4892).
   */
  level?: "L" | "M" | "Q" | "H";
  /**
   * Whether to include white quiet zone margin around the QR code.
   */
  includeMargin?: boolean;
}

/**
 * AfipQrCode Component:
 * Renders the official ARCA (ex-AFIP) verification QR code as an SVG vector graphic,
 * ensuring high precision for print, PDF generation, and mobile camera scanning.
 */
export const AfipQrCode: React.FC<AfipQrCodeProps> = ({
  invoice,
  qrUrl,
  size = 130,
  className = "",
  level = "M",
  includeMargin = true,
}) => {
  const url = qrUrl || (invoice ? invoiceService.generateAfipQrUrl(invoice) : "");

  if (!url) {
    return null;
  }

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <QRCodeSVG
        value={url}
        size={size}
        level={level}
        includeMargin={includeMargin}
        className="rounded bg-white p-1 shadow-xs"
        aria-label="Código QR Oficial de ARCA para Verificación de Comprobante Fiscal"
      />
      <span className="text-[8px] font-mono font-medium text-slate-500 uppercase tracking-widest mt-1">
        ARCA / AFIP
      </span>
    </div>
  );
};
