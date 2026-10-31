"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Receipt,
  FilePlus,
  Download,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Building,
  ArrowUpRight,
  Eye,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DirectInvoiceModal } from "@/components/billing/direct-invoice-modal";
import { ManualInvoiceModal } from "@/components/billing/manual-invoice-modal";
import { FiscalizeSaleNoteModal } from "@/components/billing/fiscalize-sale-note-modal";
import { ReceiptPreviewDialog } from "@/components/billing/receipt-preview-dialog";
import { UnifiedCommercialDocumentProps } from "@/components/billing/unified-commercial-document";
import { InvoiceResponse } from "@/types/invoice";
import { SaleNoteResponse } from "@/types/sales-note";
import { AccountingDashboardResponse } from "@/types/accounting";
import { invoiceService } from "@/services/invoice.service";
import { salesNoteService } from "@/services/sales-note.service";
import { accountingService } from "@/services/accounting.service";

/**
 * Helper to format currency values in ARS.
 */
function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return "$0.00";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount);
}

/**
 * Formats YYYYMMDD to DD/MM/YYYY.
 */
function formatAfipDate(dateStr?: string): string {
  if (!dateStr) return "-";
  if (dateStr.length === 8) {
    return `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}/${dateStr.substring(0, 4)}`;
  }
  return dateStr;
}

