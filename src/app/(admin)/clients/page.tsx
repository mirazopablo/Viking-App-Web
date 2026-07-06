"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { userService } from "@/services/user.service";
import { UserResponseDTO } from "@/types/user";
import { QuickClientModal } from "@/components/clients/quick-client-modal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Users, Search, Plus, Phone, Mail, MapPin, Edit3, ShieldAlert, Loader2, Save, RefreshCw } from "lucide-react";

/**
 * Schema for updating user profile.
 * Note: DNI and Email are intentionally excluded or marked readOnly to enforce immutable PII rules.
 */
const editClientSchema = z.object({
  name: z.string().min(3, { message: "Nombre requerido" }),
  phoneNumber: z.string().min(8, { message: "Teléfono requerido" }),
  address: z.string().min(5, { message: "Dirección requerida" }),
});

type EditClientFormValues = z.infer<typeof editClientSchema>;

/**
 * Clients Directory Admin Page (/clients):
 * Workshop directory for managing customer records.
 * Enforces PII protection by locking DNI and Email against modifications.
 */
export default function ClientsDirectoryPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [clientToEdit, setClientToEdit] = useState<UserResponseDTO | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const { data: clients = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["users-directory"],
    queryFn: () => userService.getUsers(),
    staleTime: 30000,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditClientFormValues>({
    resolver: zodResolver(editClientSchema),
  });

  const handleOpenEdit = (client: UserResponseDTO) => {
    setClientToEdit(client);
    reset({
      name: client.name,
      phoneNumber: client.phoneNumber || "",
      address: client.address || "",
    });
  };

  const onUpdateSubmit = async (data: EditClientFormValues) => {
    if (!clientToEdit) return;
    setIsUpdating(true);
    try {
      await userService.updateUser(clientToEdit.id, {
        name: data.name,
        phoneNumber: data.phoneNumber,
        address: data.address,
      });
      toast.success("Cliente actualizado con éxito", {
        description: `Datos de ${data.name} actualizados correctamente.`,
      });
      queryClient.invalidateQueries({ queryKey: ["users-directory"] });
      setClientToEdit(null);
    } catch (err: any) {
      console.error("Update failed:", err);
      toast.error("Error al actualizar", { description: "No se pudieron guardar los cambios en el servidor." });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(lower) ||
      c.dni.toString().includes(lower) ||
      c.email.toLowerCase().includes(lower) ||
      c.phoneNumber?.includes(lower)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-foreground tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-info" />
            Directorio de Clientes
          </h1>
          <p className="text-xs font-mono text-typography mt-1">
            Gestión centralizada de titulares e información de contacto del taller.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="border-border hover:border-tertiary h-10 w-10 text-typography"
            title="Refrescar directorio"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin text-tertiary" : ""}`} />
          </Button>

          <Button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-info hover:bg-info/90 text-white font-bold tracking-wider uppercase shadow-lg shadow-info/20 text-xs py-5 px-5"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-typography" />
        <Input
          type="text"
          placeholder="Buscar por DNI, nombre, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-secondary/20 border-border focus:border-info focus:ring-1 focus:ring-info font-mono text-sm h-10"
        />
      </div>

      {/* Directory Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-card/50 border-border/60 p-5 space-y-4">
              <Skeleton className="h-6 w-3/4 bg-secondary" />
              <Skeleton className="h-4 w-1/2 bg-secondary" />
              <Skeleton className="h-16 w-full bg-secondary" />
            </Card>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <Card className="bg-secondary/15 border-border/60 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-typography/40 mx-auto" />
          <h3 className="font-bold text-foreground text-base uppercase">No se encontraron clientes</h3>
          <p className="text-xs font-mono text-typography">Intente con otro parámetro de búsqueda o registre un cliente en el taller.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="bg-card/90 backdrop-blur-sm border-border/80 hover:border-info/60 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between group overflow-hidden"
            >
              <div className="h-1 w-full bg-info/40 group-hover:bg-info transition-colors" />
              <CardHeader className="p-5 pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase bg-secondary/60 text-typography px-2 py-0.5 rounded">
                    DNI: <strong className="text-foreground">{client.dni}</strong>
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-info/15 text-info px-2 py-0.5 rounded border border-info/30">
                    {client.roleId || "CLIENT"}
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-foreground tracking-tight pt-1">
                  {client.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5 text-xs font-mono text-typography pt-1 bg-secondary/15 p-3 rounded-lg border border-border/40">
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-info shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-info shrink-0" />
                    <span>{client.phoneNumber || "Sin teléfono"}</span>
                  </p>
                  {client.address && (
                    <p className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-info shrink-0" />
                      <span className="truncate">{client.address}</span>
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-border/40 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(client)}
                    className="h-8 text-xs font-mono uppercase text-info hover:text-info/80 hover:bg-info/10 font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                    Editar Contacto
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Create Modal */}
      <QuickClientModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["users-directory"] })}
      />

      {/* Edit Client Modal with PII Immutability */}
      <Dialog open={!!clientToEdit} onOpenChange={(open) => !open && !isUpdating && setClientToEdit(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold uppercase text-foreground flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-info" />
              Editar Contacto del Titular
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-typography">
              Modificando metadata para: <strong className="text-foreground">{clientToEdit?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          {clientToEdit && (
            <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-4 py-2">
              {/* PII Locked Alert Box */}
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <div className="text-[11px] font-mono text-typography leading-tight space-y-1">
                  <p className="font-bold text-foreground">Protección de Datos Privados (PII)</p>
                  <p>
                    Por políticas de seguridad e inmutabilidad relacional, el **DNI ({clientToEdit.dni})** y el **Correo Electrónico ({clientToEdit.email})** no pueden modificarse desde este panel.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Nombre Completo (*)
                </Label>
                <Input
                  id="edit-name"
                  disabled={isUpdating}
                  className="bg-secondary/20 border-border focus:border-info"
                  {...register("name")}
                />
                {errors.name && <p className="text-xs text-error font-medium">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-phone" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Teléfono de Contacto (*)
                </Label>
                <Input
                  id="edit-phone"
                  disabled={isUpdating}
                  className="bg-secondary/20 border-border focus:border-info font-mono"
                  {...register("phoneNumber")}
                />
                {errors.phoneNumber && <p className="text-xs text-error font-medium">{errors.phoneNumber.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-address" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Dirección (*)
                </Label>
                <Input
                  id="edit-address"
                  disabled={isUpdating}
                  className="bg-secondary/20 border-border focus:border-info"
                  {...register("address")}
                />
                {errors.address && <p className="text-xs text-error font-medium">{errors.address.message}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setClientToEdit(null)}
                  disabled={isUpdating}
                  className="text-xs uppercase font-mono"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-info hover:bg-info/90 text-white text-xs font-bold uppercase tracking-wider px-6 shadow-md shadow-info/20"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
