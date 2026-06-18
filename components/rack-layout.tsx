"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { stockBadgeClass, cn } from "@/lib/utils";
import { Warehouse } from "lucide-react";

export type RackYarn = {
  id: number;
  yarnId: string;
  name: string;
  quantity: number;
  location: string;
};

export type Rack = {
  name: string;
  yarns: RackYarn[];
  totalCones: number;
};

export function RackLayout({ racks }: { racks: Rack[] }) {
  const [active, setActive] = useState<string | null>(racks[0]?.name ?? null);
  const current = racks.find((r) => r.name === active);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        {racks.map((r) => (
          <button
            key={r.name}
            onClick={() => setActive(r.name)}
            className={cn(
              "rounded-lg border bg-card p-4 text-left transition-colors",
              active === r.name
                ? "border-primary ring-1 ring-primary"
                : "hover:bg-accent"
            )}
          >
            <div className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-primary" />
              <span className="font-semibold">{r.name}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {r.yarns.length} slots · {r.totalCones.toLocaleString()} cones
            </p>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {!current ? (
            <p className="text-sm text-muted-foreground">No racks to show.</p>
          ) : (
            <>
              <h2 className="text-lg font-semibold">{current.name}</h2>
              <p className="text-sm text-muted-foreground">
                {current.yarns.length} yarn(s) stored here
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {current.yarns.map((y) => (
                  <Link
                    key={y.id}
                    href={`/inventory/${y.id}`}
                    className="rounded-lg border p-4 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">
                        {y.location}
                      </span>
                      <Badge className={stockBadgeClass(y.quantity) + " border"}>
                        {y.quantity}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm font-medium">{y.name}</p>
                    <p className="text-xs text-muted-foreground">{y.yarnId}</p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
