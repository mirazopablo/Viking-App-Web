"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  AlertTriangle,
  Receipt,
  FileCheck2,
  User,
  CreditCard,
  Printer,
  Loader2,
  RotateCcw,
  Search,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  BillingPrefillFromQuote,
  consumeBillingPrefill,
} from "@/lib/quote-to-billing";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { SearchPicker, SearchPickerOption } from "@/components/common/search-picker";
import { DocumentInput } from "@/components/shared/document-input";
import { getDocumentDisplayInfo } from "@/lib/document-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/shared/phone-input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreateSaleNoteRequest,
  SaleNoteItem,
  SaleNoteItemType,
  SaleNotePaymentMethod,
  SaleNotePaymentStatus,
  SaleNoteResponse,
} from "@/types/sales-note";
import { salesNoteService } from "@/services/sales-note.service";
import { userService } from "@/services/user.service";
import { UserResponseDTO } from "@/types/user";
import { ReceiptPreviewDialog } from "@/components/billing/receipt-preview-dialog";
import { UnifiedCommercialDocumentProps } from "@/components/billing/unified-commercial-document";
import {
  mapSaleNoteToCommercialDocument,
  SALE_NOTE_PAYMENT_METHOD_LABELS,
  SALE_NOTE_PAYMENT_STATUS_LABELS,
} from "@/lib/sales-note-document";

function formatArs(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount);
}

const DEFAULT_ITEMS: SaleNoteItem[] = [
  {
    description: "",
    item_type: "SPARE_PART",
    quantity: 1,
    unit_price: 0,
    unit_cost: 0,
  },
];

