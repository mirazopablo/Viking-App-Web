"use client";

import { Navbar } from "@/components/common/navbar";
import { BookingStepper } from "@/components/booking/booking-stepper";
import { useLanguage } from "@/context/language-context";

export default function BookingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground relative pb-20 md:pb-0">
      <Navbar />
      
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tertiary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12 flex flex-col">
        <div className="space-y-2 mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight">
            {t.booking.pageTitlePart1} <span className="text-tertiary">{t.booking.pageTitleHighlight}</span>
          </h1>
          <p className="text-xs sm:text-sm text-typography font-mono">
            {t.booking.pageSubtitle}
          </p>
        </div>
        
        <div className="flex-1 w-full bg-card/40 border border-border/50 rounded-2xl p-4 sm:p-8 backdrop-blur-sm shadow-xl">
          <BookingStepper />
        </div>
      </main>
    </div>
  );
}
