import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "YarnTrack — Inventory System",
    template: "%s · YarnTrack",
  },
  description: "Warehouse yarn & thread stock management",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", inter.variable, sora.variable)}
    >
      <head>
        {/*
          Self-heal a stale service worker left in the browser from a previous
          app on this port: an old SW serves cached chunks that no longer exist,
          breaking the JS bundle ("Cannot read properties of undefined (reading
          'call')"). This inline script runs even when the bundle is broken, so
          it can unregister the SW, clear caches, and reload once.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.getRegistrations().then(function(rs){
    if (!rs.length) return;
    Promise.all(rs.map(function(r){return r.unregister();})).then(function(){
      if (window.caches && caches.keys) {
        caches.keys().then(function(ks){ ks.forEach(function(k){ caches.delete(k); }); });
      }
      if (!sessionStorage.getItem('sw-cleared')) {
        sessionStorage.setItem('sw-cleared','1');
        location.reload();
      }
    });
  }).catch(function(){});
})();`,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
