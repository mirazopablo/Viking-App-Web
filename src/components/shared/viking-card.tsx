import React from "react";
import { Card } from "@/components/ui/card";

export type VikingCardVariant = "order" | "client" | "device" | "default";

export interface VikingCardProps {
  children: React.ReactNode;
  variant?: VikingCardVariant;
  className?: string;
  onClick?: () => void;
}

/**
 * VikingCard:
 * Shared atomic card component enforcing domain-specific semantic color coding:
 * - order: Crimson Red (tertiary) for work order urgency and precision
 * - client: Cyan/Info (info) for client communication and directory lookups
 * - device: Green/Success (success) for hardware inventory and assets
 */
export function VikingCard({
  children,
  variant = "order",
  className = "",
  onClick,
}: Readonly<VikingCardProps>) {
  // Map domain variants to Tailwind border, shadow glow, and highlight bar colors
  const variantConfig: Record<
    VikingCardVariant,
    { borderShadow: string; topBar: string }
  > = {
    order: {
      borderShadow:
        "hover:border-tertiary/60 hover:shadow-xl hover:shadow-tertiary/10",
      topBar: "bg-tertiary/40 group-hover:bg-tertiary",
    },
    client: {
      borderShadow: "hover:border-info/60 hover:shadow-xl hover:shadow-info/10",
      topBar: "bg-info/40 group-hover:bg-info",
    },
    device: {
      borderShadow:
        "hover:border-success/60 hover:shadow-xl hover:shadow-success/10",
      topBar: "bg-success/40 group-hover:bg-success",
    },
    default: {
      borderShadow:
        "hover:border-border hover:shadow-xl hover:shadow-secondary/10",
      topBar: "bg-secondary/40 group-hover:bg-secondary",
    },
  };

  const currentConfig = variantConfig[variant];

  return (
    <Card
      onClick={onClick}
      className={`bg-card/90 backdrop-blur-sm border-border/80 transition-all duration-300 shadow-sm flex flex-col justify-between group overflow-hidden ${currentConfig.borderShadow} ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Animated Top Semantic Highlight Bar */}
      <div
        className={`h-1 w-full transition-colors shrink-0 ${currentConfig.topBar}`}
      />
      {children}
    </Card>
  );
}
