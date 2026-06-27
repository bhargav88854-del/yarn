"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center p-8">
      <div className="max-w-sm text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-600">
          <TriangleAlert className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-display text-lg font-semibold">
          Something went wrong
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We couldn&apos;t load this page. Try again, and if it keeps happening
          check that the database is running.
        </p>
        <Button className="mt-5" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
