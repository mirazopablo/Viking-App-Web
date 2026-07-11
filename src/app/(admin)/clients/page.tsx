"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { userService } from "@/services/user.service";
import { UserResponseDTO } from "@/types/user";
import { QuickClientModal } from "@/components/clients/quick-client-modal";
import { Card } from "@/components/ui/card";
import { VikingCard } from "@/components/shared/viking-card";
import { VikingSearchBar } from "@/components/shared/viking-search-bar";
import { VikingLoader } from "@/components/shared/viking-loader";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, Search, Plus, Phone, Mail, MapPin, Edit3, Trash2, ShieldAlert, Loader2, Save, RefreshCw } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";

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
  const { isAdmin } = useUserRole();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [clientToEdit, setClientToEdit] = useState<UserResponseDTO | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const debouncedSearch = searchTerm.trim().length >= 2 ? searchTerm.trim() : undefined;

  const { data: clients = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["users-directory", debouncedSearch],
    queryFn: () => userService.getUsers(debouncedSearch),
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

  const handleDeleteClient = async (client: UserResponseDTO) => {
    const confirmed = window.confirm(
      `¿Está seguro de eliminar definitivamente al cliente "${client.name}" (DNI: ${client.dni})? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    try {
      await userService.deleteUser(client.id);
      toast.success("Cliente eliminado con éxito", {
        description: `El registro de ${client.name} ha sido removido del sistema.`,
      });
      queryClient.invalidateQueries({ queryKey: ["users-directory"] });
    } catch (err: unknown) {
      console.error("Delete user failed:", err);
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar el cliente en el servidor.",
      });
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
      <AdminPageHeader
        title="Directorio de Clientes"
        subtitle="Gestión centralizada de titulares e información de contacto del taller."
        icon={Users}
        iconClassName="w-7 h-7 text-info"
        onRefresh={() => refetch()}
        isRefetching={isRefetching}
        refreshTitle="Refrescar directorio"
        actions={
          <Button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-info hover:bg-info/90 text-white font-bold tracking-wider uppercase shadow-lg shadow-info/20 text-xs py-5 px-5"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo Cliente
          </Button>
        }
      />

      {/* Search Input */}
      <VikingSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar por DNI, nombre, email o teléfono..."
        variant="client"
        minChars={2}
      />

      {/* Directory Grid */}
      {isLoading ? (
        <VikingLoader count={6} columns={3} />
      ) : filteredClients.length === 0 ? (
        <EmptyStateCard
          icon={Users}
          title="No se encontraron clientes"
          description="Intente con otro parámetro de búsqueda o registre un cliente en el taller."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredClients.map((client) => (
            <VikingCard
              key={client.id}
              variant="client"
              badgeLeft={
                <span className="text-xs font-mono font-bold uppercase bg-info/15 text-info px-2.5 py-1 rounded border border-info/30 tracking-wider">
                  DNI: {client.dni}
                </span>
              }
              title={client.name}
              footer={
                <div className="flex items-center justify-end gap-2 w-full">
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClient(client)}
                      className="h-8 text-xs font-mono uppercase text-error hover:text-error/90 hover:bg-error/10 font-semibold"
                      title="Eliminar cliente (Sólo Administrador)"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Eliminar
                    </Button>
                  )}
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
              }
            >
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
            </VikingCard>
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
