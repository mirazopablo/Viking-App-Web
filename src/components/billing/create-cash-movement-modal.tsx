"use client";

import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, PlusCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CashMovement,
  CashMovementCategory,
  CashMovementType,
} from "@/types/cash-movement";
import type { SaleNotePaymentMethod } from "@/types/sales-note";
import { cashMovementService } from "@/services/cash-movement.service";
import { SALE_NOTE_PAYMENT_METHOD_LABELS } from "@/lib/sales-note-document";

export const CASH_CATEGORY_LABELS: Record<CashMovementCategory, string> = {
  SPARE_PART_PURCHASE: "Compra de Repuesto",
  OPERATING_EXPENSE: "Gasto Operativo",
  REFUND: "Devolución / Reintegro",
  BUDGET_ADVANCE: "Seña / Entrega",
  SALE_NOTE_PAYMENT: "Cobro Nota de Venta",
  INVOICE_PAYMENT: "Cobro Factura Directa",
};

interface CreateCashMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (created: CashMovement) => void;
}

/**
 * Modal for registering manual cash inflows or outflows (spare parts, operating expenses, refunds).
 */
export const CreateCashMovementModal: React.FC<CreateCashMovementModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [type, setType] = useState<CashMovementType>("EXPENSE");
  const [category, setCategory] = useState<CashMovementCategory>("SPARE_PART_PURCHASE");
  const [paymentMethod, setPaymentMethod] = useState<SaleNotePaymentMethod>("CASH");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [workOrderId, setWorkOrderId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setType("EXPENSE");
      setCategory("SPARE_PART_PURCHASE");
      setPaymentMethod("CASH");
      setAmount("");
      setDescription("");
      setWorkOrderId("");
      setErrorMessage(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMessage("El monto debe ser mayor a 0.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Ingresá una descripción para el movimiento.");
      return;
    }

    try {
      setIsLoading(true);
      const trimmedWoId = workOrderId.trim();
      const created = await cashMovementService.createCashMovement({
        type,
        category,
        payment_method: paymentMethod,
        amount: parsedAmount,
        description: description.trim(),
        reference_type: trimmedWoId ? "WORK_ORDER" : "MANUAL",
        work_order_id: trimmedWoId || undefined,
      });

      toast.success(
        type === "INCOME"
          ? "Ingreso registrado en Caja."
          : "Egreso registrado en Caja."
      );
      onOpenChange(false);
      onSuccess?.(created);
    } catch (error: unknown) {
      const errObj = error as {
        response?: { data?: { error?: string; message?: string } };
        message?: string;
      };
      const msg =
        errObj?.response?.data?.error ||
        errObj?.response?.data?.message ||
        errObj?.message ||
        "No se pudo registrar el movimiento.";
      setErrorMessage(msg);
      toast.error("Error al registrar movimiento de caja.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border text-foreground shadow-2xl p-6 font-mono">
        <DialogHeader className="border-b border-border/60 pb-3">
          <DialogTitle className="text-base font-bold">
            Registrar Movimiento de Caja
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Cargá compras de repuestos, gastos operativos, devoluciones de señas (REFUND) o ingresos manuales.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMessage && (
            <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-lg text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] uppercase text-muted-foreground font-semibold">
                Tipo
              </Label>
              <Select
                value={type}
                onValueChange={(val) => setType(val as CashMovementType)}
              >
                <SelectTrigger className="mt-1 bg-secondary/20 border-border text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="EXPENSE">Egreso (Salida)</SelectItem>
                  <SelectItem value="INCOME">Ingreso (Entrada)</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] uppercase text-muted-foreground font-semibold">
                Categoría
              </Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as CashMovementCategory)}
              >
                <SelectTrigger className="mt-1 bg-secondary/20 border-border text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {Object.entries(CASH_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[11px] uppercase text-muted-foreground font-semibold">
                Monto ($)
              </Label>
              <Input
                type="number"
                step="0.01"
                min={0.01}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1 bg-secondary/20 border-border text-xs h-9 text-right font-bold"
              />
            </div>
          </div>

          <div>
            <Label className="text-[11px] uppercase text-muted-foreground font-semibold">
              Descripción
            </Label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Compra de pin de carga en proveedor"
              className="mt-1 bg-secondary/20 border-border text-xs h-9"
            />
          </div>

          <div>
            <Label className="text-[11px] uppercase text-muted-foreground font-semibold">
              Work Order UUID (Opcional)
            </Label>
            <Input
              type="text"
              value={workOrderId}
              onChange={(e) => setWorkOrderId(e.target.value)}
              placeholder="Ej: 56c85844-3462-4c08-9058-f699e3188644"
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Registrar</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

