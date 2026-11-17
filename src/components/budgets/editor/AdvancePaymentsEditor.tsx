'use client';

import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Wallet, Plus, Trash2, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BudgetAdvancePayment } from '@/types/budget';
import type { SaleNotePaymentMethod } from '@/types/sales-note';

const PAYMENT_METHOD_OPTIONS: Array<{ value: SaleNotePaymentMethod; label: string }> = [
  { value: 'CASH', label: 'Efectivo' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'MERCADOPAGO', label: 'MercadoPago' },
  { value: 'DEBIT', label: 'Débito' },
  { value: 'CREDIT', label: 'Crédito' },
];

interface AdvancePaymentsEditorProps {
  /**
   * When true (Work Order budgets persisted in Go backend), advance payments that
   * already have a persisted paidAt timestamp are locked to prevent 400 Bad Request.
   */
  lockPersisted?: boolean;
}

function generateAdvanceId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `adv_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `adv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export const AdvancePaymentsEditor: React.FC<AdvancePaymentsEditorProps> = ({
  lockPersisted = false,
}) => {
  const { register, control, watch } = useFormContext<{
    currency?: string;
    advancePayments?: BudgetAdvancePayment[];
  }>();

  const currency = watch('currency') || '$';
  const advancePayments = watch('advancePayments') || [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'advancePayments',
  });

  const advanceTotal = advancePayments.reduce(
    (acc, p) => acc + Math.max(0, Number(p.amount) || 0),
    0
  );

  const handleAddAdvance = () => {
    append({
      id: generateAdvanceId(),
      description: 'Entrega / Seña a cuenta',
      amount: 0,
      paymentMethod: 'CASH',
    });
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
        <div className="space-y-0.5">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
            Entrega / Señas por Adelantado
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Descuenta del saldo restante del cliente sin modificar el total ni los descuentos del presupuesto.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddAdvance}
          className="text-xs w-full sm:w-auto border-sky-500/40 text-sky-700 dark:text-sky-300 hover:bg-sky-500/10"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          + Agregar Entrega
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        {fields.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No se registraron entregas por adelantado. Haz clic en &quot;+ Agregar Entrega&quot; si el cliente dejó una seña.
          </p>
        ) : (
          <div className="space-y-2.5">
            {fields.map((field, index) => {
              const currentRow = advancePayments[index];
              const isLocked = lockPersisted && Boolean(currentRow?.paidAt);

              return (
                <div
                  key={field.id}
                  className="flex flex-col md:flex-row md:items-center gap-2 p-2.5 rounded-lg border bg-sky-500/5 border-sky-500/20"
                >
                  <input type="hidden" {...register(`advancePayments.${index}.id`)} />

                  <div className="flex-1 min-w-0">
                    <Label className="text-[10px] uppercase font-mono text-muted-foreground md:hidden">
                      Detalle de la entrega
                    </Label>
                    <Input
                      {...register(`advancePayments.${index}.description`)}
                      placeholder="Ej. Seña inicial en efectivo / transferencia..."
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-[1fr_1fr_auto] sm:flex sm:items-center gap-2 w-full md:w-auto">
                    <div className="min-w-0 sm:w-36 sm:shrink-0">
                      <select
                        {...register(`advancePayments.${index}.paymentMethod`)}
                        disabled={isLocked}
                        className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {PAYMENT_METHOD_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="min-w-0 sm:w-32 sm:shrink-0">
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        readOnly={isLocked}
                        {...register(`advancePayments.${index}.amount`, { valueAsNumber: true })}
                        placeholder="Monto"
                        className={`h-8 text-xs text-right font-semibold bg-background w-full ${
                          isLocked ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>

                    {isLocked ? (
                      <Badge
                        variant="outline"
                        className="h-8 px-2 text-[10px] gap-1 border-sky-500/40 text-sky-700 dark:text-sky-300 shrink-0"
                        title="Seña ya registrada en Caja. Para devolverla o corregirla, registrá un egreso REFUND en Caja."
                      >
                        <Lock className="w-3 h-3" />
                        Caja
                      </Badge>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-8 w-8 text-destructive shrink-0"
                        title="Quitar entrega"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {advanceTotal > 0 && (
          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Total Entregas / Señas:</span>
            <span className="font-bold text-sky-700 dark:text-sky-300 font-mono text-sm">
              {currency} {advanceTotal.toFixed(2)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
