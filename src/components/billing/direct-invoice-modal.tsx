"use client";

import React, { useState } from "react";
import { Plus, Trash2, Send, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";
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
  CreateInvoiceRequest,
  InvoiceResponse,
  InvoiceConcept,
  InvoiceDocType,
  InvoiceVatCondition,
  InvoiceItem,
} from "@/types/invoice";
import { invoiceService } from "@/services/invoice.service";

interface DirectInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (invoice: InvoiceResponse) => void;
}

/**
 * Returns today's date formatted as YYYYMMDD.
 */
function getTodayAfipDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * Returns first day of current month as YYYYMMDD.
 */
function getFirstDayOfMonthAfipDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}${month}01`;
}

/**
 * DirectInvoiceModal Component:
 * Handles direct electronic billing of Factura C to ARCA with real-time AFIP validation,
 * automatic RG 5616 VAT receptor classification, and observation handling.
 */
export const DirectInvoiceModal: React.FC<DirectInvoiceModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [concepto, setConcepto] = useState<InvoiceConcept>(2);
  const [docTipo, setDocTipo] = useState<InvoiceDocType>(99);
  const [docNro, setDocNro] = useState<string>("0");
  const [condicionIva, setCondicionIva] = useState<InvoiceVatCondition>(5);
  const [clientName, setClientName] = useState<string>("");

  // Dates for Services (Concepto 2 or 3)
  const [fchServDesde, setFchServDesde] = useState<string>(getFirstDayOfMonthAfipDate());
  const [fchServHasta, setFchServHasta] = useState<string>(getTodayAfipDate());
  const [fchVtoPago, setFchVtoPago] = useState<string>(getTodayAfipDate());

  // Dynamic Line Items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: "Servicio Técnico y Reparación de Equipamiento",
      item_type: "SERVICE",
      quantity: 1,
      unit_price: 15000,
      total_price: 15000,
    },
  ]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);

  // Compute grand total
  const computedTotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);

  const handleDocTypeChange = (value: string) => {
    const num = Number(value) as InvoiceDocType;
    setDocTipo(num);
    if (num === 99) {
      setDocNro("0");
      setCondicionIva(5); // Consumidor Final
    } else if (docNro === "0") {
      setDocNro("");
    }
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        description: "",
        item_type: "SERVICE",
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === "quantity" || field === "unit_price") {
        const qty = field === "quantity" ? Number(value) || 0 : item.quantity;
        const price = field === "unit_price" ? Number(value) || 0 : item.unit_price;
        item.total_price = qty * price;
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRejectionMessage(null);

    if (computedTotal <= 0) {
      toast.error("El importe total de la factura debe ser mayor a cero.");
      return;
    }

    if (docTipo !== 99 && (!docNro || docNro === "0")) {
      toast.error("Debes ingresar un número de documento o CUIT válido.");
      return;
    }

    const payload: CreateInvoiceRequest = {
      concepto,
      doc_tipo: docTipo,
      doc_nro: docTipo === 99 ? 0 : Number(docNro),
      condicion_iva_receptor_id: condicionIva,
      importe_total: computedTotal,
      items: items.map((it) => ({
        description: it.description || "Servicio",
        item_type: it.item_type,
        quantity: it.quantity,
        unit_price: it.unit_price,
        total_price: it.total_price,
      })),
    };

    if (concepto === 2 || concepto === 3) {
      payload.fch_serv_desde = fchServDesde;
      payload.fch_serv_hasta = fchServHasta;
      payload.fch_vto_pago = fchVtoPago;
    }

    try {
      setIsLoading(true);
      const invoice = await invoiceService.createInvoice(payload);

      if (invoice.resultado === "A" && invoice.cae) {
        toast.success(`¡Factura C emitida con éxito! CAE: ${invoice.cae}`);
        onOpenChange(false);
        if (onSuccess) {
          onSuccess(invoice);
        }
      } else {
        // ARCA rejection (Resultado: "R")
        const obs = invoice.observaciones || "ARCA rechazó la factura sin detalles adicionales.";
        setRejectionMessage(obs);
        toast.error("ARCA rechazó el comprobante. Revisa los datos ingresados.");
      }
    } catch (error: any) {
      const backendError =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Error inesperado al conectar con el servidor.";
      setRejectionMessage(backendError);
      toast.error("Falla técnica al emitir factura ante ARCA.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-slate-900 font-black">
            <span className="bg-slate-900 text-white text-xs px-2 py-0.5 rounded font-mono">
              [ C ] COD. 011
            </span>
            <DialogTitle className="text-base font-bold">
              Emitir Factura C Electrónica (ARCA)
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Emisión en tiempo real con obtención de CAE ante el Web Service de ARCA.
          </DialogDescription>
        </DialogHeader>

        {/* Rejection Alert Banner */}
        {rejectionMessage && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded text-rose-900 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Rechazo Fiscal de ARCA:</p>
              <p className="font-mono text-[11px] mt-0.5">{rejectionMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Concept & Receptor Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <Label className="text-xs font-bold text-slate-700">Concepto Facturado</Label>
              <Select
                value={String(concepto)}
                onValueChange={(val) => setConcepto(Number(val) as InvoiceConcept)}
              >
                <SelectTrigger className="mt-1 bg-white text-xs">
                  <SelectValue placeholder="Seleccionar concepto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 - Servicios (Taller / Soporte)</SelectItem>
                  <SelectItem value="1">1 - Productos / Repuestos</SelectItem>
                  <SelectItem value="3">3 - Productos y Servicios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700">Condición Frente al IVA (RG 5616)</Label>
              <Select
                value={String(condicionIva)}
                onValueChange={(val) => setCondicionIva(Number(val) as InvoiceVatCondition)}
              >
                <SelectTrigger className="mt-1 bg-white text-xs">
                  <SelectValue placeholder="Condición IVA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 - Consumidor Final</SelectItem>
                  <SelectItem value="1">1 - IVA Responsable Inscripto</SelectItem>
                  <SelectItem value="6">6 - Responsable Monotributo</SelectItem>
                  <SelectItem value="4">4 - IVA Sujeto Exento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700">Tipo de Documento</Label>
              <Select value={String(docTipo)} onValueChange={handleDocTypeChange}>
                <SelectTrigger className="mt-1 bg-white text-xs">
                  <SelectValue placeholder="Tipo de doc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="99">99 - Sin Identificar / Consumidor Final</SelectItem>
                  <SelectItem value="96">96 - DNI (Documento Nacional)</SelectItem>
                  <SelectItem value="80">80 - CUIT (Empresas / Profesionales)</SelectItem>
                  <SelectItem value="86">86 - CUIL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700">Número de Documento</Label>
              <Input
                type="number"
                disabled={docTipo === 99}
                value={docNro}
                onChange={(e) => setDocNro(e.target.value)}
                placeholder={docTipo === 99 ? "0 (Consumidor Final)" : "Ej: 30712345678"}
                className="mt-1 bg-white text-xs font-mono"
              />
            </div>
          </div>

          {/* Conditional Service Dates (If Concepto is 2 or 3) */}
          {(concepto === 2 || concepto === 3) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-blue-50/70 p-3 rounded-lg border border-blue-200">
              <div>
                <Label className="text-[11px] font-bold text-blue-950">Servicio Desde (YYYYMMDD)</Label>
                <Input
                  value={fchServDesde}
                  onChange={(e) => setFchServDesde(e.target.value)}
                  maxLength={8}
                  className="mt-1 bg-white text-xs font-mono"
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-blue-950">Servicio Hasta (YYYYMMDD)</Label>
                <Input
                  value={fchServHasta}
                  onChange={(e) => setFchServHasta(e.target.value)}
                  maxLength={8}
                  className="mt-1 bg-white text-xs font-mono"
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-blue-950">Vto. Pago (YYYYMMDD)</Label>
                <Input
                  value={fchVtoPago}
                  onChange={(e) => setFchVtoPago(e.target.value)}
                  maxLength={8}
                  className="mt-1 bg-white text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Ítems de la Factura
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="text-xs h-7 gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Ítem
              </Button>
            </div>

            <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
              <table className="w-full border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2 text-left">Descripción</th>
                    <th className="p-2 text-center w-24">Tipo</th>
                    <th className="p-2 text-center w-16">Cant.</th>
                    <th className="p-2 text-right w-24">Precio Unit.</th>
                    <th className="p-2 text-right w-24">Total</th>
                    <th className="p-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="p-1.5">
                        <Input
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                          placeholder="Descripción del ítem"
                          className="h-7 text-xs"
                          required
                        />
                      </td>
                      <td className="p-1.5">
                        <select
                          value={item.item_type}
                          onChange={(e) =>
                            handleItemChange(
                              idx,
                              "item_type",
                              e.target.value as "SERVICE" | "SPARE_PART" | "LABOR"
                            )
                          }
                          className="w-full h-7 text-[10px] bg-slate-50 border border-slate-300 rounded px-1 font-mono"
                        >
                          <option value="SERVICE">SERVICIO</option>
                          <option value="SPARE_PART">REPUESTO</option>
                          <option value="LABOR">M. OBRA</option>
                        </select>
                      </td>
                      <td className="p-1.5">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                          className="h-7 text-xs text-center font-mono"
                        />
                      </td>
                      <td className="p-1.5">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleItemChange(idx, "unit_price", Number(e.target.value))
                          }
                          className="h-7 text-xs text-right font-mono"
                        />
                      </td>
                      <td className="p-1.5 text-right font-mono font-bold text-slate-900">
                        ${(item.total_price || 0).toFixed(2)}
                      </td>
                      <td className="p-1.5 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={items.length <= 1}
                          onClick={() => handleRemoveItem(idx)}
                          className="h-7 w-7 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Grand Total Bar */}
            <div className="flex justify-end p-2 bg-slate-900 text-white rounded-md text-xs font-bold">
              <span className="mr-3">IMPORTE TOTAL A FACTURAR:</span>
              <span className="font-mono text-sm text-emerald-400">
                ${computedTotal.toFixed(2)}
              </span>
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
                <>Conectando con ARCA...</>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Emitir Factura C
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
