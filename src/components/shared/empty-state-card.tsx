import React from "react";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export interface EmptyStateCardProps {
  icon: LucideIcon;
  title: React.ReactNode;
  description: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * EmptyStateCard:
 * Atomic empty state display card providing standardized iconography,
 * uppercase headings, monospace descriptive text, and optional call-to-action slot.
 */
export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: Readonly<EmptyStateCardProps>) {
  return (
    <Card
      className={`bg-secondary/15 border-border/60 p-12 text-center space-y-3 ${className}`}
    >
      <Icon className="w-12 h-12 text-typography/40 mx-auto" />
      <h3 className="font-bold text-foreground text-base uppercase">{title}</h3>
      <p className="text-xs font-mono text-typography">{description}</p>
      {action && <div className="pt-2 flex justify-center">{action}</div>}
    </Card>
  );
}
