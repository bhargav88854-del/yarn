"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CsvTools({ canImport = false }: { canImport?: boolean }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const res = await fetch("/api/yarns/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Import failed");
        return;
      }
      if (data.created > 0) {
        toast.success(
          `Imported ${data.created} yarn(s)` +
            (data.skipped ? `, ${data.skipped} skipped` : "")
        );
      } else {
        toast.error(
          `No rows imported${data.skipped ? ` — ${data.skipped} invalid` : ""}`
        );
      }
      if (data.errors?.length) {
        const first = data.errors[0];
        toast.message(`Row ${first.row}: ${first.message}`);
      }
      router.refresh();
    } catch {
      toast.error("Could not read or import that file");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={onFile}
      />
      {canImport && (
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4" /> {busy ? "Importing…" : "Import CSV"}
        </Button>
      )}
      <Button variant="outline" asChild>
        <a href="/api/yarns/export">
          <Download className="h-4 w-4" /> Inventory
        </a>
      </Button>
      <Button variant="outline" asChild>
        <a href="/api/transactions/export">
          <Download className="h-4 w-4" /> Transactions
        </a>
      </Button>
    </div>
  );
}
