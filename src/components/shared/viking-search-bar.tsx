import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { VikingCardVariant } from "./viking-card";

export interface VikingSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: VikingCardVariant;
  minChars?: number;
  className?: string;
}

/**
 * VikingSearchBar:
 * Reusable debounced/controlled search input with domain-specific focus ring coloring
 * and minimum character guidance (enforcing rules like 2-digit DNI filtering).
 */
export function VikingSearchBar({
  value,
  onChange,
  placeholder = "Buscar en el sistema...",
  variant = "default",
  minChars = 0,
  className = "",
}: Readonly<VikingSearchBarProps>) {
  const focusVariantMap: Record<VikingCardVariant, string> = {
    order: "focus:border-tertiary focus:ring-1 focus:ring-tertiary",
    client: "focus:border-info focus:ring-1 focus:ring-info",
    device: "focus:border-success focus:ring-1 focus:ring-success",
    default: "focus:border-primary focus:ring-1 focus:ring-primary",
  };

  const currentFocus = focusVariantMap[variant];
  const showGuidance = minChars > 0 && value.length > 0 && value.length < minChars;

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-typography pointer-events-none" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pl-10 pr-9 bg-secondary/20 border-border font-mono text-sm h-10 transition-all ${currentFocus}`}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-3 text-typography hover:text-foreground transition-colors"
            title="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {showGuidance && (
        <p className="text-[11px] font-mono text-warning/90 pl-1 animate-fadeIn">
          * Escriba al menos {minChars} caracteres para aplicar filtrado relacional.
        </p>
      )}
    </div>
  );
}
