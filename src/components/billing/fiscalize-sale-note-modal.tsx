"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertCircle, FileCheck, ArrowRight, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { SaleNoteResponse, FiscalizeSaleNoteRequest, FiscalizeSaleNoteResponse } from "@/types/sales-note";
import { InvoiceDocType, InvoiceVatCondition } from "@/types/invoice";
import { salesNoteService } from "@/services/sales-note.service";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";

interface FiscalizeSaleNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saleNote: SaleNoteResponse | null;
  onSuccess?: (result: FiscalizeSaleNoteResponse) => void;
}

function getTodayAfipDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function getFirstDayOfMonthAfipDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}${month}01`;
}

/**
 * FiscalizeSaleNoteModal Component:
 * Styled with Viking Dark Theme.
 * Transitions an internal, non-fiscal workshop sale note (Letter [ X ]) into a legally
 * binding electronic Factura C with CAE and official ARCA QR code.
 */
export const FiscalizeSaleNoteModal: React.FC<FiscalizeSaleNoteModalProps> = ({
  open,
  onOpenChange,
  saleNote,
  onSuccess,
}) => {
  if (!saleNote) return null;

  const initialDocTipo = saleNote.client_dni ? 96 : 99;
  const initialDocNro = saleNote.client_dni ? String(saleNote.client_dni) : "0";

  const [docTipo, setDocTipo] = useState<InvoiceDocType>(initialDocTipo);
  const [docNro, setDocNro] = useState<string>(initialDocNro);
  const [condicionIva, setCondicionIva] = useState<InvoiceVatCondition>(5); // Consumidor Final default
  const [concepto, setConcepto] = useState<number>(2); // Servicios default

  // Service dates (Natural Date objects for UI, formatted to YYYYMMDD for ARCA)
  const [serviceFromDate, setServiceFromDate] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [serviceToDate, setServiceToDate] = useState<Date>(() => new Date());
  const [paymentDueDate, setPaymentDueDate] = useState<Date>(() => new Date());

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (saleNote.is_fiscal) {
      toast.error("Esta Nota de Venta ya se encuentra fiscalizada.");
      return;
    }

    if (docTipo !== 99 && (!docNro || docNro === "0")) {
      toast.error("Debes ingresar un número de CUIT o DNI para emitir a nombre del titular.");
      return;
    }

    const payload: FiscalizeSaleNoteRequest = {
      doc_tipo: docTipo,
      doc_nro: docTipo === 99 ? 0 : Number(docNro),
      condicion_iva_receptor_id: condicionIva,
      concepto,
      fch_serv_desde: format(serviceFromDate, "yyyyMMdd"),
      fch_serv_hasta: format(serviceToDate, "yyyyMMdd"),
      fch_vto_pago: format(paymentDueDate, "yyyyMMdd"),
    };

    try {
      setIsLoading(true);
      const result = await salesNoteService.fiscalizeSaleNote(saleNote.id, payload);

      if (result.is_fiscal && result.invoice?.cae) {
        toast.success(`¡Nota de Venta fiscalizada! Factura C Nro ${result.invoice.numero_cmp} (CAE: ${result.invoice.cae})`);
        onOpenChange(false);
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        setErrorMessage("ARCA no devolvió el CAE para esta solicitud.");
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Error al conectar con ARCA para fiscalizar la venta.";
      setErrorMessage(msg);
      toast.error("Error al fiscalizar ante ARCA.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto bg-card border-border text-foreground shadow-2xl p-6 font-mono">
        <DialogHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black">
              [ X ] ➔ [ C ] FISCALIZACIÓN
            </Badge>
            <DialogTitle className="text-base font-extrabold uppercase tracking-wide text-foreground">
              Fiscalizar Nota de Venta
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground font-mono">
            Convierte esta venta interna en una Factura C legal con CAE emitido por ARCA.
          </DialogDescription>
        </DialogHeader>

        {/* Informative Warning Banner */}
        <div className="bg-amber-950/30 border border-amber-500/40 p-3 rounded-xl text-amber-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-amber-300 uppercase tracking-wide text-[10px]">
              Impacto Fiscal Inmediato:
            </p>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Esta acción solicitará autorización electrónica a ARCA e imputará el monto al cómputo de facturación de tu categoría de Monotributo.
            </p>
          </div>
        </div>

        {/* Sale Note Summary Box */}
        <div className="bg-secondary/15 border border-border/80 rounded-xl p-3.5 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nota de Venta:</span>
            <span className="font-bold text-foreground">{saleNote.number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cliente Registrado:</span>
            <span className="font-semibold text-foreground">{saleNote.client_name}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-border/60">
            <span className="text-muted-foreground font-bold uppercase text-[10px]">
              Importe a Facturar:
            </span>
            <span className="font-black text-base text-emerald-400">
              ${saleNote.total_amount.toFixed(2)}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-lg text-rose-200 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="bg-secondary/10 border border-border/70 rounded-xl p-3.5 grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Tipo de Documento
              </Label>
              <Select
                value={String(docTipo)}
                onValueChange={(val) => {
                  const num = Number(val) as InvoiceDocType;
                  setDocTipo(num);
                  if (num === 99) setDocNro("0");
                }}
              >
                <SelectTrigger className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="99">99 - Consumidor Final</SelectItem>
                  <SelectItem value="96">96 - DNI</SelectItem>
                  <SelectItem value="80">80 - CUIT</SelectItem>
                  <SelectItem value="86">86 - CUIL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Número de Documento
              </Label>
              <Input
                disabled={docTipo === 99}
                value={docNro}
                onChange={(e) => setDocNro(e.target.value)}
                placeholder={docTipo === 99 ? "0 (Consumidor Final)" : "Sin puntos ni guiones"}
                className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground text-xs"
              />
            </div>

            <div className="col-span-2">
              <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Condición Frente al IVA (RG 5616)
              </Label>
              <Select
                value={String(condicionIva)}
                onValueChange={(val) => setCondicionIva(Number(val) as InvoiceVatCondition)}
              >
                <SelectTrigger className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="5">5 - Consumidor Final</SelectItem>
                  <SelectItem value="1">1 - IVA Responsable Inscripto</SelectItem>
                  <SelectItem value="6">6 - Responsable Monotributo</SelectItem>
                  <SelectItem value="4">4 - IVA Sujeto Exento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-secondary/10 border border-border/70 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-mono uppercase text-tertiary font-bold tracking-wider block">
                Período del Servicio y Vencimiento (ARCA)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <Label className="text-[9.5px] font-mono text-muted-foreground uppercase">
                  Desde
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="mt-1 w-full justify-start text-left font-mono text-xs bg-secondary/20 border-border hover:bg-secondary/30 text-foreground h-8 gap-1.5 px-2"
                    >
                      <CalendarIcon className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">{format(serviceFromDate, "dd/MM/yyyy")}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border shadow-2xl z-50" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={serviceFromDate}
                      onSelect={(d) => d && setServiceFromDate(d)}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-[9px] text-muted-foreground font-mono mt-0.5 block">
                  ARCA: {format(serviceFromDate, "yyyyMMdd")}
                </span>
              </div>
              <div>
                <Label className="text-[9.5px] font-mono text-muted-foreground uppercase">
                  Hasta
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="mt-1 w-full justify-start text-left font-mono text-xs bg-secondary/20 border-border hover:bg-secondary/30 text-foreground h-8 gap-1.5 px-2"
                    >
                      <CalendarIcon className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">{format(serviceToDate, "dd/MM/yyyy")}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border shadow-2xl z-50" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={serviceToDate}
                      onSelect={(d) => d && setServiceToDate(d)}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-[9px] text-muted-foreground font-mono mt-0.5 block">
                  ARCA: {format(serviceToDate, "yyyyMMdd")}
                </span>
              </div>
              <div>
                <Label className="text-[9.5px] font-mono text-muted-foreground uppercase">
                  Vto. Pago
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="mt-1 w-full justify-start text-left font-mono text-xs bg-secondary/20 border-border hover:bg-secondary/30 text-foreground h-8 gap-1.5 px-2"
                    >
                      <CalendarIcon className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">{format(paymentDueDate, "dd/MM/yyyy")}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border shadow-2xl z-50" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={paymentDueDate}
                      onSelect={(d) => d && setPaymentDueDate(d)}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-[9px] text-muted-foreground font-mono mt-0.5 block">
                  ARCA: {format(paymentDueDate, "yyyyMMdd")}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
              className="text-xs font-mono border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono uppercase tracking-wider gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Emitiendo ante ARCA...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Obtener CAE y Fiscalizar</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
