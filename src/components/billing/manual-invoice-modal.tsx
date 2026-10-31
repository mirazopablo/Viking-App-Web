"use client";

import React, { useState } from "react";
import { Download, AlertCircle, FileText } from "lucide-react";
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
import {
  ImportManualInvoiceRequest,
  InvoiceResponse,
  InvoiceConcept,
  InvoiceDocType,
  InvoiceVatCondition,
} from "@/types/invoice";
import { invoiceService } from "@/services/invoice.service";

interface ManualInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (invoice: InvoiceResponse) => void;
}

function getTodayAfipDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * ManualInvoiceModal Component:
 * Registers an invoice emitted externally via ARCA's web portal (RCEL / Facturador)
 * so it is accounted for locally in the unified dashboard and printable receipt.
 */
export const ManualInvoiceModal: React.FC<ManualInvoiceModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [puntoVenta, setPuntoVenta] = useState<number>(1);
  const [numeroCmp, setNumeroCmp] = useState<string>("");
  const [fechaEmision, setFechaEmision] = useState<string>(getTodayAfipDate());
  const [concepto, setConcepto] = useState<InvoiceConcept>(2);
  const [docTipo, setDocTipo] = useState<InvoiceDocType>(99);
  const [docNro, setDocNro] = useState<string>("0");
  const [condicionIva, setCondicionIva] = useState<InvoiceVatCondition>(5);
  const [importeTotal, setImporteTotal] = useState<string>("");
  const [cae, setCae] = useState<string>("");
  const [caeVto, setCaeVto] = useState<string>(getTodayAfipDate());
  const [observaciones, setObservaciones] = useState<string>("Emitida externamente desde portal ARCA");

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!numeroCmp || Number(numeroCmp) <= 0) {
      toast.error("Ingresa un número de comprobante válido.");
      return;
    }

    if (!cae || cae.trim().length < 10) {
      toast.error("El número de CAE ingresado es obligatorio y debe ser válido.");
      return;
    }

    if (!importeTotal || Number(importeTotal) <= 0) {
      toast.error("El importe total debe ser mayor a cero.");
      return;
    }

    const payload: ImportManualInvoiceRequest = {
      punto_venta: Number(puntoVenta),
      tipo_cmp: 11, // Factura C
      numero_cmp: Number(numeroCmp),
      fecha_emision: fechaEmision,
      concepto,
      doc_tipo: docTipo,
      doc_nro: docTipo === 99 ? 0 : Number(docNro),
      condicion_iva_receptor_id: condicionIva,
      importe_total: Number(importeTotal),
      cae: cae.trim(),
      cae_vto: caeVto,
      observaciones: observaciones.trim(),
    };

    try {
      setIsLoading(true);
      const invoice = await invoiceService.importManualInvoice(payload);
      toast.success("Factura externa registrada exitosamente en el sistema local.");
      onOpenChange(false);
      if (onSuccess) {
        onSuccess(invoice);
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        "Error al registrar la factura manual.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-slate-900 font-black">
            <span className="bg-amber-700 text-white text-xs px-2 py-0.5 rounded font-mono">
              IMPORTACIÓN MANUAL
            </span>
            <DialogTitle className="text-base font-bold">
              Registrar Factura Externa (RCEL / ARCA Web)
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Ingresa los datos de una Factura C ya emitida manualmente para incluirla en las métricas contables y el comprobante unificado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Point of Sale & Invoice Number */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <Label className="text-xs font-bold text-slate-700">Punto de Venta</Label>
              <Input
                type="number"
                min="1"
                value={puntoVenta}
                onChange={(e) => setPuntoVenta(Number(e.target.value))}
                className="mt-1 bg-white text-xs font-mono"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700">N° de Comprobante</Label>
              <Input
                type="number"
                min="1"
                value={numeroCmp}
                onChange={(e) => setNumeroCmp(e.target.value)}
                placeholder="Ej: 24"
                className="mt-1 bg-white text-xs font-mono"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700">Fecha Emisión (YYYYMMDD)</Label>
              <Input
                value={fechaEmision}
                onChange={(e) => setFechaEmision(e.target.value)}
                maxLength={8}
                className="mt-1 bg-white text-xs font-mono"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700">Importe Total ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={importeTotal}
                onChange={(e) => setImporteTotal(e.target.value)}
                placeholder="0.00"
                className="mt-1 bg-white text-xs font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Fiscal CAE Data */}
          <div className="grid grid-cols-2 gap-3 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
            <div>
              <Label className="text-xs font-bold text-emerald-950">Número de CAE Oficial</Label>
              <Input
                value={cae}
                onChange={(e) => setCae(e.target.value)}
                placeholder="Ej: 74421122334455"
                maxLength={14}
                className="mt-1 bg-white text-xs font-mono font-semibold"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-emerald-950">Vto. de CAE (YYYYMMDD)</Label>
              <Input
                value={caeVto}
                onChange={(e) => setCaeVto(e.target.value)}
                maxLength={8}
                className="mt-1 bg-white text-xs font-mono"
                required
              />
            </div>
          </div>

          {/* Customer / Document */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
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
              <Label className="text-xs font-bold text-slate-700">N° Documento</Label>
              <Input
                disabled={docTipo === 99}
                value={docNro}
                onChange={(e) => setDocNro(e.target.value)}
                className="mt-1 bg-white text-xs font-mono"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs font-bold text-slate-700">Observaciones o Motivo</Label>
              <Input
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej: Emitida por caída de conectividad"
                className="mt-1 bg-white text-xs"
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
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold gap-1.5"
            >
              <Download className="w-4 h-4" />
              {isLoading ? "Registrando..." : "Guardar Factura Externa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
