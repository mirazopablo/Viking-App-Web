'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BudgetBuilder } from '@/components/budgets/BudgetBuilder';
import { workOrderService } from '@/services/work-order.service';
import { userService } from '@/services/user.service';
import { budgetService } from '@/services/budget.service';
import { BudgetFormSchemaType } from '@/lib/validations/budget';
import { diagnosticService } from '@/services/diagnostic.service';

export default function WorkOrderBudgetPage() {
  const params = useParams();
  const router = useRouter();
  const workOrderId = (params?.id as string) || '';

  // 1. Fetch Work Order Detail
  const { data: workOrder, isLoading: isOrderLoading } = useQuery({
    queryKey: ['work-order', workOrderId],
    queryFn: () => workOrderService.getWorkOrderById(workOrderId),
    enabled: !!workOrderId,
  });

  // 2. Fetch Client PII User Details via clientId
  const { data: clientUser } = useQuery({
    queryKey: ['user-client', workOrder?.clientId],
    queryFn: () => userService.getUserById(workOrder!.clientId),
    enabled: !!workOrder?.clientId,
  });

  // 3. Fetch Diagnostic Findings for Machine
  const { data: diagnosticPoints } = useQuery({
    queryKey: ['diagnostic-points', workOrderId],
    queryFn: () => diagnosticService.getDiagnosticPoints(workOrderId),
    enabled: !!workOrderId,
  });

  // 4. Fetch Currently Authenticated Staff Member
  const { data: currentUser } = useQuery({
    queryKey: ['user-current'],
    queryFn: () => userService.getCurrentUser().catch(() => null),
  });

  // 5. Fetch Existing Budget from Go Backend API
  const { data: existingBudget } = useQuery({
    queryKey: ['budget', workOrderId],
    queryFn: () => budgetService.getBudgetByWorkOrder(workOrderId).catch(() => null),
    enabled: !!workOrderId,
  });

  const staffName =
    currentUser?.name ||
    (typeof window !== 'undefined' ? localStorage.getItem('viking_user_name') : '') ||
    'Técnico Especializado';

  const handleSaveBudget = async (data: BudgetFormSchemaType) => {
    await budgetService.saveBudget(data);
  };

  const handleDeleteBudget = async () => {
    if (!existingBudget?.id) return;
    await budgetService.deleteBudget(existingBudget.id);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`viking_budget_${workOrderId}`);
    }
    router.push(`/work-orders/${workOrderId}`);
  };

  if (isOrderLoading) {
    return (
      <div className="container mx-auto p-8 text-center text-xs text-muted-foreground animate-pulse">
        Cargando datos de la Orden de Trabajo N° {workOrderId}...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-6">
      <BudgetBuilder
        workOrderId={workOrderId}
        budgetId={existingBudget?.id}
        initialClientName={clientUser?.name || workOrder?.clientName || ''}
        initialClientDni={clientUser?.dni || workOrder?.clientDni}
        initialClientAddress={clientUser?.address || ''}
        initialClientPhone={clientUser?.phoneNumber || workOrder?.clientPhone || ''}
        initialClientEmail={clientUser?.email || ''}
        initialDeviceModel={workOrder?.deviceModel ? `${workOrder.deviceBrand ? workOrder.deviceBrand + ' ' : ''}${workOrder.deviceModel}` : ''}
        initialDeviceSerial={workOrder?.deviceSerialNumber || ''}
        diagnosticPoints={diagnosticPoints || []}
        staffName={staffName}
        onSave={handleSaveBudget}
        onDelete={existingBudget?.id ? handleDeleteBudget : undefined}
        onCancel={() => router.push(`/work-orders/${workOrderId}`)}
      />
    </div>
  );
}
