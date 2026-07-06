"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { workOrderService } from "@/services/work-order.service";
import { userService } from "@/services/user.service";
import { deviceService } from "@/services/device.service";
import { SearchPicker, SearchPickerOption } from "@/components/common/search-picker";
import { QuickClientModal } from "@/components/clients/quick-client-modal";
import { QuickDeviceModal } from "@/components/devices/quick-device-modal";
import { SecurityCodeModal } from "@/components/work-orders/security-code-modal";
import { WorkOrderResponseDTO, RepairStatus } from "@/types/work-order";
import { UserResponseDTO } from "@/types/user";
import { DeviceResponseDTO } from "@/types/device";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Wrench, User, Smartphone, AlertCircle, Loader2, ArrowLeft, Send } from "lucide-react";

/**
 * Zod schema matching OpenAPI specification for Work Order creation.
 */
const workOrderSchema = z.object({
  clientId: z.string().min(1, { message: "Debe seleccionar un cliente" }),
  deviceId: z.string().min(1, { message: "Debe seleccionar un dispositivo" }),
  issueDescription: z
    .string()
    .min(2, { message: "La descripción debe tener al menos 2 caracteres" })
    .max(200, { message: "La descripción no puede exceder los 200 caracteres" }),
  repairStatus: z.enum(["RECEIVED", "IN_QUEUE", "IN_PROGRESS"] as const),
});

type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

/**
 * WorkOrderForm Component:
 * Comprehensive workshop triage form featuring relational SearchPickers with debounce,
 * integrated quick creation modals for new clients/hardware, and mandatory Security Code handover.
 */
