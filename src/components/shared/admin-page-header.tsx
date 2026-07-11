import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, LucideIcon } from "lucide-react";

export interface AdminPageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
  onRefresh?: () => void;
  isRefetching?: boolean;
  refreshTitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * AdminPageHeader:
 * Reusable workshop top bar component ensuring consistent visual structure,
 * title iconography, subtitle typography, and built-in refresh button with spin animation.
 */
export function AdminPageHeader({
  title,
  subtitle,
  icon: Icon,
  iconClassName = "w-7 h-7 text-primary",
  onRefresh,
  isRefetching = false,
  refreshTitle = "Refrescar listado",
  actions,
  children,
  className = "",
}: Readonly<AdminPageHeaderProps>) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6 ${className}`}
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-foreground tracking-tight flex items-center gap-2.5">
          {Icon && <Icon className={iconClassName} />}
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs font-mono text-typography mt-1">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefetching}
            className="border-border hover:border-tertiary h-10 w-10 text-typography shrink-0"
            title={refreshTitle}
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefetching ? "animate-spin text-tertiary" : ""}`}
            />
          </Button>
        )}
        {actions}
        {children}
      </div>
    </div>
  );
}
