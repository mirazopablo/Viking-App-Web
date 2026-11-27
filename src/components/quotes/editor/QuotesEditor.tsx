'use client';

import React from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { 
  Wrench, 
  Cpu, 
  FileText, 
  DollarSign, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  User, 
  Laptop,
  TrendingUp,
  Coins
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DocumentInput } from '@/components/shared/document-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickQuoteFormSchemaType } from '@/lib/validations/quick-quote';
import { DynamicBlocksEditor } from './DynamicBlocksEditor';
import { QuotesItemsTableEditor } from './QuotesItemsTableEditor';
import { AdvancePaymentsEditor } from '@/components/budgets/editor/AdvancePaymentsEditor';
export const QuotesEditor: React.FC = () => {
  const { register, watch, setValue, control, formState: { errors } } = useFormContext<QuickQuoteFormSchemaType>();

  const currentMode = watch('mode');
  const currency = watch('currency') || '$';
  const items = watch('items') || [];
  const labors = watch('labors') || [];

  const {
    fields: laborFields,
    append: appendLabor,
    remove: removeLabor,
  } = useFieldArray({
    control,
    name: 'labors',
  });

  // Calculate Internal Workshop Profitability Metrics
  const sparePartsCost = items.reduce((acc, item) => {
    if (item.rowType === 'SPARE_PART_ITEM') {
      return acc + (item.quantity || 0) * (item.costPrice || 0);
    }
    return acc;
  }, 0);

  const sparePartsProfit = items.reduce((acc, item) => {
    if (item.rowType === 'SPARE_PART_ITEM') {
      return acc + (item.profitAmount || 0);
    }
    return acc;
  }, 0);

  const laborTotal = labors.reduce((acc, l) => acc + (l.amount || 0), 0);
  const totalEstimatedProfit = laborTotal + sparePartsProfit;

  return (
    <div className="space-y-6">
      {/* Quick Lookup Toolbar & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 bg-muted/40 rounded-xl border">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
            Modo del Presupuesto:
          </Label>
          <div className="grid grid-cols-1 sm:flex items-center p-1 bg-background border rounded-lg gap-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setValue('mode', 'MAINTENANCE', { shouldDirty: true })}
              className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentMode === 'MAINTENANCE'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              Mantenimiento y Reparación
            </button>
            <button
              type="button"
              onClick={() => setValue('mode', 'NEW_EQUIPMENT', { shouldDirty: true })}
              className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentMode === 'NEW_EQUIPMENT'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 shrink-0" />
              Armado de Equipo Nuevo
            </button>
          </div>
        </div>

        {/* No Diagnostic Points in Quick Quotes */}
      </div>

      {/* Header Info Card: Title Input + Literal Read-Only Customer & Device Cards */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Encabezado del Presupuesto
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-medium">Título del Presupuesto</Label>
            <Input
              {...register('title')}
              placeholder="Ej. Presupuesto Mantenimiento General y Cambio SSD"
              className="mt-1 text-sm h-9"
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>

          {/* Editable Client & Device Inputs for Quick Quote */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. TITULAR / CLIENTE Card */}
            <div className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    TITULAR / CLIENTE
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 md:col-span-1">
                  <Label className="text-xs text-muted-foreground uppercase font-mono block mb-1">NOMBRE COMPLETO</Label>
                  <Input {...register('clientName')} className="h-8 text-xs font-semibold" placeholder="Ej. Juan Pérez" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Label className="text-xs text-muted-foreground uppercase font-mono block mb-1">DNI / CUIT</Label>
                  <Controller
                    name="clientDni"
                    control={control}
                    render={({ field }) => (
                      <DocumentInput
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Opcional"
                        inputClassName="h-8"
                      />
                    )}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Label className="text-xs text-muted-foreground uppercase font-mono block mb-1">TELÉFONO</Label>
                  <Input {...register('clientPhoneNumber')} className="h-8 text-xs font-mono" placeholder="Opcional" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Label className="text-xs text-muted-foreground uppercase font-mono block mb-1">DIRECCIÓN</Label>
                  <Input {...register('clientAddress')} className="h-8 text-xs" placeholder="Opcional" />
                </div>
                <div className="col-span-2 border-t pt-2">
                  <Label className="text-xs text-muted-foreground uppercase font-mono block mb-1">EMAIL</Label>
                  <Input {...register('clientEmail')} className="h-8 text-xs font-mono" placeholder="Opcional" />
                </div>
              </div>
            </div>

            {/* 2. DISPOSITIVO / EQUIPO EN TALLER Card */}
            <div className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    HARDWARE / EQUIPO
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-mono block mb-1">MARCA Y MODELO</Label>
                  <Input {...register('deviceModel')} className="h-8 text-sm font-extrabold uppercase tracking-wide" placeholder="Ej. Lenovo ThinkPad T480" />
                </div>
                <div className="pt-2 border-t">
                  <Label className="text-xs text-muted-foreground uppercase font-mono block mb-1">N° DE SERIE / IMEI</Label>
                  <Input {...register('deviceSerialNumber')} className="h-8 text-xs font-mono" placeholder="Opcional" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reactive Resume Style Dynamic Content Blocks */}
      <DynamicBlocksEditor />

      {/* Flexible Budget Items Table (Supports SPARE_PART_ITEM with Cost + Profit %) */}
      <QuotesItemsTableEditor />

      {/* Labor Costs & Internal Workshop Profitability Banner */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary shrink-0" />
            Mano de Obra y Costos Adicionales
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendLabor({ description: 'Mano de Obra Técnica / Armado', amount: 0 })}
            className="text-xs w-full sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            + Mano de Obra
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {laborFields.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No se agregaron costos de mano de obra. Haz clic arriba si aplica.</p>
          ) : (
            laborFields.map((field, index) => (
              <div key={field.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2.5 sm:p-0 rounded-lg border sm:border-0 bg-muted/20 sm:bg-transparent">
                <Input
                  {...register(`labors.${index}.description`)}
                  placeholder="Descripción del servicio técnico..."
                  className="h-8 text-xs flex-1"
                />
                <div className="flex items-center gap-2 justify-end">
                  <div className="flex-1 sm:w-32 sm:flex-none">
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      {...register(`labors.${index}.amount`, { valueAsNumber: true })}
                      placeholder="Monto"
                      className="h-8 text-xs text-right font-semibold"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLabor(index)}
                    className="h-8 w-8 text-destructive shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}

          {/* Internal Profitability Metrics Dashboard Banner (For Technicians / Admin Only) */}
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                Métricas Internas de Rentabilidad (Taller)
              </div>
              <p className="text-[11px] text-muted-foreground">
                Costo en repuestos: <span className="font-semibold text-foreground">{currency} {sparePartsCost.toFixed(2)}</span> | Utilidad en repuestos: <span className="font-semibold text-foreground">+{currency} {sparePartsProfit.toFixed(2)}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-md border border-emerald-500/40 text-emerald-900 dark:text-emerald-100 font-bold">
              <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ganancia Estimada Total:</span>
              <span className="text-sm font-extrabold">{currency} {totalEstimatedProfit.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium">Porcentaje de Impuesto / IVA (%)</Label>
              <Input
                type="number"
                step="0.1"
                min={0}
                max={100}
                {...register('taxPercentage', { valueAsNumber: true })}
                className="mt-1 text-xs h-8 w-32"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Símbolo de Moneda</Label>
              <Input {...register('currency')} placeholder="$" className="mt-1 text-xs h-8 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes & Terms */}
      <AdvancePaymentsEditor />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            Aclaraciones, Garantía y Términos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-medium">Notas Generales / Condiciones de Validez</Label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Ej. Presupuesto válido por 10 días corridos. Incluye 90 días de garantía en repuestos."
              className="w-full mt-1 p-2 rounded-md border border-input bg-background text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div>
            <Label className="text-xs font-medium">Términos y Condiciones</Label>
            <textarea
              {...register('termsAndConditions')}
              rows={2}
              placeholder="Términos legales, condiciones de pago o seña..."
              className="w-full mt-1 p-2 rounded-md border border-input bg-background text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
