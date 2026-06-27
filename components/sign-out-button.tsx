"use client";

import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/actions";

export function SignOutButton({ name }: { name?: string | null }) {
  return (
    <form action={signOutAction} className="border-t px-3 py-3">
      {name && (
        <p className="truncate px-2 pb-2 text-xs text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{name}</span>
        </p>
      )}
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Sign out
      </button>
    </form>
  );
}
