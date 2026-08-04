import { z } from 'zod';

export const warningSeveritySchema = z.enum(['info', 'warning', 'important']);
export const budgetModeSchema = z.enum(['MAINTENANCE', 'NEW_EQUIPMENT']);
export const contentBlockTypeSchema = z.enum(['TEXT_PARAGRAPH', 'BULLET_LIST', 'WARNING_NOTE']);
export const tableRowTypeSchema = z.enum([
  'REGULAR_ITEM', 
  'BONIFICATION', 
  'SUBTOTAL_GROUP', 
  'HIDDEN_UNIT_PRICE_ITEM',
  'SPARE_PART_ITEM'
]);

export const dynamicContentBlockSchema = z.object({
  id: z.string(),
  type: contentBlockTypeSchema,
  title: z.string().optional(),
  content: z.string().optional(),
  items: z.array(z.string()).optional(),
  severity: warningSeveritySchema.optional(),
});

export const budgetTableRowSchema = z.object({
  id: z.string(),
  rowType: tableRowTypeSchema,
  description: z.string().min(1, 'La descripción es requerida'),
  quantity: z.number().min(0, 'La cantidad debe ser mayor o igual a 0'),
  unitPrice: z.number().min(0, 'El precio unitario debe ser positivo'),
  costPrice: z.number().min(0).optional(),
  profitMarginPercentage: z.number().min(0).optional(),
  profitAmount: z.number().optional(),
  discountAmount: z.number().min(0).optional(),
  isPercentageDiscount: z.boolean().optional(),
  isFree: z.boolean().optional(),
  vendorGroup: z.string().optional(),
  groupTitle: z.string().optional(),
  showUnitPrice: z.boolean().optional(),
});

export const budgetLaborCostSchema = z.object({
  description: z.string().min(1, 'La descripción de mano de obra es requerida'),
  amount: z.number().min(0, 'El monto debe ser positivo'),
});

export const budgetFormSchema = z.object({
  workOrderId: z.string().min(1, 'Work Order ID es requerido'),
  title: z.string().min(1, 'El título es requerido'),
  mode: budgetModeSchema,
  clientName: z.string().min(1, 'El nombre del cliente es requerido'),
  clientDni: z.union([z.number(), z.string()]).optional(),
  clientAddress: z.string().optional(),
  clientPhoneNumber: z.string().optional(),
  clientEmail: z.string().email('Email inválido').or(z.literal('')).optional(),
  deviceModel: z.string().min(1, 'El modelo del equipo es requerido'),
  deviceSerialNumber: z.string().optional(),
  blocks: z.array(dynamicContentBlockSchema),
  items: z.array(budgetTableRowSchema),
  labors: z.array(budgetLaborCostSchema),
  taxPercentage: z.number().min(0).max(100),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  currency: z.string(),
});

export type BudgetFormSchemaType = z.infer<typeof budgetFormSchema>;
