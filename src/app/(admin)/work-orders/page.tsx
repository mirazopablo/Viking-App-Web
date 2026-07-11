"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { workOrderService } from "@/services/work-order.service";
import { WorkOrderResponseDTO, SecurityCodeResponseDTO } from "@/types/work-order";
import { StatusBadge } from "@/components/common/status-badge";
import { Card } from "@/components/ui/card";
import { VikingCard } from "@/components/shared/viking-card";
import { VikingSearchBar } from "@/components/shared/viking-search-bar";
import { VikingLoader } from "@/components/shared/viking-loader";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { ErrorStateCard } from "@/components/shared/error-state-card";
import { Button } from "@/components/ui/button";
import { Search, Plus, Wrench, Smartphone, User, ArrowRight, RefreshCw, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/use-user-role";
import { SecurityCodeModal } from "@/components/work-orders/security-code-modal";

/**
 * Work Orders Dashboard (/work-orders):
 * Workshop triage board matching mobile screen 120612.
 * Features debounced search, status filter pills, and quick access to order details.
 */
export default function WorkOrdersDashboardPage() {
  const queryClient = useQueryClient();
  const { isAdmin } = useUserRole();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [regeneratedOrder, setRegeneratedOrder] = useState<SecurityCodeResponseDTO | WorkOrderResponseDTO | null>(null);
  const [isRegeneratingId, setIsRegeneratingId] = useState<string | null>(null);

  const { data: orders = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["work-orders", selectedFilter],
    queryFn: () =>
      workOrderService.getWorkOrders(
        selectedFilter !== "ALL" ? { status: selectedFilter } : undefined
      ),
    staleTime: 30000,
  });

  // Client-side filtering by search term (security code, client name, or device)
  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    const codeMatch = order.securityCode?.toLowerCase().includes(lower);
    const clientMatch = order.clientName?.toLowerCase().includes(lower);
    const deviceMatch = `${order.deviceBrand} ${order.deviceModel}`.toLowerCase().includes(lower);
    const issueMatch = order.issueDescription?.toLowerCase().includes(lower);
    return codeMatch || clientMatch || deviceMatch || issueMatch;
  });

  const filterPills = [
    { label: "Todas", value: "ALL" },
    { label: "Ingresado", value: "RECEIVED" },
    { label: "En Diagnóstico", value: "IN_QUEUE" },
    { label: "En Reparación", value: "IN_PROGRESS" },
    { label: "Listo para Retirar", value: "DONE" },
    { label: "Entregado", value: "WITHDRAWN" },
  ];

  const handleDeleteOrder = async (order: WorkOrderResponseDTO) => {
    const confirmed = window.confirm(
      `¿Está seguro de eliminar la Orden de Trabajo "${order.securityCode || order.id}"? Esta operación es irreversible.`
    );
    if (!confirmed) return;

    try {
      await workOrderService.deleteWorkOrder(order.id);
      toast.success("Orden eliminada", {
        description: `La orden de trabajo fue removida exitosamente.`,
      });
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
    } catch (err: unknown) {
      console.error("Delete work order failed:", err);
      toast.error("Error al eliminar la orden", {
        description: "No se pudo completar la eliminación en el servidor.",
      });
    }
  };

  const handleRegenerateCode = async (order: WorkOrderResponseDTO) => {
    try {
      setIsRegeneratingId(order.id);
      const updated = await workOrderService.regenerateSecurityCode(order.id);
      setRegeneratedOrder(updated);
      toast.success("Código de seguridad regenerado", {
        description: `Nuevo código generado para la orden ${updated.securityCode || updated.id}`,
      });
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
    } catch (err: unknown) {
      console.error("Regenerate security code failed:", err);
      toast.error("Error al regenerar código", {
        description: "No se pudo regenerar el código en el servidor.",
      });
    } finally {
      setIsRegeneratingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Quick Action */}
      <AdminPageHeader
        title="Órdenes de Trabajo"
        subtitle="Gestión en tiempo real de reparaciones y diagnóstico del taller."
        icon={Wrench}
        iconClassName="w-7 h-7 text-tertiary"
        onRefresh={() => refetch()}
        isRefetching={isRefetching}
        refreshTitle="Actualizar listado"
        actions={
          <Link href="/work-orders/new">
            <Button className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground font-bold tracking-wider uppercase shadow-lg shadow-tertiary/20 text-xs py-5 px-5">
              <Plus className="w-4 h-4 mr-1.5" />
              Nueva Orden (Ingreso)
            </Button>
          </Link>
        }
      />

      {/* Search Bar & Filter Pills (Matching screen 120612) */}
      <div className="space-y-4">
        <VikingSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por código WOVIK, cliente o modelo..."
          variant="order"
          minChars={2}
        />

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filterPills.map((pill) => (
            <Button
              key={pill.value}
              variant={selectedFilter === pill.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(pill.value)}
              className={`text-xs font-mono uppercase tracking-wider whitespace-nowrap px-4 py-1.5 transition-all ${selectedFilter === pill.value
                ? "bg-tertiary text-tertiary-foreground font-bold border-tertiary shadow-sm shadow-tertiary/20"
                : "bg-secondary/20 text-typography border-border/60 hover:border-tertiary/40 hover:text-foreground"
                }`}
            >
              {pill.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Work Orders Grid / List */}
      {isLoading ? (
        <VikingLoader count={4} columns={2} />
      ) : isError ? (
        <ErrorStateCard
          title="Error de conexión al servidor"
          description="No se pudieron cargar las órdenes. Verifique que el backend esté en ejecución en el puerto 8080."
          onRetry={() => refetch()}
        />
      ) : filteredOrders.length === 0 ? (
        <EmptyStateCard
          icon={Wrench}
          title="No se encontraron órdenes de trabajo"
          description={
            searchTerm || selectedFilter !== "ALL"
              ? "No hay resultados que coincidan con los filtros activos."
              : "Aún no hay reparaciones registradas en el taller."
          }
          action={
            <Link href="/work-orders/new" className="inline-block">
              <Button className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground text-xs font-bold uppercase tracking-wider">
                <Plus className="w-4 h-4 mr-1.5" />
                Crear Primera Orden
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {filteredOrders.map((order) => (
            <VikingCard
              key={order.id}
              variant="order"
              badgeLeft={
                <span className="text-xs font-mono font-bold text-tertiary tracking-widest bg-tertiary/10 px-2.5 py-1 rounded border border-tertiary/30">
                  {order.securityCode || "WOVIK-----"}
                </span>
              }
              badgeRight={<StatusBadge status={order.repairStatus} />}
              title={`${order.deviceBrand} ${order.deviceModel}`}
              footer={
                <div className="flex items-center justify-between w-full">
                  <span suppressHydrationWarning>Ingreso: {new Date(order.createdAt).toLocaleDateString("es-AR")}</span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRegenerateCode(order)}
                      disabled={isRegeneratingId === order.id}
                      className="h-8 px-2 text-warning hover:text-warning hover:bg-warning/10 uppercase tracking-wider font-semibold text-[11px]"
                      title="Regenerar Código de Seguridad (Staff y Admin)"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingId === order.id ? "animate-spin" : ""}`} />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOrder(order)}
                        className="h-8 px-2 text-error hover:text-error hover:bg-error/10 uppercase tracking-wider font-semibold text-[11px]"
                        title="Eliminar Orden (Sólo Administrador)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Link href={`/work-orders/${order.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-tertiary hover:text-tertiary/80 hover:bg-tertiary/10 uppercase tracking-wider font-semibold text-[11px] group-hover:translate-x-1 transition-all"
                      >
                        <span>Gestionar Orden</span>
                        <ArrowRight className="ml-1 w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-typography">
                  <User className="w-3.5 h-3.5 text-tertiary shrink-0" />
                  <span className="font-semibold text-foreground">{order.clientName || "Cliente Taller"}</span>
                  <span>({order.clientDni || "---"})</span>
                </div>

                <p className="text-xs text-foreground/80 italic leading-relaxed bg-secondary/20 p-2.5 rounded border border-border/40 line-clamp-2">
                  "{order.issueDescription}"
                </p>
              </div>
            </VikingCard>
          ))}
        </div>
      )}

      <SecurityCodeModal
        isOpen={!!regeneratedOrder}
        onClose={() => setRegeneratedOrder(null)}
        securityCode={regeneratedOrder?.securityCode || ""}
        clientName={regeneratedOrder?.clientName || "Cliente"}
        workOrderId={regeneratedOrder?.id}
      />
    </div>
  );
}
