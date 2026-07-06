import React from "react";
import { WorkOrderForm } from "@/components/work-orders/work-order-form";

/**
 * New Work Order Page (/work-orders/new):
 * Protected workshop route hosting the triage and creation form.
 */
export default function NewWorkOrderPage() {
  return <WorkOrderForm />;
}
