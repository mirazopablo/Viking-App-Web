"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookingStepper } from "@/components/booking/booking-stepper";
import { CalendarPlus } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export function DesktopBookingModal() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="hidden md:flex bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground font-bold uppercase tracking-wider text-xs px-4 py-2 h-9 shadow-[0_0_15px_rgba(var(--tertiary),0.3)] hover:shadow-[0_0_25px_rgba(var(--tertiary),0.5)] transition-all items-center gap-2"
        >
          <CalendarPlus className="w-4 h-4" />
          {t.navbar.bookAppointment}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-tertiary/20 shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-extrabold uppercase tracking-tight">
            {t.booking.pageTitlePart1} <span className="text-tertiary">{t.booking.pageTitleHighlight}</span>
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {t.booking.pageSubtitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 pt-0">
          <BookingStepper />
        </div>
      </DialogContent>
    </Dialog>
  );
}
