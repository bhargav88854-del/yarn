"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { yarnInputSchema, yarnUpdateSchema } from "@/lib/validation";

export type YarnFormValues = {
  name: string;
  material: string;
  color: string;
  quantity: number;
  unit: string;
  costPerCone: number;
  reorderLevel: number;
  location: string;
  supplier: string;
};

// Form state keeps every field as a string so number inputs can be cleared
// and edited freely; values are coerced to the right types on submit.
type FormState = Record<keyof YarnFormValues, string>;

const empty: FormState = {
  name: "",
  material: "",
  color: "",
  quantity: "",
  unit: "Cones",
  costPerCone: "",
  reorderLevel: "50",
  location: "",
  supplier: "",
};

type FieldErrors = Partial<Record<keyof YarnFormValues, string>>;

export function YarnForm({
  yarnId,
  initial,
  onDone,
}: {
  yarnId?: number; // present => edit mode
  initial?: YarnFormValues;
  onDone?: () => void;
}) {
  const router = useRouter();
  const isEdit = yarnId != null;
  const [values, setValues] = useState<FormState>(
    initial
      ? {
          name: initial.name,
          material: initial.material,
          color: initial.color,
          quantity: String(initial.quantity),
          unit: initial.unit,
          costPerCone: String(initial.costPerCone),
          reorderLevel: String(initial.reorderLevel),
          location: initial.location,
          supplier: initial.supplier,
        }
      : empty
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const set = (k: keyof FormState, v: string) => {
    setValues((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Edit mode never sends quantity — stock only moves via IN/OUT transactions.
    const schema = isEdit ? yarnUpdateSchema : yarnInputSchema;
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors as Record<
        keyof YarnFormValues,
        string[] | undefined
      >;
      const next: FieldErrors = {};
      (Object.keys(fe) as (keyof YarnFormValues)[]).forEach((k) => {
        const msg = fe[k]?.[0];
        if (msg) next[k] = msg;
      });
      setErrors(next);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/yarns/${yarnId}` : "/api/yarns", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not save yarn");
        return;
      }
      toast.success(isEdit ? "Yarn updated" : "Yarn added");
      onDone?.();
      router.refresh();
    } catch {
      // Network error, or a non-JSON response (e.g. an auth redirect) that made
      // res.json() throw — surface it instead of silently re-enabling the button.
      toast.error("Could not save yarn — please retry");
    } finally {
      setSaving(false);
    }
  }

  const fields: {
    key: keyof FormState;
    label: string;
    type?: string;
    step?: string;
    placeholder?: string;
    createOnly?: boolean;
  }[] = [
    { key: "name", label: "Yarn name", placeholder: "Cotton Combed 30s" },
    { key: "material", label: "Material", placeholder: "Cotton" },
    { key: "color", label: "Color", placeholder: "White" },
    {
      key: "quantity",
      label: "Opening quantity",
      type: "number",
      placeholder: "0",
      createOnly: true,
    },
    { key: "unit", label: "Unit", placeholder: "Cones" },
    {
      key: "costPerCone",
      label: "Cost per unit (₹)",
      type: "number",
      step: "0.01",
      placeholder: "0.00",
    },
    {
      key: "reorderLevel",
      label: "Reorder level",
      type: "number",
      placeholder: "50",
    },
    { key: "location", label: "Location", placeholder: "Rack A-12" },
    { key: "supplier", label: "Supplier", placeholder: "Sri Lakshmi Mills" },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      {isEdit && (
        <div className="rounded-md border bg-muted/40 p-3 text-sm sm:col-span-2">
          <span className="font-medium">{values.quantity}</span>{" "}
          {values.unit || "units"} in stock —{" "}
          <span className="text-muted-foreground">
            adjust with IN/OUT movements on the Transactions page.
          </span>
        </div>
      )}
      {fields
        .filter((f) => !(f.createOnly && isEdit))
        .map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={f.key}>{f.label}</Label>
            <Input
              id={f.key}
              type={f.type ?? "text"}
              inputMode={f.type === "number" ? "decimal" : undefined}
              min={f.type === "number" ? 0 : undefined}
              step={f.step}
              placeholder={f.placeholder}
              value={values[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              aria-invalid={!!errors[f.key]}
              className={cn(
                errors[f.key] && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors[f.key] && (
              <p className="text-xs text-destructive">{errors[f.key]}</p>
            )}
          </div>
        ))}
      <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Add yarn"}
        </Button>
      </div>
    </form>
  );
}
