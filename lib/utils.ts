import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Low stock threshold in cones. */
export const LOW_STOCK_THRESHOLD = 50;

/** Format a date as DD-MM-YYYY for display. */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/** Generate the next yarn id from the current row count: Y001, Y002... */
export function nextYarnId(count: number): string {
  return `Y${String(count + 1).padStart(3, "0")}`;
}

export type StockLevel = "low" | "medium" | "high";

/** Stock level buckets: red <50, yellow <100, green otherwise. */
export function stockLevel(quantity: number): StockLevel {
  if (quantity < 50) return "low";
  if (quantity < 100) return "medium";
  return "high";
}

/** Tailwind classes for a stock-level badge. */
export function stockBadgeClass(quantity: number): string {
  const level = stockLevel(quantity);
  if (level === "low") return "bg-red-100 text-red-700 border-red-200";
  if (level === "medium") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

/** Extract the rack group from a location like "Rack A-12" -> "Rack A". */
export function rackGroup(location: string): string {
  const m = location.match(/^(.*?)[-\s]?\d+\s*$/);
  return (m ? m[1] : location).trim().replace(/[-\s]+$/, "");
}
