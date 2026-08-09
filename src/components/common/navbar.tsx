"use client";

import React from "react";
import Link from "next/link";
import { Lock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";
import { useLanguage } from "@/context/language-context";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { DesktopBookingModal } from "@/components/booking/desktop-booking-modal";

/**
 * Top Navigation Bar (Navbar):
 * Glassmorphic sticky header with logo, language toggle,
 * booking CTA, track device, and staff login access.
 */
export function Navbar() {
  const { t } = useLanguage();

  const handleScrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-16 md:h-20 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link
          href="/"
          onClick={handleScrollToTop}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary rounded-xl p-1 shrink-0"
        >
          <BrandLogo size="md" showText={true} textVariant="tech" />
        </Link>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          <LanguageToggle />

          <DesktopBookingModal />

          <Link href="/status" className="hidden md:block shrink-0">
            <Button
              size="sm"
              className="bg-info/15 hover:bg-info/25 text-info border border-info/40 font-semibold uppercase tracking-wider text-xs px-3 py-2 h-9 shadow-sm hover:shadow-info/10 transition-all flex items-center gap-1.5"
              title={t.navbar.trackDevice}
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline">{t.navbar.trackShort}</span>
            </Button>
          </Link>

          <Link href="/login" className="hidden sm:block shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="border-border/60 hover:border-tertiary text-typography hover:text-tertiary text-xs uppercase font-mono tracking-wider px-3 py-2 h-9 flex items-center gap-1.5 transition-all bg-secondary/20 hover:bg-tertiary/10"
              title={t.navbar.staffLogin}
            >
              <Lock className="w-4 h-4" />
              <span className="hidden lg:inline">{t.navbar.staffLogin}</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
