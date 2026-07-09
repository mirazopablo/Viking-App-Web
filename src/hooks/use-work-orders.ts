"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workOrderService } from "@/services/work-order.service";
import { WorkOrderResponseDTO, WorkOrderStatusUpdateDTO, RepairStatus } from "@/types/work-order";
import { toast } from "sonner";

/**
 * Custom TanStack Query Hook: useWorkOrdersQuery
 * Fetches and caches the list of workshop work orders with automatic stale time management.
 */
export const useWorkOrdersQuery = (statusFilter?: RepairStatus) => {
  return useQuery<WorkOrderResponseDTO[], Error>({
    queryKey: statusFilter ? ["work-orders", statusFilter] : ["work-orders"],
    queryFn: () => workOrderService.getWorkOrders(statusFilter ? { status: statusFilter } : undefined),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Custom TanStack Query Hook: useWorkOrderDetailsQuery
 * Fetches 360° details for a specific work order UUID.
 */
export const useWorkOrderDetailsQuery = (workOrderId: string) => {
  return useQuery<WorkOrderResponseDTO, Error>({
    queryKey: ["work-order", workOrderId],
    queryFn: () => workOrderService.getWorkOrderById(workOrderId),
    enabled: !!workOrderId,
    staleTime: 15 * 1000,
  });
};

/**
 * Custom TanStack Mutation Hook: useUpdateWorkOrderStatusMutation
 * Executes partial PATCH updates and triggers CASCADE CACHE INVALIDATION
 * across all work order lists, detail views, and dashboard statistics without page reloads.
 */
export const useUpdateWorkOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: WorkOrderStatusUpdateDTO }) =>
      workOrderService.updateWorkOrder(id, dto),
    onSuccess: (updatedOrder, variables) => {
      // 1. Instantly update the specific detail query cache
      queryClient.setQueryData(["work-order", variables.id], updatedOrder);

      // 2. Cascade invalidation: refresh all list queries and status filters
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });

      // 3. Cascade invalidation: refresh public tracking portal caches if active
      queryClient.invalidateQueries({ queryKey: ["work-order-status"] });

      // 4. Cascade invalidation: refresh dashboard KPI counters
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });

      toast.success("Sincronización en cascada exitosa", {
        description: `El estado cambió a ${updatedOrder.repairStatus} y la caché fue actualizada globalmente.`,
      });
    },
    onError: (error: any) => {
      console.error("Mutation failed:", error);
      toast.error("Error de concurrencia", {
        description: "No se pudo actualizar el estado. Verifique su conexión al servidor.",
      });
    },
  });
};

/**
 * Custom TanStack Mutation Hook: useRegenerateSecurityCodeMutation
 * Regenerates the WOVIK security tracking code with cascade cache refresh.
 */
export const useRegenerateSecurityCodeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workOrderService.regenerateSecurityCode(id),
    onSuccess: (updatedOrder, id) => {
      queryClient.setQueryData(["work-order", id], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      toast.success("Código WOVIK regenerado", {
        description: `Nuevo código activo: ${updatedOrder.securityCode}`,
      });
    },
  });
};
