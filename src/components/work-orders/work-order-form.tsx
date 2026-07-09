"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { deviceService } from "@/services/device.service";
import { workOrderService } from "@/services/work-order.service";
import { authService } from "@/services/auth.service";
import { WorkOrderResponseDTO } from "@/types/work-order";
import { UserResponseDTO } from "@/types/user";
import { DeviceResponseDTO } from "@/types/device";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Wrench,
  User,
  Smartphone,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Copy,
  Check,
  Plus,
  AlertTriangle,
} from "lucide-react";

const DEVICE_TYPES = [
  { value: "SMARTPHONE", label: "Teléfono / Smartphone" },
  { value: "TABLET", label: "Tablet / iPad" },
  { value: "LAPTOP", label: "Notebook / Laptop" },
  { value: "PC_DESKTOP", label: "PC de Escritorio / AIO" },
  { value: "SMARTWATCH", label: "Reloj Inteligente / Smartwatch" },
  { value: "CONSOLE", label: "Consola de Videojuegos" },
  { value: "OTHER", label: "Otro Electrónico" },
];

type WizardStep = 1 | 2 | 3; // 1 = Titular & Dispositivo, 2 = Triage & Confirmación, 3 = Éxito / Código de Seguridad

export const WorkOrderForm: React.FC = () => {
  const router = useRouter();

  // Wizard Screen Navigation
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Global Loading & Error State
  const [isSavingStep1, setIsSavingStep1] = useState<boolean>(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  // -------------------------------------------------------------
  // PANTALLA 1: DNI Search & Client/Device Inline State
  // -------------------------------------------------------------
  const [dniQuery, setDniQuery] = useState<string>("");
  const [debouncedDni, setDebouncedDni] = useState<string>("");
  const [isSearchingClient, setIsSearchingClient] = useState<boolean>(false);
  const [foundClient, setFoundClient] = useState<UserResponseDTO | null>(null);

  // Client inline fields (used if new client or for display)
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientAddress, setClientAddress] = useState<string>("");

  // Device mode & selection
  const [deviceMode, setDeviceMode] = useState<"EXISTING" | "NEW">("NEW");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  // New device inline fields
  const [deviceType, setDeviceType] = useState<string>("SMARTPHONE");
  const [deviceBrand, setDeviceBrand] = useState<string>("");
  const [deviceModel, setDeviceModel] = useState<string>("");
  const [deviceSerial, setDeviceSerial] = useState<string>("");

  // Resolved IDs & Display labels after Screen 1 completion
  const [resolvedClientId, setResolvedClientId] = useState<string>("");
  const [resolvedDeviceId, setResolvedDeviceId] = useState<string>("");
  const [resolvedClientName, setResolvedClientName] = useState<string>("");
  const [resolvedDeviceLabel, setResolvedDeviceLabel] = useState<string>("");

  // -------------------------------------------------------------
  // PANTALLA 2: Triage Fields
  // -------------------------------------------------------------
  const [issueDescription, setIssueDescription] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // -------------------------------------------------------------
  // PANTALLA 3: Created Order State
  // -------------------------------------------------------------
  const [createdOrder, setCreatedOrder] = useState<WorkOrderResponseDTO | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [confirmedDelivery, setConfirmedDelivery] = useState<boolean>(false);

  // Fetch available roles to assign 'CLIENT' role when creating a new client
  const { data: roles = [] } = useQuery({
    queryKey: ["auth-roles"],
    queryFn: () => authService.getRoles(),
    staleTime: 1000 * 60 * 60,
  });

  // Debounce DNI input ~300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDni(dniQuery.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [dniQuery]);

  // Trigger POST /api/user/search when debouncedDni changes
  useEffect(() => {
    const searchClientByDni = async () => {
      if (!debouncedDni || debouncedDni.length < 6 || !/^\d+$/.test(debouncedDni)) {
        setFoundClient(null);
        setDeviceMode("NEW");
        return;
      }
      setIsSearchingClient(true);
      setStep1Error(null);
      try {
        const users = await userService.getUsers(debouncedDni, "dni");
        const exactMatch =
          users.find((u) => String(u.dni) === debouncedDni) || (users.length > 0 ? users[0] : null);

        if (exactMatch) {
          setFoundClient(exactMatch);
          setClientName(exactMatch.name || "");
          setClientPhone(exactMatch.phoneNumber || "");
          setClientEmail(exactMatch.email || "");
          setClientAddress(exactMatch.address || "Dirección no especificada");
        } else {
          setFoundClient(null);
          setDeviceMode("NEW");
        }
      } catch {
        setFoundClient(null);
        setDeviceMode("NEW");
      } finally {
        setIsSearchingClient(false);
      }
    };

    searchClientByDni();
  }, [debouncedDni]);

  // Query existing devices for found client
  const {
    data: clientDevices = [],
    isLoading: isLoadingDevices,
  } = useQuery({
    queryKey: ["client-devices-by-dni", foundClient?.dni],
    queryFn: () =>
      foundClient && foundClient.dni
        ? deviceService.getDevicesByUserDni(foundClient.dni)
        : Promise.resolve([]),
    enabled: !!foundClient && !!foundClient.dni,
    staleTime: 5000,
  });

  // Automatically select first device or switch to NEW if client has no devices
  useEffect(() => {
    if (foundClient) {
      if (clientDevices.length > 0) {
        setDeviceMode("EXISTING");
        setSelectedDeviceId(clientDevices[0].id);
      } else if (!isLoadingDevices) {
        setDeviceMode("NEW");
      }
    } else {
      setDeviceMode("NEW");
      setSelectedDeviceId("");
    }
  }, [foundClient, clientDevices, isLoadingDevices]);

  // -------------------------------------------------------------
  // STEP 1 -> STEP 2: Unified Client & Device Handler
  // -------------------------------------------------------------
  const handleContinueToStep2 = async () => {
    setStep1Error(null);

    // 1. Validate DNI
    if (!dniQuery || dniQuery.trim().length < 7 || !/^\d+$/.test(dniQuery.trim())) {
      setStep1Error("Ingrese un DNI numérico válido (mínimo 7 dígitos).");
      return;
    }

    // 2. Validate Client inline fields if new client
    if (!foundClient) {
      if (!clientName.trim() || clientName.trim().length < 3) {
        setStep1Error("El nombre completo del cliente es obligatorio.");
        return;
      }
      if (!clientPhone.trim() || clientPhone.trim().length < 8) {
        setStep1Error("Ingrese un teléfono de contacto válido.");
        return;
      }
      if (!clientEmail.trim() || !/\S+@\S+\.\S+/.test(clientEmail.trim())) {
        setStep1Error("Ingrese un correo electrónico válido.");
        return;
      }
    }

    // 3. Validate Device inline fields if registering new device
    if (deviceMode === "NEW") {
      if (!deviceBrand.trim()) {
        setStep1Error("La marca del dispositivo es obligatoria.");
        return;
      }
      if (!deviceModel.trim()) {
        setStep1Error("El modelo del dispositivo es obligatorio.");
        return;
      }
      if (!deviceSerial.trim() || deviceSerial.trim().length < 3) {
        setStep1Error("El número de serie o IMEI es obligatorio (mínimo 3 caracteres).");
        return;
      }
    } else if (deviceMode === "EXISTING" && !selectedDeviceId) {
      setStep1Error("Debe seleccionar uno de los dispositivos existentes de la lista o registrar uno nuevo.");
      return;
    }

    setIsSavingStep1(true);
    try {
      // Resolve Client ID
      let currentClientId = foundClient?.id;
      let currentClientName = foundClient?.name || clientName;

      if (!currentClientId) {
        // Resolve default CLIENT role
        const clientRole =
          roles.find((r: any) => {
            const label = r.name || r.descripcion || "";
            return label.toUpperCase() === "CLIENT";
          }) || roles[0];

        const createdClient = await userService.createUser({
          name: clientName.trim(),
          dni: parseInt(dniQuery.trim(), 10),
          email: clientEmail.trim(),
          phoneNumber: clientPhone.trim(),
          address: clientAddress.trim() || "CABA",
          roleId: clientRole ? clientRole.id : "CLIENT",
        });

        currentClientId = createdClient.id;
        currentClientName = createdClient.name;
        setFoundClient(createdClient);
      }

      // Resolve Device ID
      let currentDeviceId = selectedDeviceId;
      let currentDeviceLabel = "";

      if (deviceMode === "NEW") {
        const createdDevice = await deviceService.createDevice({
          userId: currentClientId,
          userID: currentClientId,
          type: deviceType || "SMARTPHONE",
          brand: deviceBrand.trim(),
          model: deviceModel.trim(),
          serialNumber: deviceSerial.trim().toUpperCase(),
        });
        currentDeviceId = createdDevice.id;
        currentDeviceLabel = `${createdDevice.brand} ${createdDevice.model} (S/N: ${createdDevice.serialNumber})`;
      } else {
        const dev = clientDevices.find((d) => d.id === selectedDeviceId);
        currentDeviceLabel = dev
          ? `${dev.brand} ${dev.model} (S/N: ${dev.serialNumber})`
          : "Dispositivo seleccionado";
      }

      // Save resolved IDs and advance to Screen 2
      setResolvedClientId(currentClientId);
      setResolvedDeviceId(currentDeviceId);
      setResolvedClientName(currentClientName);
      setResolvedDeviceLabel(currentDeviceLabel);
      setCurrentStep(2);
    } catch (err: any) {
      console.error("Error saving step 1 data:", err);
      const backendMessage =
        err.response?.data?.message ||
        "No se pudo guardar el titular o equipo en el servidor. Verifique que el DNI o número de serie no estén duplicados.";
      setStep1Error(backendMessage);
    } finally {
      setIsSavingStep1(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 2 -> STEP 3: Confirm & Create Work Order
  // -------------------------------------------------------------
  const handleConfirmWorkOrder = async () => {
    setStep2Error(null);
    if (!issueDescription.trim() || issueDescription.trim().length < 2) {
      setStep2Error("Debe especificar la falla o motivo de ingreso (mínimo 2 caracteres).");
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const order = await workOrderService.createWorkOrder({
        clientId: resolvedClientId,
        deviceId: resolvedDeviceId,
        issueDescription: issueDescription.trim(),
        notes: notes.trim() || "",
        repairStatus: "RECEIVED",
      });

      setCreatedOrder(order);
      setCurrentStep(3);
      toast.success("¡Orden de Trabajo Generada!", {
        description: `Código asignado: ${order.securityCode}`,
      });
    } catch (err: any) {
      console.error("Error creating work order:", err);
      const msg = err.response?.data?.message || "Error al crear la orden de trabajo.";
      setStep2Error(msg);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Copy Security Code
  const handleCopySecurityCode = async () => {
    if (!createdOrder) return;
    try {
      await navigator.clipboard.writeText(createdOrder.securityCode);
      setCopiedCode(true);
      toast.success("Código copiado");
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      toast.error("Error al copiar");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Header & Navigation */}
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
        <div className="flex items-center gap-2 text-xs font-mono text-typography uppercase">
          <span
            className={`px-2 py-0.5 rounded border ${
              currentStep === 1
                ? "bg-tertiary/20 border-tertiary text-foreground font-bold"
                : "border-border/60 text-typography"
            }`}
          >
            1. TITULAR Y EQUIPO
          </span>
          <span>→</span>
          <span
            className={`px-2 py-0.5 rounded border ${
              currentStep === 2
                ? "bg-tertiary/20 border-tertiary text-foreground font-bold"
                : "border-border/60 text-typography"
            }`}
          >
            2. TRIAGE
          </span>
          <span>→</span>
          <span
            className={`px-2 py-0.5 rounded border ${
              currentStep === 3
                ? "bg-success/20 border-success text-success font-bold"
                : "border-border/60 text-typography"
            }`}
          >
            3. CONFIRMADO
          </span>
        </div>
      </div>

      <Card className="bg-card border-border shadow-xl">
        <div className="h-2 w-full bg-tertiary" />
        <CardHeader>
          <CardTitle className="text-xl font-bold uppercase text-foreground flex items-center gap-2">
            <Wrench className="w-5 h-5 text-tertiary" />
            Recepción Rápida de Taller ("Smart Intake")
          </CardTitle>
          <CardDescription className="text-xs font-mono text-typography">
            {currentStep === 1 && "Paso 1 de 2: Identificación de titular y selección de dispositivo."}
            {currentStep === 2 && "Paso 2 de 2: Falla reportada por el cliente y confirmación."}
            {currentStep === 3 && "Orden generada y entrega de comprobante de rastreabilidad."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ========================================================= */}
          {/* PANTALLA 1: TITULAR Y DISPOSITIVO                         */}
          {/* ========================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Sección A: Titular / Cliente por DNI */}
              <div className="p-4 rounded-xl bg-secondary/15 border border-border/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-wider">
                    <User className="w-4 h-4" />
                    <span>Titular / Cliente</span>
                  </div>
                  {isSearchingClient ? (
                    <span className="text-xs font-mono text-typography flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-tertiary" />
                      Consultando DNI...
                    </span>
                  ) : foundClient ? (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-success/20 border border-success/40 text-success font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Cliente Encontrado
                    </span>
                  ) : debouncedDni.length >= 7 ? (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-warning/20 border border-warning/40 text-warning font-bold">
                      Nuevo Cliente
                    </span>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dniInput" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    DNI / CUIT (*)
                  </Label>
                  <Input
                    id="dniInput"
                    value={dniQuery}
                    onChange={(e) => setDniQuery(e.target.value)}
                    placeholder="Escriba el número de DNI (Ej: 30123456)..."
                    className="bg-secondary/20 border-border focus:border-tertiary font-mono"
                    disabled={isSavingStep1}
                  />
                </div>

                {/* Inline Fields: Read-only if existing client, open inputs if new */}
                {foundClient ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-secondary/20 border border-border/50 text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-typography block">Nombre Completo</span>
                      <strong className="text-foreground font-sans">{foundClient.name}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-typography block">Teléfono</span>
                      <strong className="text-foreground font-mono">{foundClient.phoneNumber || "No registrado"}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-typography block">Email</span>
                      <strong className="text-foreground font-mono">{foundClient.email || "No registrado"}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2 border-t border-border/40 animate-fadeIn">
                    <p className="text-[11px] font-mono text-typography">
                      No se encontró un titular con el DNI indicado. Complete los datos para darlo de alta en este mismo paso:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="clientName" className="text-[11px] font-semibold uppercase text-foreground">
                          Nombre Completo (*)
                        </Label>
                        <Input
                          id="clientName"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Ej: Ragnar Lodbrok"
                          className="bg-secondary/20 border-border h-9 text-xs"
                          disabled={isSavingStep1}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="clientPhone" className="text-[11px] font-semibold uppercase text-foreground">
                          Teléfono de Contacto (*)
                        </Label>
                        <Input
                          id="clientPhone"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="Ej: +54 9 11..."
                          className="bg-secondary/20 border-border h-9 text-xs font-mono"
                          disabled={isSavingStep1}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="clientEmail" className="text-[11px] font-semibold uppercase text-foreground">
                          Correo Electrónico (*)
                        </Label>
                        <Input
                          id="clientEmail"
                          type="email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="cliente@email.com"
                          className="bg-secondary/20 border-border h-9 text-xs font-mono"
                          disabled={isSavingStep1}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="clientAddress" className="text-[11px] font-semibold uppercase text-foreground">
                          Dirección
                        </Label>
                        <Input
                          id="clientAddress"
                          value={clientAddress}
                          onChange={(e) => setClientAddress(e.target.value)}
                          placeholder="Ciudad / Barrio"
                          className="bg-secondary/20 border-border h-9 text-xs"
                          disabled={isSavingStep1}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sección B: Dispositivo del Titular */}
              <div className="p-4 rounded-xl bg-secondary/15 border border-border/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-wider">
                    <Smartphone className="w-4 h-4" />
                    <span>Dispositivo a Reparar</span>
                  </div>
                </div>

                {foundClient && clientDevices.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-mono text-typography">
                      Equipos vinculados a <strong>{foundClient.name}</strong>. Seleccione uno o registre un equipo nuevo:
                    </p>

                    <div className="space-y-2">
                      {clientDevices.map((device) => {
                        const isSelected = deviceMode === "EXISTING" && selectedDeviceId === device.id;
                        return (
                          <div
                            key={device.id}
                            onClick={() => {
                              setDeviceMode("EXISTING");
                              setSelectedDeviceId(device.id);
                            }}
                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? "border-tertiary bg-tertiary/15"
                                : "border-border/60 bg-secondary/20 hover:bg-secondary/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="deviceSelect"
                                checked={isSelected}
                                onChange={() => {
                                  setDeviceMode("EXISTING");
                                  setSelectedDeviceId(device.id);
                                }}
                                className="text-tertiary focus:ring-tertiary h-4 w-4"
                              />
                              <div>
                                <span className="font-bold text-sm text-foreground block">
                                  {device.brand} {device.model}
                                </span>
                                <span className="text-xs font-mono text-typography">
                                  N° de Serie / IMEI: {device.serialNumber}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <span className="text-xs font-mono uppercase text-tertiary font-bold">
                                Seleccionado
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {/* Option to register new device for existing client */}
                      <div
                        onClick={() => setDeviceMode("NEW")}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                          deviceMode === "NEW"
                            ? "border-tertiary bg-tertiary/15"
                            : "border-border/60 bg-secondary/20 hover:bg-secondary/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deviceSelect"
                          checked={deviceMode === "NEW"}
                          onChange={() => setDeviceMode("NEW")}
                          className="text-tertiary focus:ring-tertiary h-4 w-4"
                        />
                        <span className="font-bold text-xs uppercase font-mono text-tertiary flex items-center gap-1.5">
                          <Plus className="w-4 h-4" />+ Registrar Nuevo Dispositivo para {foundClient.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-mono text-typography">
                    {!foundClient
                      ? "Se vinculará el nuevo equipo al titular ingresado arriba."
                      : "El cliente no tiene equipos registrados. Complete los datos de la unidad:"}
                  </p>
                )}

                {/* Inline New Device Fields */}
                {deviceMode === "NEW" && (
                  <div className="space-y-3 pt-2 border-t border-border/40 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="deviceType" className="text-[11px] font-semibold uppercase text-foreground">
                          Tipo de Equipo (*)
                        </Label>
                        <select
                          id="deviceType"
                          value={deviceType}
                          onChange={(e) => setDeviceType(e.target.value)}
                          disabled={isSavingStep1}
                          className="w-full rounded-md bg-secondary/20 border border-border focus:border-tertiary h-9 px-3 text-xs font-semibold text-foreground cursor-pointer"
                        >
                          {DEVICE_TYPES.map((t) => (
                            <option key={t.value} value={t.value} className="bg-card text-foreground">
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="deviceBrand" className="text-[11px] font-semibold uppercase text-foreground">
                          Marca (*)
                        </Label>
                        <Input
                          id="deviceBrand"
                          value={deviceBrand}
                          onChange={(e) => setDeviceBrand(e.target.value)}
                          placeholder="Ej: Samsung / Apple"
                          className="bg-secondary/20 border-border h-9 text-xs"
                          disabled={isSavingStep1}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="deviceModel" className="text-[11px] font-semibold uppercase text-foreground">
                          Modelo (*)
                        </Label>
                        <Input
                          id="deviceModel"
                          value={deviceModel}
                          onChange={(e) => setDeviceModel(e.target.value)}
                          placeholder="Ej: Galaxy S24 Ultra"
                          className="bg-secondary/20 border-border h-9 text-xs"
                          disabled={isSavingStep1}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="deviceSerial" className="text-[11px] font-semibold uppercase text-foreground">
                          N° de Serie / IMEI (*)
                        </Label>
                        <Input
                          id="deviceSerial"
                          value={deviceSerial}
                          onChange={(e) => setDeviceSerial(e.target.value.toUpperCase())}
                          placeholder="SN-9988776655"
                          className="bg-secondary/20 border-border h-9 text-xs font-mono uppercase"
                          disabled={isSavingStep1}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Inline Error Display */}
              {step1Error && (
                <div className="p-3 rounded-lg bg-error/15 border border-error/40 flex items-center gap-2 text-xs font-semibold text-error">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{step1Error}</span>
                </div>
              )}

              {/* Step 1 Submit Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleContinueToStep2}
                  disabled={isSavingStep1}
                  className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground text-xs font-bold uppercase tracking-wider px-6 py-5 shadow-lg"
                >
                  {isSavingStep1 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando datos...
                    </>
                  ) : (
                    <>
                      Continuar al Triage
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PANTALLA 2: TRIAGE Y MOTIVO DE INGRESO                      */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Summary of Selected Client & Device */}
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div>
                  <span className="text-typography uppercase block text-[10px]">Titular Asignado</span>
                  <strong className="text-foreground">{resolvedClientName}</strong>
                </div>
                <div>
                  <span className="text-typography uppercase block text-[10px]">Equipo Seleccionado</span>
                  <strong className="text-tertiary">{resolvedDeviceLabel}</strong>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(1)}
                  disabled={isSubmittingOrder}
                  className="h-7 text-[11px] text-typography hover:text-foreground uppercase underline self-start sm:self-center"
                >
                  Cambiar
                </Button>
              </div>

              {/* Triage Inputs */}
              <div className="p-4 rounded-xl bg-secondary/15 border border-border/60 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" />
                  <span>Diagnóstico Inicial / Problema Reportado</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="issueDescription" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Falla Reportada por el Cliente (*)
                  </Label>
                  <textarea
                    id="issueDescription"
                    rows={3}
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Describa con precisión los síntomas, roturas físicas o falla reportada por el cliente..."
                    disabled={isSubmittingOrder}
                    className="w-full rounded-md bg-secondary/20 border border-border focus:border-tertiary p-3 text-sm text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Notas Internas del Taller (Opcional)
                  </Label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Accesorios entregados (cargador, funda), condiciones estéticas, seña recibida..."
                    disabled={isSubmittingOrder}
                    className="w-full rounded-md bg-secondary/20 border border-border focus:border-tertiary p-3 text-sm text-foreground"
                  />
                </div>
              </div>

              {/* Inline Error Display */}
              {step2Error && (
                <div className="p-3 rounded-lg bg-error/15 border border-error/40 flex items-center gap-2 text-xs font-semibold text-error">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{step2Error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={isSubmittingOrder}
                  className="text-xs uppercase font-mono"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Paso 1
                </Button>

                <Button
                  type="button"
                  onClick={handleConfirmWorkOrder}
                  disabled={isSubmittingOrder}
                  className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground text-xs font-bold uppercase tracking-wider px-6 py-5 shadow-lg"
                >
                  {isSubmittingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ingresando Orden...
                    </>
                  ) : (
                    <>
                      Confirmar e Ingresar Orden
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PANTALLA 3: CÓDIGO DE SEGURIDAD / CONFIRMACIÓN INLINE       */}
          {/* ========================================================= */}
          {currentStep === 3 && createdOrder && (
            <div className="space-y-6 animate-fadeIn py-2">
              <div className="p-6 rounded-xl bg-secondary/20 border-2 border-tertiary/60 space-y-5 text-center">
                <div className="w-12 h-12 rounded-full bg-tertiary/20 border border-tertiary/40 flex items-center justify-center mx-auto text-tertiary">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold uppercase text-foreground tracking-wider">
                    ¡Orden de Trabajo #{createdOrder.id?.slice(0, 8)} Ingresada con Éxito!
                  </h3>
                  <p className="text-xs font-mono text-typography">
                    Entregue el siguiente código al cliente para el rastreo en línea de su equipo:
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-card border border-tertiary/40 flex flex-col items-center justify-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-typography">
                    Código de Consulta del Cliente
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black font-mono tracking-widest text-tertiary select-all">
                      {createdOrder.securityCode}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopySecurityCode}
                      className="h-10 w-10 border-tertiary/40 hover:bg-tertiary/20 text-foreground"
                      title="Copiar Código"
                    >
                      {copiedCode ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5 text-tertiary" />}
                    </Button>
                  </div>
                  <span className="text-xs font-mono text-foreground font-semibold">
                    Titular: <span className="text-tertiary uppercase">{resolvedClientName}</span>
                  </span>
                </div>

                {/* Handover confirmation */}
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-3 text-left">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground block cursor-pointer flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={confirmedDelivery}
                        onChange={(e) => setConfirmedDelivery(e.target.checked)}
                        className="rounded border-border text-tertiary focus:ring-tertiary w-4 h-4 cursor-pointer"
                      />
                      <span>Confirmé y entregué este código de seguimiento al cliente</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreatedOrder(null);
                    setCurrentStep(1);
                    setDniQuery("");
                    setDebouncedDni("");
                    setFoundClient(null);
                    setIssueDescription("");
                    setNotes("");
                  }}
                  className="text-xs uppercase font-mono"
                >
                  Crear Otra Orden
                </Button>

                <Button
                  type="button"
                  onClick={() => router.push("/work-orders")}
                  disabled={!confirmedDelivery}
                  className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground text-xs font-bold uppercase tracking-wider px-6 py-4"
                >
                  Ir al Triage de Órdenes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
