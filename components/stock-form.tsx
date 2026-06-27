"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      setError("Quantity must be a whole number greater than 0");
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
        setError(data.error ?? "Could not record movement");
        return;
      }
      toast.success(`Stock ${type}: ${qty} cones recorded`);
      setQuantity("");
      onDone?.();
      router.refresh();
    } catch {
      // Network error or non-JSON response (e.g. auth redirect) made res.json()
      // throw — show it rather than leaving the user with no feedback.
      setError("Could not reach the server — please retry");
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
          onChange={(e) => {
            setQuantity(e.target.value);
            setError(null);
          }}
          aria-invalid={!!error}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive"
          )}
          autoFocus
          required
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Recording…" : type === "IN" ? "Add stock" : "Remove stock"}
        </Button>
      </div>
    </form>
  );
}
