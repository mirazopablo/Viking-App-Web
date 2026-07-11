"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { deviceService } from "@/services/device.service";
import { userService } from "@/services/user.service";
import { SearchPicker, SearchPickerOption } from "@/components/common/search-picker";
import { Card } from "@/components/ui/card";
import { VikingCard } from "@/components/shared/viking-card";
import { VikingSearchBar } from "@/components/shared/viking-search-bar";
import { VikingLoader } from "@/components/shared/viking-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Smartphone, Search, Plus, User, Hash, ShieldCheck, Loader2, Save, RefreshCw, Phone, CreditCard, Trash2 } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";

const createDeviceSchema = z.object({
  userId: z.string().min(1, { message: "Debe seleccionar un cliente titular" }),
  brand: z.string().min(2, { message: "Marca requerida" }),
  model: z.string().min(2, { message: "Modelo requerido" }),
  serialNumber: z
    .string()
    .min(3, { message: "Número de serie requerido" })
    .transform((val) => val.trim().toUpperCase()),
});

type CreateDeviceFormValues = z.infer<typeof createDeviceSchema>;

/**
 * Devices Inventory Admin Page (/devices):
 * Workshop inventory dashboard for registered customer hardware.
 */
export default function DevicesInventoryPage() {
  const queryClient = useQueryClient();
  const { isAdmin } = useUserRole();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const debouncedSearch = searchTerm.trim().length >= 2 ? searchTerm.trim() : undefined;

  const { data: devices = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["devices-inventory", debouncedSearch],
    queryFn: () => deviceService.getDevices(undefined, debouncedSearch),
    staleTime: 30000,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreateDeviceFormValues>({
    resolver: zodResolver(createDeviceSchema),
    defaultValues: {
      userId: "",
      brand: "",
      model: "",
      serialNumber: "",
    },
  });

  const handleFetchClients = async (term: string): Promise<SearchPickerOption[]> => {
    const users = await userService.getUsers(term);
    return users.map((u) => ({
      id: u.id,
      title: u.name,
      subtitle: `DNI: ${u.dni} - Tel: ${u.phoneNumber}`,
      badge: "CLIENTE",
    }));
  };

  const onCreateSubmit = async (data: CreateDeviceFormValues) => {
    setIsCreating(true);
    try {
      const newDevice = await deviceService.createDevice({
        userId: data.userId,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
      });
      toast.success("Dispositivo registrado con éxito", {
        description: `${newDevice.brand} ${newDevice.model} (S/N: ${newDevice.serialNumber}) ingresado al parque de hardware.`,
      });
      queryClient.invalidateQueries({ queryKey: ["devices-inventory"] });
      reset();
      setIsNewModalOpen(false);
    } catch (err: any) {
      console.error("Device creation failed:", err);
      const msg = err.response?.data?.message || "No se pudo registrar el equipo. Serie duplicada en el sistema.";
      toast.error("Error al registrar", { description: msg });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDevice = async (dev: DeviceResponseDTO) => {
    const confirmed = window.confirm(
      `¿Está seguro de eliminar el dispositivo "${dev.brand} ${dev.model}" (Serie/IMEI: ${dev.serialNumber})?`
    );
    if (!confirmed) return;

    try {
      await deviceService.deleteDevice(dev.id);
      toast.success("Dispositivo eliminado", {
        description: `El equipo ${dev.serialNumber} fue eliminado del inventario.`,
      });
      queryClient.invalidateQueries({ queryKey: ["devices-inventory"] });
    } catch (err: unknown) {
      console.error("Delete device failed:", err);
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar el dispositivo en el servidor.",
      });
    }
  };

  const filteredDevices = devices.filter((d) => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (
      d.brand.toLowerCase().includes(lower) ||
      d.model.toLowerCase().includes(lower) ||
      d.serialNumber.toLowerCase().includes(lower) ||
      d.userId.toLowerCase().includes(lower) ||
      (d.userName && d.userName.toLowerCase().includes(lower)) ||
      (d.userDni && d.userDni.toString().includes(lower)) ||
      (d.userPhone && d.userPhone.toLowerCase().includes(lower))
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-foreground tracking-tight flex items-center gap-2.5">
            <Smartphone className="w-7 h-7 text-success" />
            Parque de Hardware
          </h1>
          <p className="text-xs font-mono text-typography mt-1">
            Inventario histórico de dispositivos y números de serie en taller.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="border-border hover:border-tertiary h-10 w-10 text-typography"
            title="Refrescar inventario"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin text-tertiary" : ""}`} />
          </Button>

          <Button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-success hover:bg-success/90 text-white font-bold tracking-wider uppercase shadow-lg shadow-success/20 text-xs py-5 px-5"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo Dispositivo
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <VikingSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar por marca, modelo o N° serie / IMEI..."
        variant="device"
        minChars={2}
      />

      {/* Inventory Grid */}
      {isLoading ? (
        <VikingLoader count={6} columns={3} />
      ) : filteredDevices.length === 0 ? (
        <Card className="bg-secondary/15 border-border/60 p-12 text-center space-y-3">
          <Smartphone className="w-12 h-12 text-typography/40 mx-auto" />
          <h3 className="font-bold text-foreground text-base uppercase">No se encontraron dispositivos</h3>
          <p className="text-xs font-mono text-typography">Intente con otra búsqueda o registre un nuevo equipo para un cliente.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredDevices.map((dev) => (
            <VikingCard
              key={dev.id}
              variant="device"
              badgeLeft={
                <span className="text-[10px] font-mono uppercase bg-secondary/60 text-typography px-2 py-0.5 rounded flex items-center gap-1">
                  <Hash className="w-3 h-3 text-success" />
                  <span>Serie / IMEI</span>
                </span>
              }
              badgeRight={
                <span className="text-[10px] font-mono font-bold uppercase bg-success/15 text-success px-2.5 py-0.5 rounded border border-success/30 tracking-wider">
                  {dev.serialNumber}
                </span>
              }
              title={`${dev.brand} ${dev.model}`}
              footer={
                <div className="flex items-center justify-between w-full">
                  <span className="text-typography">Registrado en Taller</span>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDevice(dev)}
                        className="h-7 px-2 text-xs font-mono uppercase text-error hover:text-error hover:bg-error/10 font-semibold"
                        title="Eliminar dispositivo (Sólo Administrador)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <span className="text-success font-semibold">Repuesto OEM</span>
                  </div>
                </div>
              }
            >
              <div className="space-y-2.5 text-xs font-mono text-typography pt-1 bg-secondary/15 p-3.5 rounded-lg border border-border/40 hover:border-success/40 transition-colors">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="flex items-center gap-1.5 font-bold text-foreground truncate" title={dev.userName || dev.userId}>
                    <User className="w-3.5 h-3.5 text-success shrink-0" />
                    {dev.userName || "Cliente Titular"}
                  </span>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-success/15 text-success font-semibold border border-success/30 shrink-0">
                    Titular
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-0.5">
                  <div className="flex items-center gap-1.5 text-typography">
                    <CreditCard className="w-3.5 h-3.5 text-tertiary shrink-0" />
                    <span className="truncate">
                      DNI: <strong className="text-foreground">{dev.userDni ? dev.userDni.toLocaleString("es-AR") : "N/A"}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-typography">
                    <Phone className="w-3.5 h-3.5 text-tertiary shrink-0" />
                    <span className="truncate">
                      Tel: <strong className="text-foreground">{dev.userPhone || "N/A"}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-typography/70 pt-1.5 border-t border-border/30">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-tertiary shrink-0" />
                    <span>Verificado en Taller</span>
                  </span>
                  <span className="truncate max-w-[110px] text-[9px] text-typography/50" title={`UUID Titular: ${dev.userId}`}>
                    {dev.userId.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </VikingCard>
          ))}
        </div>
      )}

      {/* New Device Modal */}
      <Dialog open={isNewModalOpen} onOpenChange={(open) => !open && !isCreating && setIsNewModalOpen(false)}>
        <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold uppercase text-foreground flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-success" />
              Alta de Dispositivo al Inventario
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-typography">
              Asigna una nueva unidad física de hardware a un cliente titular.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4 py-2">
            {/* Client SearchPicker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Seleccione el Cliente Titular (*)
              </Label>
              <SearchPicker
                label=""
                placeholder="Escriba nombre o DNI..."
                value={watch("userId")}
                onSelect={(opt) => setValue("userId", opt ? opt.id : "", { shouldValidate: true })}
                fetchOptions={handleFetchClients}
                disabled={isCreating}
              />
              {errors.userId && <p className="text-xs text-error font-medium">{errors.userId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="brand" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Marca (*)
                </Label>
                <Input
                  id="brand"
                  placeholder="Ej: Samsung"
                  disabled={isCreating}
                  className="bg-secondary/20 border-border focus:border-success"
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
                  placeholder="Ej: Galaxy S24"
                  disabled={isCreating}
                  className="bg-secondary/20 border-border focus:border-success"
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
                placeholder="Ej: SN-8899001122"
                disabled={isCreating}
                className="bg-secondary/20 border-border focus:border-success font-mono uppercase"
                {...register("serialNumber")}
              />
              {errors.serialNumber && <p className="text-xs text-error font-medium">{errors.serialNumber.message}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewModalOpen(false)}
                disabled={isCreating}
                className="text-xs uppercase font-mono"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-success hover:bg-success/90 text-white text-xs font-bold uppercase tracking-wider px-6 shadow-md shadow-success/20"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Registrar Dispositivo
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
