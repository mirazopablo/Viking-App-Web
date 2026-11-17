"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  CashMovementSummaryResponse,
  CashMovementType,
} from "@/types/cash-movement";
import type { SaleNotePaymentMethod } from "@/types/sales-note";
import { cashMovementService } from "@/services/cash-movement.service";
import { SALE_NOTE_PAYMENT_METHOD_LABELS } from "@/lib/sales-note-document";
import {
  CASH_CATEGORY_LABELS,
  CreateCashMovementModal,
} from "./create-cash-movement-modal";

const PAGE_LIMIT = 20;

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(val || 0);

/**
 * CashFlowTab Component:
 * Displays daily/period cash drawer summary (physical cash vs. digital methods),
 * filtered ledger of cash_movements, and manual movement creation modal.
 */
export const CashFlowTab: React.FC = () => {
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState<CashMovementSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | CashMovementType>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | CashMovementCategory>("ALL");
  const [methodFilter, setMethodFilter] = useState<"ALL" | SaleNotePaymentMethod>("ALL");
  const [offset, setOffset] = useState(0);

  const loadCashData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [listRes, summaryRes] = await Promise.all([
        cashMovementService.getCashMovements({
          from: fromDate || undefined,
          to: toDate || undefined,
          type: typeFilter === "ALL" ? undefined : typeFilter,
          category: categoryFilter === "ALL" ? undefined : categoryFilter,
          payment_method: methodFilter === "ALL" ? undefined : methodFilter,
          limit: PAGE_LIMIT,
          offset,
        }),
        cashMovementService.getCashSummary({
          from: fromDate || undefined,
          to: toDate || undefined,
        }),
      ]);

      setMovements(listRes.data || []);
      setTotalCount(listRes.total || 0);
      setSummary(summaryRes);
    } catch (error) {
      console.error("Error loading cash movements:", error);
      toast.error("No se pudieron cargar los movimientos de caja.");
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, typeFilter, categoryFilter, methodFilter, offset]);

  useEffect(() => {
    loadCashData();
  }, [loadCashData]);

  const cashDrawerNet = summary?.by_payment_method?.CASH?.net ?? 0;
  const digitalNet =
    (summary?.by_payment_method?.TRANSFER?.net ?? 0) +
    (summary?.by_payment_method?.MERCADOPAGO?.net ?? 0) +
    (summary?.by_payment_method?.DEBIT?.net ?? 0) +
    (summary?.by_payment_method?.CREDIT?.net ?? 0);

  const currentPage = Math.floor(offset / PAGE_LIMIT) + 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_LIMIT));

  return (
    <div className="space-y-4">
      {/* Arqueo Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card/70 border border-border/80 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-muted-foreground">
            <span>Caja Física (Efectivo)</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black font-mono text-emerald-400">
            {formatCurrency(cashDrawerNet)}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground">
            Neto en cajón (CASH)
          </p>
        </div>

        <div className="bg-card/70 border border-border/80 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-muted-foreground">
            <span>Cuentas Digitales</span>
            <CreditCard className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-xl font-black font-mono text-sky-400">
            {formatCurrency(digitalNet)}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground truncate">
            Transf: {formatCurrency(summary?.by_payment_method?.TRANSFER?.net ?? 0)} | MP:{" "}
            {formatCurrency(summary?.by_payment_method?.MERCADOPAGO?.net ?? 0)}
          </p>
        </div>

        <div className="bg-card/70 border border-border/80 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-muted-foreground">
            <span>Total Ingresos</span>
            <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-black font-mono text-foreground">
            {formatCurrency(summary?.total_income ?? 0)}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground">
            Señas + cobros del período
          </p>
        </div>

        <div className="bg-card/70 border border-border/80 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-muted-foreground">
            <span>Total Egresos</span>
            <ArrowDownCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl font-black font-mono text-rose-400">
            -{formatCurrency(summary?.total_expense ?? 0)}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground">
            Neto período: {formatCurrency(summary?.net_total ?? 0)}
          </p>
        </div>
      </div>

      {/* Filters & Actions Toolbar */}
      <div className="bg-card border border-border/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setOffset(0);
              setFromDate(e.target.value);
            }}
            className="h-8 w-36 text-xs font-mono"
            title="Desde"
          />
          <Input
            type="date"
            value={toDate}
            onChange={(e) => {
              setOffset(0);
              setToDate(e.target.value);
            }}
            className="h-8 w-36 text-xs font-mono"
            title="Hasta"
          />

          <Select
            value={typeFilter}
            onValueChange={(val) => {
              setOffset(0);
              setTypeFilter(val as "ALL" | CashMovementType);
            }}
          >
            <SelectTrigger className="h-8 w-32 text-xs font-mono">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="ALL">Todos (Tipo)</SelectItem>
              <SelectItem value="INCOME">Ingresos</SelectItem>
              <SelectItem value="EXPENSE">Egresos</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={methodFilter}
            onValueChange={(val) => {
              setOffset(0);
              setMethodFilter(val as "ALL" | SaleNotePaymentMethod);
            }}
          >
            <SelectTrigger className="h-8 w-36 text-xs font-mono">
              <SelectValue placeholder="Medio" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="ALL">Todos (Medio)</SelectItem>
              {Object.entries(SALE_NOTE_PAYMENT_METHOD_LABELS).map(([k, label]) => (
                <SelectItem key={k} value={k}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter}
            onValueChange={(val) => {
              setOffset(0);
              setCategoryFilter(val as "ALL" | CashMovementCategory);
            }}
          >
            <SelectTrigger className="h-8 w-44 text-xs font-mono">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="ALL">Todas (Categoría)</SelectItem>
              {Object.entries(CASH_CATEGORY_LABELS).map(([k, label]) => (
                <SelectItem key={k} value={k}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadCashData}
            disabled={isLoading}
            className="h-8 text-xs font-mono gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8 text-xs font-mono font-bold gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Movimiento
          </Button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Medio</th>
                <th className="p-3">Descripción</th>
                <th className="p-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              {movements.length > 0 ? (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      {new Date(m.created_at).toLocaleString("es-AR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="p-3">
                      {m.type === "INCOME" ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                          INGRESO
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px]">
                          EGRESO
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-foreground">
                      {CASH_CATEGORY_LABELS[m.category] || m.category}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px]">
                        {SALE_NOTE_PAYMENT_METHOD_LABELS[m.payment_method] || m.payment_method}
                      </Badge>
                    </td>
                    <td className="p-3 text-foreground max-w-xs truncate" title={m.description}>
                      {m.description}
                    </td>
                    <td
                      className={`p-3 text-right font-black whitespace-nowrap ${
                        m.type === "INCOME" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {m.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(m.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground italic">
                    {isLoading
                      ? "Cargando movimientos de caja..."
                      : "No hay movimientos registrados para los filtros seleccionados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > PAGE_LIMIT && (
          <div className="px-4 py-2.5 border-t border-border/60 flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>
              Página {currentPage} de {totalPages} ({totalCount} registros)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={offset === 0 || isLoading}
                onClick={() => setOffset((prev) => Math.max(0, prev - PAGE_LIMIT))}
                className="h-7 px-2"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={offset + PAGE_LIMIT >= totalCount || isLoading}
                onClick={() => setOffset((prev) => prev + PAGE_LIMIT)}
                className="h-7 px-2"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <CreateCashMovementModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => loadCashData()}
      />
    </div>
  );
};

