"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { material: string; value: number; quantity: number };

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#0ea5e9",
  "#a855f7",
  "#14b8a6",
  "#f43f5e",
  "#84cc16",
  "#eab308",
];

const compact = (v: number) =>
  v >= 1000 ? `₹${(v / 1000).toFixed(v >= 100000 ? 0 : 1)}k` : `₹${v}`;

export function ValueChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No stock to value yet — add yarns with a cost per unit.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
        <XAxis
          type="number"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={compact}
        />
        <YAxis
          type="category"
          dataKey="material"
          width={92}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
          formatter={(value, _name, item) => {
            const v = Number(value);
            const qty = (item?.payload as Point)?.quantity ?? 0;
            return [`₹${v.toLocaleString("en-IN")} · ${qty} cones`, "Stock value"];
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
