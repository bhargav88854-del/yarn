"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function LandingSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = q.trim() ? `?search=${encodeURIComponent(q.trim())}` : "";
    router.push(`/inventory${params}`);
  }

  return (
    <form onSubmit={submit} className="relative">
      <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search yarn (e.g. cotton, viscose, Rack A…)"
        className="w-full rounded-2xl border border-white/15 bg-white/10 py-4 pl-14 pr-5 text-base text-white placeholder:text-white/50 outline-none backdrop-blur transition-colors focus:border-white/40 focus:bg-white/15"
      />
    </form>
  );
}
