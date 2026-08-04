'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Stethoscope, Plus, Copy, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DiagnosticPointResponseDTO } from '@/types/diagnostic';
import { BudgetFormSchemaType } from '@/lib/validations/budget';
import { getImageUrl } from '@/lib/utils';

interface DiagnosticPointsDrawerProps {
  diagnosticPoints?: DiagnosticPointResponseDTO[];
  isLoading?: boolean;
}

export const DiagnosticPointsDrawer: React.FC<DiagnosticPointsDrawerProps> = ({
  diagnosticPoints = [],
  isLoading = false,
}) => {
  const { watch, setValue } = useFormContext<BudgetFormSchemaType>();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const currentBlocks = watch('blocks') || [];

  const handleInsertAsParagraph = (point: DiagnosticPointResponseDTO) => {
    const newBlockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newBlock = {
      id: newBlockId,
      type: 'TEXT_PARAGRAPH' as const,
      title: point.title,
      content: point.description,
    };
    setValue('blocks', [...currentBlocks, newBlock], { shouldDirty: true });
    setIsOpen(false);
  };

  const handleInsertAsWarning = (point: DiagnosticPointResponseDTO) => {
    const newBlockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newBlock = {
      id: newBlockId,
      type: 'WARNING_NOTE' as const,
      title: point.title,
      content: point.description,
      severity: 'warning' as const,
    };
    setValue('blocks', [...currentBlocks, newBlock], { shouldDirty: true });
    setIsOpen(false);
  };

  const handleCopyText = (point: DiagnosticPointResponseDTO) => {
    const textToCopy = `${point.title}: ${point.description}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(point.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
          <Stethoscope className="w-4 h-4" />
          Puntos de Diagnóstico Rápido ({diagnosticPoints.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="w-5 h-5 text-primary" />
            Hallazgos del Diagnóstico Técnico
          </DialogTitle>
          <DialogDescription className="text-xs">
            Revisa los avances y mediciones registradas para este equipo e insértalas directamente en los bloques del presupuesto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {isLoading ? (
            <div className="p-6 text-center text-xs text-muted-foreground animate-pulse">
              Cargando puntos de diagnóstico del equipo...
            </div>
          ) : diagnosticPoints.length === 0 ? (
            <div className="p-8 border border-dashed rounded-lg text-center space-y-2">
              <Info className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium text-foreground">No hay puntos de diagnóstico registrados aún.</p>
              <p className="text-xs text-muted-foreground">
                Los técnicos pueden registrar avances con fotos directamente en el detalle de la Orden de Trabajo.
              </p>
            </div>
          ) : (
            diagnosticPoints.map((point) => (
              <div
                key={point.id}
                className="p-3.5 border rounded-lg bg-card/60 hover:bg-card transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {new Date(point.createdAt).toLocaleDateString()}
                    </Badge>
                    <h4 className="text-sm font-semibold text-foreground">{point.title}</h4>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyText(point)}
                    className="h-7 text-xs text-muted-foreground"
                  >
                    {copiedId === point.id ? (
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 mr-1" />
                    )}
                    {copiedId === point.id ? 'Copiado' : 'Copiar'}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{point.description}</p>

                {point.imageUrl && (
                  <div className="pt-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageUrl(point.imageUrl)}
                      alt={point.title}
                      className="max-h-32 rounded object-cover border"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                  <span className="text-[10px] text-muted-foreground font-medium">Insertar en Presupuesto:</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInsertAsParagraph(point)}
                    className="h-6 text-[11px] px-2"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Como Párrafo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInsertAsWarning(point)}
                    className="h-6 text-[11px] px-2 text-amber-600 border-amber-300"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Como Advertencia
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
