import React from "react";
import Link from "next/link";
import { Lock, Search, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";

/**
 * Top Navigation Bar (Navbar):
 * Glassmorphic sticky header displaying Viking App brand, anchor links for B2B/B2C services,
 * quick access to public tracking (/status), and discreet staff login (/login).
 */
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary rounded-xl p-1">
          <BrandLogo size="md" showText={true} textVariant="tech" />
        </Link>

        {/* Center Anchor Links (Hidden on small screens) */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider uppercase text-typography">
          <a href="#services" className="hover:text-tertiary transition-colors">
            Servicios
          </a>
          <a href="#workshop" className="hover:text-tertiary transition-colors">
            Taller en Vivo
          </a>
          <a href="#why-viking" className="hover:text-tertiary transition-colors">
            Garantía
          </a>
        </nav>

        {/* Action Buttons: Track Order (QR/Ticket ready) & Staff Access */}
        <div className="flex items-center gap-3">
          <Link href="/status">
            <Button
              size="sm"
              className="bg-info/15 hover:bg-info/25 text-info border border-info/40 font-semibold uppercase tracking-wider text-xs px-3 sm:px-4 py-2 h-9 shadow-sm hover:shadow-info/10 transition-all flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rastrear Equipo</span>
              <span className="sm:hidden">Rastrear</span>
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
              <span className="hidden lg:inline">Staff Login</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
