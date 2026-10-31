"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileText,
  User,
  Calendar,
  DollarSign,
  Loader2,
} from "lucide-react";
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
import {
  CreateInvoiceRequest,
  InvoiceResponse,
  InvoiceConcept,
  InvoiceDocType,
  InvoiceVatCondition,
  InvoiceItem,
} from "@/types/invoice";
import { invoiceService } from "@/services/invoice.service";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";

interface DirectInvoiceModalProps {
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

function getFirstDayOfMonthAfipDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}${month}01`;
}

function formatAfipDateDisplay(dateStr?: string): string {
  if (!dateStr || dateStr.length !== 8) return dateStr || "-";
  return `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}/${dateStr.substring(0, 4)}`;
}

/**
 * DirectInvoiceModal Component:
 * Refactored with the Viking Dark Theme and a 2-step pre-flight confirmation preview
 * to ensure complete data accuracy before requesting legal CAE authorization from ARCA.
 */
export const DirectInvoiceModal: React.FC<DirectInvoiceModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  // Wizard Step: 'form' (carga) | 'preview' (confirmación previa)
  const [currentStep, setCurrentStep] = useState<"form" | "preview">("form");

  // Form Fields
  const [concepto, setConcepto] = useState<InvoiceConcept>(2);
  const [docTipo, setDocTipo] = useState<InvoiceDocType>(99);
  const [docNro, setDocNro] = useState<string>("0");
  const [condicionIva, setCondicionIva] = useState<InvoiceVatCondition>(5);
  const [clientName, setClientName] = useState<string>("");

  // Dates for Services (Natural Date objects for UI, formatted to YYYYMMDD for ARCA)
  const [serviceFromDate, setServiceFromDate] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [serviceToDate, setServiceToDate] = useState<Date>(() => new Date());
  const [paymentDueDate, setPaymentDueDate] = useState<Date>(() => new Date());

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

  // Computed total
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

  // Validate and advance to Step 2 (Preview)
  const handleProceedToPreview = (e: React.FormEvent) => {
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

    for (const it of items) {
      if (!it.description || it.description.trim() === "") {
        toast.error("Todos los ítems deben tener una descripción válida.");
        return;
      }
    }

    setCurrentStep("preview");
  };

  // Final submission to backend / ARCA
  const handleFinalSubmit = async () => {
    setRejectionMessage(null);

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
      payload.fch_serv_desde = format(serviceFromDate, "yyyyMMdd");
      payload.fch_serv_hasta = format(serviceToDate, "yyyyMMdd");
      payload.fch_vto_pago = format(paymentDueDate, "yyyyMMdd");
    }

    try {
      setIsLoading(true);
      const invoice = await invoiceService.createInvoice(payload);

      if (invoice.resultado === "A" && invoice.cae) {
        toast.success(`¡Factura C emitida con éxito! CAE: ${invoice.cae}`);
        onOpenChange(false);
        setCurrentStep("form");
        if (onSuccess) {
          onSuccess(invoice);
        }
      } else {
        const obs = invoice.observaciones || "ARCA rechazó el comprobante sin observaciones adicionales.";
        setRejectionMessage(obs);
        setCurrentStep("form");
        toast.error("ARCA rechazó el comprobante. Revisa los datos ingresados.");
      }
    } catch (error: any) {
      const backendError =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Error al conectar con el servidor.";
      setRejectionMessage(backendError);
      setCurrentStep("form");
      toast.error("Falla técnica al emitir factura ante ARCA.");
    } finally {
      setIsLoading(false);
    }
  };

  const getVatLabel = (id: InvoiceVatCondition) => {
    switch (id) {
      case 5:
        return "Consumidor Final";
      case 1:
        return "IVA Responsable Inscripto";
      case 6:
        return "Responsable Monotributo";
      case 4:
        return "IVA Sujeto Exento";
      default:
        return "Consumidor Final";
    }
  };

  const getDocLabel = (id: InvoiceDocType) => {
    switch (id) {
      case 99:
        return "Consumidor Final (Sin Identificar)";
      case 96:
        return "DNI";
      case 80:
        return "CUIT";
      case 86:
        return "CUIL";
      default:
        return "Doc";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isLoading) {
          onOpenChange(v);
          if (!v) {
            setCurrentStep("form");
            setRejectionMessage(null);
          }
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto bg-card border-border text-foreground shadow-2xl p-6">
        <DialogHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] font-bold">
                [ C ] COD. 011
              </Badge>
              <DialogTitle className="text-base font-extrabold uppercase tracking-wide text-foreground">
                Emitir Factura C Electrónica
              </DialogTitle>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span
                className={`px-2 py-0.5 rounded ${
                  currentStep === "form"
                    ? "bg-secondary text-foreground font-bold border border-border"
                    : "text-muted-foreground"
                }`}
              >
                1. Carga
              </span>
              <span className="text-muted-foreground">/</span>
              <span
                className={`px-2 py-0.5 rounded ${
                  currentStep === "preview"
                    ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40"
                    : "text-muted-foreground"
                }`}
              >
                2. Confirmación
              </span>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground font-mono">
            {currentStep === "form"
              ? "Carga de datos del cliente, condición de IVA (RG 5616) e ítems a facturar."
              : "Revisión pre-flight de los datos antes del envío definitivo al Web Service de ARCA."}
          </DialogDescription>
        </DialogHeader>

        {/* Rejection Alert Banner (Dark Mode Styled) */}
        {rejectionMessage && (
          <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-lg text-rose-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-rose-300 uppercase tracking-wider font-mono text-[10px]">
                Rechazo Fiscal Informado por ARCA:
              </p>
              <p className="font-mono text-xs">{rejectionMessage}</p>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 1: FORM VIEW                                                  */}
        {/* =================================================================== */}
        {currentStep === "form" && (
          <form onSubmit={handleProceedToPreview} className="space-y-4 pt-1">
            {/* Concept & Receptor Block */}
            <div className="bg-secondary/10 border border-border/70 rounded-xl p-3.5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Concepto Facturado
                  </Label>
                  <Select
                    value={String(concepto)}
                    onValueChange={(val) => setConcepto(Number(val) as InvoiceConcept)}
                  >
                    <SelectTrigger className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground text-xs font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="2">2 - Servicios (Taller / Soporte)</SelectItem>
                      <SelectItem value="1">1 - Productos / Repuestos</SelectItem>
                      <SelectItem value="3">3 - Productos y Servicios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Condición IVA Receptor (RG 5616)
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

                <div>
                  <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Tipo de Documento
                  </Label>
                  <Select value={String(docTipo)} onValueChange={handleDocTypeChange}>
                    <SelectTrigger className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground text-xs font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="99">99 - Sin Identificar (Consumidor Final)</SelectItem>
                      <SelectItem value="96">96 - DNI (Documento Nacional)</SelectItem>
                      <SelectItem value="80">80 - CUIT (Empresas / Profesionales)</SelectItem>
                      <SelectItem value="86">86 - CUIL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Número de Documento
                  </Label>
                  <Input
                    type="number"
                    disabled={docTipo === 99}
                    value={docNro}
                    onChange={(e) => setDocNro(e.target.value)}
                    placeholder={docTipo === 99 ? "0 (Consumidor Final)" : "Ej: 30712345678"}
                    className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground font-mono text-xs placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Service Dates Block (If Concepto 2 or 3) */}
            {(concepto === 2 || concepto === 3) && (
              <div className="bg-secondary/10 border border-border/70 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-mono uppercase text-tertiary font-bold tracking-wider block">
                    Período y Vencimiento del Servicio (Obligatorio ARCA)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                          <Calendar className="w-3 h-3 text-primary shrink-0" />
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
                          <Calendar className="w-3 h-3 text-primary shrink-0" />
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
                          <Calendar className="w-3 h-3 text-primary shrink-0" />
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
            )}

            {/* Items Table Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-foreground font-bold">
                  Detalle de Ítems a Facturar
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="text-xs font-mono h-7 border-border hover:bg-secondary/20 gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-primary" />
                  Agregar Ítem
                </Button>
              </div>

              <div className="border border-border/80 rounded-xl overflow-hidden bg-card/60">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-secondary/20 border-b border-border/60 text-muted-foreground font-mono uppercase text-[9.5px]">
                    <tr>
                      <th className="p-2.5">Descripción</th>
                      <th className="p-2.5 text-center w-28">Tipo</th>
                      <th className="p-2.5 text-center w-16">Cant.</th>
                      <th className="p-2.5 text-right w-28">Precio Unit.</th>
                      <th className="p-2.5 text-right w-28">Total</th>
                      <th className="p-2.5 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-mono">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/10">
                        <td className="p-2">
                          <Input
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                            placeholder="Descripción del ítem..."
                            className="h-7 text-xs bg-secondary/20 border-border focus:border-tertiary text-foreground"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={item.item_type}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "item_type",
                                e.target.value as "SERVICE" | "SPARE_PART" | "LABOR"
                              )
                            }
                            className="w-full h-7 text-[10px] bg-secondary/30 border border-border rounded px-1.5 font-mono text-foreground focus:outline-hidden"
                          >
                            <option value="SERVICE" className="bg-card text-foreground">
                              SERVICIO
                            </option>
                            <option value="SPARE_PART" className="bg-card text-foreground">
                              REPUESTO
                            </option>
                            <option value="LABOR" className="bg-card text-foreground">
                              M. OBRA
                            </option>
                          </select>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                            className="h-7 text-xs text-center font-mono bg-secondary/20 border-border text-foreground"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) =>
                              handleItemChange(idx, "unit_price", Number(e.target.value))
                            }
                            className="h-7 text-xs text-right font-mono bg-secondary/20 border-border text-foreground"
                          />
                        </td>
                        <td className="p-2 text-right font-bold text-foreground">
                          ${(item.total_price || 0).toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={items.length <= 1}
                            onClick={() => handleRemoveItem(idx)}
                            className="h-7 w-7 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Preview Strip */}
              <div className="flex justify-between items-center bg-secondary/20 border border-border/80 px-4 py-2.5 rounded-xl font-mono">
                <span className="text-xs uppercase text-muted-foreground font-bold">
                  Total a Facturar:
                </span>
                <span className="text-base font-black text-emerald-400">
                  ${computedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-xs font-mono border-border"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs font-mono uppercase tracking-wider gap-1.5 shadow-sm"
              >
                <span>Revisar Comprobante</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* =================================================================== */}
        {/* STEP 2: PRE-FLIGHT PREVIEW & CONFIRMATION VIEW                     */}
        {/* =================================================================== */}
        {currentStep === "preview" && (
          <div className="space-y-4 pt-1 font-mono">
            {/* Warning Banner */}
            <div className="bg-emerald-950/30 border border-emerald-500/40 p-3 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-300 uppercase tracking-wide text-[11px]">
                  Confirmación Fiscal de Factura C (Punto de Venta 2)
                </p>
                <p className="text-[11px] text-emerald-200/80 mt-0.5 leading-relaxed">
                  Revisa los datos antes de emitir. Al confirmar, el sistema se comunicará con el Web Service de ARCA y solicitará el CAE oficial definitivo.
                </p>
              </div>
            </div>

            {/* Structured Summary Card */}
            <div className="bg-secondary/15 border border-border/80 rounded-xl p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-border/60">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Receptor Fiscal:
                  </span>
                  <p className="text-foreground font-semibold text-sm mt-0.5">
                    {docTipo === 99 ? "Consumidor Final" : `${getDocLabel(docTipo)}: ${docNro}`}
                  </p>
                  <p className="text-[11px] text-tertiary mt-0.5">{getVatLabel(condicionIva)}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Concepto & Emisión:
                  </span>
                  <p className="text-foreground font-semibold text-xs mt-0.5">
                    {concepto === 2 ? "Servicios" : concepto === 1 ? "Productos" : "Prod. y Servicios"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Fecha: {formatAfipDateDisplay(getTodayAfipDate())}
                  </p>
                </div>
              </div>

              {(concepto === 2 || concepto === 3) && (
                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-border/60 text-[11px]">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">
                      Período Facturado:
                    </span>
                    <span className="text-foreground font-medium">
                      {format(serviceFromDate, "dd/MM/yyyy")} al {format(serviceToDate, "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase block">
                      Vto. para el Pago:
                    </span>
                    <span className="text-foreground font-medium">
                      {format(paymentDueDate, "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>
              )}

              {/* Items Summary */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1.5">
                  Ítems a Declarar ({items.length}):
                </span>
                <div className="divide-y divide-border/40 text-[11px]">
                  {items.map((it, idx) => (
                    <div key={idx} className="py-1 flex justify-between items-center">
                      <span className="text-foreground">
                        {it.quantity}x {it.description}
                      </span>
                      <span className="font-bold text-foreground">
                        ${(it.total_price || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grand Total Highlight */}
              <div className="flex justify-between items-center pt-3 border-t-2 border-border text-foreground">
                <span className="text-xs uppercase font-extrabold tracking-wider">
                  Total Final con CAE:
                </span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  ${computedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => setCurrentStep("form")}
                className="text-xs font-mono border-border gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Modificar Datos
              </Button>

              <Button
                type="button"
                disabled={isLoading}
                onClick={handleFinalSubmit}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono uppercase tracking-wider gap-2 shadow-md shadow-emerald-950/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conectando con ARCA...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirmar y Emitir Factura C</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