export default function BillingManagementPage() {
  const [activeTab, setActiveTab] = useState<string>("invoices");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Data states
  const [dashboardData, setDashboardData] = useState<AccountingDashboardResponse | null>(null);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [salesNotes, setSalesNotes] = useState<SaleNoteResponse[]>([]);

  // Modals state
  const [isDirectModalOpen, setIsDirectModalOpen] = useState<boolean>(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [selectedSaleNoteForFiscalize, setSelectedSaleNoteForFiscalize] = useState<SaleNoteResponse | null>(null);
  const [previewDocument, setPreviewDocument] = useState<UnifiedCommercialDocumentProps | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [accountingRes, invoicesRes, salesNotesRes] = await Promise.allSettled([
        accountingService.getDashboardMetrics(),
        invoiceService.getInvoices({ limit: 50 }),
        salesNoteService.getSalesNotes({ limit: 50 }),
      ]);

      if (accountingRes.status === "fulfilled") {
        setDashboardData(accountingRes.value);
      }
      if (invoicesRes.status === "fulfilled") {
        setInvoices(invoicesRes.value.data || []);
      }
      if (salesNotesRes.status === "fulfilled") {
        setSalesNotes(salesNotesRes.value.data || []);
      }
    } catch (e) {
      console.error("Error loading billing data", e);
      toast.error("Falla al cargar registros contables.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Preview for an Invoice
  const handlePreviewInvoice = (inv: InvoiceResponse) => {
    const docProps: UnifiedCommercialDocumentProps = {
      documentType: "INVOICE_C",
      documentNumber: `Punto de Venta: ${String(inv.punto_venta).padStart(5, "0")}   Comp. Nro: ${String(
        inv.numero_cmp
      ).padStart(8, "0")}`,
      issueDate: formatAfipDate(inv.fecha_emision),
      client: {
        name: inv.doc_tipo === 99 ? "Consumidor Final" : `Cliente Doc. ${inv.doc_nro}`,
        docType: inv.doc_tipo === 80 ? "CUIT" : inv.doc_tipo === 96 ? "DNI" : "Sin Identificar",
        docNumber: inv.doc_nro || 0,
        vatCondition:
          inv.condicion_iva_receptor_id === 1
            ? "IVA Responsable Inscripto"
            : inv.condicion_iva_receptor_id === 6
            ? "Responsable Monotributo"
            : "Consumidor Final",
        paymentCondition: "Contado / Transferencia",
      },
      items:
        inv.items && inv.items.length > 0
          ? inv.items.map((it) => ({
              description: it.description,
              itemType: it.item_type,
              quantity: it.quantity,
              unitPrice: it.unit_price,
              totalPrice: it.total_price,
            }))
          : [
              {
                description: "Servicio Técnico Especializado de Taller",
                quantity: 1,
                unitPrice: inv.importe_total,
                totalPrice: inv.importe_total,
              },
            ],
      totals: {
        subtotal: inv.importe_total,
        totalAmount: inv.importe_total,
      },
      fiscalData: {
        pointOfSale: inv.punto_venta,
        invoiceNumber: inv.numero_cmp,
        cae: inv.cae,
        caeVto: inv.cae_vto,
        rawInvoice: inv,
      },
      notes: inv.observaciones,
    };

    setPreviewDocument(docProps);
  };

  // Open Preview for a Sale Note
  const handlePreviewSaleNote = (sn: SaleNoteResponse) => {
    const docProps: UnifiedCommercialDocumentProps = {
      documentType: "SALE_NOTE",
      documentNumber: sn.number,
      issueDate: new Date(sn.created_at).toLocaleDateString("es-AR"),
      client: {
        name: sn.client_name,
        docType: sn.client_dni ? "DNI" : "Sin Identificar",
        docNumber: sn.client_dni || 0,
        phone: sn.client_phone || undefined,
        paymentCondition: sn.payment_method,
      },
      items:
        sn.items && sn.items.length > 0
          ? sn.items.map((it) => ({
              description: it.description,
              itemType: it.item_type,
              quantity: it.quantity,
              unitPrice: it.unit_price,
              totalPrice: (it.quantity || 1) * (it.unit_price || 0),
            }))
          : [
              {
                description: "Venta / Mano de Obra",
                quantity: 1,
                unitPrice: sn.total_amount,
                totalPrice: sn.total_amount,
              },
            ],
      totals: {
        subtotal: sn.total_amount,
        totalAmount: sn.total_amount,
      },
      notes: sn.notes || undefined,
    };

    setPreviewDocument(docProps);
  };

  // Monotributo progress bar color calculations
  const usagePercentage = dashboardData?.monotributo_control?.usage_percentage || 0;
  const progressColorClass =
    usagePercentage > 85
      ? "bg-rose-500"
      : usagePercentage > 60
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Facturación & Control Fiscal"
        subtitle="Gestión unificada de Facturas C (ARCA WSFEv1), Notas de Venta internas y control de Monotributo."
        icon={Receipt}
        iconClassName="w-7 h-7 text-emerald-500"
        onRefresh={loadData}
        isRefetching={isRefreshing}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsManualModalOpen(true)}
              className="text-xs font-mono tracking-wider uppercase border-border/80 gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>Importar Manual</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setIsDirectModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono tracking-wider uppercase shadow-md shadow-emerald-950/20 gap-1.5"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>Emitir Factura C</span>
            </Button>
          </div>
        }
      />

      {/* =================================================================== */}
      {/* 1. MONOTRIBUTO & FINANCIAL INSIGHTS DASHBOARD                       */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Monotributo Category Gauge */}
        <div className="bg-card/70 border border-border/80 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Tope Monotributo (ARCA)
            </span>
            <Badge variant="outline" className="font-mono text-xs font-bold border-emerald-500/40 text-emerald-400">
              Categoría {dashboardData?.monotributo_control?.current_category || "A"}
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black text-foreground">
                {formatCurrency(dashboardData?.monotributo_control?.accumulated_last_12_months || 0)}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                de {formatCurrency(dashboardData?.monotributo_control?.category_annual_limit || 6450000)}
              </span>
            </div>

            {/* Custom Dynamic Progress Bar */}
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-500 ${progressColorClass}`}
                style={{ width: `${Math.min(100, Math.max(0, usagePercentage))}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] font-mono pt-1 text-muted-foreground">
              <span>Consumo anual: {usagePercentage.toFixed(1)}%</span>
              <span className="text-foreground font-medium">
                Disponible: {formatCurrency(dashboardData?.monotributo_control?.remaining_before_next_category || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Fiscal vs Internal Split */}
        <div className="bg-card/70 border border-border/80 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground font-bold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" />
              Flujo Real vs. Fiscal
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Período Actual</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Ingreso Real (Caja/Bancos):</span>
              <span className="font-mono font-bold text-foreground">
                {formatCurrency(dashboardData?.cash_flow?.gross_income || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-400 font-medium">Facturado Legal (ARCA):</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatCurrency(dashboardData?.fiscal_vs_internal?.fiscal_invoiced_total || 0)}
                <span className="text-[10px] text-muted-foreground ml-1">
                  ({(dashboardData?.fiscal_vs_internal?.fiscal_percentage || 0).toFixed(0)}%)
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-border/40">
              <span className="text-muted-foreground">Notas de Venta Internas:</span>
              <span className="font-mono font-semibold text-foreground">
                {formatCurrency(dashboardData?.fiscal_vs_internal?.internal_sales_notes_total || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Payment Methods Split */}
        <div className="bg-card/70 border border-border/80 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground font-bold flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-warning" />
              Medios de Pago
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Mes en Curso</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Efectivo (Cash):</span>
              <span className="font-mono font-semibold text-foreground">
                {formatCurrency(dashboardData?.by_payment_method?.CASH || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transferencias:</span>
              <span className="font-mono font-semibold text-foreground">
                {formatCurrency(dashboardData?.by_payment_method?.TRANSFER || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">MercadoPago / Tarjetas:</span>
              <span className="font-mono font-semibold text-foreground">
                {formatCurrency(dashboardData?.by_payment_method?.MERCADOPAGO || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. TABS: FACTURAS FISCALES vs. NOTAS DE VENTA INTERNAS              */}
      {/* =================================================================== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card border border-border p-1">
          <TabsTrigger value="invoices" className="text-xs font-mono uppercase gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Facturas C Oficiales ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="sales_notes" className="text-xs font-mono uppercase gap-2">
            <Receipt className="w-4 h-4 text-tertiary" />
            Notas de Venta Internas ({salesNotes.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Facturas C Oficiales */}
        <TabsContent value="invoices" className="space-y-3">
          <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Comprobante</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Receptor / Cliente</th>
                    <th className="p-3 text-right">Importe</th>
                    <th className="p-3">CAE Oficial</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {invoices.length > 0 ? (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-bold text-foreground">
                          Factura C {String(inv.punto_venta).padStart(4, "0")}-{String(inv.numero_cmp).padStart(8, "0")}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {formatAfipDate(inv.fecha_emision)}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {inv.doc_tipo === 99
                            ? "Consumidor Final"
                            : `${inv.doc_tipo === 80 ? "CUIT" : "DNI"}: ${inv.doc_nro}`}
                        </td>
                        <td className="p-3 text-right font-black text-foreground">
                          {formatCurrency(inv.importe_total)}
                        </td>
                        <td className="p-3">
                          {inv.cae ? (
                            <span className="text-emerald-400 font-semibold">{inv.cae}</span>
                          ) : (
                            <span className="text-muted-foreground italic">Sin CAE</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {inv.status === "APPROVED" ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                              Aprobada
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px]">
                              Rechazada
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewInvoice(inv)}
                            className="h-7 text-xs font-mono gap-1 text-primary hover:text-primary-foreground"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver / QR
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground italic">
                        No hay facturas electrónicas emitidas aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Notas de Venta Internas */}
        <TabsContent value="sales_notes" className="space-y-3">
          <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Número</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3 text-right">Total Venta</th>
                    <th className="p-3">Medio de Pago</th>
                    <th className="p-3 text-center">Estado Fiscal</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {salesNotes.length > 0 ? (
                    salesNotes.map((sn) => (
                      <tr key={sn.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-bold text-foreground">{sn.number}</td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(sn.created_at).toLocaleDateString("es-AR")}
                        </td>
                        <td className="p-3 text-foreground font-medium">{sn.client_name}</td>
                        <td className="p-3 text-right font-black text-foreground">
                          {formatCurrency(sn.total_amount)}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {sn.payment_method}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          {sn.is_fiscal ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                              Fiscalizada (Factura C)
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] text-muted-foreground">
                              No Fiscal (Interna)
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-right flex items-center justify-end gap-1.5">
                          {!sn.is_fiscal && (
                            <Button
                              size="sm"
                              onClick={() => setSelectedSaleNoteForFiscalize(sn)}
                              className="h-7 text-xs bg-emerald-700 hover:bg-emerald-600 text-white font-bold gap-1"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Fiscalizar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewSaleNote(sn)}
                            className="h-7 text-xs font-mono text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground italic">
                        No hay notas de venta registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* =================================================================== */}
      {/* 3. MODALS AND WORKFLOWS                                             */}
      {/* =================================================================== */}
      <DirectInvoiceModal
        open={isDirectModalOpen}
        onOpenChange={setIsDirectModalOpen}
        onSuccess={(inv) => {
          loadData();
          handlePreviewInvoice(inv);
        }}
      />

      <ManualInvoiceModal
        open={isManualModalOpen}
        onOpenChange={setIsManualModalOpen}
        onSuccess={() => {
          loadData();
        }}
      />

      <FiscalizeSaleNoteModal
        open={!!selectedSaleNoteForFiscalize}
        onOpenChange={(open) => {
          if (!open) setSelectedSaleNoteForFiscalize(null);
        }}
        saleNote={selectedSaleNoteForFiscalize}
        onSuccess={() => {
          loadData();
        }}
      />

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
