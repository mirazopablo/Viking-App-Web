'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quickQuoteFormSchema, QuickQuoteFormSchemaType } from '@/lib/validations/quick-quote';
import { QuotesEditor } from './editor/QuotesEditor';
import { QuotesLivePreview } from './preview/QuotesLivePreview';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye, Edit3, Columns, ArrowLeft, Printer } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'split' | 'tabs'>('split');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvedStaffName, setResolvedStaffName] = useState(staffName);

  useEffect(() => {
    if (!resolvedStaffName && typeof window !== 'undefined') {
      const storedName = localStorage.getItem('viking_user_name');
      if (storedName) {
        setResolvedStaffName(storedName);
      }
    }
  }, [resolvedStaffName]);

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
    window.print();
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
        // eslint-disable-next-line react-hooks/purity
        const generatedId = quoteId === 'new_quote' ? crypto.randomUUID() : quoteId;
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
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b no-print">
          <div className="flex items-center gap-3">
            {onCancel && (
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Volver
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Presupuestario General
              </h1>
              <p className="text-xs text-muted-foreground">
                Generador rápido de presupuestos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

            {/* Print PDF Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintPDF}
              className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
            >
              <Printer className="w-4 h-4" />
              Descargar PDF
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

        {/* Main Content Area */}
        {viewMode === 'split' ? (
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
        ) : (
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'edit' | 'preview')}>
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-4 no-print">
              <TabsTrigger value="edit" className="gap-2 text-xs">
                <Edit3 className="w-4 h-4" /> Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2 text-xs">
                <Eye className="w-4 h-4" /> Simulador en Vivo
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="no-print">
              <QuotesEditor />
            </TabsContent>
            <TabsContent value="preview">
              <QuotesLivePreview staffName={resolvedStaffName} />
            </TabsContent>
          </Tabs>
        )}
      </form>

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
