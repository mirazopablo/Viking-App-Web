"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Files } from "lucide-react";
import {
  UnifiedCommercialDocument,
  UnifiedCommercialDocumentProps,
  CommercialCopyType,
  generateCommercialDocumentFilename,
} from "@/components/billing/unified-commercial-document";

interface ReceiptPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentProps: UnifiedCommercialDocumentProps | null;
}

export type PrintCopiesOption = "ORIGINAL_ONLY" | "ORIGINAL_DUPLICADO" | "TRIPLICADO_ALL";

/**
 * ReceiptPreviewDialog Component:
 * Full-featured modal displaying the unified receipt on screen with responsive preview,
 * interactive copy designation switcher (Original / Duplicado / Triplicado),
 * dynamic PDF filename injection, and clean A4 paper multi-copy printing.
 */
export const ReceiptPreviewDialog: React.FC<ReceiptPreviewDialogProps> = ({
  open,
  onOpenChange,
  documentProps,
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedPreviewCopy, setSelectedPreviewCopy] = useState<CommercialCopyType>("ORIGINAL");
  const [printCopiesOption, setPrintCopiesOption] = useState<PrintCopiesOption>("ORIGINAL_ONLY");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!documentProps) {
    return null;
  }

  const handlePrint = () => {
    if (typeof window === "undefined") return;

    const originalTitle = document.title;
    const copySuffix =
      printCopiesOption === "ORIGINAL_ONLY"
        ? "ORIGINAL"
        : printCopiesOption === "ORIGINAL_DUPLICADO"
          ? "ORIGINAL_DUPLICADO"
          : "COMPLETO";

    const suggestedFileName = generateCommercialDocumentFilename(
      documentProps,
      copySuffix as any
    );

    document.title = suggestedFileName;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <>
      {/* On-Screen Interactive Preview Modal (Enlarged and Hidden in Print) */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[96vw] max-w-5xl sm:max-w-5xl md:max-w-5xl lg:max-w-6xl xl:max-w-6xl max-h-[94vh] overflow-y-auto p-4 sm:p-6 bg-slate-100 border-slate-300 shadow-2xl no-print">
          <DialogHeader className="pb-3 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Vista Previa de Comprobante
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-600">
                  Visualización y emisión conforme a normativa de ARCA (Resolución General 1415).
                </DialogDescription>
              </div>

              {/* Dynamic Copies & Action Toolbar */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {/* On-screen copy selector tabs */}
                <div className="flex items-center bg-white p-1 rounded-lg border border-slate-300 shadow-xs text-xs font-mono">
                  <span className="text-[10px] text-slate-500 uppercase font-bold px-1.5">
                    Ver:
                  </span>
                  {(["ORIGINAL", "DUPLICADO", "TRIPLICADO"] as CommercialCopyType[]).map((cp) => (
                    <button
                      key={cp}
                      type="button"
                      onClick={() => setSelectedPreviewCopy(cp)}
                      className={`px-2 py-0.5 rounded text-[10.5px] font-bold tracking-wider transition-colors cursor-pointer ${
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
                  className="bg-white border border-slate-300 text-slate-900 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-hidden cursor-pointer shadow-xs"
                  title="Configuración de copias para impresión o PDF"
                >
                  <option value="ORIGINAL_ONLY">Imprimir: Solo Original (1 hoja)</option>
                  <option value="ORIGINAL_DUPLICADO">Imprimir: Original + Duplicado (2 hojas)</option>
                  <option value="TRIPLICADO_ALL">Imprimir: Original, Duplicado y Triplicado (3 hojas)</option>
                </select>

                <Button
                  onClick={handlePrint}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="py-2 w-full overflow-x-auto">
            <div className="w-full max-w-4xl mx-auto min-w-[700px]">
              <UnifiedCommercialDocument
                {...documentProps}
                copyType={selectedPreviewCopy}
                showActions={false}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clean A4 Printable Engine Rendered directly on document.body via Portal (Only Visible in Print) */}
      {mounted && typeof document !== "undefined" && createPortal(
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
        </div>,
        document.body
      )}
    </>
  );
};


