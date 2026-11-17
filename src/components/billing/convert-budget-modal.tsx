"use client";

import React, { useState } from "react";
import { Receipt, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BudgetResponseDTO } from "@/types/budget";
import {
  SaleNotePaymentMethod,
  SaleNotePaymentStatus,
  SaleNoteResponse,
} from "@/types/sales-note";
import { salesNoteService } from "@/services/sales-note.service";
import {
  SALE_NOTE_PAYMENT_METHOD_LABELS,
  SALE_NOTE_PAYMENT_STATUS_LABELS,
} from "@/lib/sales-note-document";

interface ConvertBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: BudgetResponseDTO | null;
  onSuccess?: (saleNote: SaleNoteResponse) => void;
}

/**
 * ConvertBudgetModal Component:
 * Converts an APPROVED budget into an internal Sales Note (Letter [ X ])
 * and records the transaction in internal cash flow.
 */
export const ConvertBudgetModal: React.FC<ConvertBudgetModalProps> = ({
  open,
  onOpenChange,
  budget,
  onSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<SaleNotePaymentMethod>("CASH");
  const [paymentStatus, setPaymentStatus] = useState<SaleNotePaymentStatus>("PAID");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!budget) return null;

  const grandTotal = budget.totals?.grandTotal || 0;
  const advanceTotal = budget.totals?.advancePaymentTotal || 0;
  const remainingBalance =
    typeof budget.totals?.remainingBalance === "number"
      ? budget.totals.remainingBalance
      : Math.max(0, grandTotal - advanceTotal);

  const formatARS = (val: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(val);

  const requiresPaymentMethod = paymentStatus === "PAID" && remainingBalance > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      setIsLoading(true);
      const res = await salesNoteService.convertBudgetToSaleNote(budget.id, {
        payment_method: requiresPaymentMethod ? paymentMethod : undefined,
        payment_status: paymentStatus,
        notes: notes.trim() || undefined,
      });

      const createdNote =
        res.sale_note || (res as unknown as { sales_note?: SaleNoteResponse }).sales_note;

      toast.success(
        createdNote?.number
          ? `Presupuesto convertido a Nota de Venta ${createdNote.number}`
          : "Presupuesto convertido a Nota de Venta exitosamente"
      );

      onOpenChange(false);
      if (onSuccess && createdNote) {
        onSuccess(createdNote);
      }
    } catch (error: unknown) {
      const errObj = error as {
        response?: { data?: { error?: string; message?: string } };
        message?: string;
      };
      const msg =
        errObj?.response?.data?.error ||
        errObj?.response?.data?.message ||
        errObj?.message ||
        "No se pudo convertir el presupuesto a Nota de Venta.";
      setErrorMessage(msg);
      toast.error("Error al convertir presupuesto.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90dvh] overflow-y-auto bg-card border-border text-foreground shadow-2xl p-4 sm:p-6 font-mono">
        <DialogHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black">
              PRESUPUESTO ➔ [ X ] NOTA DE VENTA
            </Badge>
          </div>
          <DialogTitle className="text-base font-bold pt-1">
            Convertir Presupuesto a Comprobante [ X ]
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Genera automáticamente la Nota de Venta interna sin duplicar ítems y marca el presupuesto como convertido.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="bg-secondary/25 border border-border/60 rounded-xl p-3.5 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Presupuesto:</span>
              <span className="font-bold text-foreground truncate max-w-[220px]">
                {budget.title}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total a Registrar:</span>
              <span className="font-black text-amber-400">{formatARS(grandTotal)}</span>
            </div>
            {advanceTotal > 0 && (
              <>
                <div className="flex justify-between text-sky-400">
                  <span>Señas / Entregas Previas:</span>
                  <span className="font-semibold">-{formatARS(advanceTotal)}</span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-1">
                  <span className="text-muted-foreground font-semibold">Saldo Restante:</span>
                  <span className="font-black text-sky-300">{formatARS(remainingBalance)}</span>
                </div>
              </>
            )}
          </div>

          {errorMessage && (
            <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-lg text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] uppercase text-muted-foreground font-semibold">
                Medio de Pago {requiresPaymentMethod ? "" : "(Opcional)"}
              </Label>
              <Select
                value={paymentMethod}
                disabled={!requiresPaymentMethod}
                onValueChange={(val) => setPaymentMethod(val as SaleNotePaymentMethod)}
              >
                <SelectTrigger className="mt-1 bg-secondary/20 border-border text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {Object.entries(SALE_NOTE_PAYMENT_METHOD_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[11px] uppercase text-muted-foreground font-semibold">
                Estado de Pago
              </Label>
              <Select
                value={paymentStatus}
                onValueChange={(val) => setPaymentStatus(val as SaleNotePaymentStatus)}
              >
                <SelectTrigger className="mt-1 bg-secondary/20 border-border text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {Object.entries(SALE_NOTE_PAYMENT_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-[11px] uppercase text-muted-foreground font-semibold">
              Observaciones / Comprobante (Opcional)
            </Label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Transferencia comprobante #784912"
              className="mt-1 bg-secondary/20 border-border text-xs h-9"
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
              className="text-xs border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Convirtiendo...</span>
                </>
              ) : (
                <>
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Emitir Nota de Venta [ X ]</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

