'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quickQuoteFormSchema, QuickQuoteFormSchemaType } from '@/lib/validations/quick-quote';
import { QuotesEditor } from './editor/QuotesEditor';
import { QuotesLivePreview } from './preview/QuotesLivePreview';
import { printBudgetDocumentWithTitle } from '@/components/budgets/preview/PrintableBudgetDocument';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Save, Eye, Edit3, Columns, ArrowLeft, Printer, Receipt, FileText, FileSpreadsheet } from 'lucide-react';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { saveBillingPrefillFromQuote } from '@/lib/quote-to-billing';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface QuickQuoteBuilderProps {
  quoteId?: string;
  initialClientName?: string;
  initialClientDni?: number | string;
  initialClientAddress?: string;
  initialClientPhone?: string;
  initialClientEmail?: string;
  initialDeviceModel?: string;
  initialDeviceSerial?: string;
  staffName?: string;
  onSave?: (data: QuickQuoteFormSchemaType) => Promise<void>;
  onDelete?: () => Promise<void> | void;
  onCancel?: () => void;
}

function createLocalQuoteId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const QuickQuoteBuilder: React.FC<QuickQuoteBuilderProps> = ({
  quoteId = 'new_quote',
  initialClientName = '',
  initialClientDni = '',
  initialClientAddress = '',
  initialClientPhone = '',
  initialClientEmail = '',
  initialDeviceModel = '',
  initialDeviceSerial = '',
  staffName = '',
  onSave,
  onDelete,
  onCancel,
}) => {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [viewMode, setViewMode] = useState<'split' | 'tabs'>('split');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const storedStaffName = useSyncExternalStore(
    () => () => {},
    () => localStorage.getItem('viking_user_name') || '',
    () => ''
  );
  const resolvedStaffName = staffName || storedStaffName;

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete();
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const methods = useForm<QuickQuoteFormSchemaType>({
    resolver: zodResolver(quickQuoteFormSchema) as never,
    defaultValues: {
      title: 'Presupuesto de Mantenimiento / Equipamiento',
      mode: 'MAINTENANCE',
      clientName: initialClientName,
      clientDni: initialClientDni,
      clientAddress: initialClientAddress,
      clientPhoneNumber: initialClientPhone,
      clientEmail: initialClientEmail,
      deviceModel: initialDeviceModel,
      deviceSerialNumber: initialDeviceSerial,
      currency: '$',
      taxPercentage: 0,
      blocks: [
        {
          id: `block_init_1`,
          type: 'TEXT_PARAGRAPH',
          title: 'Detalles Generales',
          content: 'Presupuesto rápido generado en taller.',
        },
      ],
      items: [],
      labors: [],
      notes: 'Presupuesto válido por 10 días corridos. Precios sujetos a disponibilidad de stock de repuestos.',
      termsAndConditions: 'Todos los componentes sustituidos cuentan con 90 días de garantía oficial de taller Viking Tech.',
    },
  });

  // Re-sync client fields if initial props load asynchronously from backend
  useEffect(() => {
    if (initialClientName) methods.setValue('clientName', initialClientName);
    if (initialClientDni) methods.setValue('clientDni', initialClientDni);
    if (initialClientAddress) methods.setValue('clientAddress', initialClientAddress);
    if (initialClientPhone) methods.setValue('clientPhoneNumber', initialClientPhone);
    if (initialClientEmail) methods.setValue('clientEmail', initialClientEmail);
    if (initialDeviceModel) methods.setValue('deviceModel', initialDeviceModel);
    if (initialDeviceSerial) methods.setValue('deviceSerialNumber', initialDeviceSerial);
  }, [initialClientName, initialClientDni, initialClientAddress, initialClientPhone, initialClientEmail, initialDeviceModel, initialDeviceSerial, methods]);

  // Load previously saved local budget if present
  useEffect(() => {
    if (typeof window !== 'undefined' && quoteId !== 'new_quote') {
      try {
        const savedJson = localStorage.getItem(`viking_quick_quote_${quoteId}`);
        if (savedJson) {
          const parsed = JSON.parse(savedJson);
          methods.reset(parsed);
        }
      } catch (err) {
        console.warn('Could not load saved local quote:', err);
      }
    }
  }, [quoteId, methods]);

  const handlePrintPDF = () => {
    const values = methods.getValues();
    printBudgetDocumentWithTitle(values.clientName, values.deviceModel);
  };

  const handleConvertToBilling = (target: 'sale-note' | 'invoice-c') => {
    const currentValues = methods.getValues();
    saveBillingPrefillFromQuote(currentValues);
    setIsConvertDialogOpen(false);
    if (target === 'sale-note') {
      router.push('/billing/sales-notes/new?from=quote');
    } else {
      router.push('/billing/new?from=quote');
    }
  };

  const onSubmit = async (data: QuickQuoteFormSchemaType) => {
    try {
      setIsSubmitting(true);

      // 1. Calculate Summary Totals
      const itemsSubtotal = (data.items || []).reduce((acc, item) => {
        if (item.rowType === 'REGULAR_ITEM' || item.rowType === 'SPARE_PART_ITEM' || item.rowType === 'HIDDEN_UNIT_PRICE_ITEM') {
          return acc + (item.quantity || 0) * (item.unitPrice || 0);
        }
        return acc;
      }, 0);

      const laborTotal = (data.labors || []).reduce((acc, l) => acc + (l.amount || 0), 0);
      const grandTotal = itemsSubtotal + laborTotal;
      const currency = data.currency || '$';

      if (typeof window !== 'undefined') {
        const generatedId = quoteId === 'new_quote' ? createLocalQuoteId() : quoteId;
        localStorage.setItem(`viking_quick_quote_${generatedId}`, JSON.stringify(data));
      }

      if (onSave) {
        await onSave(data);
      }

      toast.success('¡Presupuesto guardado!', {
        description: `Total General: ${currency} ${grandTotal.toFixed(2)}`,
        action: {
          label: 'Descargar PDF',
          onClick: handlePrintPDF,
        },
      });
    } catch (error) {
      console.error('Error al guardar presupuesto:', error);
      toast.error('Error al guardar el presupuesto. Revisa los datos ingresados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        {/* Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b no-print">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0">
            {onCancel && (
              <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="shrink-0 px-2 sm:px-3">
                <ArrowLeft className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Volver</span>
              </Button>
            )}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground truncate">
                Presupuestario General
              </h1>
              <p className="text-xs text-muted-foreground">
                Generador rápido de presupuestos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            {/* View Mode Toggle Buttons */}
            <div className="hidden lg:flex items-center p-1 bg-muted rounded-lg border">
              <Button
                type="button"
                variant={viewMode === 'split' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('split')}
                className="h-7 text-xs px-2.5"
              >
                <Columns className="w-3.5 h-3.5 mr-1" />
                Vista Dividida
              </Button>
              <Button
                type="button"
                variant={viewMode === 'tabs' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tabs')}
                className="h-7 text-xs px-2.5"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Vista Solapas
              </Button>
            </div>

            {/* Convert to Sale Note X or Factura C */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsConvertDialogOpen(true)}
              className="gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              <Receipt className="w-4 h-4" />
              <span>Facturar / Nota X</span>
            </Button>

            {/* Print PDF Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintPDF}
              className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Descargar PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>

            {/* Hard Delete Button (If existing budget) */}
            {onDelete && quoteId !== 'new_quote' && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="gap-1.5 font-bold uppercase text-xs shadow-md"
                title="Eliminar Presupuesto Permanentemente"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            )}

            {/* Save Button */}
            <Button type="submit" disabled={isSubmitting} className="gap-2 shadow-md">
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>

        {/* Main Content Area: mount Editor and LivePreview only once to keep react-hook-form refs unique */}
        {!isDesktop || viewMode === 'tabs' ? (
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'edit' | 'preview')}>
            <TabsList className="grid w-full lg:max-w-md grid-cols-2 mb-4 no-print">
              <TabsTrigger value="edit" className="gap-2 text-xs">
                <Edit3 className="w-4 h-4" /> Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2 text-xs">
                <Eye className="w-4 h-4" /> {isDesktop ? 'Simulador en Vivo' : 'Simulador'}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="no-print">
              <QuotesEditor />
            </TabsContent>
            <TabsContent value="preview" forceMount className="data-[state=inactive]:hidden">
              <QuotesLivePreview staffName={resolvedStaffName} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form Editor */}
            <div className="lg:col-span-7 space-y-6 no-print">
              <QuotesEditor />
            </div>

            {/* Right Column: Live Visual Simulator */}
            <div className="lg:col-span-5">
              <QuotesLivePreview staffName={resolvedStaffName} />
            </div>
          </div>
        )}
      </form>

      {/* Convert Quote to Commercial Document Modal */}
      <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Receipt className="w-4 h-4 text-emerald-500" />
              Pasar Presupuesto a Comprobante
            </DialogTitle>
            <DialogDescription className="text-xs">
              Se precargarán cliente, ítems y mano de obra para que ajustes datos fiscales, DNI o medio de pago antes de emitir.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleConvertToBilling('sale-note')}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-left transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-foreground">
                  Nota de Venta [ X ]
                </p>
                <p className="text-xs text-muted-foreground">
                  Comprobante interno no fiscal. Conserva precios, costos de repuestos y descuentos.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleConvertToBilling('invoice-c')}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-left transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-foreground">
                  Factura C Oficial [ AFIP / ARCA ]
                </p>
                <p className="text-xs text-muted-foreground">
                  Comprobante fiscal. Te pedirá verificar o completar DNI / CUIT y condición frente al IVA.
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Critical Hard Delete Confirmation Modal */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Eliminar Presupuesto
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              ¿Estás seguro de que deseas eliminar permanentemente este presupuesto?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="font-bold tracking-wider uppercase text-xs"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormProvider>
  );
};
