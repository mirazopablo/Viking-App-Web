"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, formatISO } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Clock, Loader2, Trash2, CalendarX, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { bookingService } from "@/services/booking.service";

const blockSchema = z.object({
  date: z.date({ message: "Selecciona una fecha" }),
  isFullDay: z.boolean(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  reason: z.string().optional(),
}).refine(data => {
  if (!data.isFullDay) {
    return !!data.startTime && !!data.endTime;
  }
  return true;
}, {
  message: "Debes especificar hora de inicio y fin si no es día completo",
  path: ["startTime"]
});

type BlockFormValues = z.infer<typeof blockSchema>;

export default function AvailabilityPage() {
  const queryClient = useQueryClient();
  const [isFullDay, setIsFullDay] = useState(true);

  const form = useForm<BlockFormValues>({
    resolver: zodResolver(blockSchema),
    defaultValues: {
      isFullDay: true,
      reason: "",
    }
  });

  const selectedDate = form.watch("date");

  // Fetch active blocks
  const { data: blockedPeriods, isLoading } = useQuery({
    queryKey: ["blockedPeriods"],
    queryFn: bookingService.getBlockedPeriods,
  });

  // Create block mutation
  const createBlockMutation = useMutation({
    mutationFn: bookingService.createBlockedPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedPeriods"] });
      form.reset({ isFullDay: true, reason: "" });
      setIsFullDay(true);
    },
    onError: (error) => {
      console.error("Failed to create block:", error);
      alert("Error al crear la excepción.");
    }
  });

  // Delete block mutation
  const deleteBlockMutation = useMutation({
    mutationFn: bookingService.deleteBlockedPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedPeriods"] });
    }
  });

  const onSubmit = (data: BlockFormValues) => {
    createBlockMutation.mutate({
      date: formatISO(data.date, { representation: "date" }),
      isFullDay: data.isFullDay,
      startTime: data.isFullDay ? undefined : data.startTime,
      endTime: data.isFullDay ? undefined : data.endTime,
      reason: data.reason || "Sin motivo",
    });
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-foreground">Agenda y <span className="text-tertiary">Disponibilidad</span></h1>
          <p className="text-sm text-typography font-mono">Gestiona los días y horarios donde no recibirás turnos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CREATE BLOCK FORM */}
        <div className="lg:col-span-1 bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm shadow-lg h-fit">
          <h2 className="text-lg font-bold uppercase border-b border-border/40 pb-2 mb-4 flex items-center">
            <PlusCircle className="w-5 h-5 mr-2 text-tertiary" />
            Nueva Excepción
          </h2>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-2 flex flex-col">
              <Label>Fecha a bloquear</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={`justify-start text-left font-normal bg-background ${!selectedDate && "text-muted-foreground"}`}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Seleccionar Fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar 
                    mode="single" 
                    selected={selectedDate} 
                    onSelect={(day) => {
                      if (day) {
                        form.setValue("date", day);
                        form.clearErrors("date");
                      }
                    }} 
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.date && <p className="text-danger text-xs">{form.formState.errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Tipo de Bloqueo</Label>
              <Select 
                value={isFullDay ? "full" : "partial"} 
                onValueChange={(val) => {
                  const isFull = val === "full";
                  setIsFullDay(isFull);
                  form.setValue("isFullDay", isFull);
                }}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Día Completo</SelectItem>
                  <SelectItem value="partial">Franja Horaria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isFullDay && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-2">
                  <Label>Hora Inicio</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-typography/50" />
                    <Input type="time" className="pl-9 bg-background" {...form.register("startTime")} />
                  </div>
                  {form.formState.errors.startTime && <p className="text-danger text-xs">{form.formState.errors.startTime.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Hora Fin</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-typography/50" />
                    <Input type="time" className="pl-9 bg-background" {...form.register("endTime")} />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Label>Motivo (opcional)</Label>
              <Input placeholder="Ej: Rindo final, Consulta médica..." className="bg-background" {...form.register("reason")} />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground mt-6"
              disabled={createBlockMutation.isPending}
            >
              {createBlockMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarX className="w-4 h-4 mr-2" />}
              Bloquear Disponibilidad
            </Button>
          </form>
        </div>

        {/* ACTIVE BLOCKS LIST */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold uppercase border-b border-border/40 pb-2 mb-4">Bloqueos Activos</h2>
          
          {isLoading ? (
            <div className="w-full flex items-center justify-center p-12 bg-card/20 rounded-xl border border-border/30">
              <Loader2 className="w-6 h-6 animate-spin text-tertiary" />
            </div>
          ) : !blockedPeriods || blockedPeriods.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center p-12 bg-card/20 rounded-xl border border-dashed border-border/50 text-typography/50">
              <CalendarX className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-mono text-sm">No hay días bloqueados configurados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blockedPeriods.map((block) => (
                <div key={block.id} className="bg-background border border-border/50 p-4 rounded-lg flex flex-col justify-between group hover:border-tertiary/50 transition-colors relative overflow-hidden">
                  {/* Danger Indicator Stripe */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-danger/70"></div>
                  
                  <div className="pl-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-foreground">
                        {format(new Date(`${block.date}T12:00:00`), "dd MMM, yyyy")}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-danger hover:bg-danger/20 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          if (confirm("¿Estás seguro de eliminar esta excepción?")) {
                            deleteBlockMutation.mutate(block.id);
                          }
                        }}
                        title="Eliminar bloqueo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center text-xs font-mono text-typography/80 mb-3 space-x-2">
                      <span className="bg-secondary/30 px-2 py-1 rounded inline-flex items-center">
                        <Clock className="w-3 h-3 mr-1 inline-block" />
                        {block.isFullDay ? "Día Completo" : `${block.startTime} - ${block.endTime}`}
                      </span>
                    </div>
                    
                    <p className="text-sm text-typography truncate" title={block.reason}>
                      {block.reason || "Sin motivo especificado"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
