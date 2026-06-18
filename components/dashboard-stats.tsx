import { Card, CardContent } from "@/components/ui/card";
import { Boxes, Layers, AlertTriangle, ArrowLeftRight } from "lucide-react";

type Stat = {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "default" | "warn";
};

export function DashboardStats({
  totalStock,
  yarnTypes,
  lowStockCount,
  movements30d,
}: {
  totalStock: number;
  yarnTypes: number;
  lowStockCount: number;
  movements30d: number;
}) {
  const stats: Stat[] = [
    { label: "Total Stock", value: totalStock.toLocaleString(), hint: "cones in warehouse", icon: Boxes, tone: "default" },
    { label: "Yarn Types", value: yarnTypes, hint: "distinct SKUs", icon: Layers, tone: "default" },
    { label: "Low Stock", value: lowStockCount, hint: "below 50 cones", icon: AlertTriangle, tone: "warn" },
    { label: "Movements (30d)", value: movements30d, hint: "IN + OUT entries", icon: ArrowLeftRight, tone: "default" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
            </div>
            <span
              className={
                "rounded-lg p-2 " +
                (s.tone === "warn"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-primary/10 text-primary")
              }
            >
              <s.icon className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
