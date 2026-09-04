"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { bookingService } from "@/services/booking.service";
import { formatISO } from "date-fns";
import { useLanguage } from "@/context/language-context";

// Zod Schema for robust client-side validation
const bookingSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  phone: z.string().min(8, "Valid phone number required"),
  deviceType: z.string().min(1, "Please select a device type"),
  date: z.date({ message: "Please select a date" }),
  timeSlotId: z.string().min(1, "Please select a time slot"),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;



export function BookingStepper() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const { t } = useLanguage();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { fullName: "", phone: "", deviceType: "", notes: "" },
  });

  const selectedDate = form.watch("date");
  const selectedTimeSlot = form.watch("timeSlotId");
  const selectedDeviceType = form.watch("deviceType");

  const formattedDate = selectedDate ? formatISO(selectedDate, { representation: "date" }) : "";

  const { data: availabilityData, isLoading: isLoadingSlots } = useQuery({
    queryKey: ["availability", formattedDate, selectedDeviceType],
    queryFn: () => bookingService.getAvailability(formattedDate, selectedDeviceType),
    enabled: !!selectedDate && !!selectedDeviceType,
  });

  const availableSlots = (availabilityData?.availableSlots || []).map((slot) => {
    if (!selectedDate) return slot;
    
    // Parse slot time manually to handle "09:30 AM" formats safely across all browsers
    const [timeStr, modifier] = slot.time.split(' ');
    let [hours, minutes] = timeStr.split(':').map(Number);
    
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    const slotDateTime = new Date(selectedDate.getTime());
    slotDateTime.setHours(hours, minutes, 0, 0);
    
    // 24 hours from now
    const minValidTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const isEnoughAdvance = slotDateTime.getTime() > minValidTime.getTime();
    
    return {
      ...slot,
      isAvailable: slot.isAvailable && isEnoughAdvance
    };
  });
  
  const selectedSlotData = availableSlots.find((s) => s.id === selectedTimeSlot);

  const createBookingMutation = useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: () => {
      setIsSubmitting(false);
      setIsSuccess(true);
    },
    onError: (error) => {
      setIsSubmitting(false);
      console.error("Booking failed:", error);
      alert(t.booking.toastError);
    }
  });

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();
    let isValid = false;
    if (step === 1) isValid = await form.trigger(["fullName", "phone", "deviceType"]);
    else if (step === 2) isValid = await form.trigger(["date", "timeSlotId"]);
    
    if (isValid) {
      setStep((s) => s + 1);
      if (step === 2) {
        // Just entering step 3, prevent ghost clicks
        setCanSubmit(false);
        setTimeout(() => setCanSubmit(true), 600);
      }
    }
  };

  const onSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    createBookingMutation.mutate({
      ...data,
      date: data.date.toISOString(),
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center animate-fade-in">
        <div className="w-16 h-16 bg-success/15 rounded-full flex items-center justify-center text-success mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold uppercase">{t.booking.successTitle}</h3>
        <p className="text-typography font-mono text-sm max-w-sm">
          {t.booking.successDesc}
        </p>
        <Button onClick={() => window.location.href = "/"} className="mt-6 bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground">
          {t.booking.successReturn}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border/50 -z-10 -translate-y-1/2" />
        <div className="absolute top-1/2 left-0 h-0.5 bg-tertiary -z-10 -translate-y-1/2 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }} />
        
        {[1, 2, 3].map((i) => (
          <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= i ? "bg-tertiary text-tertiary-foreground" : "bg-secondary text-typography/50 border border-border"}`}>
            {i}
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold uppercase border-b border-border/40 pb-2 mb-4">{t.booking.step1Title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t.booking.fullNameLabel}</Label>
                <Input id="fullName" placeholder={t.booking.fullNamePlaceholder} {...form.register("fullName")} className="bg-background" />
                {form.formState.errors.fullName && <p className="text-danger text-xs">{form.formState.errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t.booking.phoneLabel}</Label>
                <Input id="phone" placeholder={t.booking.phonePlaceholder} {...form.register("phone")} className="bg-background" />
                {form.formState.errors.phone && <p className="text-danger text-xs">{form.formState.errors.phone.message}</p>}
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <Label>{t.booking.deviceTypeLabel}</Label>
              <Select onValueChange={(val) => form.setValue("deviceType", val)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={t.booking.deviceTypePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t.booking.deviceOptions.general}</SelectItem>
                  <SelectItem value="pc">{t.booking.deviceOptions.pc}</SelectItem>
                  <SelectItem value="laptop">{t.booking.deviceOptions.laptop}</SelectItem>
                  <SelectItem value="mobile">{t.booking.deviceOptions.mobile}</SelectItem>
                  <SelectItem value="gaming">{t.booking.deviceOptions.gaming}</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.deviceType && <p className="text-danger text-xs">{form.formState.errors.deviceType.message}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold uppercase border-b border-border/40 pb-2 mb-4">{t.booking.step2Title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 flex flex-col">
                <Label>{t.booking.selectDateLabel}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={`justify-start text-left font-normal bg-background ${!selectedDate && "text-muted-foreground"}`}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>{t.booking.pickDatePlaceholder}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={selectedDate} onSelect={(day) => form.setValue("date", day as Date)} disabled={(date) => date <= new Date(new Date().setHours(0,0,0,0))} />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.date && <p className="text-danger text-xs">{form.formState.errors.date.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>{t.booking.availableSlotsLabel}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {!selectedDate ? (
                    <div className="col-span-2 text-xs font-mono text-typography/50 p-4 border border-dashed border-border rounded-md text-center">
                      {t.booking.selectDateFirst}
                    </div>
                  ) : !selectedDeviceType ? (
                    <div className="col-span-2 text-xs font-mono text-typography/50 p-4 border border-dashed border-border rounded-md text-center">
                      {t.booking.selectDeviceFirst}
                    </div>
                  ) : isLoadingSlots ? (
                    <div className="col-span-2 text-xs font-mono text-typography/50 p-4 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {t.booking.loadingSlots}
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="col-span-2 text-xs font-mono text-typography/50 p-4 border border-dashed border-border rounded-md text-center text-warning">
                      {t.booking.noSlots}
                    </div>
                  ) : (
                    availableSlots.map((slot) => (
                      <Button 
                        key={slot.id} 
                        type="button" 
                        variant={selectedTimeSlot === slot.id ? "default" : "outline"} 
                        className={selectedTimeSlot === slot.id ? "bg-tertiary text-tertiary-foreground" : "bg-background"} 
                        onClick={() => form.setValue("timeSlotId", slot.id)}
                        disabled={!slot.isAvailable}
                      >
                        {slot.time}
                      </Button>
                    ))
                  )}
                </div>
                {form.formState.errors.timeSlotId && <p className="text-danger text-xs">{form.formState.errors.timeSlotId.message}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold uppercase border-b border-border/40 pb-2 mb-4">{t.booking.step3Title}</h3>
            <div className="bg-secondary/20 p-4 rounded-lg font-mono text-sm space-y-2 border border-border/50">
              <p><span className="text-typography/60">{t.booking.stepName}</span> {form.getValues("fullName")}</p>
              <p><span className="text-typography/60">{t.booking.stepDevice}</span> {form.getValues("deviceType")}</p>
              <p><span className="text-typography/60">{t.booking.stepDate}</span> {selectedDate ? format(selectedDate, "PPP") : ""}</p>
              <p><span className="text-typography/60">{t.booking.stepTime}</span> {selectedSlotData?.time}</p>
            </div>
            
            <div className="space-y-2 pt-2">
              <Label htmlFor="notes">{t.booking.notesLabel}</Label>
              <Textarea id="notes" placeholder={t.booking.notesPlaceholder} {...form.register("notes")} className="bg-background resize-none h-24" />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/40">
          <Button type="button" variant="ghost" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1 || isSubmitting}>
            {t.booking.buttonBack}
          </Button>
          
          {step < 3 ? (
            <Button type="button" onClick={handleNext} className="bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground">
              {t.booking.buttonContinue} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting || !canSubmit} className="bg-success hover:bg-success/90 text-success-foreground px-8 transition-opacity duration-300">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? t.booking.buttonProcessing : t.booking.buttonSubmit}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
