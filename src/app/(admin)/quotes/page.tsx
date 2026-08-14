"use client";

import React, { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { VikingCard } from "@/components/shared/viking-card";
import { Button } from "@/components/ui/button";
import { Calculator, Plus, Eye, Trash2, Search, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { QuickQuoteFormSchemaType } from "@/lib/validations/quick-quote";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface SavedQuote extends QuickQuoteFormSchemaType {
  id: string;
}

export default function QuotesDashboardPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadQuotes = () => {
    setIsLoading(true);
    const loadedQuotes: SavedQuote[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("viking_quick_quote_")) {
          const id = key.replace("viking_quick_quote_", "");
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            loadedQuotes.push({ id, ...parsed });
          }
        }
      }
      // Sort by latest first, assuming ID is timestamp
      loadedQuotes.sort((a, b) => Number(b.id) - Number(a.id));
      setQuotes(loadedQuotes);
    } catch (e) {
      console.error("Failed to load quotes", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Avoid synchronous state update in effect warning
    setTimeout(() => {
      loadQuotes();
    }, 0);
  }, []);

  const handleDelete = (id: string) => {
    const confirm = window.confirm("¿Seguro que deseas eliminar este presupuesto?");
    if (confirm) {
      localStorage.removeItem(`viking_quick_quote_${id}`);
      toast.success("Presupuesto eliminado");
      loadQuotes();
    }
  };

  const filteredQuotes = quotes.filter(q => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (
      (q.clientName || "").toLowerCase().includes(lower) ||
      (q.clientEmail || "").toLowerCase().includes(lower) ||
      (q.title || "").toLowerCase().includes(lower) ||
      (q.deviceModel || "").toLowerCase().includes(lower)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <AdminPageHeader
        title="Presupuestario General"
        subtitle="Generador rápido de presupuestos sin necesidad de crear una Orden de Trabajo."
        icon={Calculator}
        iconClassName="w-7 h-7 text-primary"
        onRefresh={loadQuotes}
        isRefetching={isLoading}
        refreshTitle="Refrescar presupuestos"
        actions={
          <Button
            onClick={() => router.push('/quotes/new')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wider uppercase shadow-lg shadow-primary/20 text-xs py-5 px-5"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo Presupuesto
          </Button>
        }
      />

      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder="Buscar por cliente, título o equipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 bg-card/60 backdrop-blur-sm border-border/80 focus:border-primary font-mono text-sm shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : quotes.length === 0 ? (
        <EmptyStateCard
          icon={Calculator}
          title="No hay presupuestos guardados"
          description="Crea un nuevo presupuesto rápido para un cliente."
          action={
            <Button
              onClick={() => router.push('/quotes/new')}
              className="mt-4 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Crear el primero
            </Button>
          }
        />
      ) : filteredQuotes.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm font-mono border border-dashed rounded-lg">
          No se encontraron presupuestos que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredQuotes.map((quote) => (
            <VikingCard
              key={quote.id}
              variant="default"
              badgeLeft={
                <span className="text-[10px] font-mono font-bold uppercase bg-primary/15 text-primary px-2.5 py-1 rounded border border-primary/30 tracking-wider">
                  RAPIDO
                </span>
              }
              title={quote.clientName || 'Cliente No Identificado'}
              footer={
                <div className="flex items-center justify-end gap-2 w-full border-t border-border/40 pt-3 mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(quote.id)}
                    className="h-8 text-xs font-mono uppercase text-destructive hover:text-destructive/90 hover:bg-destructive/10 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => router.push(`/quotes/${quote.id}`)}
                    className="h-8 text-xs font-mono uppercase bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-semibold flex-1 justify-between px-3"
                  >
                    Ver / Editar
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              }
            >
              <div className="space-y-1.5 text-xs font-mono text-typography/80 pt-1">
                <p className="font-semibold text-foreground truncate" title={quote.title}>{quote.title}</p>
                <p className="truncate text-[10px] uppercase">{quote.deviceModel || "Sin equipo detallado"}</p>
                <div className="pt-2 flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>Modo: {quote.mode}</span>
                  <span className="font-bold text-primary">
                    Total: {quote.currency} {(
                      (quote.items || []).reduce((acc: number, item) => acc + ((item.quantity || 0) * (item.unitPrice || 0)), 0) +
                      (quote.labors || []).reduce((acc: number, l) => acc + (l.amount || 0), 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </VikingCard>
          ))}
        </div>
      )}
    </div>
  );
}
