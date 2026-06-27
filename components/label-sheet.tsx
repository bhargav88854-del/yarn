"use client";

import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Label = {
  id: number;
  yarnId: string;
  name: string;
  color: string;
  location: string;
  url: string;
};

export function LabelSheet({ labels }: { labels: Label[] }) {
  if (labels.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No yarns yet — add stock to print labels.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <p className="text-sm text-muted-foreground">
          {labels.length} label(s). Scan a code to open that yarn.
        </p>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print labels
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 print:grid-cols-3">
        {labels.map((l) => (
          <div
            key={l.id}
            className="flex items-center gap-3 rounded-lg border bg-white p-3 print:break-inside-avoid"
          >
            <QRCodeSVG value={l.url} size={72} level="M" className="shrink-0" />
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold">{l.yarnId}</p>
              <p className="truncate text-sm font-medium" title={l.name}>
                {l.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {l.color} · {l.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
