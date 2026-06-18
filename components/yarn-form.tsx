"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type YarnFormValues = {
  name: string;
  material: string;
  color: string;
  quantity: number;
  location: string;
  supplier: string;
};

const empty: YarnFormValues = {
  name: "",
  material: "",
  color: "",
  quantity: 0,
  location: "",
  supplier: "",
};

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
  const [values, setValues] = useState<YarnFormValues>(initial ?? empty);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof YarnFormValues, v: string) =>
    setValues((p) => ({ ...p, [k]: k === "quantity" ? Number(v) : v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        yarnId ? `/api/yarns/${yarnId}` : "/api/yarns",
        {
          method: yarnId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not save yarn");
        return;
      }
      toast.success(yarnId ? "Yarn updated" : "Yarn added");
      onDone?.();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const fields: { key: keyof YarnFormValues; label: string; type?: string; placeholder?: string }[] = [
    { key: "name", label: "Yarn name", placeholder: "Cotton Combed 30s" },
    { key: "material", label: "Material", placeholder: "Cotton" },
    { key: "color", label: "Color", placeholder: "White" },
    { key: "quantity", label: "Quantity (cones)", type: "number" },
    { key: "location", label: "Location", placeholder: "Rack A-12" },
    { key: "supplier", label: "Supplier", placeholder: "Sri Lakshmi Mills" },
  ];

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.key} className="space-y-1.5">
          <Label htmlFor={f.key}>{f.label}</Label>
          <Input
            id={f.key}
            type={f.type ?? "text"}
            min={f.type === "number" ? 0 : undefined}
            placeholder={f.placeholder}
            value={values[f.key]}
            onChange={(e) => set(f.key, e.target.value)}
            required
          />
        </div>
      ))}
      <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : yarnId ? "Save changes" : "Add yarn"}
        </Button>
      </div>
    </form>
  );
}
