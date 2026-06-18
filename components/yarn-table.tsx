"use client";

import { useMemo, useState } from "react";
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
import { Plus, ArrowDown, ArrowUp, Pencil, Trash2, Search } from "lucide-react";
import { stockBadgeClass } from "@/lib/utils";
import { YarnForm } from "@/components/yarn-form";
import { StockForm } from "@/components/stock-form";

export type Yarn = {
  id: number;
  yarnId: string;
  name: string;
  material: string;
  color: string;
  quantity: number;
  location: string;
  supplier: string;
};

const ALL = "__all__";

export function YarnTable({
  yarns,
  materials,
}: {
  yarns: Yarn[];
  materials: string[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [material, setMaterial] = useState<string>(ALL);
  const [color, setColor] = useState("");
  const [location, setLocation] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [stock, setStock] = useState<{ yarn: Yarn; type: "IN" | "OUT" } | null>(
    null
  );

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const c = color.trim().toLowerCase();
    const l = location.trim().toLowerCase();
    return yarns.filter(
      (y) =>
        (!s || y.name.toLowerCase().includes(s) || y.yarnId.toLowerCase().includes(s)) &&
        (material === ALL || y.material === material) &&
        (!c || y.color.toLowerCase().includes(c)) &&
        (!l || y.location.toLowerCase().includes(l))
    );
  }, [yarns, search, material, color, location]);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-56">
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

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No yarns match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((y) => (
                <TableRow key={y.id}>
                  <TableCell className="font-mono text-xs">{y.yarnId}</TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/inventory/${y.id}`} className="hover:underline">
                      {y.name}
                    </Link>
                  </TableCell>
                  <TableCell>{y.material}</TableCell>
                  <TableCell>{y.color}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={stockBadgeClass(y.quantity) + " border"}>
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
