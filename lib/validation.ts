import { z } from "zod";

export const yarnInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  material: z.string().min(1, "Material is required"),
  color: z.string().min(1, "Color is required"),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  location: z.string().min(1, "Location is required"),
  supplier: z.string().min(1, "Supplier is required"),
});

export type YarnInput = z.infer<typeof yarnInputSchema>;

export const transactionInputSchema = z.object({
  yarnId: z.coerce.number().int().positive("Yarn is required"),
  type: z.enum(["IN", "OUT"]),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0"),
});

export type TransactionInput = z.infer<typeof transactionInputSchema>;
