"use client";

import React, { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRIES,
  PhoneCountry,
  normalizePhoneNumber,
  parsePhoneNumber,
  stripNonDigits,
} from "@/lib/phone-utils";

interface PhoneInputProps {
  id?: string;
  value?: string | null;
  onChange: (normalizedValue: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  triggerClassName?: string;
}

/**
 * Reusable WhatsApp-friendly phone input with a searchable country prefix selector.
 * Defaults to Argentina (`549`) and emits normalized digit-only numbers (e.g. `5492604821000`).
 */
export const PhoneInput: React.FC<PhoneInputProps> = ({
  id,
  value,
  onChange,
  onBlur,
  disabled = false,
  placeholder,
  className,
  inputClassName,
  triggerClassName,
}) => {
  const [preferredCountry, setPreferredCountry] = useState<PhoneCountry>(DEFAULT_PHONE_COUNTRY);
  const [open, setOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { activeCountry, localNumber } = useMemo(() => {
    const digits = stripNonDigits(value || "");
    if (!digits) {
      return { activeCountry: preferredCountry, localNumber: "" };
    }
    const parsed = parsePhoneNumber(digits);
    return { activeCountry: parsed.country, localNumber: parsed.localNumber };
  }, [value, preferredCountry]);

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return PHONE_COUNTRIES;
    return PHONE_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.displayCode.includes(q)
    );
  }, [searchQuery]);

  const handleCountrySelect = (country: PhoneCountry) => {
    setPreferredCountry(country);
    setOpen(false);
    setSearchQuery("");
    if (localNumber) {
      onChange(normalizePhoneNumber(country.dialCode, localNumber));
    }
  };

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = stripNonDigits(e.target.value);
    onChange(normalizePhoneNumber(activeCountry.dialCode, digitsOnly));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    const digits = stripNonDigits(pasted);
    if (!digits) return;

    // If pasted text includes a country prefix (e.g. 5492604821000 or +54 9 2604 821000), parse it
    if (pasted.includes("+") || digits.length >= 11) {
      e.preventDefault();
      const parsed = parsePhoneNumber(pasted);
      setPreferredCountry(parsed.country);
      onChange(normalizePhoneNumber(parsed.country.dialCode, parsed.localNumber));
    }
  };

  return (
    <div className={cn("flex items-center gap-1.5 w-full", className)}>
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label="Seleccionar prefijo de país"
            className={cn(
              "inline-flex items-center justify-between gap-1 h-9 px-2.5 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 text-xs font-mono text-foreground shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed",
              triggerClassName
            )}
          >
            <span className="flex items-center gap-1.5">
              <span className="text-sm leading-none">{activeCountry.flag}</span>
              <span className="font-semibold">{activeCountry.dialCode}</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-64 p-2 pointer-events-auto bg-popover border border-border shadow-lg"
        >
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar país o prefijo..."
              className="h-8 pl-8 text-xs bg-secondary/20 border-border"
              autoFocus
            />
          </div>
          <div
            className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5"
            onWheel={(e) => e.stopPropagation()}
          >
            {filteredCountries.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Sin resultados
              </p>
            ) : (
              filteredCountries.map((country) => {
                const isSelected = country.iso === activeCountry.iso;
                return (
                  <button
                    key={country.iso}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs text-left transition-colors",
                      isSelected
                        ? "bg-primary/15 text-primary font-semibold"
                        : "hover:bg-secondary/50 text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-sm leading-none">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground shrink-0">
                      <span>{country.dialCode}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        value={localNumber}
        onChange={handleLocalChange}
        onPaste={handlePaste}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder || activeCountry.placeholder || DEFAULT_PHONE_COUNTRY.placeholder}
        className={cn(
          "bg-secondary/20 border-border focus:border-tertiary font-mono h-9 text-xs",
          inputClassName
        )}
      />
    </div>
  );
};
