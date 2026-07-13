"use client";

import React from "react";
import Link from "next/link";
import { Lock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";
import { useLanguage } from "@/context/language-context";
import { LanguageToggle } from "@/components/shared/language-toggle";

/**
 * Top Navigation Bar (Navbar):
 * Glassmorphic sticky header displaying Viking App brand, anchor links for B2B/B2C services,
 * quick access to public tracking (/status), and discreet staff login (/login).
 */
export function Navbar() {
  const { t } = useLanguage();

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 88; // 5.5rem offset for sticky navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleScrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          onClick={handleScrollToTop}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary rounded-xl p-1"
        >
          <BrandLogo size="md" showText={true} textVariant="tech" />
        </Link>

        {/* Center Anchor Links (Hidden on small screens) */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider uppercase text-typography">
          <a
            href="#services"
            onClick={(e) => handleSmoothScroll(e, "services")}
            className="hover:text-tertiary transition-colors cursor-pointer"
          >
            {t.navbar.services}
          </a>
          <a
            href="#evidence"
            onClick={(e) => handleSmoothScroll(e, "evidence")}
            className="hover:text-tertiary transition-colors cursor-pointer"
          >
            {t.navbar.evidence}
          </a>
          <a
            href="#why-viking"
            onClick={(e) => handleSmoothScroll(e, "why-viking")}
            className="hover:text-tertiary transition-colors cursor-pointer"
          >
            {t.navbar.standards}
          </a>
        </nav>

        {/* Action Buttons: Language Toggle, Track Order & Staff Access */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />

          <Link href="/status">
            <Button
              size="sm"
              className="bg-info/15 hover:bg-info/25 text-info border border-info/40 font-semibold uppercase tracking-wider text-xs px-3 sm:px-4 py-2 h-9 shadow-sm hover:shadow-info/10 transition-all flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.navbar.trackDevice}</span>
              <span className="sm:hidden">{t.navbar.trackShort}</span>
            </Button>
          </Link>

          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="border-border/60 hover:border-tertiary text-typography hover:text-tertiary text-xs uppercase font-mono tracking-wider px-3 h-9 flex items-center gap-1.5 transition-all bg-secondary/20 hover:bg-tertiary/10"
              title="Acceso para Personal y Técnicos"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t.navbar.staffLogin}</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
