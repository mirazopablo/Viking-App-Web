import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, LucideIcon } from "lucide-react";

export interface ErrorStateCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/**
 * ErrorStateCard:
 * Reusable server/network error feedback card providing clear visual alert styling
 * and a built-in retry action button.
 */
export function ErrorStateCard({
  title = "Error de conexión al servidor",
  description = "No se pudo recuperar la información solicitada. Verifique la conexión con el servidor.",
  icon: Icon = AlertCircle,
  onRetry,
  retryLabel = "Reintentar Conexión",
  className = "",
}: Readonly<ErrorStateCardProps>) {
  return (
    <Card
      className={`bg-error/10 border-error/30 p-8 text-center space-y-3 ${className}`}
    >
      <Icon className="w-10 h-10 text-error mx-auto" />
      <h3 className="font-bold uppercase text-foreground">{title}</h3>
      <p className="text-xs font-mono text-typography">{description}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="text-xs uppercase font-mono mt-2 border-error/40 hover:border-error hover:bg-error/10"
        >
          {retryLabel}
        </Button>
      )}
    </Card>
  );
}