export default function NewDirectSaleNotePage() {
  const router = useRouter();

  const [quotePrefill] = useState<BillingPrefillFromQuote | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("from") === "quote" ? consumeBillingPrefill() : null;
  });

  const [currentStep, setCurrentStep] = useState<"form" | "preview" | "success">("form");

  // Client fields
  const [clientName, setClientName] = useState<string>(
    () => quotePrefill?.clientName ?? ""
  );
  const [clientDni, setClientDni] = useState<string>(
    () => quotePrefill?.clientDni ?? ""
  );
  const [clientPhone, setClientPhone] = useState<string>(
    () => quotePrefill?.clientPhone ?? ""
  );
  const [workOrderId, setWorkOrderId] = useState<string>("");

  // Payment & notes
  const [paymentMethod, setPaymentMethod] = useState<SaleNotePaymentMethod>("CASH");
  const [paymentStatus, setPaymentStatus] = useState<SaleNotePaymentStatus>("PAID");
  const [discount, setDiscount] = useState<number>(() => quotePrefill?.discount ?? 0);
  const [notes, setNotes] = useState<string>(() => quotePrefill?.notes ?? "");

  // Line items
  const [items, setItems] = useState<SaleNoteItem[]>(
    () => quotePrefill?.saleNoteItems ?? DEFAULT_ITEMS
  );

  // Submission & UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emittedSaleNote, setEmittedSaleNote] = useState<SaleNoteResponse | null>(null);
  const [previewDocument, setPreviewDocument] = useState<UnifiedCommercialDocumentProps | null>(null);

  // Viking client lookup
  const [isSearchingClient, setIsSearchingClient] = useState<boolean>(false);
  const [foundClientMatch, setFoundClientMatch] = useState<UserResponseDTO | null>(null);
  const [clientPickerCache, setClientPickerCache] = useState<Record<string, UserResponseDTO>>({});

  const handleFetchWorkshopClients = async (term: string): Promise<SearchPickerOption[]> => {
    const res = await userService.getUsers(term);
    const list = res.data || [];
    const nextCache: Record<string, UserResponseDTO> = {};
    list.forEach((u) => {
      nextCache[u.id] = u;
    });
    setClientPickerCache((prev) => ({ ...prev, ...nextCache }));
    return list.map((u) => ({
      id: u.id,
      title: u.name,
      subtitle: `${getDocumentDisplayInfo(u.dni).badgeText} - Tel: ${u.phoneNumber || "S/D"}`,
      badge: getDocumentDisplayInfo(u.dni).label,
    }));
  };

  const handleSelectWorkshopClient = (opt: SearchPickerOption | null) => {
    if (!opt) {
      setFoundClientMatch(null);
      return;
    }
    const matched = clientPickerCache[opt.id];
    if (matched) {
      setFoundClientMatch(matched);
      setClientName(matched.name);
      setClientDni(String(matched.dni || ""));
      if (matched.phoneNumber) setClientPhone(matched.phoneNumber);
      toast.success(`Cliente seleccionado: ${matched.name}`, { duration: 2500 });
    }
  };

  const lookupVikingClient = async (queryNum: string) => {
    const cleanNum = queryNum.trim();
    if (cleanNum.length < 6 || cleanNum === "0") {
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
        if (!clientName) setClientName(matched.name);
        setClientDni(String(matched.dni));
        if (!clientPhone && matched.phoneNumber) setClientPhone(matched.phoneNumber);
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

  // Calculations
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    0
  );
  const safeDiscount = Math.max(0, Number(discount) || 0);
  const totalAmount = Math.max(0, subtotal - safeDiscount);
  const totalCost = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0),
    0
  );
  const estimatedNetProfit = totalAmount - totalCost;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        description: "",
        item_type: "SPARE_PART",
        quantity: 1,
        unit_price: 0,
        unit_cost: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof SaleNoteItem,
    value: string | number
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleProceedToPreview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.some((it) => !it.description || it.description.trim() === "")) {
      toast.error("Todos los ítems deben tener una descripción válida.");
      return;
    }

    if (totalAmount <= 0) {
      toast.error("El importe total de la Nota de Venta debe ser mayor a cero.");
      return;
    }

    setCurrentStep("preview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalSubmit = async () => {
    setErrorMessage(null);

    const parsedDni = clientDni.trim() ? Number(clientDni.trim()) : 0;
    const payload: CreateSaleNoteRequest = {
      client_name: clientName.trim() || "Consumidor Final",
      client_dni: Number.isNaN(parsedDni) ? 0 : parsedDni,
      client_phone: clientPhone.trim() || undefined,
      work_order_id: workOrderId.trim() || undefined,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      discount: safeDiscount,
      total_amount: totalAmount,
      notes: notes.trim() || undefined,
      items: items.map((it) => ({
        description: it.description.trim(),
        item_type: it.item_type,
        quantity: Number(it.quantity) || 1,
        unit_price: Number(it.unit_price) || 0,
        unit_cost: Number(it.unit_cost) || 0,
      })),
    };

    try {
      setIsLoading(true);
      const created = await salesNoteService.createDirectSaleNote(payload);
      toast.success(`¡Nota de Venta ${created.number} emitida con éxito!`);
      setEmittedSaleNote(created);
      setCurrentStep("success");
    } catch (error: unknown) {
      const errObj = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const backendError =
        errObj?.response?.data?.error ||
        errObj?.response?.data?.message ||
        errObj?.message ||
        "Error al registrar la Nota de Venta.";
      setErrorMessage(backendError);
      setCurrentStep("form");
      toast.error("No se pudo emitir la Nota de Venta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep("form");
    setEmittedSaleNote(null);
    setClientName("");
    setClientDni("");
    setClientPhone("");
    setWorkOrderId("");
    setFoundClientMatch(null);
    setPaymentMethod("CASH");
    setPaymentStatus("PAID");
    setDiscount(0);
    setNotes("");
    setItems(DEFAULT_ITEMS);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 no-print">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link href="/billing">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs font-mono gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Facturación
          </Button>
        </Link>

        {/* Stepper Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <Badge
            variant={currentStep === "form" ? "default" : "outline"}
            className={
              currentStep === "form"
                ? "bg-primary text-primary-foreground font-bold"
                : "text-muted-foreground"
            }
          >
            1. Carga de Datos
          </Badge>
          <span className="text-muted-foreground">➔</span>
          <Badge
            variant={currentStep === "preview" ? "default" : "outline"}
            className={
              currentStep === "preview"
                ? "bg-amber-600 text-white font-bold"
                : "text-muted-foreground"
            }
          >
            2. Previsualización y Confirmación
          </Badge>
        </div>
      </div>

      {/* Page Header */}
      <AdminPageHeader
        title={
          <div className="flex items-center gap-3">
            <span>Nueva Nota de Venta</span>
            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono text-xs">
              [ X ] INTERNA • NO FISCAL
            </Badge>
          </div>
        }
        subtitle="Registro de venta directa en mostrador o servicio con impacto en caja interna y utilidad neta (sin reporte a ARCA)."
        icon={Receipt}
        iconClassName="w-8 h-8 text-amber-500"
      />

      {/* Quote Prefill Banner */}
      {quotePrefill && currentStep === "form" && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-xs flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-foreground">
              Datos importados desde presupuesto: {quotePrefill.sourceTitle}
            </p>
            <p className="text-muted-foreground">
              Revisá los datos del cliente, el medio de pago y los costos antes de emitir la Nota de Venta [ X ].
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-rose-950/40 border border-rose-500/40 p-4 rounded-xl text-rose-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-300 uppercase tracking-wider font-mono">
              Error al registrar Comprobante X:
            </p>
            <p className="font-mono text-xs leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* STEP 1: FORM CARGA                                                  */}
      {/* =================================================================== */}
      {currentStep === "form" && (
        <form onSubmit={handleProceedToPreview} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Client Data */}
            <div className="bg-card/70 border border-border/80 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <User className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  Datos del Cliente
                </h3>
              </div>

              <div className="space-y-3.5">
                <div>
                  <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold block mb-1">
                    Seleccionar Cliente del Taller (Nombre / DNI / CUIT)
                  </Label>
                  <SearchPicker
                    label=""
                    placeholder="Buscar cliente por nombre, DNI o CUIT..."
                    value={foundClientMatch?.id}
                    onSelect={handleSelectWorkshopClient}
                    fetchOptions={handleFetchWorkshopClients}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                      DNI / CUIT (Opcional)
                    </Label>
                    <button
                      type="button"
                      onClick={() => lookupVikingClient(clientDni)}
                      className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {isSearchingClient ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Search className="w-3 h-3" />
                      )}
                      Buscar en Taller
                    </button>
                  </div>
                  <DocumentInput
                    value={clientDni}
                    onChange={setClientDni}
                    onBlur={() => {
                      if (clientDni.length >= 7) lookupVikingClient(clientDni);
                    }}
                    placeholder="0 para anónimo / Consumidor Final"
                    className="mt-1"
                  />
                  {foundClientMatch && (
                    <div className="mt-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Cliente vinculado: {foundClientMatch.name} ({getDocumentDisplayInfo(foundClientMatch.dni).badgeText})
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                    Nombre o Razón Social
                  </Label>
                  <Input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Consumidor Final"
                    className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground text-xs font-mono h-9"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                      Teléfono (Opcional)
                    </Label>
                    <PhoneInput
                      value={clientPhone}
                      onChange={setClientPhone}
                      placeholder="2604845489"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                      UUID Orden de Trabajo (Opcional)
                    </Label>
                    <Input
                      type="text"
                      value={workOrderId}
                      onChange={(e) => setWorkOrderId(e.target.value)}
                      placeholder="Vincular OT..."
                      className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground text-xs font-mono h-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Payment & Notes */}
            <div className="bg-card/70 border border-border/80 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <CreditCard className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  Condiciones de Cobro y Notas
                </h3>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                      Medio de Pago
                    </Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(val) => setPaymentMethod(val as SaleNotePaymentMethod)}
                    >
                      <SelectTrigger className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground text-xs font-mono h-9">
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
                    <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                      Estado de Pago
                    </Label>
                    <Select
                      value={paymentStatus}
                      onValueChange={(val) => setPaymentStatus(val as SaleNotePaymentStatus)}
                    >
                      <SelectTrigger className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground text-xs font-mono h-9">
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
                  <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                    Descuento Global ($)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount || ""}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    placeholder="0.00"
                    className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground text-xs font-mono h-9"
                  />
                </div>

                <div>
                  <Label className="text-xs font-mono uppercase text-muted-foreground font-semibold">
                    Observaciones / Garantía
                  </Label>
                  <Input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej: Cliente retira por mostrador / Garantía 90 días"
                    className="mt-1 bg-secondary/20 border-border focus:border-tertiary text-foreground text-xs font-mono h-9"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Card */}
          <div className="bg-card/70 border border-border/80 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  Detalle de Productos, Repuestos y Mano de Obra
                </h3>
                <p className="text-[11px] font-mono text-muted-foreground">
                  El costo unitario es de uso interno para calcular la utilidad neta (no se imprime en el comprobante).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="text-xs font-mono border-border gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-amber-500" />
                Agregar Ítem
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => {
                const rowTotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end p-3 rounded-xl bg-secondary/15 border border-border/50"
                  >
                    <div className="md:col-span-4">
                      <Label className="text-[10px] font-mono uppercase text-muted-foreground">
                        Descripción
                      </Label>
                      <Input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                        placeholder="Ej: Pasta Térmica Arctic MX-4"
                        className="mt-1 bg-background/60 border-border text-xs font-mono h-8"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-[10px] font-mono uppercase text-muted-foreground">
                        Tipo
                      </Label>
                      <Select
                        value={item.item_type}
                        onValueChange={(val) =>
                          handleItemChange(idx, "item_type", val as SaleNoteItemType)
                        }
                      >
                        <SelectTrigger className="mt-1 bg-background/60 border-border text-xs font-mono h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                          <SelectItem value="SPARE_PART">Repuesto</SelectItem>
                          <SelectItem value="LABOR">Mano de Obra</SelectItem>
                          <SelectItem value="ACCESSORY">Accesorio</SelectItem>
                          <SelectItem value="SERVICE">Servicio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-1">
                      <Label className="text-[10px] font-mono uppercase text-muted-foreground">
                        Cant.
                      </Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(idx, "quantity", Number(e.target.value) || 0)
                        }
                        className="mt-1 bg-background/60 border-border text-xs font-mono h-8 text-right"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-[10px] font-mono uppercase text-muted-foreground">
                        Precio Venta ($)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={item.unit_price}
                        onChange={(e) =>
                          handleItemChange(idx, "unit_price", Number(e.target.value) || 0)
                        }
                        className="mt-1 bg-background/60 border-border text-xs font-mono h-8 text-right"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-[10px] font-mono uppercase text-amber-400/90">
                        Costo Interno ($)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_cost}
                        onChange={(e) =>
                          handleItemChange(idx, "unit_cost", Number(e.target.value) || 0)
                        }
                        className="mt-1 bg-background/60 border-amber-500/30 text-xs font-mono h-8 text-right"
                      />
                    </div>

                    <div className="md:col-span-1 flex items-center justify-between md:justify-end gap-2">
                      <span className="text-xs font-mono font-bold text-foreground md:hidden">
                        {formatArs(rowTotal)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={items.length <= 1}
                        onClick={() => handleRemoveItem(idx)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Quitar ítem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Totals & Internal Margin Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/60 font-mono">
              <div className="bg-secondary/20 border border-border/60 rounded-xl p-3.5 space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-amber-400">
                  Control Interno de Taller (No se imprime)
                </span>
                <div className="flex justify-between text-muted-foreground">
                  <span>Costo Total Repuestos:</span>
                  <span>{formatArs(totalCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400">
                  <span>Utilidad Neta Estimada:</span>
                  <span>{formatArs(estimatedNetProfit)}</span>
                </div>
              </div>

              <div className="bg-secondary/25 border border-border/80 rounded-xl p-3.5 space-y-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal Bruto:</span>
                  <span>{formatArs(subtotal)}</span>
                </div>
                {safeDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Descuento Aplicado:</span>
                    <span>-{formatArs(safeDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-foreground pt-1 border-t border-border/50">
                  <span>TOTAL FINAL:</span>
                  <span className="text-amber-400">{formatArs(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs font-mono uppercase tracking-wider gap-2 px-6 shadow-md"
            >
              <span>Revisar Comprobante [ X ]</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      )}

      {/* =================================================================== */}
      {/* STEP 2: PREVIEW & CONFIRMATION                                      */}
      {/* =================================================================== */}
      {currentStep === "preview" && (
        <div className="space-y-6 font-mono">
          <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
              <div>
                <h3 className="text-sm font-black uppercase text-foreground">
                  Confirmación Previa — Nota de Venta [ X ]
                </h3>
                <p className="text-xs text-muted-foreground">
                  Este comprobante impactará en caja interna y no se enviará a ARCA.
                </p>
              </div>
              <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {SALE_NOTE_PAYMENT_METHOD_LABELS[paymentMethod]} •{" "}
                {SALE_NOTE_PAYMENT_STATUS_LABELS[paymentStatus]}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-secondary/20 p-4 rounded-xl border border-border/50">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">Cliente</span>
                <span className="font-bold text-foreground">
                  {clientName.trim() || "Consumidor Final"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">
                  {clientDni ? getDocumentDisplayInfo(clientDni).label : "DNI / CUIT"}
                </span>
                <span className="font-bold text-foreground">
                  {clientDni ? getDocumentDisplayInfo(clientDni).formatted : "0 (Anónimo)"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">Teléfono</span>
                <span className="font-bold text-foreground">{clientPhone || "-"}</span>
              </div>
            </div>

            <div className="border border-border/70 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Descripción</th>
                    <th className="p-3 text-center">Tipo</th>
                    <th className="p-3 text-center">Cant.</th>
                    <th className="p-3 text-right">Precio U.</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium text-foreground">{it.description}</td>
                      <td className="p-3 text-center text-[10px] text-muted-foreground">
                        {it.item_type}
                      </td>
                      <td className="p-3 text-center">{it.quantity}</td>
                      <td className="p-3 text-right">{formatArs(it.unit_price)}</td>
                      <td className="p-3 text-right font-bold">
                        {formatArs(it.quantity * it.unit_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/25 border border-border/80 px-6 py-4 rounded-xl">
              <div className="text-xs text-muted-foreground">
                Utilidad neta estimada:{" "}
                <span className="text-emerald-400 font-bold">{formatArs(estimatedNetProfit)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase font-extrabold text-foreground">
                  TOTAL A COBRAR:
                </span>
                <span className="text-2xl font-black text-amber-400">{formatArs(totalAmount)}</span>
              </div>
            </div>
          </div>

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
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs font-mono uppercase tracking-wider gap-2 px-6 shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registrando Nota de Venta...</span>
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  <span>Confirmar y Emitir Comprobante [ X ]</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* STEP 3: SUCCESS VIEW                                                */}
      {/* =================================================================== */}
      {currentStep === "success" && emittedSaleNote && (
        <div className="space-y-6 font-mono">
          <div className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center mx-auto shadow-md">
              <FileCheck2 className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-1">
              <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs uppercase tracking-wider">
                COMPROBANTE INTERNO [ X ] REGISTRADO
              </Badge>
              <h2 className="text-2xl font-black text-foreground pt-1">
                Nota de Venta {emittedSaleNote.number}
              </h2>
              <p className="text-xs text-muted-foreground">
                Documento no válido como factura • Impactado en caja interna
              </p>
            </div>

            <div className="max-w-lg mx-auto bg-card border border-border/80 rounded-xl p-4 grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-bold">
                  Total Venta
                </span>
                <span className="font-mono text-sm font-black text-foreground">
                  {formatArs(emittedSaleNote.total_amount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-bold">
                  Costo Repuestos
                </span>
                <span className="font-mono text-sm font-bold text-muted-foreground">
                  {formatArs(emittedSaleNote.cost_amount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-bold">
                  Utilidad Neta
                </span>
                <span className="font-mono text-sm font-black text-emerald-400">
                  {formatArs(emittedSaleNote.net_profit)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
              <Button
                variant="outline"
                onClick={() =>
                  setPreviewDocument(mapSaleNoteToCommercialDocument(emittedSaleNote))
                }
                className="text-xs font-mono gap-1.5 border-border"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Imprimir / Guardar PDF</span>
              </Button>

              <Button
                onClick={handleReset}
                variant="outline"
                className="text-xs font-mono gap-1.5 border-border"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Emitir Otra Nota de Venta</span>
              </Button>

              <Button
                onClick={() => router.push("/billing")}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs font-mono uppercase tracking-wider"
              >
                <span>Ir al Panel de Facturación</span>
              </Button>
            </div>
          </div>
        </div>
      )}

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

