"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "@/components/sidebar";

/** Mobile top bar with a slide-in navigation drawer. */
export function MobileNav({ userName }: { userName?: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b bg-card/90 px-4 py-3 backdrop-blur md:hidden">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger
          aria-label="Open menu"
          className="grid h-9 w-9 place-items-center rounded-md border text-foreground transition-colors hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-64 border-r shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            <Dialog.Close
              aria-label="Close menu"
              className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
            <SidebarNav onNavigate={() => setOpen(false)} userName={userName} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <span className="flex items-center gap-2 font-display font-semibold">
        <span>🧵</span> YarnTrack
      </span>
    </header>
  );
}
