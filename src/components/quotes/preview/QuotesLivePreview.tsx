'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { QuickQuoteFormSchemaType } from '@/lib/validations/quick-quote';
import { QuotesDocumentHeader } from './QuotesDocumentHeader';
import { QuotesDocumentBlocks } from './QuotesDocumentBlocks';
import { QuotesDocumentTable } from './QuotesDocumentTable';
import { PrintableQuotesDocument } from './PrintableQuotesDocument';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, ShieldAlert, Printer } from 'lucide-react';

interface QuotesLivePreviewProps {
  staffName?: string;
}

export const QuotesLivePreview: React.FC<QuotesLivePreviewProps> = ({ staffName }) => {
  const { watch } = useFormContext<QuickQuoteFormSchemaType>();

  const title = watch('title');
  const mode = watch('mode') || 'MAINTENANCE';
  const clientName = watch('clientName');
  const clientDni = watch('clientDni');
  const clientAddress = watch('clientAddress');
  const clientPhoneNumber = watch('clientPhoneNumber');
  const clientEmail = watch('clientEmail');
  const deviceModel = watch('deviceModel');
  const deviceSerialNumber = watch('deviceSerialNumber');
  const blocks = watch('blocks') || [];
  const items = watch('items') || [];
  const labors = watch('labors') || [];
  const taxPercentage = watch('taxPercentage') || 0;
  const currency = watch('currency') || '$';
  const notes = watch('notes');
  const termsAndConditions = watch('termsAndConditions');

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <>
      {/* CSS Rules for Clean A4 PDF Print Isolation */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          html, body {
            background: white !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print,
          header,
          footer,
          nav,
          aside {
            display: none !important;
          }
          #viking-printable-budget-document {
            display: block !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            min-height: 100vh !important;
            height: auto !important;
            z-index: 99999 !important;
            padding: 20px !important;
            margin: 0 !important;
            background: white !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
            max-height: none !important;
          }
          #viking-printable-budget-document * {
            max-height: none !important;
            overflow: visible !important;
          }
        }
      `}</style>

      {/* Screen Interactive Visual Simulator */}
      <Card className="border border-border/80 shadow-lg bg-card overflow-hidden sticky top-6 no-print">
        <div className="bg-muted/60 px-4 py-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5 text-primary" />
            Simulador de Documento en Vivo
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintPDF}
              className="h-7 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10"
              title="Imprimir o Guardar en PDF para enviar por WhatsApp"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </Button>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
              Previsualización PDF Cliente
            </span>
          </div>
        </div>

        <CardContent className="p-6 space-y-6 max-h-[82vh] overflow-y-auto bg-background/50">
          {/* Header with Client PII */}
          <QuotesDocumentHeader
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
          <QuotesDocumentBlocks blocks={blocks} />

          {/* Table & Totals (PRIVACY ENFORCED: SPARE_PART_ITEM renders only final calculated price) */}
          <QuotesDocumentTable
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
                  <h5 className="font-semibold text-foreground">Aclaraciones y Notas de Mantenimiento</h5>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{notes}</p>
                </div>
              )}

              {termsAndConditions && (
                <div className="p-3 border border-dashed rounded-lg space-y-1 text-muted-foreground">
                  <h5 className="font-semibold text-foreground flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    Términos y Condiciones
                  </h5>
                  <p className="leading-relaxed whitespace-pre-line text-[11px]">{termsAndConditions}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* High-Contrast Space-Saving Modular Printable PDF Document */}
      <PrintableQuotesDocument
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
