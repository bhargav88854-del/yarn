"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import { cn, stockBadgeClass } from "@/lib/utils";
import { YarnForm } from "@/components/yarn-form";
import { StockForm } from "@/components/stock-form";

export type Yarn = {
  id: number;
  yarnId: string;
  name: string;
  material: string;
  color: string;
  quantity: number;
  reorderLevel: number;
  location: string;
  supplier: string;
};

const ALL = "__all__";
const PAGE_SIZE = 10;
type SortKey = "name" | "quantity";

export function YarnTable({
  yarns,
  materials,
  initialSearch = "",
}: {
  yarns: Yarn[];
  materials: string[];
  initialSearch?: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [material, setMaterial] = useState<string>(ALL);
  const [color, setColor] = useState("");
  const [location, setLocation] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [addOpen, setAddOpen] = useState(false);
  const [stock, setStock] = useState<{ yarn: Yarn; type: "IN" | "OUT" } | null>(
    null
  );

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const c = color.trim().toLowerCase();
    const l = location.trim().toLowerCase();
    const rows = yarns.filter(
      (y) =>
        (!s || y.name.toLowerCase().includes(s) || y.yarnId.toLowerCase().includes(s)) &&
        (material === ALL || y.material === material) &&
        (!c || y.color.toLowerCase().includes(c)) &&
        (!l || y.location.toLowerCase().includes(l))
    );
    rows.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "quantity") return (a.quantity - b.quantity) * dir;
      return a.name.localeCompare(b.name) * dir;
    });
    return rows;
  }, [yarns, search, material, color, location, sortKey, sortDir]);

  // Reset to first page whenever the result set changes.
  useEffect(() => setPage(1), [search, material, color, location, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function handleDelete(y: Yarn) {
    if (!confirm(`Delete ${y.name} (${y.yarnId})? This cannot be undone.`)) return;
    const res = await fetch(`/api/yarns/${y.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not delete yarn");
      return;
    }
    toast.success("Yarn deleted");
    router.refresh();
  }

  const SortIcon = ({ active }: { active: boolean }) =>
    active ? (
      sortDir === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5" />
      ) : (
        <ArrowDown className="h-3.5 w-3.5" />
      )
    ) : (
      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={material} onValueChange={setMaterial}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All materials</SelectItem>
            {materials.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="w-36"
          placeholder="Color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <Input
          className="w-36"
          placeholder="Rack / location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Add Yarn
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add new yarn</DialogTitle>
            </DialogHeader>
            <YarnForm onDone={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort("name")}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  Name <SortIcon active={sortKey === "name"} />
                </button>
              </TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => toggleSort("quantity")}
                  className="ml-auto inline-flex items-center gap-1 hover:text-foreground"
                >
                  Qty <SortIcon active={sortKey === "quantity"} />
                </button>
              </TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No yarns match your filters.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((y) => (
                <TableRow key={y.id} className="odd:bg-muted/30">
                  <TableCell className="font-mono text-xs">{y.yarnId}</TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/inventory/${y.id}`} className="hover:underline">
                      {y.name}
                    </Link>
                  </TableCell>
                  <TableCell>{y.material}</TableCell>
                  <TableCell>{y.color}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={cn(stockBadgeClass(y.quantity, y.reorderLevel), "border tabular-nums")}>
                      {y.quantity}
                    </Badge>
                  </TableCell>
                  <TableCell>{y.location}</TableCell>
                  <TableCell className="text-muted-foreground">{y.supplier}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Stock IN"
                        onClick={() => setStock({ yarn: y, type: "IN" })}
                      >
                        <ArrowDown className="h-4 w-4 text-emerald-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Stock OUT"
                        onClick={() => setStock({ yarn: y, type: "OUT" })}
                      >
                        <ArrowUp className="h-4 w-4 text-red-600" />
                      </Button>
                      <Button size="icon" variant="ghost" title="Edit" asChild>
                        <Link href={`/inventory/${y.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Delete"
                        onClick={() => handleDelete(y)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* result count + pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          {filtered.length === 0
            ? "No results"
            : `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length}`}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </Button>
            <span className="tabular-nums">
              Page {current} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={current >= totalPages}
              onClick={() => setPage(current + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <Dialog open={!!stock} onOpenChange={(o) => !o && setStock(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Stock {stock?.type} — {stock?.yarn.name}
            </DialogTitle>
          </DialogHeader>
          {stock && (
            <>
              <p className="text-sm text-muted-foreground">
                Current quantity: {stock.yarn.quantity} cones
              </p>
              <StockForm
                yarnPk={stock.yarn.id}
                type={stock.type}
                onDone={() => setStock(null)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
