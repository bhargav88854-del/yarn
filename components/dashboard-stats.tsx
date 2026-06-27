import { Card, CardContent } from "@/components/ui/card";
import {
  Boxes,
  Layers,
  AlertTriangle,
  ArrowLeftRight,
  IndianRupee,
} from "lucide-react";
import { cn, formatINR } from "@/lib/utils";

type Tone = "default" | "warn" | "alert";

type Stat = {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: Tone;
};

const toneStyles: Record<Tone, { strip: string; icon: string }> = {
  default: { strip: "bg-primary", icon: "bg-primary/10 text-primary" },
  warn: { strip: "bg-amber-400", icon: "bg-amber-100 text-amber-600" },
  alert: { strip: "bg-red-500", icon: "bg-red-100 text-red-600" },
};

export function DashboardStats({
  totalStock,
  totalValue,
  yarnTypes,
  lowStockCount,
  movements30d,
}: {
  totalStock: number;
  totalValue: number;
  yarnTypes: number;
  lowStockCount: number;
  movements30d: number;
}) {
  const stats: Stat[] = [
    { label: "Stock Value", value: formatINR(totalValue), hint: "current holdings at cost", icon: IndianRupee, tone: "default" },
    { label: "Total Stock", value: totalStock.toLocaleString(), hint: "cones in warehouse", icon: Boxes, tone: "default" },
    { label: "Yarn Types", value: yarnTypes, hint: "distinct SKUs", icon: Layers, tone: "default" },
    { label: "Low Stock", value: lowStockCount, hint: "below reorder level", icon: AlertTriangle, tone: lowStockCount > 0 ? "alert" : "default" },
    { label: "Movements (30d)", value: movements30d, hint: "IN + OUT entries", icon: ArrowLeftRight, tone: "default" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((s) => {
        const t = toneStyles[s.tone];
        return (
          <Card
            key={s.label}
            className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <span className={cn("absolute inset-x-0 top-0 h-1", t.strip)} />
            <CardContent className="flex items-start justify-between gap-3 p-5">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
              </div>
              <span className={cn("rounded-lg p-2", t.icon)}>
                <s.icon className="h-5 w-5" />
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
