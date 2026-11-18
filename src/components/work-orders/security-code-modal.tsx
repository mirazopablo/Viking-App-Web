"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldAlert, Copy, Check, AlertTriangle } from "lucide-react";

interface SecurityCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  securityCode: string;
  clientName?: string;
  workOrderId?: string;
}

function copyTextWithFallback(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (ok) resolve();
      else reject(new Error("execCommand copy failed"));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * SecurityCodeModal Component:
 * Radix AlertDialog locking focus and screen upon Work Order creation or code regeneration.
 * Enforces staff responsibility to deliver the generated tracking code to the client
 * before returning to normal workshop operations.
 */
export const SecurityCodeModal: React.FC<SecurityCodeModalProps> = ({
  isOpen,
  onClose,
  securityCode,
  clientName = "Cliente",
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [confirmedDelivery, setConfirmedDelivery] = useState<boolean>(false);

  const handleCopyCode = async () => {
    try {
      await copyTextWithFallback(securityCode);
      setCopied(true);
      toast.success("Código copiado al portapapeles", {
        description: `Listo para pegar o enviar a ${clientName}.`,
      });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Error al copiar", { description: "Copie el código manualmente." });
    }
  };

  const handleDismiss = () => {
    if (!confirmedDelivery) {
      toast.warning("Confirmación requerida", {
        description: "Debe confirmar que entregó el comprobante de seguridad al cliente.",
      });
      return;
    }
    setConfirmedDelivery(false);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && confirmedDelivery && onClose()}>
      <AlertDialogContent className="sm:max-w-lg bg-card border-2 border-tertiary shadow-2xl p-4 sm:p-6 gap-3 sm:gap-4">
        <AlertDialogHeader className="space-y-2 text-center sm:place-items-center sm:text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-tertiary/20 border border-tertiary/40 flex items-center justify-center mx-auto text-tertiary">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <AlertDialogTitle className="text-base sm:text-xl font-extrabold uppercase text-center text-foreground tracking-wider">
            ¡Código de Seguridad Generado!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs font-mono text-typography text-center leading-relaxed">
            ATENCIÓN STAFF: Este código es el <strong className="text-foreground">único comprobante de consulta</strong> para que el cliente rastree su equipo sin iniciar sesión.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="p-4 sm:p-5 rounded-xl bg-secondary/30 border border-tertiary/60 flex flex-col items-center justify-center gap-2.5 relative overflow-hidden">
          <span className="text-[10px] font-mono uppercase tracking-widest text-typography text-center">
            Comprobante de Retiro & Rastreabilidad
          </span>
          <div className="flex items-center justify-center gap-2.5 sm:gap-4 w-full">
            <span className="text-xl sm:text-3xl font-black font-mono tracking-wider sm:tracking-widest text-tertiary select-all whitespace-nowrap">
              {securityCode}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopyCode}
              className="h-9 w-9 sm:h-10 sm:w-10 border-tertiary/40 hover:bg-tertiary/20 text-foreground shrink-0"
              title="Copiar Código"
            >
              {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-tertiary" />}
            </Button>
          </div>
          <span className="text-xs font-mono text-foreground font-semibold text-center truncate max-w-full">
            Titular: <span className="text-tertiary uppercase">{clientName}</span>
          </span>
        </div>

        {/* Mandatory Handover Checkbox */}
        <label className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmedDelivery}
            onChange={(e) => setConfirmedDelivery(e.target.checked)}
            className="mt-0.5 rounded border-border text-tertiary focus:ring-tertiary w-4 h-4 shrink-0 cursor-pointer"
          />
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground">
              <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
              <span>Confirmé y entregué este código al cliente</span>
            </div>
            <p className="text-[11px] font-mono text-typography leading-tight">
              Si el cliente pierde este código, podés regenerarlo desde el menú Acciones de la orden.
            </p>
          </div>
        </label>

        <AlertDialogFooter className="mt-1 sm:justify-center">
          <AlertDialogAction
            onClick={handleDismiss}
            disabled={!confirmedDelivery}
            className="w-full sm:w-auto px-6 py-3 h-10 bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground font-bold tracking-wider uppercase text-xs disabled:opacity-50 transition-all shadow-lg shadow-tertiary/20"
          >
            Continuar al Panel de Triage
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
