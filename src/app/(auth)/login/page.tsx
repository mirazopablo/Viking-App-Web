"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "@/services/auth.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";

/**
 * Zod validation schema for staff login form.
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido" })
    .email({ message: "Formato de correo electrónico inválido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      
      if (response && response.token) {
        localStorage.setItem("viking_jwt_token", response.token);
        toast.success(`Bienvenido, ${response.user?.name || "Técnico"}`, {
          description: `Sesión iniciada con rol: ${response.user?.role || "Staff"}`,
        });
        
        // Redirect to main work orders workspace
        router.push("/work-orders");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Credenciales inválidas o acceso denegado por RBAC.";
      toast.error("Error de autenticación", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-card/90 backdrop-blur-md border-border shadow-xl">
      <CardHeader className="space-y-1 text-center pb-6">
        <CardTitle className="text-xl font-bold tracking-tight text-foreground uppercase">
          Acceso Personal Técnico
        </CardTitle>
        <CardDescription className="text-xs text-typography font-mono">
          Ingresa tus credenciales de Staff o Administrador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Correo Electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-typography" />
              <Input
                id="email"
                type="email"
                placeholder="staff@vikingapp.com"
                className="pl-9 bg-secondary/20 border-border focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all"
                disabled={isLoading}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-error font-medium mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-typography" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9 bg-secondary/20 border-border focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all"
                disabled={isLoading}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-error font-medium mt-1">{errors.password.message}</p>
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
                Verificando...
              </>
            ) : (
              <>
                Ingresar al Panel
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
