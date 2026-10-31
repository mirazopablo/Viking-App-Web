"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Plus,
  Trash2,
  AlertTriangle,
  Receipt,
  FileCheck2,
  Calendar as CalendarIcon,
  User,
  Printer,
  Loader2,
  RotateCcw,
  Search,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
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
import { userService } from "@/services/user.service";
import { UserResponseDTO } from "@/types/user";
import { AfipQrCode } from "@/components/common/afip-qr-code";
import { ReceiptPreviewDialog } from "@/components/billing/receipt-preview-dialog";
import { UnifiedCommercialDocumentProps } from "@/components/billing/unified-commercial-document";

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

export default function NewDirectInvoicePage() {
  const router = useRouter();

  // Wizard Step: 'form' | 'preview' | 'success'
  const [currentStep, setCurrentStep] = useState<"form" | "preview" | "success">("form");

  // Form Fields
  const [concepto, setConcepto] = useState<InvoiceConcept>(2);
  const [docTipo, setDocTipo] = useState<InvoiceDocType>(99);
  const [docNro, setDocNro] = useState<string>("0");
  const [clientName, setClientName] = useState<string>("");
  const [clientAddress, setClientAddress] = useState<string>("");
  const [condicionIva, setCondicionIva] = useState<InvoiceVatCondition>(5);

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

  // Request & Success states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);
  const [emittedInvoice, setEmittedInvoice] = useState<InvoiceResponse | null>(null);
  const [previewDocument, setPreviewDocument] = useState<UnifiedCommercialDocumentProps | null>(null);

  // Local Viking DB Client Lookup
  const [isSearchingClient, setIsSearchingClient] = useState<boolean>(false);
  const [foundClientMatch, setFoundClientMatch] = useState<UserResponseDTO | null>(null);

  const lookupVikingClient = async (queryNum: string) => {
    const cleanNum = queryNum.trim();
    if (docTipo === 99 || cleanNum.length < 6 || cleanNum === "0") {
      setFoundClientMatch(null);
      return;
    }

    try {
      setIsSearchingClient(true);
      const res = await userService.getUsers(cleanNum);
      const matched =
        res.data?.find((u) => String(u.dni) === cleanNum || String(u.dni).includes(cleanNum)) ||
        res.data?.[0];

      if (matched) {
        setFoundClientMatch(matched);
        if (!clientName || clientName === "Consumidor Final") {
          setClientName(matched.name);
        }
        if (!clientAddress && matched.address) {
          setClientAddress(matched.address);
        }
        toast.success(`Cliente encontrado en base del taller: ${matched.name}`, { duration: 3000 });
      } else {
        setFoundClientMatch(null);
      }
    } catch {
      setFoundClientMatch(null);
    } finally {
      setIsSearchingClient(false);
    }
  };

  // Compute Grand Total
  const computedTotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);

  const handleDocTypeChange = (value: string) => {
    const num = Number(value) as InvoiceDocType;
    setDocTipo(num);
    if (num === 99) {
      setDocNro("0");
      setCondicionIva(5); // Consumidor Final
      setFoundClientMatch(null);
    } else if (docNro === "0") {
      setDocNro("");
      setFoundClientMatch(null);
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

  // Validation before going to preview
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submission to ARCA
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
        setEmittedInvoice(invoice);
        setCurrentStep("success");
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
        "Error al conectar con ARCA.";
      setRejectionMessage(backendError);
      setCurrentStep("form");
      toast.error("Falla técnica al emitir factura.");
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
        return "Consumidor Final";
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
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link href="/billing">
          <Button variant="ghost" size="sm" className="text-xs font-mono gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Volver a Facturación
          </Button>
        </Link>

        {/* Stepper Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <Badge
            variant={currentStep === "form" ? "default" : "outline"}
            className={currentStep === "form" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"}
          >
            1. Carga de Datos
          </Badge>
          <span className="text-muted-foreground">➔</span>
          <Badge
            variant={currentStep === "preview" ? "default" : "outline"}
            className={currentStep === "preview" ? "bg-emerald-600 text-white font-bold" : "text-muted-foreground"}
          >
            2. Previsualización y Confirmación
          </Badge>
        </div>
      </div>

      {/* Page Header */}
      <AdminPageHeader
        title={
          <div className="flex items-center gap-3">
            <span>Emisión de Factura C</span>
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-xs">
              [ C ] COD. 011 • ARCA
            </Badge>
          </div>
        }
        subtitle="Emisión directa con obtención de CAE legal ante el Web Service de ARCA (Punto de Venta 2)."
        icon={Receipt}
        iconClassName="w-8 h-8 text-emerald-500"
      />

      {/* Rejection Alert */}
      {rejectionMessage && (
        <div className="bg-rose-950/40 border border-rose-500/40 p-4 rounded-xl text-rose-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-300 uppercase tracking-wider font-mono">
              Rechazo Fiscal Informado por ARCA:
            </p>
            <p className="font-mono text-xs leading-relaxed">{rejectionMessage}</p>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* STEP 1: FORM CARGA                                                 */}
      {/* =================================================================== */}
      {currentStep === "form" && (
        <form onSubmit={handleProceedToPreview} className="space-y-6">
          {/* Top Two Cards: Receptor & Service Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Receptor Data */}
            <div className="bg-card/70 border border-border/80 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <User className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  Datos del Receptor & Régimen IVA (RG 5616)
                </h3>
              </div>

              <div className="space-y-3.5">
                <div>
                  <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                    Concepto Facturado
                  </Label>
                  <Select
                    value={String(concepto)}
                    onValueChange={(val) => setConcepto(Number(val) as InvoiceConcept)}
                  >
                    <SelectTrigger className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground text-xs font-mono h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="2">2 - Servicios (Taller / Mantenimiento / Soporte)</SelectItem>
                      <SelectItem value="1">1 - Productos / Repuestos de Hardware</SelectItem>
                      <SelectItem value="3">3 - Productos y Servicios Combinados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                    Condición Frente al IVA del Cliente
                  </Label>
                  <Select
                    value={String(condicionIva)}
                    onValueChange={(val) => setCondicionIva(Number(val) as InvoiceVatCondition)}
                  >
                    <SelectTrigger className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground text-xs font-mono h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="5">5 - Consumidor Final (Default taller)</SelectItem>
                      <SelectItem value="1">1 - IVA Responsable Inscripto</SelectItem>
                      <SelectItem value="6">6 - Responsable Monotributo</SelectItem>
                      <SelectItem value="4">4 - IVA Sujeto Exento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                      Tipo de Documento
                    </Label>
                    <Select value={String(docTipo)} onValueChange={handleDocTypeChange}>
                      <SelectTrigger className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground text-xs font-mono h-9">
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
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                        Número de Documento
                      </Label>
                      {docTipo !== 99 && (
                        <button
                          type="button"
                          onClick={() => lookupVikingClient(docNro)}
                          disabled={isSearchingClient || !docNro || docNro === "0"}
                          className="text-[10px] font-mono text-tertiary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {isSearchingClient ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <Search className="w-2.5 h-2.5" />
                          )}
                          <span>Buscar en base del taller</span>
                        </button>
                      )}
                    </div>
                    <div className="relative mt-1">
                      <Input
                        type="number"
                        disabled={docTipo === 99}
                        value={docNro}
                        onChange={(e) => {
                          setDocNro(e.target.value);
                          if (foundClientMatch && String(foundClientMatch.dni) !== e.target.value) {
                            setFoundClientMatch(null);
                          }
                        }}
                        onBlur={() => {
                          if (docTipo !== 99 && docNro && docNro.length >= 7) {
                            lookupVikingClient(docNro);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            lookupVikingClient(docNro);
                          }
                        }}
                        placeholder={docTipo === 99 ? "0 (Consumidor Final)" : "Sin puntos ni guiones"}
                        className="bg-secondary/20 border-border focus:border-tertiary text-foreground font-mono text-xs h-9 pr-8"
                      />
                      {isSearchingClient && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-2.5 top-3 text-tertiary" />
                      )}
                    </div>
                    {foundClientMatch && (
                      <span className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Cliente vinculado: {foundClientMatch.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                      Nombre o Razón Social {docTipo !== 99 && "(Requerido por RG 1415)"}
                    </Label>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={docTipo === 99 ? "Consumidor Final (Opcional)" : "Ej: Distribuidora Cuyo SA"}
                      className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground text-xs h-9"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                      Domicilio Fiscal / Comercial {docTipo !== 99 && "(Requerido en CUIT)"}
                    </Label>
                    <Input
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder={docTipo === 99 ? "Opcional (Consumidor Final)" : "Ej: Av. Mitre 450, San Rafael"}
                      className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground text-xs h-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Regulatory Dates (ARCA) */}
            <div className="bg-card/70 border border-border/80 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <CalendarIcon className="w-4 h-4 text-warning" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  Período y Vencimiento del Comprobante
                </h3>
              </div>

              {(concepto === 2 || concepto === 3) ? (
                <div className="space-y-3.5">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Por reglamentación de ARCA, toda factura de servicios debe indicar el rango de fechas en el que se prestó el servicio técnico y su vencimiento de pago.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                        Servicio Desde
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="mt-1 w-full justify-start text-left font-mono text-xs bg-secondary/20 border-border hover:bg-secondary/30 text-foreground h-9 gap-2"
                          >
                            <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                            <span>{format(serviceFromDate, "dd/MM/yyyy")}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-card border-border shadow-2xl z-50" align="start">
                          <CalendarPicker
                            mode="single"
                            selected={serviceFromDate}
                            onSelect={(d) => d && setServiceFromDate(d)}
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                      <span className="text-[10px] text-muted-foreground font-mono mt-0.5 block">
                        ARCA: {format(serviceFromDate, "yyyyMMdd")}
                      </span>
                    </div>

                    <div>
                      <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                        Servicio Hasta
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="mt-1 w-full justify-start text-left font-mono text-xs bg-secondary/20 border-border hover:bg-secondary/30 text-foreground h-9 gap-2"
                          >
                            <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                            <span>{format(serviceToDate, "dd/MM/yyyy")}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-card border-border shadow-2xl z-50" align="start">
                          <CalendarPicker
                            mode="single"
                            selected={serviceToDate}
                            onSelect={(d) => d && setServiceToDate(d)}
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                      <span className="text-[10px] text-muted-foreground font-mono mt-0.5 block">
                        ARCA: {format(serviceToDate, "yyyyMMdd")}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                      Vencimiento de Pago
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="mt-1 w-full justify-start text-left font-mono text-xs bg-secondary/20 border-border hover:bg-secondary/30 text-foreground h-9 gap-2"
                        >
                          <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                          <span>{format(paymentDueDate, "dd/MM/yyyy")}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card border-border shadow-2xl z-50" align="start">
                        <CalendarPicker
                          mode="single"
                          selected={paymentDueDate}
                          onSelect={(d) => d && setPaymentDueDate(d)}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <span className="text-[10px] text-muted-foreground font-mono mt-0.5 block">
                      ARCA: {format(paymentDueDate, "yyyyMMdd")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-2 font-mono">
                  <p>Concepto: Productos / Repuestos de Hardware.</p>
                  <p className="text-[11px] opacity-70">
                    No requiere período de prestación de servicios conforme a normativa general.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Section */}
          <div className="bg-card/70 border border-border/80 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  Ítems a Declarar en el Comprobante ({items.length})
                </h3>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="text-xs font-mono gap-1.5 border-border hover:bg-secondary/20"
              >
                <Plus className="w-4 h-4 text-primary" />
                <span>Agregar Ítem</span>
              </Button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto border border-border/80 rounded-xl bg-secondary/5">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-secondary/20 border-b border-border/60 text-muted-foreground font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Descripción de Productos / Servicios</th>
                    <th className="p-3 w-36 text-center">Tipo</th>
                    <th className="p-3 w-20 text-center">Cant.</th>
                    <th className="p-3 w-32 text-right">Precio Unitario</th>
                    <th className="p-3 w-32 text-right">Subtotal</th>
                    <th className="p-3 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/10 transition-colors">
                      <td className="p-2.5">
                        <Input
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                          placeholder="Descripción detallada..."
                          className="h-8 text-xs bg-secondary/20 border-border focus:border-tertiary text-foreground"
                          required
                        />
                      </td>
                      <td className="p-2.5">
                        <select
                          value={item.item_type}
                          onChange={(e) =>
                            handleItemChange(
                              idx,
                              "item_type",
                              e.target.value as "SERVICE" | "SPARE_PART" | "LABOR"
                            )
                          }
                          className="w-full h-8 text-xs bg-secondary/30 border border-border rounded px-2 font-mono text-foreground focus:outline-hidden"
                        >
                          <option value="SERVICE" className="bg-card text-foreground">
                            SERVICIO
                          </option>
                          <option value="SPARE_PART" className="bg-card text-foreground">
                            REPUESTO
                          </option>
                          <option value="LABOR" className="bg-card text-foreground">
                            M. DE OBRA
                          </option>
                        </select>
                      </td>
                      <td className="p-2.5">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                          className="h-8 text-xs text-center font-mono bg-secondary/20 border-border text-foreground"
                        />
                      </td>
                      <td className="p-2.5">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleItemChange(idx, "unit_price", Number(e.target.value))
                          }
                          className="h-8 text-xs text-right font-mono bg-secondary/20 border-border text-foreground"
                        />
                      </td>
                      <td className="p-2.5 text-right font-bold text-foreground">
                        ${(item.total_price || 0).toFixed(2)}
                      </td>
                      <td className="p-2.5 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={items.length <= 1}
                          onClick={() => handleRemoveItem(idx)}
                          className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card-Based Items View */}
            <div className="block sm:hidden space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="bg-secondary/15 border border-border/80 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                      Ítem #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(idx)}
                        className="h-6 px-2 text-rose-400 text-xs"
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label className="text-[9.5px] font-mono text-muted-foreground uppercase">
                      Descripción
                    </Label>
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                      placeholder="Ej: Cambio de display..."
                      className="mt-1 h-8 text-xs bg-secondary/20 border-border text-foreground"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[9.5px] font-mono text-muted-foreground uppercase">
                        Tipo
                      </Label>
                      <select
                        value={item.item_type}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "item_type",
                            e.target.value as "SERVICE" | "SPARE_PART" | "LABOR"
                          )
                        }
                        className="mt-1 w-full h-8 text-[11px] bg-secondary/30 border border-border rounded px-1.5 font-mono text-foreground"
                      >
                        <option value="SERVICE">SERVICIO</option>
                        <option value="SPARE_PART">REPUESTO</option>
                        <option value="LABOR">M. OBRA</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-[9.5px] font-mono text-muted-foreground uppercase">
                        Cant.
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                        className="mt-1 h-8 text-xs text-center font-mono bg-secondary/20 border-border text-foreground"
                      />
                    </div>

                    <div>
                      <Label className="text-[9.5px] font-mono text-muted-foreground uppercase">
                        Precio U.
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(idx, "unit_price", Number(e.target.value))}
                        className="mt-1 h-8 text-xs text-right font-mono bg-secondary/20 border-border text-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border/40 font-mono text-xs">
                    <span className="text-muted-foreground">Total Ítem:</span>
                    <span className="font-bold text-foreground">
                      ${(item.total_price || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Strip */}
            <div className="flex items-center justify-between bg-secondary/25 border border-border/80 px-5 py-4 rounded-xl font-mono">
              <span className="text-xs uppercase text-muted-foreground font-bold tracking-wider">
                Total Final a Facturar:
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">
                ${computedTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <Link href="/billing">
              <Button type="button" variant="outline" className="text-xs font-mono border-border">
                Cancelar
              </Button>
            </Link>

            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono uppercase tracking-wider gap-2 px-6 shadow-md shadow-emerald-950/30"
            >
              <span>Continuar a Revisión Pre-Flight</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      )}

      {/* =================================================================== */}
      {/* STEP 2: PRE-FLIGHT PREVIEW & FISCAL CONFIRMATION                   */}
      {/* =================================================================== */}
      {currentStep === "preview" && (
        <div className="space-y-6 font-mono">
          {/* Informative Security Banner */}
          <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-2xl flex items-start gap-3.5 text-xs text-emerald-200 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-emerald-300 uppercase tracking-wide text-xs">
                Confirmación Previa de Factura C (Punto de Venta 2)
              </p>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Revisa los datos fiscales antes del envío definitivo. Al confirmar, el backend enviará el lote al Web Service de ARCA y persistirá el CAE legal.
              </p>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-card/80 border border-border/80 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border/60">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Receptor del Comprobante:
                </span>
                <p className="text-base font-bold text-foreground">
                  {clientName || (docTipo === 99 ? "Consumidor Final" : `Cliente ${getDocLabel(docTipo)}: ${docNro}`)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getDocLabel(docTipo)}: <span className="font-semibold text-foreground">{docNro}</span>
                </p>
                {clientAddress && (
                  <p className="text-xs text-muted-foreground">
                    Domicilio: <span className="font-medium text-foreground">{clientAddress}</span>
                  </p>
                )}
                <p className="text-xs text-tertiary">{getVatLabel(condicionIva)}</p>
              </div>

              <div className="space-y-1 md:text-right">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Datos de Emisión & Concepto:
                </span>
                <p className="text-xs text-foreground font-semibold">
                  Concepto: {concepto === 2 ? "Servicios" : concepto === 1 ? "Productos" : "Prod. y Servicios"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Fecha Emisión: {formatAfipDateDisplay(getTodayAfipDate())}
                </p>
                {(concepto === 2 || concepto === 3) && (
                  <p className="text-xs text-muted-foreground">
                    Período: {format(serviceFromDate, "dd/MM/yyyy")} al {format(serviceToDate, "dd/MM/yyyy")} • Vto: {format(paymentDueDate, "dd/MM/yyyy")}
                  </p>
                )}
              </div>
            </div>

            {/* Line items table preview */}
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Detalle de ítems declarados ({items.length}):
              </span>
              <div className="border border-border/80 rounded-xl overflow-hidden bg-secondary/10">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-secondary/20 border-b border-border/60 text-muted-foreground uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Descripción</th>
                      <th className="p-3 text-center w-24">Tipo</th>
                      <th className="p-3 text-center w-16">Cant.</th>
                      <th className="p-3 text-right w-28">Precio U.</th>
                      <th className="p-3 text-right w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-muted/10">
                        <td className="p-3 text-foreground font-medium">{it.description}</td>
                        <td className="p-3 text-center text-muted-foreground text-[10px]">
                          {it.item_type}
                        </td>
                        <td className="p-3 text-center text-foreground">{it.quantity}</td>
                        <td className="p-3 text-right text-foreground font-medium">
                          ${it.unit_price.toFixed(2)}
                        </td>
                        <td className="p-3 text-right text-foreground font-bold">
                          ${(it.total_price || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="flex items-center justify-between bg-secondary/25 border border-border/80 px-6 py-4 rounded-xl">
              <span className="text-xs uppercase font-extrabold text-foreground tracking-wider">
                IMPORTE TOTAL LEGAL A CONFIRMAR:
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ${computedTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => setCurrentStep("form")}
              className="text-xs font-mono border-border gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Modificar Datos</span>
            </Button>

            <Button
              type="button"
              disabled={isLoading}
              onClick={handleFinalSubmit}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono uppercase tracking-wider gap-2 px-6 shadow-md shadow-emerald-950/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Obteniendo CAE con ARCA...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirmar y Emitir Factura C</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* STEP 3: SUCCESS VIEW WITH LEGAL QR AND PRINT                        */}
      {/* =================================================================== */}
      {currentStep === "success" && emittedInvoice && (
        <div className="space-y-6 font-mono">
          <div className="bg-emerald-950/30 border border-emerald-500/50 rounded-2xl p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-md">
              <FileCheck2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs uppercase tracking-wider">
                COMPROBANTE AUTORIZADO POR ARCA
              </Badge>
              <h2 className="text-2xl font-black text-foreground pt-1">
                Factura C N° {String(emittedInvoice.numero_cmp).padStart(8, "0")}
              </h2>
              <p className="text-xs text-muted-foreground">
                Punto de Venta {String(emittedInvoice.punto_venta).padStart(4, "0")} • Código de Comprobante 011
              </p>
            </div>

            {/* CAE Info Strip */}
            <div className="max-w-md mx-auto bg-card border border-border/80 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-bold">
                  Código CAE:
                </span>
                <span className="font-mono text-sm font-black text-emerald-400 tracking-wider">
                  {emittedInvoice.cae}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-bold">
                  Vencimiento CAE:
                </span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {formatAfipDateDisplay(emittedInvoice.cae_vto)}
                </span>
              </div>
            </div>

            {/* QR Code Display */}
            <div className="py-2">
              <AfipQrCode invoice={emittedInvoice} size={140} />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
              <Button
                variant="outline"
                onClick={() => {
                  setPreviewDocument({
                    documentType: "INVOICE_C",
                    documentNumber: `Punto de Venta: ${String(emittedInvoice.punto_venta).padStart(5, "0")}   Comp. Nro: ${String(
                      emittedInvoice.numero_cmp
                    ).padStart(8, "0")}`,
                    issueDate: formatAfipDateDisplay(emittedInvoice.fecha_emision),
                    client: {
                      name: clientName || (docTipo === 99 ? "Consumidor Final" : `Cliente ${docNro}`),
                      docType: getDocLabel(emittedInvoice.doc_tipo),
                      docNumber: emittedInvoice.doc_nro,
                      vatCondition: getVatLabel(emittedInvoice.condicion_iva_receptor_id || 5),
                      address: clientAddress || undefined,
                    },
                    items: items.map((it) => ({
                      description: it.description,
                      itemType: it.item_type,
                      quantity: it.quantity,
                      unitPrice: it.unit_price,
                      totalPrice: it.total_price,
                    })),
                    totals: {
                      subtotal: emittedInvoice.importe_total,
                      totalAmount: emittedInvoice.importe_total,
                    },
                    fiscalData: {
                      pointOfSale: emittedInvoice.punto_venta,
                      invoiceNumber: emittedInvoice.numero_cmp,
                      cae: emittedInvoice.cae,
                      caeVto: emittedInvoice.cae_vto,
                      serviceFrom: format(serviceFromDate, "yyyyMMdd"),
                      serviceTo: format(serviceToDate, "yyyyMMdd"),
                      paymentDueDate: format(paymentDueDate, "yyyyMMdd"),
                      rawInvoice: emittedInvoice,
                    },
                  });
                }}
                className="text-xs font-mono gap-1.5 border-border"
              >
                <Printer className="w-4 h-4 text-primary" />
                <span>Imprimir / Guardar PDF</span>
              </Button>

              <Button
                onClick={() => {
                  setCurrentStep("form");
                  setEmittedInvoice(null);
                  setClientName("");
                  setClientAddress("");
                  setDocNro("0");
                  setDocTipo(99);
                  setItems([
                    {
                      description: "Servicio Técnico y Reparación",
                      item_type: "SERVICE",
                      quantity: 1,
                      unit_price: 0,
                      total_price: 0,
                    },
                  ]);
                }}
                variant="outline"
                className="text-xs font-mono gap-1.5 border-border"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Emitir Otra Factura</span>
              </Button>

              <Button
                onClick={() => router.push("/billing")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono uppercase tracking-wider"
              >
                <span>Ir al Panel de Facturación</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Dialog */}
      <ReceiptPreviewDialog
        open={!!previewDocument}
        onOpenChange={(open) => {
          if (!open) setPreviewDocument(null);
        }}
        documentProps={previewDocument}
      />
    </div>
  );
}
