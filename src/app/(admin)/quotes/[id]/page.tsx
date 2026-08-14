"use client";

import React, { use } from "react";
import { QuickQuoteBuilder } from "@/components/quotes/QuickQuoteBuilder";

export default function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <div className="animate-fadeIn pb-12">
      <QuickQuoteBuilder quoteId={resolvedParams.id} />
    </div>
  );
}
