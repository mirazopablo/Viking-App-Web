'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { budgetFormSchema, BudgetFormSchemaType } from '@/lib/validations/budget';
import { BudgetEditor } from './editor/BudgetEditor';
import { BudgetLivePreview } from './preview/BudgetLivePreview';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye, Edit3, Columns, ArrowLeft, Printer, CheckCircle2 } from 'lucide-react';
import { DiagnosticPointResponseDTO } from '@/types/diagnostic';
import { diagnosticService } from '@/services/diagnostic.service';
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

interface BudgetBuilderProps {
  workOrderId: string;
  budgetId?: string;
  initialClientName?: string;
  initialClientDni?: number | string;
  initialClientAddress?: string;
  initialClientPhone?: string;
  initialClientEmail?: string;
  initialDeviceModel?: string;
  initialDeviceSerial?: string;
  diagnosticPoints?: DiagnosticPointResponseDTO[];
  staffName?: string;
  onSave?: (data: BudgetFormSchemaType) => Promise<void>;
  onDelete?: () => Promise<void> | void;
  onCancel?: () => void;
}

export const BudgetBuilder: React.FC<BudgetBuilderProps> = ({
  workOrderId,
  budgetId,
  initialClientName = '',
  initialClientDni = '',
  initialClientAddress = '',
  initialClientPhone = '',
  initialClientEmail = '',
  initialDeviceModel = '',
  initialDeviceSerial = '',
  diagnosticPoints = [],
  staffName = '',
  onSave,
  onDelete,
  onCancel,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'tabs'>('split');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<BudgetFormSchemaType>({
    resolver: zodResolver(budgetFormSchema) as never,
    defaultValues: {
      workOrderId,
      title: 'Presupuesto de Mantenimiento Técnico y Equipamiento',
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
          title: 'Diagnóstico Inicial y Estado del Equipo',
          content: 'El equipo ingresó al taller técnico para evaluación completa, diagnóstico de fallas y pruebas de estrés.',
        },
      ],
      items: [],
      labors: [
        {
          description: 'Mano de Obra Técnica y Ensamblado',
          amount: 0,
        },
      ],
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
    if (typeof window !== 'undefined' && workOrderId) {
      try {
        const savedJson = localStorage.getItem(`viking_budget_${workOrderId}`);
        if (savedJson) {
          const parsed = JSON.parse(savedJson);
          methods.reset(parsed);
        }
      } catch (err) {
        console.warn('Could not load saved local budget:', err);
      }
    }
  }, [workOrderId, methods]);

  const handlePrintPDF = () => {
    window.print();
  };

  const onSubmit = async (data: BudgetFormSchemaType) => {
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

      // 2. Persist JSON data locally for immediate dual web rendering
      if (typeof window !== 'undefined') {
        localStorage.setItem(`viking_budget_${workOrderId}`, JSON.stringify(data));
      }

      if (onSave) {
        await onSave(data);
      }

      toast.success('¡Presupuesto guardado, publicado y registrado en la bitácora!', {
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
                Creador y Simulador Dinámico de Presupuestos
              </h1>
              <p className="text-xs text-muted-foreground">
                Orden de Trabajo N°: <span className="font-mono text-foreground font-semibold">{workOrderId}</span>
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
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="gap-1.5 font-bold uppercase text-xs shadow-md"
                title="Eliminar Presupuesto Permanentemente (Hard Delete)"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            )}

            {/* Save Button */}
            <Button type="submit" disabled={isSubmitting} className="gap-2 shadow-md">
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Guardando Presupuesto...' : 'Guardar y Publicar Presupuesto'}
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form Editor */}
            <div className="lg:col-span-7 space-y-6 no-print">
              <BudgetEditor diagnosticPoints={diagnosticPoints} />
            </div>

            {/* Right Column: Live Visual Simulator */}
            <div className="lg:col-span-5">
              <BudgetLivePreview staffName={staffName} />
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
              <BudgetEditor diagnosticPoints={diagnosticPoints} />
            </TabsContent>
            <TabsContent value="preview">
              <BudgetLivePreview staffName={staffName} />
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
              Eliminar Presupuesto Permanentemente
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              ¿Estás seguro de que deseas eliminar permanentemente este presupuesto? Esta acción ejecutará un <strong>borrado físico irreversible</strong> en el servidor PostgreSQL. El cliente ya no podrá consultarlo en la vista pública ni en PDF.
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
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar permanentemente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormProvider>
  );
};
