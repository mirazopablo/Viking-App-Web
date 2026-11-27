"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DocumentKind,
  formatCuitMask,
  stripDocumentDigits,
} from "@/lib/document-utils";

interface DocumentInputProps {
  id?: string;
  value?: string | number | null;
  onChange: (cleanDigits: string) => void;
  onKindChange?: (kind: DocumentKind) => void;
  forcedKind?: DocumentKind;
  hideKindSelector?: boolean;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

/**
 * Unified DNI / CUIT / CUIL input component.
 * - In DNI mode: accepts up to 9 digits without hyphens.
 * - In CUIT/CUIL mode: visually formats as `XX-XXXXXXXX-X` (up to 11 digits)
 *   while always emitting clean digits without hyphens to the parent form/state.
 */
export const DocumentInput: React.FC<DocumentInputProps> = ({
  id,
  value,
  onChange,
  onKindChange,
  forcedKind,
  hideKindSelector = false,
  onBlur,
  onKeyDown,
  disabled = false,
  placeholder,
  className,
  inputClassName,
}) => {
  const [preferredKind, setPreferredKind] = useState<DocumentKind>("DNI");

  const digits = stripDocumentDigits(value);
  const activeKind: DocumentKind =
    forcedKind ?? (digits.length > 9 ? "CUIT" : preferredKind);

  const displayValue =
    activeKind === "CUIT" ? formatCuitMask(digits) : digits.slice(0, 9);

  const handleSelectKind = (nextKind: DocumentKind) => {
    setPreferredKind(nextKind);
    onKindChange?.(nextKind);
    if (nextKind === "DNI" && digits.length > 9) {
      onChange(digits.slice(0, 9));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = stripDocumentDigits(e.target.value);
    const maxLen = activeKind === "CUIT" ? 11 : 9;
    const clean = raw.slice(0, maxLen);
    onChange(clean);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    const pastedDigits = stripDocumentDigits(pasted);
    if (!pastedDigits) return;

    if (pasted.includes("-") || pastedDigits.length > 9) {
      e.preventDefault();
      setPreferredKind("CUIT");
      onKindChange?.("CUIT");
      onChange(pastedDigits.slice(0, 11));
    }
  };

  const resolvedPlaceholder =
    placeholder ||
    (activeKind === "CUIT" ? "20-30123456-7" : "Ej: 30123456");

  return (
    <div className={cn("flex items-center gap-1.5 w-full", className)}>
      {!hideKindSelector && (
        <div
          className="inline-flex items-center h-9 p-0.5 rounded-lg border border-border bg-secondary/30 shrink-0"
          role="group"
          aria-label="Tipo de documento"
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleSelectKind("DNI")}
            className={cn(
              "px-2 h-7 rounded-md text-[10px] font-mono font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
              activeKind === "DNI"
                ? "bg-tertiary text-tertiary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            DNI
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleSelectKind("CUIT")}
            title="CUIT / CUIL (11 dígitos con formato XX-XXXXXXXX-X)"
            className={cn(
              "px-2 h-7 rounded-md text-[10px] font-mono font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
              activeKind === "CUIT"
                ? "bg-tertiary text-tertiary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            CUIT
          </button>
        </div>
      )}

      <Input
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleInputChange}
        onPaste={handlePaste}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        disabled={disabled}
        placeholder={resolvedPlaceholder}
        className={cn(
          "flex-1 min-w-[130px] bg-secondary/20 border-border focus:border-tertiary font-mono h-9 text-xs",
          inputClassName
        )}
      />
    </div>
  );
};

