"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertCircle, FileCheck, ArrowRight } from "lucide-react";
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
import { SaleNoteResponse, FiscalizeSaleNoteRequest, FiscalizeSaleNoteResponse } from "@/types/sales-note";
import { InvoiceDocType, InvoiceVatCondition } from "@/types/invoice";
import { salesNoteService } from "@/services/sales-note.service";

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

  // Service dates
  const [fchServDesde, setFchServDesde] = useState<string>(getFirstDayOfMonthAfipDate());
  const [fchServHasta, setFchServHasta] = useState<string>(getTodayAfipDate());
  const [fchVtoPago, setFchVtoPago] = useState<string>(getTodayAfipDate());

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
      fch_serv_desde: fchServDesde,
      fch_serv_hasta: fchServHasta,
      fch_vto_pago: fchVtoPago,
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded font-mono">
              [ X ] ➔ [ C ]
            </span>
            <DialogTitle className="text-base font-bold text-slate-900">
              Fiscalizar Nota de Venta ante ARCA
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Convierte la venta interna en un comprobante fiscal legal (Factura C con CAE).
          </DialogDescription>
        </DialogHeader>

        {/* Informative / Warning Note */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-2.5 rounded text-amber-950 text-xs">
          <p className="font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Impacto Fiscal Inmediato:
          </p>
          <p className="text-[11px] mt-0.5 text-amber-900 leading-tight">
            Esta acción solicitará autorización electrónica a ARCA e imputará el monto al cómputo de facturación de tu categoría de Monotributo.
          </p>
        </div>

        {/* Sale Note Summary Box */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-1">
          <div className="flex justify-between font-mono">
            <span className="text-slate-500">Nota de Venta:</span>
            <span className="font-bold text-slate-900">{saleNote.number}</span>
          </div>
          <div className="flex justify-between font-mono">
            <span className="text-slate-500">Cliente Registrado:</span>
            <span className="font-semibold text-slate-900">{saleNote.client_name}</span>
          </div>
          <div className="flex justify-between font-mono pt-1 border-t border-slate-200">
            <span className="text-slate-500 font-bold">Importe a Facturar:</span>
            <span className="font-black text-sm text-emerald-700">
              ${saleNote.total_amount.toFixed(2)}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-300 p-2.5 rounded text-rose-900 text-xs font-mono">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs font-bold text-slate-700">Tipo de Documento</Label>
              <Select
                value={String(docTipo)}
                onValueChange={(val) => {
                  const num = Number(val) as InvoiceDocType;
                  setDocTipo(num);
                  if (num === 99) setDocNro("0");
                }}
              >
                <SelectTrigger className="mt-1 bg-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="99">99 - Consumidor Final</SelectItem>
                  <SelectItem value="96">96 - DNI</SelectItem>
                  <SelectItem value="80">80 - CUIT</SelectItem>
                  <SelectItem value="86">86 - CUIL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700">Número de Documento</Label>
              <Input
                disabled={docTipo === 99}
                value={docNro}
                onChange={(e) => setDocNro(e.target.value)}
                placeholder={docTipo === 99 ? "0 (Consumidor Final)" : "Sin puntos ni guiones"}
                className="mt-1 bg-white text-xs font-mono"
              />
            </div>

            <div className="col-span-2">
              <Label className="text-xs font-bold text-slate-700">Condición Frente al IVA (RG 5616)</Label>
              <Select
                value={String(condicionIva)}
                onValueChange={(val) => setCondicionIva(Number(val) as InvoiceVatCondition)}
              >
                <SelectTrigger className="mt-1 bg-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 - Consumidor Final</SelectItem>
                  <SelectItem value="1">1 - IVA Responsable Inscripto</SelectItem>
                  <SelectItem value="6">6 - Responsable Monotributo</SelectItem>
                  <SelectItem value="4">4 - IVA Sujeto Exento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
            <div>
              <Label className="text-[10px] font-bold text-slate-700">Desde (YYYYMMDD)</Label>
              <Input
                value={fchServDesde}
                onChange={(e) => setFchServDesde(e.target.value)}
                maxLength={8}
                className="mt-1 bg-white text-xs font-mono h-7"
              />
            </div>
            <div>
              <Label className="text-[10px] font-bold text-slate-700">Hasta (YYYYMMDD)</Label>
              <Input
                value={fchServHasta}
                onChange={(e) => setFchServHasta(e.target.value)}
                maxLength={8}
                className="mt-1 bg-white text-xs font-mono h-7"
              />
            </div>
            <div>
              <Label className="text-[10px] font-bold text-slate-700">Vto. Pago (YYYYMMDD)</Label>
              <Input
                value={fchVtoPago}
                onChange={(e) => setFchVtoPago(e.target.value)}
                maxLength={8}
                className="mt-1 bg-white text-xs font-mono h-7"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5"
            >
              {isLoading ? (
                <>Emitiendo ante ARCA...</>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Obtener CAE y Fiscalizar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
