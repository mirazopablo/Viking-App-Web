"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import {
  UnifiedCommercialDocument,
  UnifiedCommercialDocumentProps,
  CommercialCopyType,
  generateCommercialDocumentFilename,
} from "@/components/billing/unified-commercial-document";
import { PrintPortal } from "@/components/shared/print-portal";

interface ReceiptPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentProps: UnifiedCommercialDocumentProps | null;
}

export type PrintCopiesOption = "ORIGINAL_ONLY" | "ORIGINAL_DUPLICADO" | "TRIPLICADO_ALL";

const A4_PREVIEW_WIDTH = 760;

/**
 * ReceiptPreviewDialog Component:
 * Full-featured modal (full-screen on mobile, large dialog on desktop) displaying
 * the unified receipt with proportional auto-scaling on narrow viewports,
 * interactive copy switcher (Original / Duplicado / Triplicado),
 * dynamic PDF filename injection, and clean A4 paper multi-copy printing via PrintPortal.
 */
export const ReceiptPreviewDialog: React.FC<ReceiptPreviewDialogProps> = ({
  open,
  onOpenChange,
  documentProps,
}) => {
  const [selectedPreviewCopy, setSelectedPreviewCopy] = useState<CommercialCopyType>("ORIGINAL");
  const [printCopiesOption, setPrintCopiesOption] = useState<PrintCopiesOption>("ORIGINAL_ONLY");
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Proportionally scale A4 document on narrow mobile viewports to prevent horizontal overflow
  useEffect(() => {
    if (!open) return;

    const updateMetrics = () => {
      const containerEl = containerRef.current;
      const contentEl = contentRef.current;
      if (!containerEl || !contentEl) return;

      const availableWidth = containerEl.clientWidth;
      const nextScale =
        availableWidth > 0 && availableWidth < A4_PREVIEW_WIDTH
          ? availableWidth / A4_PREVIEW_WIDTH
          : 1;

      setScale(nextScale);
      setContentHeight(contentEl.scrollHeight);
    };

    updateMetrics();

    const observer = new ResizeObserver(updateMetrics);
    if (containerRef.current) observer.observe(containerRef.current);
    if (contentRef.current) observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, [open, selectedPreviewCopy, documentProps]);

  if (!documentProps) {
    return null;
  }

  const handlePrint = () => {
    if (typeof window === "undefined") return;

    const originalTitle = document.title;
    const baseFileName = generateCommercialDocumentFilename(documentProps, "ORIGINAL");
    const suggestedFileName =
      printCopiesOption === "ORIGINAL_ONLY"
        ? baseFileName
        : printCopiesOption === "ORIGINAL_DUPLICADO"
          ? baseFileName.replace("_ORIGINAL", "_ORIGINAL_DUPLICADO")
          : baseFileName.replace("_ORIGINAL", "_COMPLETO");

    document.title = suggestedFileName;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <>
      {/* On-Screen Interactive Preview Modal (Full-screen on mobile, Hidden in Print) */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="inset-0 top-0 left-0 translate-x-0 translate-y-0 w-full h-[100dvh] max-w-none max-h-none rounded-none p-0 overflow-hidden flex flex-col gap-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[96vw] sm:max-w-5xl lg:max-w-6xl sm:h-auto sm:max-h-[94vh] sm:rounded-lg bg-slate-100 border-slate-300 shadow-2xl no-print">
          <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-100 shrink-0 pr-12 sm:pr-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
              <div className="min-w-0">
                <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  Vista Previa de Comprobante
                </DialogTitle>
                <DialogDescription className="text-[11px] sm:text-xs text-slate-600 truncate">
                  Visualización y emisión conforme a normativa de ARCA (RG 1415).
                </DialogDescription>
              </div>

              {/* Dynamic Copies & Action Toolbar */}
              <div className="flex items-center gap-2 flex-wrap justify-start lg:justify-end">
                {/* On-screen copy selector tabs */}
                <div className="flex items-center bg-white p-1 rounded-lg border border-slate-300 shadow-xs text-xs font-mono">
                  <span className="hidden sm:inline text-[10px] text-slate-500 uppercase font-bold px-1.5">
                    Ver:
                  </span>
                  {(["ORIGINAL", "DUPLICADO", "TRIPLICADO"] as CommercialCopyType[]).map((cp) => (
                    <button
                      key={cp}
                      type="button"
                      onClick={() => setSelectedPreviewCopy(cp)}
                      className={`px-2 py-0.5 rounded text-[10px] sm:text-[10.5px] font-bold tracking-wider transition-colors cursor-pointer ${
                        selectedPreviewCopy === cp
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      {cp}
                    </button>
                  ))}
                </div>

                {/* Multi-copy export mode selector */}
                <select
                  value={printCopiesOption}
                  onChange={(e) => setPrintCopiesOption(e.target.value as PrintCopiesOption)}
                  className="bg-white border border-slate-300 text-slate-900 text-[11px] sm:text-xs font-mono rounded-lg px-2 py-1.5 focus:outline-hidden cursor-pointer shadow-xs max-w-full"
                  title="Configuración de copias para impresión o PDF"
                >
                  <option value="ORIGINAL_ONLY">Solo Original (1 hoja)</option>
                  <option value="ORIGINAL_DUPLICADO">Original + Duplicado (2 hojas)</option>
                  <option value="TRIPLICADO_ALL">Original, Duplicado y Triplicado (3 hojas)</option>
                </select>

                <Button
                  onClick={handlePrint}
                  size="sm"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Auto-Scaled A4 Preview Container */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            <div ref={containerRef} className="w-full max-w-4xl mx-auto">
              <div
                className="overflow-hidden mx-auto"
                style={{
                  width: scale < 1 ? "100%" : undefined,
                  height: scale < 1 && contentHeight ? `${contentHeight * scale}px` : undefined,
                }}
              >
                <div
                  ref={contentRef}
                  style={
                    scale < 1
                      ? {
                          width: `${A4_PREVIEW_WIDTH}px`,
                          transform: `scale(${scale})`,
                          transformOrigin: "top left",
                        }
                      : undefined
                  }
                >
                  <UnifiedCommercialDocument
                    {...documentProps}
                    copyType={selectedPreviewCopy}
                    showActions={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clean A4 Printable Engine Rendered directly on document.body via PrintPortal */}
      <PrintPortal>
        <div
          id="viking-printable-commercial-document"
          className="hidden print:block bg-white text-slate-900 font-sans p-0 m-0 w-full border-none shadow-none text-xs"
        >
          {printCopiesOption === "ORIGINAL_ONLY" && (
            <UnifiedCommercialDocument {...documentProps} copyType="ORIGINAL" showActions={false} />
          )}

          {printCopiesOption === "ORIGINAL_DUPLICADO" && (
            <>
              <div className="print-page-break">
                <UnifiedCommercialDocument {...documentProps} copyType="ORIGINAL" showActions={false} />
              </div>
              <div>
                <UnifiedCommercialDocument {...documentProps} copyType="DUPLICADO" showActions={false} />
              </div>
            </>
          )}

          {printCopiesOption === "TRIPLICADO_ALL" && (
            <>
              <div className="print-page-break">
                <UnifiedCommercialDocument {...documentProps} copyType="ORIGINAL" showActions={false} />
              </div>
              <div className="print-page-break">
                <UnifiedCommercialDocument {...documentProps} copyType="DUPLICADO" showActions={false} />
              </div>
              <div>
                <UnifiedCommercialDocument {...documentProps} copyType="TRIPLICADO" showActions={false} />
              </div>
            </>
          )}
        </div>
      </PrintPortal>
    </>
  );
};
