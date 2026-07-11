"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { UserResponseDTO } from "@/types/user";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Loader2, Save } from "lucide-react";

const quickClientSchema = z.object({
  name: z.string().min(3, { message: "El nombre completo es requerido" }),
  dni: z
    .string()
    .min(7, { message: "DNI inválido" })
    .max(9, { message: "DNI excede límite" })
    .regex(/^\d+$/, { message: "DNI debe ser numérico" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
  phoneNumber: z.string().min(8, { message: "Teléfono requerido" }),
  secondaryPhoneNumber: z.string().optional(),
  address: z.string().min(5, { message: "Dirección requerida" }),
  roleId: z.string().min(1, { message: "El rol es requerido" }),
  password: z.string().optional(),
});

type QuickClientFormValues = z.infer<typeof quickClientSchema>;

interface QuickClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newClient: UserResponseDTO) => void;
}

/**
 * QuickClientModal Component:
 * Rapid creation dialog allowing registration of clients or staff members.
 * Enforces dynamic role UUID mapping and conditional password security rules.
 */
export const QuickClientModal: React.FC<QuickClientModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["auth-roles"],
    queryFn: () => authService.getRoles(),
    staleTime: 1000 * 60 * 60,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError,
  } = useForm<QuickClientFormValues>({
    resolver: zodResolver(quickClientSchema),
    defaultValues: {
      name: "",
      dni: "",
      email: "",
      phoneNumber: "",
      secondaryPhoneNumber: "",
      address: "",
      roleId: "",
      password: "",
    },
  });

  const selectedRoleId = watch("roleId");

  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      const clientRole = roles.find((r) => {
        const label = (r as any).name || (r as any).descripcion || "";
        return label.toUpperCase() === "CLIENT";
      });
      if (clientRole) {
        setValue("roleId", clientRole.id);
      } else if (roles[0]) {
        setValue("roleId", roles[0].id);
      }
    }
  }, [roles, selectedRoleId, setValue]);

  const selectedRoleObj = roles.find((r) => r.id === selectedRoleId);
  const selectedRoleLabel = ((selectedRoleObj as any)?.name || (selectedRoleObj as any)?.descripcion || "").toUpperCase();
  const isPrivilegedRole = selectedRoleLabel === "STAFF" || selectedRoleLabel === "ADMIN";

  const onSubmit = async (data: QuickClientFormValues) => {
    if (isPrivilegedRole) {
      if (!data.password || data.password.trim().length < 6) {
        setError("password", {
          type: "manual",
          message: "La contraseña para usuarios Staff o Admin debe tener al menos 6 caracteres.",
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const newClient = await userService.createUser({
        name: data.name,
        dni: parseInt(data.dni, 10),
        email: data.email,
        phoneNumber: data.phoneNumber,
        secondaryPhoneNumber: data.secondaryPhoneNumber ? data.secondaryPhoneNumber.trim() : undefined,
        address: data.address,
        roleId: data.roleId,
        password: data.password && data.password.trim().length > 0 ? data.password.trim() : undefined,
      });

      toast.success("Usuario registrado con éxito", {
        description: `${newClient.name} (DNI: ${newClient.dni}) fue agregado al sistema.`,
      });

      reset();
      onSuccess(newClient);
      onClose();
    } catch (error: any) {
      console.error("Client registration failed:", error);
      const msg = error.response?.data?.message || "No se pudo registrar el usuario. DNI o Email en uso.";
      toast.error("Error al registrar usuario", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold uppercase text-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-tertiary" />
            Alta de Usuario / Cliente
          </DialogTitle>
          <DialogDescription className="text-xs font-mono text-typography">
            Registra el nuevo titular o miembro del equipo con su rol correspondiente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="roleId" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Rol Asignado (*)
            </Label>
            <select
              id="roleId"
              disabled={isLoading || isLoadingRoles}
              className="w-full rounded-md bg-neutral-900 border border-border focus:border-tertiary p-2 text-sm text-foreground font-mono uppercase font-semibold"
              {...register("roleId")}
            >
              <option value="" disabled className="bg-neutral-900 text-foreground">
                {isLoadingRoles ? "Cargando roles..." : "Seleccione un rol..."}
              </option>
              {roles.map((r) => {
                const label = (r as any).name || (r as any).descripcion || "ROL";
                return (
                  <option key={r.id} value={r.id} className="bg-neutral-900 text-foreground">
                    {label}
                  </option>
                );
              })}
            </select>
            {errors.roleId && <p className="text-xs text-error font-medium">{errors.roleId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Nombre Completo (*)
            </Label>
            <Input
              id="name"
              placeholder="Ej: Ragnar Lodbrok"
              disabled={isLoading}
              className="bg-secondary/20 border-border focus:border-tertiary"
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-error font-medium">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dni" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                DNI (*)
              </Label>
              <Input
                id="dni"
                placeholder="Ej: 30123456"
                disabled={isLoading}
                className="bg-secondary/20 border-border focus:border-tertiary font-mono"
                {...register("dni")}
              />
              {errors.dni && <p className="text-xs text-error font-medium">{errors.dni.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Teléfono (*)
              </Label>
              <Input
                id="phoneNumber"
                placeholder="Ej: +54 9 11..."
                disabled={isLoading}
                className="bg-secondary/20 border-border focus:border-tertiary font-mono"
                {...register("phoneNumber")}
              />
              {errors.phoneNumber && <p className="text-xs text-error font-medium">{errors.phoneNumber.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="secondaryPhoneNumber" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Teléfono Secundario
              </Label>
              <Input
                id="secondaryPhoneNumber"
                placeholder="Ej: +54 9 11... (Opc.)"
                disabled={isLoading}
                className="bg-secondary/20 border-border focus:border-tertiary font-mono"
                {...register("secondaryPhoneNumber")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Correo Electrónico (*)
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@email.com"
                disabled={isLoading}
                className="bg-secondary/20 border-border focus:border-tertiary font-mono"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-error font-medium">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Dirección (*)
            </Label>
            <Input
              id="address"
              placeholder="Ej: Calle Falsa 123, CABA"
              disabled={isLoading}
              className="bg-secondary/20 border-border focus:border-tertiary"
              {...register("address")}
            />
            {errors.address && <p className="text-xs text-error font-medium">{errors.address.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {isPrivilegedRole ? "Contraseña (* Obligatoria)" : "Contraseña (Opcional)"}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={isPrivilegedRole ? "Mínimo 6 caracteres" : "Dejar en blanco para cliente"}
              disabled={isLoading}
              className="bg-secondary/20 border-border focus:border-tertiary font-mono"
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-error font-medium">{errors.password.message}</p>}
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
                  Registrar Usuario
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
