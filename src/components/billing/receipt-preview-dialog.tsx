"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  UnifiedCommercialDocument,
  UnifiedCommercialDocumentProps,
} from "@/components/billing/unified-commercial-document";

interface ReceiptPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentProps: UnifiedCommercialDocumentProps | null;
}

/**
 * ReceiptPreviewDialog Component:
 * Full-featured modal displaying the unified receipt on screen with responsive preview,
 * print button, and clean A4 paper rendering.
 */
export const ReceiptPreviewDialog: React.FC<ReceiptPreviewDialogProps> = ({
  open,
  onOpenChange,
  documentProps,
}) => {
  if (!documentProps) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-slate-100 border-slate-300">
        <DialogHeader className="print:hidden pb-2 border-b border-slate-200">
          <DialogTitle className="text-base font-bold text-slate-900">
            Vista Previa de Comprobante
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600">
            Visualización y emisión conforme a normativa de ARCA (Resolución General 1415).
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <UnifiedCommercialDocument {...documentProps} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
