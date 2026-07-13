"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PublicLanguage, PublicDictionary, publicDictionaries } from "@/i18n/public-dictionaries";

interface LanguageContextType {
  lang: PublicLanguage;
  setLang: (lang: PublicLanguage) => void;
  toggleLang: () => void;
  t: PublicDictionary;
}

const STORAGE_KEY = "viking-public-lang";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export interface LanguageProviderProps {
  children: ReactNode;
  defaultLang?: PublicLanguage;
}

export function LanguageProvider({ children, defaultLang = "es" }: Readonly<LanguageProviderProps>) {
  const [lang, setLangState] = useState<PublicLanguage>(defaultLang);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY) as PublicLanguage | null;
      if (stored === "es" || stored === "en") {
        setLangState(stored);
      }
    }
  }, []);

  const setLang = (newLang: PublicLanguage) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLang);
    }
  };

  const toggleLang = () => {
    const nextLang: PublicLanguage = lang === "es" ? "en" : "es";
    setLang(nextLang);
  };

  const value: LanguageContextType = {
    lang,
    setLang,
    toggleLang,
    t: publicDictionaries[lang],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
