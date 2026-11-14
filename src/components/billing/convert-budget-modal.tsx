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

  const formattedTotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(budget.totals?.grandTotal || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      setIsLoading(true);
      const res = await salesNoteService.convertBudgetToSaleNote(budget.id, {
        payment_method: paymentMethod,
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
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo convertir el presupuesto a Nota de Venta.";
      setErrorMessage(msg);
      toast.error("Error al convertir presupuesto.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border text-foreground shadow-2xl p-6 font-mono">
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
              <span className="font-black text-amber-400">{formattedTotal}</span>
            </div>
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
                Medio de Pago
              </Label>
              <Select
                value={paymentMethod}
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

