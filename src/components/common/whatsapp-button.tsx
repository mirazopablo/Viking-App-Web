import React from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsappButton() {
  return (
    <a 
      href="https://wa.me/message/NYPSRDA5EDPGH1" 
      target="_blank" 
      rel="noopener noreferrer"
      className="hidden md:block shrink-0"
    >
      <Button
        size="sm"
        className="bg-success/15 hover:bg-success/25 text-success border border-success/40 font-semibold uppercase tracking-wider text-xs px-3 py-2 h-9 shadow-sm hover:shadow-success/10 transition-all flex items-center gap-1.5"
        title="Consultar a Vicki"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden lg:inline">Reservar Turno</span>
      </Button>
    </a>
  );
}