export const WorkOrderForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<UserResponseDTO | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceResponseDTO | null>(null);

  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<WorkOrderResponseDTO | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      clientId: "",
      deviceId: "",
      issueDescription: "",
      repairStatus: "RECEIVED",
    },
  });

  const issueText = watch("issueDescription") || "";

  // Fetch options for Client SearchPicker
  const handleFetchClients = async (term: string): Promise<SearchPickerOption[]> => {
    const users = await userService.getUsers(term);
    return users.map((u) => ({
      id: u.id,
      title: u.name,
      subtitle: `DNI: ${u.dni} - Tel: ${u.phoneNumber}`,
      badge: "CLIENTE",
    }));
  };

  // Fetch options for Device SearchPicker (filtered by selected client)
  const handleFetchDevices = async (term: string): Promise<SearchPickerOption[]> => {
    if (!selectedClient) return [];
    const devices = await deviceService.getDevices(selectedClient.id, term);
    return devices.map((d) => ({
      id: d.id,
      title: `${d.brand} ${d.model}`,
      subtitle: `S/N: ${d.serialNumber}`,
      badge: "EQUIPO",
    }));
  };

  const onSelectClientOption = async (option: SearchPickerOption | null) => {
    if (option) {
      setValue("clientId", option.id, { shouldValidate: true });
      try {
        const client = await userService.getUserById(option.id);
        setSelectedClient(client);
      } catch {
        setSelectedClient({ id: option.id, name: option.title, dni: 0, address: "", phoneNumber: "", email: "" });
      }
    } else {
      setValue("clientId", "");
      setSelectedClient(null);
    }
    // Clear device when client changes
    setValue("deviceId", "");
    setSelectedDevice(null);
  };

  const onSelectDeviceOption = async (option: SearchPickerOption | null) => {
    if (option) {
      setValue("deviceId", option.id, { shouldValidate: true });
      try {
        const device = await deviceService.getDeviceById(option.id);
        setSelectedDevice(device);
      } catch {
        setSelectedDevice({ id: option.id, userId: selectedClient?.id || "", brand: option.title, model: "", serialNumber: option.subtitle || "" });
      }
    } else {
      setValue("deviceId", "");
      setSelectedDevice(null);
    }
  };

  const onSubmit = async (data: WorkOrderFormValues) => {
    setIsLoading(true);
    try {
      const newOrder = await workOrderService.createWorkOrder({
        clientId: data.clientId,
        deviceId: data.deviceId,
        issueDescription: data.issueDescription,
        repairStatus: data.repairStatus as RepairStatus,
      });

      toast.success("¡Orden de Trabajo Creada!", {
        description: `Se asignó el código de seguimiento: ${newOrder.securityCode}`,
      });

      // Open mandatory security code modal
      setCreatedOrder(newOrder);
    } catch (error: any) {
      console.error("Order creation failed:", error);
      const msg = error.response?.data?.message || "Error al generar la orden en el servidor.";
      toast.error("Fallo al crear orden", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setCreatedOrder(null);
    router.push("/work-orders");
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/work-orders")}
          className="text-xs font-mono tracking-wider uppercase"
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5" />
          Volver al Triage
        </Button>
        <span className="text-xs font-mono text-typography uppercase">
          Nueva Orden de Reparación
        </span>
      </div>

      <Card className="bg-card border-border shadow-xl">
        <div className="h-2 w-full bg-tertiary" />
        <CardHeader>
          <CardTitle className="text-xl font-bold uppercase text-foreground flex items-center gap-2">
            <Wrench className="w-5 h-5 text-tertiary" />
            Ingreso de Equipo a Taller
          </CardTitle>
          <CardDescription className="text-xs font-mono text-typography">
            Selecciona el cliente y dispositivo existente o registra nuevos en el momento.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Client Picker */}
            <div className="p-4 rounded-xl bg-secondary/15 border border-border/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-wider">
                <User className="w-4 h-4" />
                <span>Paso 1: Asignar Cliente / Titular (*)</span>
              </div>

              <SearchPicker
                label="Seleccione el Cliente del Taller"
                placeholder="Escriba nombre o DNI del cliente..."
                value={watch("clientId")}
                onSelect={onSelectClientOption}
                fetchOptions={handleFetchClients}
                onAddNew={() => setIsClientModalOpen(true)}
                addNewLabel="Nuevo Cliente"
                disabled={isLoading}
              />
              {errors.clientId && <p className="text-xs text-error font-medium">{errors.clientId.message}</p>}
            </div>

            {/* Step 2: Device Picker */}
            <div className="p-4 rounded-xl bg-secondary/15 border border-border/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-wider">
                <Smartphone className="w-4 h-4" />
                <span>Paso 2: Asignar Dispositivo / Hardware (*)</span>
              </div>

              <SearchPicker
                label="Seleccione el Dispositivo a Reparar"
                placeholder={
                  selectedClient
                    ? `Buscar equipos de ${selectedClient.name}...`
                    : "Primero seleccione un cliente arriba..."
                }
                value={watch("deviceId")}
                onSelect={onSelectDeviceOption}
                fetchOptions={handleFetchDevices}
                onAddNew={() => setIsDeviceModalOpen(true)}
                addNewLabel="Nuevo Dispositivo"
                disabled={isLoading || !selectedClient}
              />
              {errors.deviceId && <p className="text-xs text-error font-medium">{errors.deviceId.message}</p>}
              {!selectedClient && (
                <p className="text-[11px] font-mono text-typography/80 italic">
                  * La lista de dispositivos se habilitará al seleccionar un cliente titular.
                </p>
              )}
            </div>

            {/* Step 3: Issue Description & Status */}
            <div className="p-4 rounded-xl bg-secondary/15 border border-border/60 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Paso 3: Triage y Problema Reportado (*)</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="issueDescription" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Descripción del Fallo / Motivo de Ingreso
                  </Label>
                  <span className={`text-[10px] font-mono ${issueText.length > 180 ? "text-error font-bold" : "text-typography"}`}>
                    {issueText.length}/200 caracteres
                  </span>
                </div>
                <textarea
                  id="issueDescription"
                  rows={3}
                  disabled={isLoading}
                  placeholder="Ej: Pantalla rota por caída, no enciende. Cliente solicita presupuesto original..."
                  className="w-full rounded-md bg-secondary/20 border border-border focus:border-tertiary focus:ring-1 focus:ring-tertiary p-3 text-sm text-foreground font-sans transition-all"
                  {...register("issueDescription")}
                />
                {errors.issueDescription && (
                  <p className="text-xs text-error font-medium">{errors.issueDescription.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="repairStatus" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Estado Inicial de Ingreso
                </Label>
                <select
                  id="repairStatus"
                  disabled={isLoading}
                  className="w-full rounded-md bg-secondary/20 border border-border focus:border-tertiary p-2.5 text-sm text-foreground font-mono uppercase font-semibold"
                  {...register("repairStatus")}
                >
                  <option value="RECEIVED">RECEPCIONADO (Ingreso en Mostrador)</option>
                  <option value="IN_QUEUE">EN ESPERA / COLA (A la espera de técnico)</option>
                  <option value="IN_PROGRESS">EN REPARACIÓN (Técnico asignado inmediatamente)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !selectedClient || !selectedDevice}
              className="w-full bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground font-bold uppercase tracking-wider py-6 shadow-xl shadow-tertiary/20 transition-all text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generando Orden y Comprobante...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Emitir Orden de Trabajo (Generar WOVIK)
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Creation Modals */}
      <QuickClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={(newClient) => {
          setSelectedClient(newClient);
          setValue("clientId", newClient.id, { shouldValidate: true });
        }}
      />

      <QuickDeviceModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        clientId={selectedClient?.id || ""}
        clientName={selectedClient?.name || ""}
        onSuccess={(newDevice) => {
          setSelectedDevice(newDevice);
          setValue("deviceId", newDevice.id, { shouldValidate: true });
        }}
      />

      {/* Mandatory Security Code Handover Modal */}
      {createdOrder && (
        <SecurityCodeModal
          isOpen={!!createdOrder}
          onClose={handleModalClose}
          securityCode={createdOrder.securityCode}
          clientName={selectedClient?.name || "Cliente"}
          workOrderId={createdOrder.id}
        />
      )}
    </div>
  );
};
