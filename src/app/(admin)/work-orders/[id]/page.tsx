"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { workOrderService } from "@/services/work-order.service";
import { diagnosticService } from "@/services/diagnostic.service";
import { budgetService } from "@/services/budget.service";
import { WorkOrderResponseDTO, SecurityCodeResponseDTO } from "@/types/work-order";
import { StatusBadge } from "@/components/common/status-badge";
import { DiagnosticTimeline } from "@/components/work-orders/diagnostic-timeline";
import { StatusUpdater } from "@/components/work-orders/status-updater";
import { AddDiagnosticPointModal } from "@/components/work-orders/add-diagnostic-point-modal";
import { SecurityCodeModal } from "@/components/work-orders/security-code-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Smartphone,
  AlertCircle,
  Plus,
  Camera,
  Calendar,
  Phone,
  RefreshCw,
  FileText,
  Trash2,
  Edit3,
} from "lucide-react";

interface WorkOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Work Order Detail Admin Page (/work-orders/[id]):
 * Comprehensive workshop triage workspace permitting live status updates,
 * complete client/hardware inspection, and multipart/form-data evidence logging.
 */
export default function WorkOrderDetailPage({ params }: Readonly<WorkOrderDetailPageProps>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resolvedParams = use(params);
  const workOrderId = resolvedParams.id;

  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState<boolean>(false);
  const [regeneratedOrder, setRegeneratedOrder] = useState<SecurityCodeResponseDTO | WorkOrderResponseDTO | null>(null);
  const [isRegeneratingCode, setIsRegeneratingCode] = useState<boolean>(false);
  const [savedBudgetInfo, setSavedBudgetInfo] = useState<{ title?: string; total?: number; mode?: string } | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && workOrderId) {
      try {
        const raw = localStorage.getItem(`viking_budget_${workOrderId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          const total = (parsed.items || []).reduce((acc: number, i: any) => acc + (i.quantity || 0) * (i.unitPrice || 0), 0) +
            (parsed.labors || []).reduce((acc: number, l: any) => acc + (l.amount || 0), 0);
          setSavedBudgetInfo({
            title: parsed.title,
            total,
            mode: parsed.mode,
          });
        }
      } catch (err) {
        console.warn('Could not read local budget:', err);
      }
    }
  }, [workOrderId]);

  // 1. Fetch Work Order Details
  const {
    data: workOrder,
    isLoading: isOrderLoading,
    isError: isOrderError,
    refetch: refetchOrder,
  } = useQuery({
    queryKey: ["work-order", workOrderId],
    queryFn: () => workOrderService.getWorkOrderById(workOrderId),
    staleTime: 30000,
  });

  // 2. Fetch Diagnostic Timeline
  const {
    data: diagnosticPoints = [],
    isLoading: isPointsLoading,
    refetch: refetchPoints,
  } = useQuery({
    queryKey: ["diagnostic-points", workOrderId],
    queryFn: () => diagnosticService.getDiagnosticPoints(workOrderId),
    staleTime: 30000,
  });

  // 3. Fetch Existing Budget from Backend API
  const { data: existingBudget, refetch: refetchBudget } = useQuery({
    queryKey: ["budget", workOrderId],
    queryFn: () => budgetService.getBudgetByWorkOrder(workOrderId).catch(() => null),
    enabled: !!workOrderId,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDeletingBudget, setIsDeletingBudget] = useState<boolean>(false);

  const handleDeleteBudget = async () => {
    const targetId = existingBudget?.id;
    if (!targetId) {
      toast.error("No se encontró el presupuesto para eliminar");
      return;
    }

    try {
      setIsDeletingBudget(true);
      // 1. Delete budget from budgets table
      await budgetService.deleteBudget(targetId);

      // 2. Also delete corresponding BUDGET_SUMMARY diagnostic point from diagnostic_points table
      const budgetPoint = diagnosticPoints.find(
        (p) =>
          p.entryType === "BUDGET_SUMMARY" ||
          p.title?.toLowerCase().includes("presupuesto") ||
          p.description?.toLowerCase().includes("presupuesto")
      );
      if (budgetPoint?.id) {
        try {
          await diagnosticService.deleteDiagnosticPoint(budgetPoint.id);
        } catch (pointErr) {
          console.warn("Could not delete timeline point:", pointErr);
        }
      }

      localStorage.removeItem(`viking_budget_${workOrderId}`);
      setSavedBudgetInfo(null);
      toast.success("Presupuesto e hito de bitácora eliminados permanentemente");
      queryClient.invalidateQueries({ queryKey: ["budget", workOrderId] });
      queryClient.invalidateQueries({ queryKey: ["diagnostic-points", workOrderId] });
      refetchBudget();
      refetchPoints();
    } catch (err: any) {
      console.error("Delete budget failed:", err);
      toast.error(err?.response?.data?.error || "Error al eliminar el presupuesto");
    } finally {
      setIsDeletingBudget(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleRefresh = () => {
    refetchOrder();
    refetchPoints();
    refetchBudget();
    toast.info("Datos actualizados");
  };

  const handleRegenerateCode = async () => {
    try {
      setIsRegeneratingCode(true);
      const updated = await workOrderService.regenerateSecurityCode(workOrderId);
      setRegeneratedOrder(updated);
      toast.success("Código de seguridad regenerado", {
        description: `Nuevo código: ${updated.securityCode || updated.id}`,
      });
      queryClient.setQueryData(["work-order", workOrderId], updated);
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
    } catch (err: unknown) {
      console.error("Regenerate code failed:", err);
      toast.error("Error al regenerar código de seguridad");
    } finally {
      setIsRegeneratingCode(false);
    }
  };

  if (isOrderLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48 bg-secondary" />
        <Skeleton className="h-64 w-full bg-secondary rounded-xl" />
        <Skeleton className="h-48 w-full bg-secondary rounded-xl" />
      </div>
    );
  }

  if (isOrderError || !workOrder) {
    return (
      <Card className="max-w-md mx-auto my-12 p-8 text-center bg-error/10 border-error/30 space-y-4">
        <AlertCircle className="w-12 h-12 text-error mx-auto" />
        <h2 className="text-lg font-bold uppercase text-foreground">Orden no encontrada</h2>
        <p className="text-xs font-mono text-typography">
          No se pudo recuperar la información para el UUID especificado o no tiene permisos de acceso.
        </p>
        <Button onClick={() => router.push("/work-orders")} variant="outline" size="sm" className="text-xs uppercase font-mono mt-2">
          Volver al Listado
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/work-orders">
            <Button variant="outline" size="sm" className="text-xs font-mono tracking-wider uppercase border-border hover:border-tertiary">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Main
            </Button>
          </Link>
          <div className="h-4 w-px bg-border/60 hidden sm:block" />
          <span className="text-xs font-mono text-typography uppercase">
            UUID: <span className="text-foreground">{workOrder.id.slice(0, 8)}...</span>
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerateCode}
            disabled={isRegeneratingCode}
            className="text-xs font-mono uppercase h-9 px-3 border-warning/50 text-warning hover:bg-warning/10"
            title="Regenerar Código de Seguridad (Staff y Admin)"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRegeneratingCode ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Regenerar Código</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="text-xs font-mono uppercase h-9 px-3 border-border"
            title="Refrescar vista"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Refrescar</span>
          </Button>

          <Button
            onClick={() => setIsDiagnosticModalOpen(true)}
            className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground font-bold tracking-wider uppercase text-xs h-9 px-4 shadow-md shadow-tertiary/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Adjuntar Avance / Foto</span>
          </Button>

          {existingBudget || savedBudgetInfo ? (
            <>
              <Link href={`/work-orders/${workOrderId}/budget`}>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-wider uppercase text-xs h-9 px-4 shadow-md gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Editar Presupuesto</span>
                </Button>
              </Link>

              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="font-bold tracking-wider uppercase text-xs h-9 px-3 shadow-md gap-1.5"
                title="Eliminar Presupuesto Permanentemente (Hard Delete)"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Eliminar Presupuesto</span>
              </Button>
            </>
          ) : (
            <Link href={`/work-orders/${workOrderId}/budget`}>
              <Button
                variant="outline"
                className="border-primary/60 text-primary hover:bg-primary/10 font-bold tracking-wider uppercase text-xs h-9 px-4 shadow-sm gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Generar Presupuesto</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="bg-card border-border shadow-2xl overflow-hidden">
        <div className="h-2 w-full bg-tertiary" />
        <CardHeader className="pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-black text-tertiary tracking-widest bg-tertiary/15 px-3 py-1 rounded border border-tertiary/40 uppercase">
                {workOrder.securityCode || "WOVIK-----"}
              </span>
              <StatusBadge status={workOrder.repairStatus} />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold uppercase text-foreground tracking-tight pt-1">
              {workOrder.deviceBrand} {workOrder.deviceModel}
            </CardTitle>
            <CardDescription className="text-xs font-mono text-typography flex items-center gap-4">
              <span className="flex items-center gap-1" suppressHydrationWarning>
                <Calendar className="w-3 h-3 text-tertiary" />
                Ingresado: {new Date(workOrder.createdAt).toLocaleString("es-AR")}
              </span>
            </CardDescription>
          </div>

          <div className="w-full lg:w-auto min-w-[360px] max-w-xl">
            <StatusUpdater
              workOrderId={workOrder.id}
              currentStatus={workOrder.repairStatus}
              onStatusUpdated={(updated) => {
                queryClient.setQueryData(["work-order", workOrderId], updated);
                queryClient.invalidateQueries({ queryKey: ["work-orders"] });
              }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          <Separator className="bg-border/60" />

          {/* Client & Device Comprehensive Inspection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Card */}
            <div className="space-y-3 p-4 rounded-xl bg-secondary/15 border border-border/60">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-wider">
                  <User className="w-4 h-4" />
                  <span>Titular / Propietario</span>
                </span>
                <span className="text-[10px] font-mono bg-secondary/50 px-2 py-0.5 rounded text-typography">
                  DNI: {workOrder.clientDni || "---"}
                </span>
              </div>

              <div className="space-y-1.5">
                <p className="font-bold text-foreground text-base">
                  {workOrder.clientName || "Cliente Taller"}
                </p>
                <div className="space-y-1 text-xs font-mono text-typography pt-1">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-tertiary shrink-0" />
                    <span>Tel: {workOrder.clientPhone || "No registrado"}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Hardware Device Card */}
            <div className="space-y-3 p-4 rounded-xl bg-secondary/15 border border-border/60 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-wider">
                    <Smartphone className="w-4 h-4" />
                    <span>Hardware en Taller</span>
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-success/15 text-success border border-success/30 px-2 py-0.5 rounded">
                    Identificado
                  </span>
                </div>

                <div>
                  <p className="font-bold text-foreground text-base">
                    {workOrder.deviceBrand} {workOrder.deviceModel}
                  </p>
                  <p className="text-xs font-mono text-typography pt-1">
                    N° Serie / IMEI: <span className="text-foreground font-semibold uppercase">{workOrder.deviceSerialNumber || "N/A"}</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/40 text-[11px] font-mono text-typography/80 flex items-center justify-between">
                <span>Garantía Taller: 90 días</span>
                <span className="text-tertiary font-semibold">Repuesto Original</span>
              </div>
            </div>
          </div>

          {/* Reported Issue Triage Box */}
          <div className="space-y-2 p-4 rounded-xl bg-secondary/10 border border-border/60">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-tertiary" />
              <span>Motivo de Ingreso </span>
            </div>
            <p className="text-sm text-foreground/90 italic leading-relaxed pl-6 border-l-2 border-tertiary/60">
              &quot;{workOrder.issueDescription}&quot;
            </p>
          </div>

          <Separator className="bg-border/60" />

          {/* Technical Timeline & Evidence Gallery */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping" />
                  Bitácora de Diagnóstico y Evidencia Fotográfica
                </h3>
                <p className="text-xs text-typography font-mono">
                  Registro cronológico de aperturas, mediciones técnicas y repuestos reemplazados:
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDiagnosticModalOpen(true)}
                className="text-xs font-mono uppercase border-tertiary/50 text-tertiary hover:bg-tertiary/10 self-start sm:self-auto shrink-0"
              >
                <Camera className="w-3.5 h-3.5 mr-1.5" />
                Nueva Entrada (+ Foto)
              </Button>
            </div>

            {isPointsLoading ? (
              <div className="space-y-4 py-4">
                <Skeleton className="h-20 w-full bg-secondary" />
                <Skeleton className="h-20 w-3/4 bg-secondary" />
              </div>
            ) : (
              <DiagnosticTimeline
                points={diagnosticPoints}
                onDelete={async (pointId) => {
                  const targetPoint = diagnosticPoints.find((p) => p.id === pointId);
                  const isBudgetSummary =
                    targetPoint?.entryType === "BUDGET_SUMMARY" ||
                    targetPoint?.title?.toLowerCase().includes("presupuesto") ||
                    targetPoint?.description?.toLowerCase().includes("presupuesto");

                  try {
                    if (isBudgetSummary && existingBudget?.id) {
                      try {
                        await budgetService.deleteBudget(existingBudget.id);
                      } catch (budgetErr) {
                        console.warn("Could not delete budget row:", budgetErr);
                      }
                      localStorage.removeItem(`viking_budget_${workOrderId}`);
                      setSavedBudgetInfo(null);
                    }

                    await diagnosticService.deleteDiagnosticPoint(pointId);
                    toast.success(
                      isBudgetSummary
                        ? "Presupuesto e hito técnico eliminados permanentemente"
                        : "Hito técnico eliminado"
                    );
                    queryClient.invalidateQueries({ queryKey: ["budget", workOrderId] });
                    queryClient.invalidateQueries({ queryKey: ["diagnostic-points", workOrderId] });
                    refetchBudget();
                    refetchPoints();
                  } catch {
                    toast.error("Error al eliminar", { description: "No se pudo borrar el hito en el servidor." });
                  }
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Multipart Upload Modal */ }
      <AddDiagnosticPointModal
        isOpen={isDiagnosticModalOpen}
        onClose={() => setIsDiagnosticModalOpen(false)}
        workOrderId={workOrderId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["diagnostic-points", workOrderId] });
          queryClient.invalidateQueries({ queryKey: ["work-order", workOrderId] });
        }}
      />

      <SecurityCodeModal
        isOpen={!!regeneratedOrder}
        onClose={() => setRegeneratedOrder(null)}
        securityCode={regeneratedOrder?.securityCode || ""}
        clientName={regeneratedOrder?.clientName || workOrder?.clientName || "Cliente"}
        workOrderId={regeneratedOrder?.id || workOrderId}
      />

      {/* Critical Hard Delete Confirmation Modal */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Eliminar Presupuesto Permanentemente
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              ¿Estás seguro de que deseas eliminar permanentemente este presupuesto? Esta acción ejecutará un <strong>borrado físico irreversible</strong> en el servidor PostgreSQL. El cliente ya no podrá consultarlo en la vista pública ni en PDF.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingBudget}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteBudget}
              disabled={isDeletingBudget}
              className="font-bold tracking-wider uppercase text-xs"
            >
              {isDeletingBudget ? "Eliminando..." : "Sí, eliminar permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
