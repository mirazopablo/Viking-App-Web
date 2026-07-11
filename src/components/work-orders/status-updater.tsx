"use client";

import React, { useState } from "react";
import { workOrderService } from "@/services/work-order.service";
import { RepairStatus, WorkOrderResponseDTO } from "@/types/work-order";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";

interface StatusUpdaterProps {
  workOrderId: string;
  currentStatus: RepairStatus;
  onStatusUpdated: (updatedOrder: WorkOrderResponseDTO) => void;
}

/**
 * StatusUpdater Component:
 * Administrative selector permitting staff to transition repair workflows via PATCH requests.
 */
export const StatusUpdater: React.FC<StatusUpdaterProps> = ({
  workOrderId,
  currentStatus,
  onStatusUpdated,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<RepairStatus>(currentStatus);

  const statusOptions: { value: RepairStatus; label: string }[] = [
    { value: "RECEIVED", label: "RECEPCIONADO (Ingresado)" },
    { value: "IN_QUEUE", label: "EN ESPERA (En Cola)" },
    { value: "IN_PROGRESS", label: "EN REPARACIÓN (Taller)" },
    { value: "DONE", label: "LISTO PARA RETIRO (Terminado)" },
    { value: "WITHDRAWN", label: "RETIRADO POR CLIENTE (Entregado)" },
  ];

  const handleUpdate = async () => {
    if (selectedStatus === currentStatus) return;

    setIsLoading(true);
    try {
      const updated = await workOrderService.updateWorkOrder(workOrderId, {
        repairStatus: selectedStatus,
      });

      toast.success("Estado actualizado con éxito", {
        description: `La orden ahora se encuentra en estado: ${selectedStatus}`,
      });

      onStatusUpdated(updated);
    } catch (error: any) {
      console.error("Status update failed:", error);
      toast.error("Error de actualización", {
        description: "No se pudo cambiar el estado en el servidor. Reintente.",
      });
      setSelectedStatus(currentStatus);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanged = selectedStatus !== currentStatus;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-secondary/20 p-3 rounded-xl border border-border/60">
      <div className="flex items-center gap-2 px-2 shrink-0">
        <span className="text-xs font-mono uppercase tracking-wider text-typography">Transición:</span>
      </div>

      <div className="flex-1 min-w-[260px]">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as RepairStatus)}
          disabled={isLoading}
          className="w-full rounded-md bg-neutral-900 border border-border focus:border-tertiary py-2.5 pl-3 pr-8 text-xs text-foreground font-mono uppercase font-semibold transition-all cursor-pointer text-ellipsis overflow-hidden"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-neutral-900 text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {hasChanged && (
        <Button
          type="button"
          size="sm"
          onClick={handleUpdate}
          disabled={isLoading}
          className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground text-xs font-bold uppercase tracking-wider px-4 shrink-0 shadow-md shadow-tertiary/20 animate-pulse-amber"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span>Guardar Cambio</span>
              <CheckCircle2 className="w-3.5 h-3.5 ml-1.5" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};
