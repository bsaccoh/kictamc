import { z } from 'zod';

export const submitManualPaymentSchema = z.object({
  body: z.object({
    paymentMethod: z.enum([
      'MANUAL_BANK_DEPOSIT',
      'MANUAL_ORANGE_MONEY',
      'MANUAL_AFRIMONEY',
      'ONLINE_MOCK',
    ]),
    providerTransactionReference: z
      .string()
      .min(3, 'Transaction or bank teller reference is required'),
    declaredAmountMinor: z.number().int().positive('Declared amount must be a positive integer'),
    receiptDocumentPath: z.string().optional().nullable(),
  }),
});

export const rejectPaymentSchema = z.object({
  body: z.object({
    reason: z.string().min(5, 'A valid rejection reason must be provided (min 5 characters)'),
  }),
});
