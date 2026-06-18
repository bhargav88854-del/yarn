"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StockForm({
  yarnPk,
  type,
  onDone,
}: {
  yarnPk: number;
  type: "IN" | "OUT";
  onDone?: () => void;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yarnId: yarnPk, type, quantity: qty }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not record movement");
        return;
      }
      toast.success(`Stock ${type}: ${qty} cones recorded`);
      setQuantity("");
      onDone?.();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="qty">Quantity (cones)</Label>
        <Input
          id="qty"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          autoFocus
          required
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Recording…" : type === "IN" ? "Add stock" : "Remove stock"}
        </Button>
      </div>
    </form>
  );
}
