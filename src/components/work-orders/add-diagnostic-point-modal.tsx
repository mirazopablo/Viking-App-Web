"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { diagnosticService } from "@/services/diagnostic.service";
import { DiagnosticPointResponseDTO } from "@/types/diagnostic";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Camera, Upload, X, Loader2, Save, Image as ImageIcon } from "lucide-react";

const diagnosticPointSchema = z.object({
  title: z
    .string()
    .min(3, { message: "El título debe tener al menos 3 caracteres" })
    .max(80, { message: "El título no puede exceder 80 caracteres" }),
  description: z
    .string()
    .min(5, { message: "La descripción técnica debe tener al menos 5 caracteres" })
    .max(500, { message: "La descripción no puede exceder 500 caracteres" }),
});

type DiagnosticPointFormValues = z.infer<typeof diagnosticPointSchema>;

interface AddDiagnosticPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
  onSuccess: (newPoint: DiagnosticPointResponseDTO) => void;
}

/**
 * AddDiagnosticPointModal Component:
 * Modal dialog for logging technical progress and uploading evidence photos (multipart/form-data).
 * Features live image blob preview before transmitting to the server.
 */
export const AddDiagnosticPointModal: React.FC<AddDiagnosticPointModalProps> = ({
  isOpen,
  onClose,
  workOrderId,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<DiagnosticPointFormValues>({
    resolver: zodResolver(diagnosticPointSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const descText = watch("description") || "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Archivo demasiado grande", {
        description: "La imagen no debe superar los 5 MB.",
      });
      return;
    }

    // Validate image type
    if (!file.type.startsWith("image/")) {
      toast.error("Formato no soportado", {
        description: "Por favor seleccione una imagen válida (JPG, PNG, WEBP).",
      });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: DiagnosticPointFormValues) => {
    setIsLoading(true);
    try {
      const newPoint = await diagnosticService.createDiagnosticPoint(
        {
          workOrderId,
          title: data.title,
          description: data.description,
        },
        selectedFile || undefined
      );

      toast.success("Hito técnico registrado", {
        description: `Se adjuntó "${data.title}" al historial de reparación.`,
      });

      handleRemoveImage();
      reset();
      onSuccess(newPoint);
      onClose();
    } catch (error: any) {
      console.error("Diagnostic upload failed:", error);
      const msg = error.response?.data?.message || "Error al subir la evidencia o registrar el hito.";
      toast.error("Error al registrar diagnóstico", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    if (!isLoading) {
      handleRemoveImage();
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
      <DialogContent className="sm:max-w-lg bg-card border-border shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-tertiary absolute top-0 left-0" />
        <DialogHeader className="pt-2">
          <DialogTitle className="text-lg font-bold uppercase text-foreground flex items-center gap-2">
            <Camera className="w-5 h-5 text-tertiary" />
            Registrar Avance / Foto Técnica
          </DialogTitle>
          <DialogDescription className="text-xs font-mono text-typography">
            Adjunta una nota de progreso o fotografía de evidencia para el cliente y el taller.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Título del Hito (*)
            </Label>
            <Input
              id="title"
              placeholder="Ej: Revisión en microscopio / Cambio de módulo..."
              disabled={isLoading}
              className="bg-secondary/20 border-border focus:border-tertiary text-sm font-semibold"
              {...register("title")}
            />
            {errors.title && <p className="text-xs text-error font-medium">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Descripción Técnica Detallada (*)
              </Label>
              <span className={`text-[10px] font-mono ${descText.length > 450 ? "text-error font-bold" : "text-typography"}`}>
                {descText.length}/500
              </span>
            </div>
            <textarea
              id="description"
              rows={4}
              disabled={isLoading}
              placeholder="Ej: Se observa corrosión por líquido en IC de carga. Se aplica baño químico y se procede al reemplazo de componente deteriorado..."
              className="w-full rounded-md bg-secondary/20 border border-border focus:border-tertiary focus:ring-1 focus:ring-tertiary p-3 text-sm text-foreground font-sans transition-all"
              {...register("description")}
            />
            {errors.description && <p className="text-xs text-error font-medium">{errors.description.message}</p>}
          </div>

          {/* Multipart Image Dropzone / Preview */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center justify-between">
              <span>Evidencia Fotográfica (Opcional)</span>
              <span className="text-[10px] text-typography font-mono lowercase">máx 5mb</span>
            </Label>

            {previewUrl ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-tertiary/60 bg-black/60 group max-h-56 flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className="max-h-56 w-auto object-contain" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-xs font-mono uppercase tracking-wider shadow-lg"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Quitar Imagen
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/80 hover:border-tertiary rounded-xl p-6 text-center cursor-pointer transition-all bg-secondary/10 hover:bg-secondary/20 group flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-secondary/40 flex items-center justify-center text-typography group-hover:text-tertiary group-hover:scale-110 transition-all">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono text-typography">
                  <span className="text-tertiary font-bold uppercase underline">Haz clic para adjuntar foto</span> o arrastra un archivo aquí.
                </div>
                <span className="text-[10px] font-mono text-typography/60 uppercase">JPG, PNG, WEBP Soportados</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={handleModalClose}
              disabled={isLoading}
              className="text-xs uppercase font-mono"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground text-xs font-bold uppercase tracking-wider px-6 shadow-md shadow-tertiary/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo Evidencia...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Registrar Avance
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
