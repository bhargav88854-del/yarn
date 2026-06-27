"use client";

import { useEffect, useState, useTransition } from "react";
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
type SortKey = "name" | "quantity" | "yarnId";

type Filters = {
  q: string;
  material: string;
  color: string;
  location: string;
  sort: SortKey;
  dir: "asc" | "desc";
};

export function YarnTable({
  yarns,
  materials,
  canManage = false,
  total,
  page,
  pageSize,
  pageCount,
  filters,
}: {
  yarns: Yarn[];
  materials: string[];
  canManage?: boolean;
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  filters: Filters;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Local state for the text inputs so typing is responsive; URL is the source
  // of truth and the server does the actual filtering/paging.
  const [q, setQ] = useState(filters.q);
  const [color, setColor] = useState(filters.color);
  const [location, setLocation] = useState(filters.location);

  const [addOpen, setAddOpen] = useState(false);
  const [stock, setStock] = useState<{ yarn: Yarn; type: "IN" | "OUT" } | null>(
    null
  );

  function buildHref(
    over: Partial<Filters & { page: number }> = {}
  ): string {
    const f = {
      q,
      color,
      location,
      material: filters.material,
      sort: filters.sort,
      dir: filters.dir,
      page: 1,
      ...over,
    };
    const p = new URLSearchParams();
    if (f.q) p.set("q", f.q);
    if (f.material) p.set("material", f.material);
    if (f.color) p.set("color", f.color);
    if (f.location) p.set("location", f.location);
    if (f.sort && f.sort !== "yarnId") p.set("sort", f.sort);
    if (f.dir && f.dir !== "asc") p.set("dir", f.dir);
    if (f.page && f.page > 1) p.set("page", String(f.page));
    const qs = p.toString();
    return qs ? `/inventory?${qs}` : "/inventory";
  }

  const go = (over: Partial<Filters & { page: number }>) =>
    startTransition(() => router.push(buildHref(over)));

  // Debounce text fields → URL.
  useEffect(() => {
    if (
      q === filters.q &&
      color === filters.color &&
      location === filters.location
    ) {
      return;
    }
    const t = setTimeout(() => go({ page: 1 }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, color, location]);

  function toggleSort(key: SortKey) {
    const dir =
      filters.sort === key && filters.dir === "asc" ? "desc" : "asc";
    go({ sort: key, dir, page: 1 });
  }

  async function handleDelete(y: Yarn) {
    if (!confirm(`Delete ${y.name} (${y.yarnId})? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/yarns/${y.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not delete yarn");
        return;
      }
      toast.success("Yarn deleted");
      router.refresh();
    } catch {
      toast.error("Could not reach the server — please retry");
    }
  }

  const SortIcon = ({ active }: { active: boolean }) =>
    active ? (
      filters.dir === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5" />
      ) : (
        <ArrowDown className="h-3.5 w-3.5" />
      )
    ) : (
      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
    );

  const start = total === 0 ? 0 : (page - 1) * pageSize;

  return (
    <div className={cn("space-y-4", pending && "opacity-70 transition-opacity")}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name, ID, color, supplier…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select
          value={filters.material || ALL}
          onValueChange={(v) => go({ material: v === ALL ? "" : v, page: 1 })}
        >
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

        {canManage && (
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
        )}
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
                  Name <SortIcon active={filters.sort === "name"} />
                </button>
              </TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => toggleSort("quantity")}
                  className="ml-auto inline-flex items-center gap-1 hover:text-foreground"
                >
                  Qty <SortIcon active={filters.sort === "quantity"} />
                </button>
              </TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {yarns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No yarns match your filters.
                </TableCell>
              </TableRow>
            ) : (
              yarns.map((y) => (
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
                      {canManage && (
                        <>
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
                        </>
                      )}
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
          {total === 0
            ? "No results"
            : `Showing ${start + 1}–${Math.min(start + pageSize, total)} of ${total}`}
        </span>
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || pending}
              onClick={() => go({ page: page - 1 })}
            >
              Previous
            </Button>
            <span className="tabular-nums">
              Page {page} / {pageCount}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= pageCount || pending}
              onClick={() => go({ page: page + 1 })}
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
