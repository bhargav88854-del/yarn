import { z } from "zod";

export const yarnInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  material: z.string().min(1, "Material is required"),
  color: z.string().min(1, "Color is required"),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  // Empty string -> undefined so the .default() fires; otherwise z.coerce.number()
  // would turn "" into 0 and the default would never apply.
  unit: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().min(1, "Unit is required").default("Cones")
  ),
  costPerCone: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().min(0, "Cost cannot be negative").default(0)
  ),
  reorderLevel: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().min(0, "Reorder level cannot be negative").default(50)
  ),
  location: z.string().min(1, "Location is required"),
  supplier: z.string().min(1, "Supplier is required"),
});

export type YarnInput = z.infer<typeof yarnInputSchema>;

// Quantity only moves through IN/OUT transactions — never edited directly.
// So updates omit it to keep the stock figure and movement log in sync.
export const yarnUpdateSchema = yarnInputSchema.omit({ quantity: true });

export type YarnUpdate = z.infer<typeof yarnUpdateSchema>;

export const transactionInputSchema = z.object({
  yarnId: z.coerce.number().int().positive("Yarn is required"),
  type: z.enum(["IN", "OUT"]),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0"),
  note: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().max(200, "Note is too long").optional()
  ),
  reference: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().max(60, "Reference is too long").optional()
  ),
});

export type TransactionInput = z.infer<typeof transactionInputSchema>;
