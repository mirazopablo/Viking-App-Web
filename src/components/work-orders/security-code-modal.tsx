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

/**
 * SecurityCodeModal Component:
 * Radix AlertDialog locking focus and screen upon Work Order creation.
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
      await navigator.clipboard.writeText(securityCode);
      setCopied(true);
      toast.success("Código copiado al portapapeles", {
        description: `Listo para pegar o imprimir para ${clientName}.`,
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
      <AlertDialogContent className="sm:max-w-lg bg-card border-2 border-tertiary shadow-2xl">
        <AlertDialogHeader className="space-y-3">
          <div className="w-12 h-12 rounded-full bg-tertiary/20 border border-tertiary/40 flex items-center justify-center mx-auto text-tertiary animate-bounce">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <AlertDialogTitle className="text-xl font-extrabold uppercase text-center text-foreground tracking-wider">
            ¡Código de Seguridad Generado!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs font-mono text-typography text-center leading-relaxed">
            ATENCIÓN STAFF: Este código es el **único comprobante de consulta** para que el cliente rastree su equipo sin iniciar sesión. Es su responsabilidad entregarlo en este momento.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-6 p-6 rounded-xl bg-secondary/30 border border-tertiary/60 flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
          <span className="text-[10px] font-mono uppercase tracking-widest text-typography">
            Comprobante de Retiro & Rastreabilidad
          </span>
          <div className="flex items-center gap-4">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-tertiary select-all">
              {securityCode}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopyCode}
              className="h-10 w-10 border-tertiary/40 hover:bg-tertiary/20 text-foreground shrink-0"
              title="Copiar Código"
            >
              {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5 text-tertiary" />}
            </Button>
          </div>
          <span className="text-xs font-mono text-foreground font-semibold">
            Titular: <span className="text-tertiary uppercase">{clientName}</span>
          </span>
        </div>

        {/* Mandatory Handover Checkbox */}
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground block cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={confirmedDelivery}
                onChange={(e) => setConfirmedDelivery(e.target.checked)}
                className="rounded border-border text-tertiary focus:ring-tertiary w-4 h-4 cursor-pointer"
              />
              <span>Confirmé y entregué este código al cliente</span>
            </label>
            <p className="text-[11px] font-mono text-typography leading-tight">
              Si el cliente pierde este código, solo un administrador podrá regenerarlo mediante autenticación secundaria en una futura versión.
            </p>
          </div>
        </div>

        <AlertDialogFooter className="mt-4 sm:justify-center">
          <AlertDialogAction
            onClick={handleDismiss}
            disabled={!confirmedDelivery}
            className="w-full sm:w-auto px-8 py-5 bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground font-bold tracking-wider uppercase disabled:opacity-50 transition-all shadow-lg shadow-tertiary/20"
          >
            Continuar al Panel de Triage
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
