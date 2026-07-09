"use client";

import React from "react";
import { RepairStatus } from "@/types/work-order";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wrench, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: RepairStatus;
  className?: string;
}

/**
 * StatusBadge Component:
 * Renders a visually distinct, semantic pill badge for Work Order status.
 * Incorporates production-grade micro-animations (Hito 5 UX Polish):
 * - Amber pulse with animated ping dot for IN_PROGRESS orders.
 * - Emerald glow and sparkle effect for DONE orders.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const getStatusConfig = (s: RepairStatus) => {
    switch (s) {
      case "RECEIVED":
        return {
          label: "RECEPCIONADO",
          styles: "bg-info/15 text-info border-info/40 hover:bg-info/20 shadow-sm shadow-info/20",
          dotColor: "bg-info",
          icon: <Clock className="w-3 h-3 text-info shrink-0 animate-spin-slow" />,
          isPulsingDot: false,
        };
      case "IN_PROGRESS":
        return {
          label: "EN REPARACIÓN",
          styles:
            "bg-warning/15 text-warning border-warning/60 hover:bg-warning/25 shadow-md shadow-warning/30 animate-pulse-amber font-bold",
          dotColor: "bg-warning",
          icon: <Wrench className="w-3 h-3 text-warning shrink-0 animate-bounce" />,
          isPulsingDot: true,
        };
      case "IN_QUEUE":
        return {
          label: "EN ESPERA / COLA",
          styles: "bg-tertiary/15 text-tertiary border-tertiary/40 hover:bg-tertiary/20",
          dotColor: "bg-tertiary",
          icon: <Clock className="w-3 h-3 text-tertiary shrink-0" />,
          isPulsingDot: false,
        };
      case "DONE":
        return {
          label: "LISTO PARA RETIRO",
          styles:
            "bg-success/15 text-success border-success/70 hover:bg-success/25 shadow-md shadow-success/30 font-bold tracking-widest",
          dotColor: "bg-success",
          icon: <Sparkles className="w-3 h-3 text-success shrink-0 animate-pulse" />,
          isPulsingDot: false,
        };
      case "WITHDRAWN":
        return {
          label: "ENTREGADO / CANCELADO",
          styles: "bg-error/15 text-error border-error/40 hover:bg-error/20 opacity-85",
          dotColor: "bg-error",
          icon: <CheckCircle2 className="w-3 h-3 text-error shrink-0" />,
          isPulsingDot: false,
        };
      default:
        return {
          label: s,
          styles: "bg-muted text-muted-foreground border-border",
          dotColor: "bg-muted-foreground",
          icon: <AlertCircle className="w-3 h-3 text-muted-foreground shrink-0" />,
          isPulsingDot: false,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant="outline"
      className={`px-3 py-1 font-mono font-semibold tracking-wider text-xs uppercase transition-all duration-300 flex items-center gap-2 w-fit rounded-full ${config.styles} ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {config.isPulsingDot && (
          <span className={`absolute inline-flex h-2.5 w-2.5 rounded-full ${config.dotColor} opacity-75 animate-ping`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
      </div>
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
};
