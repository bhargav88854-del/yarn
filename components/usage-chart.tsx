"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { month: string; in: number; out: number };

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function label(month: string): string {
  const [y, m] = month.split("-");
  return `${MONTHS[Number(m)]} ${y.slice(2)}`;
}

export function UsageChart({ data }: { data: Point[] }) {
  const rows = data.map((d) => ({ name: label(d.month), IN: d.in, OUT: d.out }));

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No movements recorded yet.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={rows} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="IN" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="OUT" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
