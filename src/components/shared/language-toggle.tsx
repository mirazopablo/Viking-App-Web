"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { PublicLanguage } from "@/i18n/public-dictionaries";

interface LanguageToggleProps {
  className?: string;
}

/**
 * LanguageToggle:
 * Sleek bilingual toggle switch (ES / EN) for public screens.
 */
export function LanguageToggle({ className = "" }: Readonly<LanguageToggleProps>) {
  const { lang, setLang } = useLanguage();

  const handleSelect = (selected: PublicLanguage) => {
    setLang(selected);
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg bg-secondary/30 p-1 border border-border/60 backdrop-blur-md shadow-sm font-mono text-xs select-none ${className}`}
      role="group"
      aria-label="Seleccionar Idioma / Select Language"
    >
      <Globe className="w-3.5 h-3.5 text-tertiary ml-1.5 mr-0.5 shrink-0" />
      <button
        type="button"
        onClick={() => handleSelect("es")}
        className={`px-2 py-1 rounded-md uppercase tracking-wider font-semibold transition-all duration-200 ${
          lang === "es"
            ? "bg-tertiary text-tertiary-foreground shadow-sm"
            : "text-typography/70 hover:text-foreground hover:bg-secondary/40"
        }`}
        aria-pressed={lang === "es"}
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => handleSelect("en")}
        className={`px-2 py-1 rounded-md uppercase tracking-wider font-semibold transition-all duration-200 ${
          lang === "en"
            ? "bg-tertiary text-tertiary-foreground shadow-sm"
            : "text-typography/70 hover:text-foreground hover:bg-secondary/40"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
