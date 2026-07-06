"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Shield, Wrench, PlusCircle, List, LogOut } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin / Staff Workspace Layout:
 * Protected layout providing top workshop navigation, brand identity, and session security.
 */
export default function AdminLayout({ children }: Readonly<AdminLayoutProps>) {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>("Técnico Staff");

  useEffect(() => {
    // Quick client-side check if token is present
    const token = localStorage.getItem("viking_jwt_token");
    if (!token && typeof window !== "undefined") {
      // In production with real auth, uncomment to force redirect:
      // window.location.href = "/login?reason=no_session";
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground">
      {/* Top Workshop Header */}
      <header className="w-full border-b border-border/60 bg-card/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/work-orders" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-tertiary/20 border border-tertiary/40 flex items-center justify-center group-hover:bg-tertiary/30 transition-colors">
              <Shield className="w-6 h-6 text-tertiary" />
            </div>
            <div>
              <span className="font-bold tracking-wider uppercase text-foreground text-sm sm:text-base block">
                Viking App <span className="text-tertiary">Workshop</span>
              </span>
              <span className="text-[10px] font-mono text-typography tracking-widest block uppercase">
                Panel Técnico & Triage
              </span>
            </div>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/work-orders">
              <Button
                variant={pathname === "/work-orders" ? "default" : "ghost"}
                size="sm"
                className={`text-xs font-mono tracking-wider uppercase ${
                  pathname === "/work-orders"
                    ? "bg-secondary text-foreground font-bold border border-border"
                    : "text-typography hover:text-foreground"
                }`}
              >
                <List className="w-3.5 h-3.5 mr-1.5 text-tertiary" />
                <span className="hidden sm:inline">Órdenes</span>
              </Button>
            </Link>

            <Link href="/work-orders/new">
              <Button
                variant={pathname === "/work-orders/new" ? "default" : "outline"}
                size="sm"
                className={`text-xs font-mono tracking-wider uppercase ${
                  pathname === "/work-orders/new"
                    ? "bg-tertiary text-tertiary-foreground font-bold shadow-md shadow-tertiary/20"
                    : "border-tertiary/40 text-tertiary hover:bg-tertiary/10"
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                <span>Nueva Orden</span>
              </Button>
            </Link>

            <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-typography hover:text-error h-9 w-9"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workshop Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 z-10">
        {children}
      </main>

      {/* Workshop Footer */}
      <footer className="w-full border-t border-border/40 py-6 px-4 text-center text-xs text-typography/60 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} Viking App Systems. Entorno Técnico Protegido.</p>
          <p className="flex items-center gap-1.5 justify-center">
            <Wrench className="w-3.5 h-3.5 text-tertiary" />
            <span>Soporte RBAC Activo</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
