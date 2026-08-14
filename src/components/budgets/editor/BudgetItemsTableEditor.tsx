'use client';

import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ShoppingCart, 
  Tag, 
  EyeOff, 
  FolderPlus, 
  GripVertical,
  Wrench,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetFormSchemaType } from '@/lib/validations/budget';
import { TableRowType } from '@/types/budget';

export const BudgetItemsTableEditor: React.FC = () => {
  const { register, control, watch, setValue } = useFormContext<BudgetFormSchemaType>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'items',
  });

  const budgetMode = watch('mode');
  const currency = watch('currency') || '$';

  const addItemRow = (rowType: TableRowType) => {
    const newId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    if (rowType === 'SPARE_PART_ITEM') {
      append({
        id: newId,
        rowType: 'SPARE_PART_ITEM',
        description: '',
        quantity: 1,
        costPrice: 0,
        profitMarginPercentage: 30,
        unitPrice: 0,
        profitAmount: 0,
      });
    } else if (rowType === 'REGULAR_ITEM') {
      append({
        id: newId,
        rowType: 'REGULAR_ITEM',
        description: '',
        quantity: 1,
        unitPrice: 0,
      });
    } else if (rowType === 'BONIFICATION') {
      append({
        id: newId,
        rowType: 'BONIFICATION',
        description: 'Descuento Especial / Cortesía Taller',
        quantity: 1,
        unitPrice: 0,
        discountAmount: 0,
        isPercentageDiscount: false,
        isFree: true,
      });
    } else if (rowType === 'HIDDEN_UNIT_PRICE_ITEM') {
      append({
        id: newId,
        rowType: 'HIDDEN_UNIT_PRICE_ITEM',
        description: '',
        quantity: 1,
        unitPrice: 0,
        vendorGroup: 'Componente Armado PC',
        showUnitPrice: false,
      });
    } else if (rowType === 'SUBTOTAL_GROUP') {
      append({
        id: newId,
        rowType: 'SUBTOTAL_GROUP',
        description: 'Encabezado de Grupo',
        quantity: 0,
        unitPrice: 0,
        groupTitle: 'Subtotal Grupo',
      });
    }
  };

  const handleSparePartChange = (
    index: number,
    cost: number,
    marginPct: number,
    qty: number
  ) => {
    const safeCost = Math.max(0, cost || 0);
    const safeMargin = Math.max(0, marginPct || 0);
    const safeQty = Math.max(1, qty || 1);

    const calculatedUnitPrice = safeCost * (1 + safeMargin / 100);
    const calculatedProfit = safeQty * (safeCost * (safeMargin / 100));

    setValue(`items.${index}.unitPrice`, calculatedUnitPrice, { shouldDirty: true });
    setValue(`items.${index}.profitAmount`, calculatedProfit, { shouldDirty: true });
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-3 gap-2">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Tabla de Ítems y Repuestos
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Configura repuestos con cálculo automático (Costo + % Utilidad), productos, bonificaciones o grupos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => addItemRow('SPARE_PART_ITEM')}
            className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
          >
            <Wrench className="w-3.5 h-3.5 mr-1" />
            + Repuesto (Costo + % Utilidad)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItemRow('REGULAR_ITEM')}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            + Ítem Regular
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItemRow('BONIFICATION')}
            className="text-xs"
          >
            <Tag className="w-3.5 h-3.5 mr-1" />
            + Descuento
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItemRow('HIDDEN_UNIT_PRICE_ITEM')}
            className="text-xs border-indigo-200 dark:border-indigo-800"
          >
            <EyeOff className="w-3.5 h-3.5 mr-1 text-indigo-500" />
            + Precio Oculto
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItemRow('SUBTOTAL_GROUP')}
            className="text-xs"
          >
            <FolderPlus className="w-3.5 h-3.5 mr-1" />
            + Encabezado
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {fields.length === 0 ? (
          <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
            No se han agregado repuestos ni ítems. Haz clic en los botones superiores para agregar elementos.
          </div>
        ) : (
          fields.map((field, index) => {
            const rowType = watch(`items.${index}.rowType`);
            const isFree = watch(`items.${index}.isFree`);
            const qty = watch(`items.${index}.quantity`) || 0;
            const costPrice = watch(`items.${index}.costPrice`) || 0;
            const profitMarginPct = watch(`items.${index}.profitMarginPercentage`) || 0;
            const price = watch(`items.${index}.unitPrice`) || 0;
            const lineTotal = qty * price;
            const profitAmount = watch(`items.${index}.profitAmount`) || 0;

            if (rowType === 'SUBTOTAL_GROUP') {
              return (
                <div
                  key={field.id}
                  className="flex items-center justify-between p-3 bg-muted/60 border border-primary/20 rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <span className="text-xs font-bold text-primary uppercase">Divisor de Grupo:</span>
                    <Input
                      {...register(`items.${index}.groupTitle`)}
                      placeholder="Ej. Subtotal Componentes Principales PC"
                      className="h-8 text-xs font-semibold max-w-xs"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                      className="h-7 w-7"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === fields.length - 1}
                      onClick={() => move(index, index + 1)}
                      className="h-7 w-7"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-7 w-7 text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={field.id}
                className="p-3.5 border rounded-lg bg-card hover:border-border transition-colors space-y-2.5"
              >
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        rowType === 'SPARE_PART_ITEM'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                          : rowType === 'REGULAR_ITEM'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : rowType === 'BONIFICATION'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {rowType === 'SPARE_PART_ITEM'
                        ? 'REPUESTO (COSTO + % UTILIDAD)'
                        : rowType === 'REGULAR_ITEM'
                        ? 'ÍTEM REGULAR'
                        : rowType === 'BONIFICATION'
                        ? 'BONIFICACIÓN'
                        : 'ÍTEM CON PRECIO OCULTO'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                      className="h-7 w-7"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === fields.length - 1}
                      onClick={() => move(index, index + 1)}
                      className="h-7 w-7"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-7 w-7 text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Form controls row for SPARE_PART_ITEM (4 Editable Fields) */}
                {rowType === 'SPARE_PART_ITEM' ? (
                  <div className="grid grid-cols-12 gap-2.5 items-end bg-amber-500/5 p-2.5 rounded-md border border-amber-500/20">
                    {/* 1. Description */}
                    <div className="col-span-12 md:col-span-4">
                      <Label className="text-[11px] font-semibold text-foreground">1. Descripción del Repuesto</Label>
                      <Input
                        {...register(`items.${index}.description`)}
                        placeholder="Ej. Disco SSD M.2 NVMe 1TB Kingston..."
                        className="h-8 text-xs mt-0.5"
                      />
                    </div>

                    {/* 2. Quantity */}
                    <div className="col-span-3 md:col-span-2">
                      <Label className="text-[11px] font-semibold text-foreground">2. Cantidad</Label>
                      <Input
                        type="number"
                        min={1}
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                          onChange: (e) =>
                            handleSparePartChange(index, costPrice, profitMarginPct, parseFloat(e.target.value)),
                        })}
                        className="h-8 text-xs mt-0.5 text-center font-bold"
                      />
                    </div>

                    {/* 3. Cost Price */}
                    <div className="col-span-4 md:col-span-2">
                      <Label className="text-[11px] font-semibold text-foreground">3. Precio Costo ({currency})</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        {...register(`items.${index}.costPrice`, {
                          valueAsNumber: true,
                          onChange: (e) =>
                            handleSparePartChange(index, parseFloat(e.target.value), profitMarginPct, qty),
                        })}
                        placeholder="0.00"
                        className="h-8 text-xs mt-0.5 font-mono"
                      />
                    </div>

                    {/* 4. Profit Margin % */}
                    <div className="col-span-5 md:col-span-2">
                      <Label className="text-[11px] font-semibold text-foreground">4. % Utilidad</Label>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Input
                          type="number"
                          step="1"
                          min={0}
                          {...register(`items.${index}.profitMarginPercentage`, {
                            valueAsNumber: true,
                            onChange: (e) =>
                              handleSparePartChange(index, costPrice, parseFloat(e.target.value), qty),
                          })}
                          placeholder="30"
                          className="h-8 text-xs font-bold text-amber-600 dark:text-amber-400"
                        />
                        <span className="text-xs font-bold text-muted-foreground">%</span>
                      </div>
                    </div>

                    {/* Calculated Unit Price & Line Total (Visible internally to admin) */}
                    <div className="col-span-12 md:col-span-2 text-right border-t md:border-t-0 pt-2 md:pt-0">
                      <Label className="text-[10px] text-muted-foreground uppercase block font-semibold">
                        Precio Final Cliente
                      </Label>
                      <span className="text-xs font-bold text-foreground block">
                        {currency} {price.toFixed(2)} c/u
                      </span>
                      <span className="text-xs font-extrabold text-primary block mt-0.5">
                        Total: {currency} {lineTotal.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1 mt-0.5">
                        <TrendingUp className="w-3 h-3" />
                        Ganancia: +{currency} {profitAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Standard form controls for REGULAR_ITEM, BONIFICATION, HIDDEN_UNIT_PRICE */
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-12 md:col-span-5">
                      <Label className="text-[11px] text-muted-foreground">Descripción del Ítem / Repuesto</Label>
                      <Input
                        {...register(`items.${index}.description`)}
                        placeholder="Descripción del producto o servicio..."
                        className="h-8 text-xs mt-0.5"
                      />
                    </div>

                    <div className="col-span-4 md:col-span-2">
                      <Label className="text-[11px] text-muted-foreground">Cant.</Label>
                      <Input
                        type="number"
                        min={1}
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="h-8 text-xs mt-0.5"
                      />
                    </div>

                    {rowType !== 'BONIFICATION' && (
                      <div className="col-span-4 md:col-span-3">
                        <Label className="text-[11px] text-muted-foreground">
                          Precio Unit. ({currency})
                          {rowType === 'HIDDEN_UNIT_PRICE_ITEM' && (
                            <span className="ml-1 text-[10px] text-indigo-500 font-medium">(Oculto en PDF)</span>
                          )}
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                          className="h-8 text-xs mt-0.5"
                        />
                      </div>
                    )}

                    {rowType === 'BONIFICATION' && (
                      <div className="col-span-4 md:col-span-3">
                        <Label className="text-[11px] text-muted-foreground">Monto del Descuento</Label>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            disabled={isFree}
                            {...register(`items.${index}.discountAmount`, { valueAsNumber: true })}
                            placeholder={isFree ? 'GRATIS' : '0.00'}
                            className="h-8 text-xs flex-1"
                          />
                          <Button
                            type="button"
                            variant={isFree ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setValue(`items.${index}.isFree`, !isFree)}
                            className="h-8 text-[11px] px-2"
                          >
                            BONIFICADO
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="col-span-4 md:col-span-2 text-right">
                      <Label className="text-[11px] text-muted-foreground block">Total por Línea</Label>
                      <span className="text-xs font-semibold text-foreground h-8 flex items-center justify-end">
                        {rowType === 'BONIFICATION'
                          ? isFree
                            ? 'BONIFICADO ($0)'
                            : `-${currency} ${(watch(`items.${index}.discountAmount`) || 0).toFixed(2)}`
                          : rowType === 'HIDDEN_UNIT_PRICE_ITEM'
                          ? `${currency} ${lineTotal.toFixed(2)}`
                          : `${currency} ${lineTotal.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                )}

                {rowType === 'HIDDEN_UNIT_PRICE_ITEM' && (
                  <div className="flex items-center gap-3 pt-1 border-t border-border/40">
                    <Label className="text-[11px] text-muted-foreground">Proveedor / Categoría Grupo:</Label>
                    <Input
                      {...register(`items.${index}.vendorGroup`)}
                      placeholder="Ej. Proveedor A / Componente Almacenamiento"
                      className="h-7 text-xs max-w-xs"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
