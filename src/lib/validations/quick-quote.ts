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

export const quickQuoteTableRowSchema = z.object({
  id: z.string(),
  rowType: tableRowTypeSchema,
  description: z.string().optional(),
  quantity: z.number().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
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

export const quickQuoteLaborCostSchema = z.object({
  description: z.string().optional(),
  amount: z.number().min(0).optional(),
});

export const quickQuoteFormSchema = z.object({
  title: z.string().optional(),
  mode: budgetModeSchema,
  clientName: z.string().optional(),
  clientDni: z.union([z.number(), z.string()]).optional(),
  clientAddress: z.string().optional(),
  clientPhoneNumber: z.string().optional(),
  clientEmail: z.string().email('Email inválido').or(z.literal('')).optional(),
  deviceModel: z.string().optional(),
  deviceSerialNumber: z.string().optional(),
  blocks: z.array(dynamicContentBlockSchema),
  items: z.array(quickQuoteTableRowSchema),
  labors: z.array(quickQuoteLaborCostSchema),
  taxPercentage: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  currency: z.string().optional(),
});

export type QuickQuoteFormSchemaType = z.infer<typeof quickQuoteFormSchema>;
