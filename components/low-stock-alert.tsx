import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

type LowYarn = {
  id: number;
  yarnId: string;
  name: string;
  quantity: number;
  location: string;
};

export function LowStockAlert({ yarns }: { yarns: LowYarn[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <CardTitle className="text-base">Low Stock Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {yarns.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            All yarns are above the 50-cone threshold.
          </p>
        ) : (
          <ul className="divide-y">
            {yarns.map((y) => (
              <li key={y.id} className="flex items-center justify-between py-2.5">
                <div>
                  <Link
                    href={`/inventory/${y.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {y.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {y.yarnId} · {y.location}
                  </p>
                </div>
                <Badge className="bg-red-100 text-red-700 border border-red-200 hover:bg-red-100">
                  {y.quantity} cones
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
