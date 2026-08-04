'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BudgetTableRow, BudgetLaborCost, BudgetMode } from '@/types/budget';

interface BudgetDocumentTableProps {
  items?: BudgetTableRow[];
  labors?: BudgetLaborCost[];
  taxPercentage?: number;
  currency?: string;
  mode: BudgetMode;
}

export const BudgetDocumentTable: React.FC<BudgetDocumentTableProps> = ({
  items = [],
  labors = [],
  taxPercentage = 0,
  currency = '$',
  mode,
}) => {
  // Calculations
  let regularSubtotal = 0;
  let hiddenSubtotal = 0;
  let totalDiscounts = 0;

  items.forEach((item) => {
    if (item.rowType === 'REGULAR_ITEM' || item.rowType === 'SPARE_PART_ITEM') {
      regularSubtotal += (item.quantity || 0) * (item.unitPrice || 0);
    } else if (item.rowType === 'HIDDEN_UNIT_PRICE_ITEM') {
      hiddenSubtotal += (item.quantity || 0) * (item.unitPrice || 0);
    } else if (item.rowType === 'BONIFICATION') {
      if (!item.isFree) {
        totalDiscounts += item.discountAmount || 0;
      }
    }
  });

  const laborTotal = labors.reduce((acc, l) => acc + (l.amount || 0), 0);
  const itemsSubtotal = regularSubtotal + hiddenSubtotal;
  const taxableAmount = Math.max(0, itemsSubtotal + laborTotal - totalDiscounts);
  const taxAmount = (taxableAmount * (taxPercentage || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden bg-background">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-muted/70 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Descripción</th>
              <th className="py-2.5 px-3 text-center">Cant.</th>
              {mode !== 'NEW_EQUIPMENT' && <th className="py-2.5 px-3 text-right">Precio Unit.</th>}
              <th className="py-2.5 px-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={mode !== 'NEW_EQUIPMENT' ? 4 : 3}
                  className="py-6 text-center text-muted-foreground italic"
                >
                  No se han registrado ítems en el presupuesto.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                if (item.rowType === 'SUBTOTAL_GROUP') {
                  return (
                    <tr key={item.id} className="bg-primary/5 font-bold border-y border-primary/20">
                      <td colSpan={mode !== 'NEW_EQUIPMENT' ? 4 : 3} className="py-2 px-3 text-primary uppercase tracking-wide">
                        📁 {item.groupTitle || 'Sección de Grupo'}
                      </td>
                    </tr>
                  );
                }

                if (item.rowType === 'BONIFICATION') {
                  return (
                    <tr key={item.id} className="bg-emerald-500/5 text-emerald-700 dark:text-emerald-300">
                      <td className="py-2 px-3 font-medium">
                        <span className="font-semibold">{item.description}</span>
                        {item.isFree && (
                          <Badge variant="outline" className="ml-2 text-[9px] bg-emerald-100 text-emerald-800 border-emerald-300">
                            BONIFICADO
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">1</td>
                      {mode !== 'NEW_EQUIPMENT' && <td className="py-2 px-3 text-right">-</td>}
                      <td className="py-2 px-3 text-right font-semibold">
                        {item.isFree ? 'BONIFICADO ($0)' : `-${currency} ${(item.discountAmount || 0).toFixed(2)}`}
                      </td>
                    </tr>
                  );
                }

                if (item.rowType === 'HIDDEN_UNIT_PRICE_ITEM') {
                  const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
                  return (
                    <tr key={item.id} className="hover:bg-muted/20">
                      <td className="py-2 px-3 font-medium">
                        <div>{item.description}</div>
                        {item.vendorGroup && (
                          <div className="text-[10px] text-muted-foreground">{item.vendorGroup}</div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center font-medium">{item.quantity}</td>
                      {mode !== 'NEW_EQUIPMENT' && <td className="py-2 px-3 text-right text-muted-foreground">-</td>}
                      <td className="py-2 px-3 text-right font-medium">
                        {mode === 'NEW_EQUIPMENT' ? (
                          <span className="text-muted-foreground italic text-[11px]">Incluido en Subtotal de Armado</span>
                        ) : (
                          `${currency} ${lineTotal.toFixed(2)}`
                        )}
                      </td>
                    </tr>
                  );
                }

                // REGULAR_ITEM & SPARE_PART_ITEM (Enforces customer privacy: ONLY final unit price and line total rendered)
                const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
                return (
                  <tr key={item.id} className="hover:bg-muted/20">
                    <td className="py-2 px-3 font-medium text-foreground">{item.description}</td>
                    <td className="py-2 px-3 text-center">{item.quantity}</td>
                    {mode !== 'NEW_EQUIPMENT' && (
                      <td className="py-2 px-3 text-right text-muted-foreground">
                        {currency} {(item.unitPrice || 0).toFixed(2)}
                      </td>
                    )}
                    <td className="py-2 px-3 text-right font-semibold text-foreground">
                      {currency} {lineTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}

            {/* Labor Lines */}
            {labors.length > 0 &&
              labors.map((labor, idx) => (
                <tr key={`labor_${idx}`} className="bg-muted/20 border-t">
                  <td className="py-2 px-3 font-medium text-foreground">
                    🛠️ <span className="font-semibold">Mano de Obra:</span> {labor.description}
                  </td>
                  <td className="py-2 px-3 text-center">1</td>
                  {mode !== 'NEW_EQUIPMENT' && <td className="py-2 px-3 text-right">-</td>}
                  <td className="py-2 px-3 text-right font-semibold text-foreground">
                    {currency} {(labor.amount || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Totals Summary Card */}
      <div className="flex justify-end pt-2">
        <div className="w-full sm:w-80 p-3.5 bg-muted/40 rounded-lg border space-y-2 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Componentes y Repuestos:</span>
            <span className="font-medium text-foreground">{currency} {itemsSubtotal.toFixed(2)}</span>
          </div>

          {laborTotal > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Mano de Obra / Armado:</span>
              <span className="font-medium text-foreground">{currency} {laborTotal.toFixed(2)}</span>
            </div>
          )}

          {totalDiscounts > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Descuentos Aplicados:</span>
              <span>-{currency} {totalDiscounts.toFixed(2)}</span>
            </div>
          )}

          {taxPercentage > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Impuestos / IVA ({taxPercentage}%):</span>
              <span className="font-medium text-foreground">{currency} {taxAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="pt-2 border-t flex justify-between items-center text-sm font-bold text-foreground">
            <span>TOTAL PRESUPUESTO:</span>
            <span className="text-base font-extrabold text-primary">
              {currency} {grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
