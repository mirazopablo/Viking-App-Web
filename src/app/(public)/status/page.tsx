"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { publicWorkOrderService } from "@/services/public-work-order.service";
import { WorkOrderPublicStatusResponseDTO } from "@/types/work-order";
import { StatusBadge } from "@/components/common/status-badge";
import { DiagnosticTimeline } from "@/components/work-orders/diagnostic-timeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Search, ShieldCheck, User, Smartphone, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/language-context";

/**
 * Zod schema for public repair status query.
 * Enforces valid DNI integer and standard WOVIK security code prefix.
 */
const statusQuerySchema = z.object({
  clientDni: z
    .string()
    .min(7, { message: "Ingrese un DNI válido de al menos 7 dígitos" })
    .max(9, { message: "El DNI no puede exceder 9 dígitos" })
    .regex(/^\d+$/, { message: "El DNI debe contener únicamente números" }),
  securityCode: z
    .string()
    .min(1, { message: "El código de seguridad es requerido" })
    .transform((val) => val.trim().toUpperCase())
    .transform((val) => (val.startsWith("WOVIK-") ? val.slice(6) : val))
    .refine((val) => val.length === 5, {
      message: "Ingrese exactamente los 5 caracteres del código",
    })
    .transform((val) => `WOVIK-${val}`),
});

type StatusQueryFormValues = z.infer<typeof statusQuerySchema>;

export default function PublicStatusPage() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WorkOrderPublicStatusResponseDTO | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StatusQueryFormValues>({
    resolver: zodResolver(statusQuerySchema),
    defaultValues: {
      clientDni: "",
      securityCode: "",
    },
  });

  const onSubmit = async (data: StatusQueryFormValues) => {
    setIsLoading(true);
    try {
      const response = await publicWorkOrderService.getStatusByDni({
        clientDni: parseInt(data.clientDni, 10),
        securityCode: data.securityCode,
      });

      if (response && response.workOrder) {
        setResult(response);
        toast.success(t.statusPage.toastSuccess);
      }
    } catch (error: any) {
      console.error("Lookup failed:", error);
      toast.error(t.statusPage.notFoundTitle, {
        description: t.statusPage.notFoundDesc,
      });
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSearch = () => {
    setResult(null);
    reset();
  };

  // State A: Render Search Form
  if (!result) {
    return (
      <div className="w-full max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground uppercase">
            {t.statusPage.title}
          </h1>
          <p className="text-sm text-typography font-mono max-w-md mx-auto">
            {t.statusPage.subtitle}
          </p>
        </div>

        <Card className="bg-card/90 backdrop-blur-md border-border shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-foreground uppercase flex items-center gap-2">
              <Search className="w-4 h-4 text-tertiary" />
              {t.statusPage.badge}
            </CardTitle>
            <CardDescription className="text-xs text-typography font-mono">
              {t.statusPage.securityNotice}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientDni" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {t.statusPage.clientDniLabel} (*)
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-typography" />
                  <Input
                    id="clientDni"
                    type="text"
                    inputMode="numeric"
                    placeholder={t.statusPage.clientDniPlaceholder}
                    className="pl-9 bg-secondary/20 border-border focus:border-tertiary focus:ring-1 focus:ring-tertiary font-mono"
                    disabled={isLoading}
                    {...register("clientDni")}
                  />
                </div>
                {errors.clientDni && (
                  <p className="text-xs text-error font-medium mt-1">{errors.clientDni.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="securityCode" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {t.statusPage.securityCodeLabel} (*)
                </Label>
                <div className="flex rounded-lg border border-border bg-secondary/20 focus-within:border-tertiary focus-within:ring-1 focus-within:ring-tertiary overflow-hidden">
                  <div className="flex items-center gap-1.5 pl-3 pr-2.5 bg-secondary/40 border-r border-border text-xs font-mono font-bold tracking-wider text-foreground select-none shrink-0">
                    <ShieldCheck className="h-4 w-4 text-tertiary shrink-0" />
                    <span>WOVIK-</span>
                  </div>
                  <Input
                    id="securityCode"
                    type="text"
                    maxLength={5}
                    placeholder={t.statusPage.securityCodePlaceholder}
                    className="border-0 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-transparent font-mono uppercase font-bold tracking-widest text-tertiary"
                    disabled={isLoading}
                    {...register("securityCode")}
                  />
                </div>
                {errors.securityCode && (
                  <p className="text-xs text-error font-medium mt-1">{errors.securityCode.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground font-semibold tracking-wider uppercase py-5 mt-4 shadow-md shadow-tertiary/20 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.statusPage.searchingButton}
                  </>
                ) : (
                  <>
                    {t.statusPage.searchButton}
                    <Search className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // State B: Render Order Details & Diagnostic Timeline (Screen 121231 & 120907)
  const { workOrder, diagnosticPoints } = result;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Action Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetSearch}
          className="text-xs font-mono tracking-wider uppercase border-border hover:border-tertiary text-foreground"
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5" />
          {t.statusPage.tryAgainButton}
        </Button>
        <span className="text-xs font-mono text-typography uppercase">
          WOVIK: <strong className="text-tertiary font-bold tracking-wider">{workOrder.securityCode}</strong>
        </span>
      </div>

      {/* Main Order Metadata Card */}
      <Card className="bg-card border-border shadow-xl overflow-hidden">
        <div className="h-2 w-full bg-tertiary" />
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold uppercase text-foreground">
              {t.statusPage.orderInfoTitle}
            </CardTitle>
            <CardDescription className="text-xs font-mono text-typography">
              {t.statusPage.intakeDateLabel}: {new Date(workOrder.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:items-end gap-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-typography">
              Estado Actual
            </span>
            <StatusBadge status={workOrder.repairStatus} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Separator className="bg-border/60" />

          {/* Client & Device Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 p-4 rounded-xl bg-secondary/15 border border-border/40">
              <div className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-wider">
                <User className="w-4 h-4" />
                <span>{t.statusPage.clientDniLabel}</span>
              </div>
              <p className="font-semibold text-foreground text-sm">
                {workOrder.clientName || "Cliente Registrado"}
              </p>
              <p className="text-xs font-mono text-typography">
                DNI: {workOrder.clientDni || "---"}
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-secondary/15 border border-border/40">
              <div className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-wider">
                <Smartphone className="w-4 h-4" />
                <span>{t.statusPage.deviceLabel}</span>
              </div>
              <p className="font-semibold text-foreground text-sm">
                {workOrder.deviceBrand} {workOrder.deviceModel}
              </p>
              <p className="text-xs font-mono text-typography">
                {t.statusPage.serialLabel}: <span className="text-foreground font-medium">{workOrder.deviceSerialNumber || "N/A"}</span>
              </p>
            </div>
          </div>

          {/* Reported Issue */}
          <div className="space-y-2 p-4 rounded-xl bg-secondary/10 border border-border/40">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-tertiary" />
              <span>Problema Reportado</span>
            </div>
            <p className="text-sm text-foreground/90 italic leading-relaxed pl-6 border-l-2 border-tertiary/60">
              "{workOrder.issueDescription}"
            </p>
          </div>

          <Separator className="bg-border/60" />

          {/* Diagnostic Timeline Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
              {t.statusPage.diagnosticHistoryTitle}
            </h3>
            <p className="text-xs text-typography font-mono">
              {t.statusPage.diagnosticHistorySubtitle}
            </p>

            <DiagnosticTimeline points={diagnosticPoints} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
