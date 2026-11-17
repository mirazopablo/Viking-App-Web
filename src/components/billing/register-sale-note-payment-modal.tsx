"use client";

import React, { useMemo, useState } from "react";
import { Plus, Trash2, Loader2, AlertCircle, Wallet } from "lucide-react";
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
import type {
  SaleNotePaymentInput,
  SaleNotePaymentMethod,
  SaleNoteResponse,
} from "@/types/sales-note";
import { salesNoteService } from "@/services/sales-note.service";
import { SALE_NOTE_PAYMENT_METHOD_LABELS } from "@/lib/sales-note-document";

interface RegisterSaleNotePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saleNote: SaleNoteResponse | null;
  onSuccess?: (updated: SaleNoteResponse) => void;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(val || 0);

/**
 * Modal for registering partial or mixed payments against a PENDING or PARTIAL Sales Note.
 */
export const RegisterSaleNotePaymentModal: React.FC<RegisterSaleNotePaymentModalProps> = ({
  open,
  onOpenChange,
  saleNote,
  onSuccess,
}) => {
  const remainingBalance = useMemo(() => {
    if (!saleNote) return 0;
    if (typeof saleNote.remaining_balance === "number") {
      return Math.max(0, saleNote.remaining_balance);
    }
    const paid = typeof saleNote.paid_amount === "number" ? saleNote.paid_amount : 0;
    return Math.max(0, saleNote.total_amount - paid);
  }, [saleNote]);

  const [payments, setPayments] = useState<SaleNotePaymentInput[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const effectivePayments = useMemo<SaleNotePaymentInput[]>(
    () =>
      payments ?? [
        { payment_method: "CASH", amount: remainingBalance, description: "" },
      ],
    [payments, remainingBalance]
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPayments(null);
      setErrorMessage(null);
    }
    onOpenChange(nextOpen);
  };

  if (!saleNote) return null;

  const totalEntered = effectivePayments.reduce(
    (acc, p) => acc + Math.max(0, Number(p.amount) || 0),
    0
  );
  const exceedsBalance = totalEntered > remainingBalance + 0.009;

  const handleAddLine = () => {
    const remainingToCover = Math.max(0, remainingBalance - totalEntered);
    setPayments([
      ...effectivePayments,
      { payment_method: "TRANSFER", amount: remainingToCover, description: "" },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    setPayments(effectivePayments.filter((_, i) => i !== index));
  };

  const handleUpdateLine = (
    index: number,
    patch: Partial<SaleNotePaymentInput>
  ) => {
    setPayments(
      effectivePayments.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validPayments = effectivePayments
      .map((p) => ({
        payment_method: p.payment_method,
        amount: Number(p.amount) || 0,
        description: p.description?.trim() || undefined,
      }))
      .filter((p) => p.amount > 0);

    if (validPayments.length === 0) {
      setErrorMessage("Ingresá al menos un monto mayor a 0.");
      return;
    }

    if (exceedsBalance) {
      setErrorMessage(
        `La suma ingresada (${formatCurrency(totalEntered)}) supera el saldo pendiente (${formatCurrency(remainingBalance)}).`
      );
      return;
    }

    try {
      setIsLoading(true);
      const updated = await salesNoteService.registerPayments(saleNote.id, {
        payments: validPayments,
      });

      toast.success(
        updated.payment_status === "PAID"
          ? `Nota de Venta ${saleNote.number} saldada por completo.`
          : `Pago parcial registrado en ${saleNote.number}.`
      );

      setPayments(null);
      setErrorMessage(null);
      onOpenChange(false);
      onSuccess?.(updated);
    } catch (error: unknown) {
      const errObj = error as {
        response?: { data?: { error?: string; message?: string } };
        message?: string;
      };
      const msg =
        errObj?.response?.data?.error ||
        errObj?.response?.data?.message ||
        errObj?.message ||
        "No se pudo registrar el pago.";
      setErrorMessage(msg);
      toast.error("Error al registrar pago.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[90dvh] overflow-y-auto bg-card border-border text-foreground shadow-2xl p-4 sm:p-6 font-mono">
        <DialogHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-black">
              COBRO DE SALDO • {saleNote.number}
            </Badge>
          </div>
          <DialogTitle className="text-base font-bold pt-1">
            Registrar Pago / Pagos Mixtos
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Podés combinar distintos medios de pago (ej. Efectivo + Transferencia) hasta cubrir el saldo pendiente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="bg-secondary/25 border border-border/60 rounded-xl p-3.5 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Nota de Venta:</span>
              <span className="font-bold">{formatCurrency(saleNote.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ya Abonado:</span>
              <span className="font-semibold text-emerald-400">
                {formatCurrency(saleNote.paid_amount ?? 0)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-1.5">
              <span className="text-muted-foreground font-bold">Saldo Pendiente:</span>
              <span className="font-black text-sky-400">{formatCurrency(remainingBalance)}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-lg text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] uppercase text-muted-foreground font-semibold">
                Líneas de Pago
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLine}
                className="h-7 text-[11px] gap-1"
              >
                <Plus className="w-3 h-3" />
                Agregar Medio
              </Button>
            </div>

            {effectivePayments.map((row, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-border/60 bg-secondary/15 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="w-full sm:w-40 shrink-0">
                    <Select
                      value={row.payment_method}
                      onValueChange={(val) =>
                        handleUpdateLine(idx, { payment_method: val as SaleNotePaymentMethod })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs bg-background">
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

                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={row.amount || ""}
                      onChange={(e) =>
                        handleUpdateLine(idx, { amount: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="Monto"
                      className="h-8 text-xs text-right font-bold bg-background flex-1"
                    />

                    {effectivePayments.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLine(idx)}
                        className="h-8 w-8 text-destructive shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                <Input
                  type="text"
                  value={row.description || ""}
                  onChange={(e) => handleUpdateLine(idx, { description: e.target.value })}
                  placeholder="Detalle / comprobante (opcional)"
                  className="h-7 text-[11px] bg-background"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
            <span className="text-muted-foreground">Total a Registrar:</span>
            <span
              className={`font-black ${
                exceedsBalance ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {formatCurrency(totalEntered)}
            </span>
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
              disabled={isLoading || exceedsBalance || totalEntered <= 0}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Confirmar Pago</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

