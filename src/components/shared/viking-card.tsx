import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export type VikingCardVariant = "order" | "client" | "device" | "default";

export interface VikingCardProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  badgeLeft?: React.ReactNode;
  badgeRight?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: VikingCardVariant;
  className?: string;
  contentClassName?: string;
  onClick?: () => void;
}

/**
 * VikingCard:
 * Shared atomic card component enforcing domain-specific semantic color coding
 * and structured layout slots (badgeLeft, badgeRight, title, footer, children):
 * - order: Crimson Red (tertiary) for work order urgency and precision
 * - client: Cyan/Info (info) for client communication and directory lookups
 * - device: Green/Success (success) for hardware inventory and assets
 */
export function VikingCard({
  children,
  title,
  badgeLeft,
  badgeRight,
  footer,
  variant = "order",
  className = "",
  contentClassName = "",
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
  const hasHeader = Boolean(title || badgeLeft || badgeRight);
  const useStructuredLayout = Boolean(hasHeader || footer);

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

      {useStructuredLayout ? (
        <>
          {hasHeader && (
            <CardHeader className="p-5 pb-3 space-y-1.5">
              {(badgeLeft || badgeRight) && (
                <div className="flex items-center justify-between gap-2">
                  <div>{badgeLeft}</div>
                  <div>{badgeRight}</div>
                </div>
              )}
              {title && (
                <CardTitle className="text-base font-bold text-foreground tracking-tight pt-0.5">
                  {title}
                </CardTitle>
              )}
            </CardHeader>
          )}

          <CardContent
            className={`p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between ${contentClassName}`}
          >
            <div className="flex-1">{children}</div>

            {footer && (
              <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-typography">
                {footer}
              </div>
            )}
          </CardContent>
        </>
      ) : (
        children
      )}
    </Card>
  );
}

