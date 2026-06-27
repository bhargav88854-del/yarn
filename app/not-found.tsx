import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 p-8">
      <div className="max-w-sm text-center">
        <p className="font-display text-6xl font-bold text-primary">404</p>
        <h1 className="mt-3 font-display text-xl font-semibold">
          Page not found
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
