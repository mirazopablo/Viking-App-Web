"use client";

import React, { useState } from "react";
import { DiagnosticPointResponseDTO } from "@/types/diagnostic";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Image as ImageIcon, Trash2, ZoomIn, ExternalLink, Loader2 } from "lucide-react";

interface DiagnosticTimelineProps {
  points: DiagnosticPointResponseDTO[];
  onDelete?: (id: string) => Promise<void> | void;
}

/**
 * DiagnosticTimeline Component:
 * Displays a chronological vertical timeline of diagnostic entries, technical notes,
 * and uploaded hardware evidence photos.
 * Recreates the "HISTORIAL DE DIAGNÓSTICO" layout seen in mobile screen 121231.
 * Features an integrated Fullscreen Lightbox viewer and optional granular deletion via Radix AlertDialog.
 */
export const DiagnosticTimeline: React.FC<DiagnosticTimelineProps> = ({ points, onDelete }) => {
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [pointToDelete, setPointToDelete] = useState<DiagnosticPointResponseDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  if (!points || points.length === 0) {
    return (
      <Card className="bg-secondary/20 border-border/60">
        <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
          <FileText className="w-10 h-10 text-typography/50" />
          <p className="text-sm font-medium">No se han registrado hitos de diagnóstico para esta orden aún.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort chronologically (newest first for status viewer)
  const sortedPoints = [...points].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleDeleteConfirm = async () => {
    if (!pointToDelete || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(pointToDelete.id);
      setPointToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="relative border-l-2 border-tertiary/40 ml-4 md:ml-6 pl-6 space-y-6 my-4">
        {sortedPoints.map((point, index) => {
          const formattedDate = new Date(point.createdAt).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div key={point.id || index} className="relative group">
              {/* Timeline Node Dot */}
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-tertiary border-4 border-background group-hover:scale-125 transition-transform duration-200" />

              <Card className="bg-card/80 backdrop-blur-sm border-border/80 hover:border-tertiary/50 transition-all duration-300 shadow-sm hover:shadow-md">
                <CardContent className="p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                    <h4 className="font-semibold text-foreground text-base tracking-tight flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-tertiary rounded-full inline-block" />
                      {point.title}
                    </h4>
                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <span className="text-xs text-typography flex items-center gap-1.5 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-tertiary" />
                        {formattedDate}
                      </span>
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPointToDelete(point)}
                          className="h-7 w-7 text-typography hover:text-error hover:bg-error/10 -mr-1"
                          title="Eliminar hito de diagnóstico"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {point.description}
                  </p>

                  {point.imageUrl && (
                    <div className="mt-3 pt-2 border-t border-border/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-tertiary">
                          <ImageIcon className="w-4 h-4" />
                          <span>EVIDENCIA ADJUNTA</span>
                        </div>
                        <span className="text-[10px] font-mono text-typography uppercase">Clic para ampliar</span>
                      </div>
                      <div
                        onClick={() => setLightboxImage({ url: point.imageUrl!, title: point.title })}
                        className="relative overflow-hidden rounded-lg border border-border/80 max-w-sm bg-secondary/30 group/img cursor-pointer"
                      >
                        <img
                          src={point.imageUrl}
                          alt={`Evidencia técnica: ${point.title}`}
                          className="w-full h-auto object-cover max-h-56 group-hover/img:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold uppercase tracking-wider">
                          <ZoomIn className="w-4 h-4" />
                          <span>Ver Pantalla Completa</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Lightbox Dialog */}
      <Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
        <DialogContent className="max-w-4xl w-[95vw] bg-card/95 border-tertiary/40 shadow-2xl p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base sm:text-lg font-bold uppercase text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-tertiary" />
                {lightboxImage?.title}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="relative rounded-xl overflow-hidden bg-black/80 flex items-center justify-center max-h-[75vh] border border-border">
            {lightboxImage && (
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[75vh] w-auto object-contain"
              />
            )}
          </div>
          <div className="flex justify-end pt-2">
            {lightboxImage && (
              <a href={lightboxImage.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs font-mono uppercase">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Abrir en Pestaña Nueva
                </Button>
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Radix AlertDialog for Granular Deletion */}
      <AlertDialog open={!!pointToDelete} onOpenChange={(open) => !open && !isDeleting && setPointToDelete(null)}>
        <AlertDialogContent className="sm:max-w-md bg-card border-border shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold uppercase text-foreground flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-error" />
              ¿Eliminar Hito de Diagnóstico?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-mono text-typography leading-relaxed">
              Esta acción eliminará de forma permanente el hito técnico y su fotografía de evidencia adjunta. El cliente ya no podrá visualizarlo en el portal público.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pointToDelete && (
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 space-y-1">
              <p className="text-xs font-bold text-foreground">{pointToDelete.title}</p>
              <p className="text-xs text-typography italic line-clamp-2">"{pointToDelete.description}"</p>
            </div>
          )}
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isDeleting} className="text-xs font-mono uppercase">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-error hover:bg-error/90 text-white font-bold uppercase tracking-wider text-xs px-6"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Sí, Eliminar Evidencia"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
