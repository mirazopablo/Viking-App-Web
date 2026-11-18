'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, FileText } from 'lucide-react';
import {
  BudgetPaperContent,
  PrintableBudgetDocument,
  printBudgetDocumentWithTitle,
} from '../preview/PrintableBudgetDocument';
import { sanitizeBudgetForClient } from '@/types/budget';

interface PublicBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  budgetData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workOrder?: any;
  staffName?: string;
}

const A4_PREVIEW_WIDTH = 760;

export const PublicBudgetModal: React.FC<PublicBudgetModalProps> = ({
  isOpen,
  onClose,
  budgetData,
  workOrder,
  staffName = 'Técnico Especializado',
}) => {
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Robust JSON parsing for Go/PostgreSQL stringified budget payloads
  let parsedBudgetData = budgetData;
  if (typeof budgetData === 'string') {
    try { parsedBudgetData = JSON.parse(budgetData); } catch {}
  }

  // Support both camelCase budgetData AND snake_case budget_data
  const rawInner = parsedBudgetData?.budgetData ?? parsedBudgetData?.budget_data;
  if (rawInner) {
    let innerData = rawInner;
    if (typeof innerData === 'string') {
      try { innerData = JSON.parse(innerData); } catch {}
    }
    if (typeof innerData === 'object' && innerData !== null) {
      parsedBudgetData = { ...parsedBudgetData, ...innerData };
    }
  }

  const raw = parsedBudgetData || {
    title: 'Presupuesto de Mantenimiento Técnico',
    mode: 'MAINTENANCE',
    clientName: workOrder?.clientName || 'Cliente Registrado',
    clientDni: workOrder?.clientDni || 'No registrado',
    clientAddress: workOrder?.clientAddress || '',
    clientPhoneNumber: workOrder?.clientPhone || workOrder?.clientPhoneNumber || '',
    clientEmail: workOrder?.clientEmail || '',
    deviceModel: workOrder ? `${workOrder.deviceBrand ? workOrder.deviceBrand + ' ' : ''}${workOrder.deviceModel || ''}` : 'N/A',
    deviceSerialNumber: workOrder?.deviceSerialNumber || '',
    currency: '$',
    taxPercentage: 0,
    blocks: [],
    items: [],
    labors: [],
    advancePayments: [],
  };

  const cleanData = sanitizeBudgetForClient(raw) || {};

  // Robust dual mapping (camelCase & snake_case) to guarantee rendering on all devices
  const title = cleanData.title || cleanData.title_name || 'Presupuesto de Mantenimiento Técnico';
  const mode = cleanData.mode || 'MAINTENANCE';
  const clientName = cleanData.clientName || cleanData.client_name || workOrder?.clientName || 'Cliente Registrado';
  const clientDni = cleanData.clientDni || cleanData.client_dni || workOrder?.clientDni || 'No registrado';
  const clientAddress = cleanData.clientAddress || cleanData.client_address || workOrder?.clientAddress || workOrder?.client_address || '';
  const clientPhoneNumber = cleanData.clientPhoneNumber || cleanData.client_phone_number || cleanData.client_phone || workOrder?.clientPhone || workOrder?.clientPhoneNumber || workOrder?.client_phone || '';
  const clientEmail = cleanData.clientEmail || cleanData.client_email || workOrder?.clientEmail || workOrder?.client_email || '';
  const deviceModel = cleanData.deviceModel || cleanData.device_model || (workOrder ? `${workOrder.deviceBrand || workOrder?.device_brand ? (workOrder.deviceBrand || workOrder?.device_brand) + ' ' : ''}${workOrder.deviceModel || workOrder?.device_model || ''}` : '') || 'N/A';
  const deviceSerialNumber = cleanData.deviceSerialNumber || cleanData.device_serial_number || cleanData.device_serial || workOrder?.deviceSerialNumber || workOrder?.device_serial_number || '';
  const blocks = cleanData.blocks || cleanData.content_blocks || [];
  const items = cleanData.items || cleanData.budget_items || cleanData.row_items || [];
  const labors = cleanData.labors || cleanData.labor_costs || cleanData.labor_items || [];
  const advancePayments = cleanData.advancePayments || cleanData.advance_payments || [];
  const taxPercentage = cleanData.taxPercentage || cleanData.tax_percentage || 0;
  const currency = cleanData.currency || '$';
  const notes = cleanData.notes;
  const termsAndConditions = cleanData.termsAndConditions || cleanData.terms_and_conditions;

  // Proportionally scale A4 budget sheet on narrow mobile viewports so it fits edge-to-edge
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, budgetData, workOrder]);

  const handlePrintPDF = () => {
    printBudgetDocumentWithTitle(clientName, deviceModel);
  };

  const sharedDocProps = {
    title,
    mode,
    clientName,
    clientDni,
    clientAddress,
    clientPhoneNumber,
    clientEmail,
    deviceModel,
    deviceSerialNumber,
    blocks,
    items,
    labors,
    advancePayments,
    taxPercentage,
    currency,
    notes,
    termsAndConditions,
    staffName,
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="inset-0 top-0 left-0 translate-x-0 translate-y-0 w-full h-[100dvh] max-w-none max-h-none rounded-none p-0 overflow-hidden flex flex-col gap-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[94vw] sm:max-w-4xl lg:max-w-5xl sm:h-auto sm:max-h-[92vh] sm:rounded-lg bg-slate-100 border-slate-300 shadow-2xl no-print">
          <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-100 shrink-0 flex flex-row items-center justify-between gap-2 pr-12 sm:pr-12">
            <div className="min-w-0">
              <DialogTitle className="text-sm sm:text-base font-bold uppercase text-slate-900 flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-tertiary shrink-0" />
                <span className="truncate">Presupuesto Oficial</span>
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs font-mono text-slate-600 truncate">
                Visualización autorizada para cliente (Validez 10 días)
              </DialogDescription>
            </div>

            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <Button
                type="button"
                size="sm"
                onClick={handlePrintPDF}
                className="h-8 text-xs gap-1.5 bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground font-bold uppercase"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Descargar PDF</span>
              </Button>
            </div>
          </DialogHeader>

          {/* Auto-Scaled A4 Official Document Preview Container */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            <div ref={containerRef} className="w-full max-w-4xl mx-auto">
              <div
                className="overflow-hidden mx-auto"
                style={{
                  width: scale < 1 ? '100%' : undefined,
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
                          transformOrigin: 'top left',
                        }
                      : undefined
                  }
                >
                  <BudgetPaperContent {...sharedDocProps} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer for Mobile & Desktop */}
          <div className="px-4 py-3 sm:px-6 border-t border-slate-200 shrink-0 bg-white flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <p className="text-[11px] font-mono text-slate-600 text-center sm:text-left">
              Presupuesto emitido por <strong className="text-slate-900">{staffName}</strong>
            </p>
            <Button
              type="button"
              onClick={handlePrintPDF}
              className="w-full sm:w-auto bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground font-bold tracking-wider uppercase text-xs h-10 px-6 shadow-md gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Descargar PDF Oficial</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* High-Contrast A4 Printable Document Engine for Client PDF Downloads (Only mounted when modal is open) */}
      {isOpen && <PrintableBudgetDocument {...sharedDocProps} />}
    </>
  );
};
