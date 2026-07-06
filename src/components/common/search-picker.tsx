"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Check, Loader2, X } from "lucide-react";

export interface SearchPickerOption {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
}

interface SearchPickerProps {
  label: string;
  placeholder?: string;
  value?: string;
  onSelect: (option: SearchPickerOption | null) => void;
  fetchOptions: (searchTerm: string) => Promise<SearchPickerOption[]>;
  onAddNew?: () => void;
  addNewLabel?: string;
  disabled?: boolean;
}

/**
 * SearchPicker Component:
 * Reusable debounced autocomplete selector for relational entities (Clients & Devices).
 * Features live search queries with TanStack Query and an integrated "Crear Nuevo" action.
 */
export const SearchPicker: React.FC<SearchPickerProps> = ({
  label,
  placeholder = "Buscar por nombre, DNI o serie...",
  value,
  onSelect,
  fetchOptions,
  onAddNew,
  addNewLabel = "Crear Nuevo",
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedTerm, setDebouncedTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<SearchPickerOption | null>(null);

  // 300ms debounce to prevent API flooding while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: options = [], isLoading, isError } = useQuery({
    queryKey: ["search-picker", label, debouncedTerm],
    queryFn: () => fetchOptions(debouncedTerm),
    enabled: isOpen && !disabled,
    staleTime: 30000,
  });

  const handleSelect = (option: SearchPickerOption) => {
    setSelectedOption(option);
    onSelect(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOption(null);
    onSelect(null);
  };

  return (
    <div className="space-y-2 relative">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {label}
        </label>
        {onAddNew && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAddNew}
            disabled={disabled}
            className="h-6 text-[11px] font-mono uppercase tracking-wider text-tertiary hover:text-tertiary/80 hover:bg-tertiary/10 px-2"
          >
            <Plus className="w-3 h-3 mr-1" />
            {addNewLabel}
          </Button>
        )}
      </div>

      {/* Selected Option Display or Search Trigger */}
      {selectedOption ? (
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-tertiary/50 transition-all">
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Check className="w-4 h-4 text-tertiary" />
              {selectedOption.title}
            </span>
            {selectedOption.subtitle && (
              <span className="text-xs font-mono text-typography pl-6">
                {selectedOption.subtitle}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="text-typography hover:text-error h-8 w-8 p-0"
            title="Deseleccionar"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-typography pointer-events-none" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
            className="pl-9 bg-secondary/20 border-border focus:border-tertiary focus:ring-1 focus:ring-tertiary font-mono text-sm"
          />
        </div>
      )}

      {/* Dropdown Options List */}
      {isOpen && !selectedOption && (
        <>
          {/* Backdrop closer */}
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />

          <Card className="absolute z-30 w-full mt-1 bg-card border-border shadow-2xl max-h-60 overflow-y-auto animate-fadeIn">
            <CardContent className="p-1 space-y-1">
              {isLoading ? (
                <div className="p-4 text-center text-xs text-typography flex items-center justify-center gap-2 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin text-tertiary" />
                  <span>Buscando registros en el sistema...</span>
                </div>
              ) : isError ? (
                <div className="p-4 text-center text-xs text-error font-mono">
                  Error al cargar registros. Intente nuevamente.
                </div>
              ) : options.length === 0 ? (
                <div className="p-4 text-center space-y-2">
                  <p className="text-xs text-typography font-mono">
                    No se encontraron coincidencias para "{searchTerm}".
                  </p>
                  {onAddNew && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setIsOpen(false);
                        onAddNew();
                      }}
                      className="bg-tertiary/15 text-tertiary hover:bg-tertiary/25 border border-tertiary/30 text-xs font-semibold uppercase tracking-wider w-full"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      {addNewLabel}
                    </Button>
                  )}
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className="p-2.5 rounded-md hover:bg-secondary/40 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground group-hover:text-tertiary transition-colors">
                        {option.title}
                      </span>
                      {option.subtitle && (
                        <span className="text-xs font-mono text-typography">
                          {option.subtitle}
                        </span>
                      )}
                    </div>
                    {option.badge && (
                      <span className="text-[10px] font-mono uppercase bg-secondary/50 text-typography px-2 py-0.5 rounded border border-border/40">
                        {option.badge}
                      </span>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
