"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { deviceService } from "@/services/device.service";
import { DeviceResponseDTO } from "@/types/device";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Smartphone, Loader2, Save } from "lucide-react";

const quickDeviceSchema = z.object({
  brand: z.string().min(2, { message: "Marca requerida" }),
  model: z.string().min(2, { message: "Modelo requerido" }),
  serialNumber: z
    .string()
    .min(3, { message: "El número de serie es requerido" })
    .transform((val) => val.trim().toUpperCase()),
});

type QuickDeviceFormValues = z.infer<typeof quickDeviceSchema>;

interface QuickDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName?: string;
  onSuccess: (newDevice: DeviceResponseDTO) => void;
}

/**
 * QuickDeviceModal Component:
 * Dialog for registering hardware inventory linked to a specific client.
 */
export const QuickDeviceModal: React.FC<QuickDeviceModalProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName = "Cliente",
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuickDeviceFormValues>({
    resolver: zodResolver(quickDeviceSchema),
    defaultValues: {
      brand: "",
      model: "",
      serialNumber: "",
    },
  });

  const onSubmit = async (data: QuickDeviceFormValues) => {
    if (!clientId) {
      toast.error("Selección incompleta", { description: "Debe seleccionar un cliente antes de registrar un equipo." });
      return;
    }

    setIsLoading(true);
    try {
      const newDevice = await deviceService.createDevice({
        userId: clientId,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
      });

      toast.success("Equipo registrado con éxito", {
        description: `${newDevice.brand} ${newDevice.model} (S/N: ${newDevice.serialNumber}) asignado a ${clientName}.`,
      });

      reset();
      onSuccess(newDevice);
      onClose();
    } catch (error: any) {
      console.error("Device registration failed:", error);
      const msg = error.response?.data?.message || "No se pudo registrar el equipo. Número de serie duplicado.";
      toast.error("Error al registrar equipo", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold uppercase text-foreground flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-tertiary" />
            Alta Rápida de Equipo
          </DialogTitle>
          <DialogDescription className="text-xs font-mono text-typography">
            Vinculando dispositivo al cliente: <strong className="text-foreground">{clientName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="brand" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Marca (*)
              </Label>
              <Input
                id="brand"
                placeholder="Ej: Samsung / Apple"
                disabled={isLoading}
                className="bg-secondary/20 border-border focus:border-tertiary"
                {...register("brand")}
              />
              {errors.brand && <p className="text-xs text-error font-medium">{errors.brand.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="model" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Modelo (*)
              </Label>
              <Input
                id="model"
                placeholder="Ej: Galaxy S23 Ultra"
                disabled={isLoading}
                className="bg-secondary/20 border-border focus:border-tertiary"
                {...register("model")}
              />
              {errors.model && <p className="text-xs text-error font-medium">{errors.model.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="serialNumber" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Número de Serie / IMEI (*)
            </Label>
            <Input
              id="serialNumber"
              placeholder="Ej: SN-9988776655"
              disabled={isLoading}
              className="bg-secondary/20 border-border focus:border-tertiary font-mono uppercase"
              {...register("serialNumber")}
            />
            {errors.serialNumber && <p className="text-xs text-error font-medium">{errors.serialNumber.message}</p>}
            <p className="text-[10px] font-mono text-typography/70">
              El número de serie será inmutable en futuras ediciones.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="text-xs uppercase font-mono">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground text-xs font-semibold uppercase tracking-wider">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Vincular Equipo
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
