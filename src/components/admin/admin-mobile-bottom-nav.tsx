"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  List,
  Calculator,
  Smartphone,
  LayoutGrid,
  Plus,
  Wrench,
  Receipt,
  FileText,
  FileSpreadsheet,
  Users,
  Calendar,
  LogOut,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import packageInfo from "../../../package.json";

type DrawerMode = "create" | "more" | null;

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activeColor: string;
  iconColor: string;
  baseColor: string;
  exact: boolean;
}

/**
 * Symmetric mobile bottom navigation (2 + Central Action FAB + 2)
 * with an interactive creation speed-dial and a secondary "More" drawer.
 */
export function AdminMobileBottomNav() {
  const pathname = usePathname();
  const [activeDrawer, setActiveDrawer] = useState<DrawerMode>(null);
  const [showReceiptTypes, setShowReceiptTypes] = useState(false);

  // Close active drawer with Escape key
  useEffect(() => {
    if (!activeDrawer) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDrawer(null);
        setShowReceiptTypes(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDrawer]);

  const leftNavItems: NavItem[] = [
    {
      name: "Órdenes",
      href: "/work-orders",
      icon: List,
      activeColor: "text-tertiary",
      iconColor: "fill-tertiary/20",
      baseColor: "text-typography/70",
      exact: true,
    },
    {
      name: "Presupuestos",
      href: "/quotes",
      icon: Calculator,
      activeColor: "text-primary",
      iconColor: "fill-primary/20",
      baseColor: "text-typography/70",
      exact: false,
    },
  ];

  const devicesNavItem: NavItem = {
    name: "Equipos",
    href: "/devices",
    icon: Smartphone,
    activeColor: "text-success",
    iconColor: "fill-success/20",
    baseColor: "text-typography/70",
    exact: false,
  };

  const isCreateRouteActive =
    pathname === "/work-orders/new" ||
    pathname === "/quotes/new" ||
    pathname === "/billing/new" ||
    pathname === "/billing/sales-notes/new";

  const isMoreRouteActive =
    pathname === "/billing" ||
    pathname.startsWith("/clients") ||
    pathname.startsWith("/availability");

  const toggleDrawer = (mode: Exclude<DrawerMode, null>) => {
    setActiveDrawer((prev) => {
      const next = prev === mode ? null : mode;
      if (next !== "create") {
        setShowReceiptTypes(false);
      }
      return next;
    });
  };

  const closeDrawer = () => {
    setActiveDrawer(null);
    setShowReceiptTypes(false);
  };

  const handleLogout = () => {
    closeDrawer();
    authService.logout();
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = item.exact
      ? pathname === item.href
      : pathname.startsWith(item.href);

    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
          isActive ? item.activeColor : `${item.baseColor} hover:text-foreground`
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? item.iconColor : ""}`} />
        <span className="text-[9px] font-mono uppercase tracking-wider font-semibold">
          {item.name}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Backdrop for active drawer */}
      {activeDrawer && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-background/70 backdrop-blur-sm no-print"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Interactive FAB Creation Menu */}
      {activeDrawer === "create" && (
        <div
          role="dialog"
          aria-label="Menú de creación rápida"
          className="md:hidden fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-3 space-y-2 no-print animate-in fade-in slide-in-from-bottom-4 duration-150"
        >
          <div className="flex items-center justify-between px-2 pb-1 border-b border-border/50">
            <span className="text-[10px] font-mono uppercase tracking-widest text-typography/80 font-semibold">
              Crear nuevo
            </span>
            <button
              type="button"
              onClick={closeDrawer}
              className="p-1 text-typography/70 hover:text-foreground rounded-md"
              aria-label="Cerrar menú de creación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/work-orders/new"
            onClick={closeDrawer}
            className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 hover:bg-secondary/80 border border-border/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-tertiary/15 border border-tertiary/30 flex items-center justify-center text-tertiary">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Nueva Orden de Trabajo
                </p>
                <p className="text-[11px] text-typography/70">
                  Registrar ingreso de equipo al taller
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-typography/60" />
          </Link>

          <Link
            href="/quotes/new"
            onClick={closeDrawer}
            className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 hover:bg-secondary/80 border border-border/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Nuevo Presupuesto
                </p>
                <p className="text-[11px] text-typography/70">
                  Armar cotización para un cliente
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-typography/60" />
          </Link>

          {/* Expandable Receipt / Invoice Selector (C vs X) */}
          <div className="rounded-xl bg-secondary/40 border border-border/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowReceiptTypes((prev) => !prev)}
              aria-expanded={showReceiptTypes}
              className="w-full flex items-center justify-between p-3 hover:bg-secondary/80 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Nuevo Comprobante
                  </p>
                  <p className="text-[11px] text-typography/70">
                    Elegir entre Factura C o Comprobante X
                  </p>
                </div>
              </div>
              {showReceiptTypes ? (
                <ChevronDown className="w-4 h-4 text-typography/60" />
              ) : (
                <ChevronRight className="w-4 h-4 text-typography/60" />
              )}
            </button>

            {showReceiptTypes && (
              <div className="grid grid-cols-2 gap-2 px-3 pb-3 pt-1">
                <Link
                  href="/billing/new"
                  onClick={closeDrawer}
                  className="flex flex-col gap-1 p-2.5 rounded-lg bg-background/80 hover:bg-background border border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-bold">Factura C</span>
                  </div>
                  <span className="text-[10px] text-typography/70 leading-tight">
                    Comprobante fiscal AFIP
                  </span>
                </Link>

                <Link
                  href="/billing/sales-notes/new"
                  onClick={closeDrawer}
                  className="flex flex-col gap-1 p-2.5 rounded-lg bg-background/80 hover:bg-background border border-amber-500/30 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="text-xs font-bold">Comprobante X</span>
                  </div>
                  <span className="text-[10px] text-typography/70 leading-tight">
                    Nota de venta interna
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Secondary "More" Drawer */}
      {activeDrawer === "more" && (
        <div
          role="dialog"
          aria-label="Más módulos y opciones"
          className="md:hidden fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-3 space-y-2 no-print animate-in fade-in slide-in-from-bottom-4 duration-150"
        >
          <div className="flex items-center justify-between px-2 pb-1 border-b border-border/50">
            <span className="text-[10px] font-mono uppercase tracking-widest text-typography/80 font-semibold">
              Más módulos
            </span>
            <button
              type="button"
              onClick={closeDrawer}
              className="p-1 text-typography/70 hover:text-foreground rounded-md"
              aria-label="Cerrar menú de módulos"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/billing"
            onClick={closeDrawer}
            className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
              pathname.startsWith("/billing")
                ? "bg-emerald-500/10 border-emerald-500/40"
                : "bg-secondary/40 hover:bg-secondary/80 border-border/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Facturación</p>
                <p className="text-[11px] text-typography/70">
                  Historial de Facturas C, Notas X y control
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-typography/60" />
          </Link>

          <Link
            href="/clients"
            onClick={closeDrawer}
            className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
              pathname.startsWith("/clients")
                ? "bg-info/10 border-info/40"
                : "bg-secondary/40 hover:bg-secondary/80 border-border/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-info/15 border border-info/30 flex items-center justify-center text-info">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Clientes</p>
                <p className="text-[11px] text-typography/70">
                  Directorio y datos fiscales
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-typography/60" />
          </Link>

          <Link
            href="/availability"
            onClick={closeDrawer}
            className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
              pathname.startsWith("/availability")
                ? "bg-warning/10 border-warning/40"
                : "bg-secondary/40 hover:bg-secondary/80 border-border/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-warning/15 border border-warning/30 flex items-center justify-center text-warning">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Agenda</p>
                <p className="text-[11px] text-typography/70">
                  Disponibilidad horaria y turnos
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-typography/60" />
          </Link>

          <div className="pt-1 border-t border-border/50 flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-typography/50 px-2">
              v{packageInfo.version}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-semibold text-error hover:bg-error/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Symmetric Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/60 pb-safe no-print">
        <div className="flex items-center justify-between h-16 px-1 relative">
          {/* Left Items: Órdenes, Presupuestos */}
          <div className="flex-1 flex justify-around items-center h-full">
            {leftNavItems.map(renderNavItem)}
          </div>

          {/* Central Elevated Interactive FAB */}
          <div className="relative -top-5 flex-shrink-0 mx-2">
            <button
              type="button"
              onClick={() => toggleDrawer("create")}
              aria-expanded={activeDrawer === "create"}
              aria-label="Abrir menú de creación rápida"
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-tertiary/20 transform transition-all active:scale-95 ${
                activeDrawer === "create" || isCreateRouteActive
                  ? "bg-tertiary text-tertiary-foreground"
                  : "bg-background border-2 border-tertiary text-tertiary hover:bg-tertiary hover:text-tertiary-foreground"
              }`}
            >
              <Plus
                className={`w-7 h-7 transition-transform duration-200 ${
                  activeDrawer === "create" ? "rotate-45" : ""
                }`}
              />
            </button>
          </div>

          {/* Right Items: Equipos, Más */}
          <div className="flex-1 flex justify-around items-center h-full">
            {renderNavItem(devicesNavItem)}

            <button
              type="button"
              onClick={() => toggleDrawer("more")}
              aria-expanded={activeDrawer === "more"}
              aria-label="Abrir más módulos"
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                activeDrawer === "more" || isMoreRouteActive
                  ? "text-foreground"
                  : "text-typography/70 hover:text-foreground"
              }`}
            >
              <LayoutGrid
                className={`w-5 h-5 ${
                  activeDrawer === "more" || isMoreRouteActive
                    ? "fill-foreground/15"
                    : ""
                }`}
              />
              <span className="text-[9px] font-mono uppercase tracking-wider font-semibold">
                Más
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
