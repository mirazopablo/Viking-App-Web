'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { BudgetDocumentHeader } from '../preview/BudgetDocumentHeader';
import { BudgetDocumentBlocks } from '../preview/BudgetDocumentBlocks';
import { BudgetDocumentTable } from '../preview/BudgetDocumentTable';
import { PrintableBudgetDocument } from '../preview/PrintableBudgetDocument';
import { sanitizeBudgetForClient } from '@/types/budget';

interface PublicBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetData: any;
  workOrder?: any;
  staffName?: string;
}

export const PublicBudgetModal: React.FC<PublicBudgetModalProps> = ({
  isOpen,
  onClose,
  budgetData,
  workOrder,
  staffName = 'Técnico Especializado',
}) => {
  // Robust JSON parsing for Go/PostgreSQL stringified budget payloads
  let parsedBudgetData = budgetData;
  if (typeof budgetData === 'string') {
    try { parsedBudgetData = JSON.parse(budgetData); } catch {}
  }

  if (parsedBudgetData?.budgetData) {
    let innerData = parsedBudgetData.budgetData;
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
  };

  const cleanData = sanitizeBudgetForClient(raw) || {};

  console.log('🔍 [PublicBudgetModal] Render State -> isOpen:', isOpen, '| hasBudgetData:', !!budgetData, '| hasWorkOrder:', !!workOrder);
  console.log('🔍 [PublicBudgetModal] Raw budgetData received:', budgetData);
  console.log('🔍 [PublicBudgetModal] Clean parsed data for view:', cleanData);

  const title = cleanData.title || 'Presupuesto de Mantenimiento Técnico';
  const mode = cleanData.mode || 'MAINTENANCE';
  const clientName = cleanData.clientName || workOrder?.clientName || 'Cliente Registrado';
  const clientDni = cleanData.clientDni || workOrder?.clientDni || 'No registrado';
  const clientAddress = cleanData.clientAddress || workOrder?.clientAddress || '';
  const clientPhoneNumber = cleanData.clientPhoneNumber || workOrder?.clientPhone || workOrder?.clientPhoneNumber || '';
  const clientEmail = cleanData.clientEmail || workOrder?.clientEmail || '';
  const deviceModel = cleanData.deviceModel || (workOrder ? `${workOrder.deviceBrand ? workOrder.deviceBrand + ' ' : ''}${workOrder.deviceModel || ''}` : '') || 'N/A';
  const deviceSerialNumber = cleanData.deviceSerialNumber || workOrder?.deviceSerialNumber || '';
  const blocks = cleanData.blocks || [];
  const items = cleanData.items || [];
  const labors = cleanData.labors || [];
  const taxPercentage = cleanData.taxPercentage || 0;
  const currency = cleanData.currency || '$';
  const notes = cleanData.notes;
  const termsAndConditions = cleanData.termsAndConditions;

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-3xl lg:max-w-5xl lg:w-[900px] max-h-[92vh] overflow-y-auto bg-card border-border shadow-2xl p-4 sm:p-6 no-print">
          <DialogHeader className="pb-3 border-b flex flex-row items-center justify-between gap-2">
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold uppercase text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-tertiary" />
                Presupuesto Oficial de Taller
              </DialogTitle>
              <DialogDescription className="text-xs font-mono text-typography">
                Visualización autorizada para cliente (Validez 10 días)
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrintPDF}
                className="h-8 text-xs gap-1.5 border-primary/50 text-primary hover:bg-primary/10 font-bold uppercase"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Descargar</span> PDF
              </Button>
            </div>
          </DialogHeader>

          {/* Client Document Body (Responsive Mobile Container) */}
          <div className="space-y-6 pt-3">
            {/* Header with Client PII */}
            <BudgetDocumentHeader
              title={title}
              mode={mode}
              clientName={clientName}
              clientDni={clientDni}
              clientAddress={clientAddress}
              clientPhoneNumber={clientPhoneNumber}
              clientEmail={clientEmail}
              deviceModel={deviceModel}
              deviceSerialNumber={deviceSerialNumber}
              currency={currency}
            />

            {/* Dynamic Content Blocks */}
            <BudgetDocumentBlocks blocks={blocks} />

            {/* Table & Totals (Strictly Sanitized Public View) */}
            <BudgetDocumentTable
              items={items}
              labors={labors}
              taxPercentage={taxPercentage}
              currency={currency}
              mode={mode}
            />

            {/* Notes & Terms */}
            {(notes || termsAndConditions) && (
              <div className="pt-4 border-t space-y-3 text-xs">
                {notes && (
                  <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                    <h5 className="font-semibold text-foreground">Aclaraciones y Observaciones</h5>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{notes}</p>
                  </div>
                )}

                {termsAndConditions && (
                  <div className="p-3 border border-dashed rounded-lg space-y-1 text-muted-foreground">
                    <h5 className="font-semibold text-foreground flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                      Términos y Condiciones
                    </h5>
                    <p className="leading-relaxed whitespace-pre-line text-[11px]">{termsAndConditions}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action Footer for Mobile */}
          <div className="pt-4 mt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] font-mono text-muted-foreground text-center sm:text-left">
              Presupuesto emitido por <strong className="text-foreground">{staffName}</strong>
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

      {/* High-Contrast A4 Printable Document Engine for Client PDF Downloads */}
      <PrintableBudgetDocument
        title={title}
        mode={mode}
        clientName={clientName}
        clientDni={clientDni}
        clientAddress={clientAddress}
        clientPhoneNumber={clientPhoneNumber}
        clientEmail={clientEmail}
        deviceModel={deviceModel}
        deviceSerialNumber={deviceSerialNumber}
        blocks={blocks}
        items={items}
        labors={labors}
        taxPercentage={taxPercentage}
        currency={currency}
        notes={notes}
        termsAndConditions={termsAndConditions}
        staffName={staffName}
      />
    </>
  );
};
