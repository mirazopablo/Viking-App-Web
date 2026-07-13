"use client";

import React from "react";
import Link from "next/link";
import { Wrench, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { useLanguage } from "@/context/language-context";
import { LanguageToggle } from "@/components/shared/language-toggle";

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Public Layout:
 * Clean, accessible wrapper for unauthenticated clients checking repair status.
 * Features top navigation back to main portal or login.
 */
export default function PublicLayout({ children }: Readonly<PublicLayoutProps>) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground relative">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-border/60 bg-card/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <BrandLogo size="sm" />
            <div>
              <span className="font-bold tracking-wider uppercase text-foreground text-sm sm:text-base block">
                Viking App
              </span>
              <span className="text-[10px] font-mono text-typography tracking-widest block uppercase">
                {t.publicLayout.portalSubtitle}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageToggle />

            <Link
              href="/login"
              className="text-xs font-semibold text-typography hover:text-tertiary transition-colors flex items-center gap-1.5 uppercase tracking-wider font-mono bg-secondary/30 px-3 py-1.5 rounded-md border border-border/40 hover:border-tertiary/40"
            >
              <span>{t.publicLayout.staffAccess}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 z-10 flex flex-col items-center justify-start">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-6 px-4 text-center text-xs text-typography/60 font-mono">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} {t.publicLayout.footerCopyright}</p>
          <p className="flex items-center gap-1.5 justify-center">
            <Wrench className="w-3.5 h-3.5 text-tertiary" />
            <span>{t.publicLayout.footerSupport}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
