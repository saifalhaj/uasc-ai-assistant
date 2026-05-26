import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "UASC AI Operational Assistant — Dubai Police",
  description: "Operational Intelligence Platform — Unmanned Aerial Systems Center",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-uasc-bg text-uasc-text">

        <nav className="glass-nav fixed top-0 left-0 right-0 z-50 flex items-center px-5 py-2.5 border-b border-uasc-border">

          {/* Brand — links back to home */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="flex flex-col leading-none">
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-uasc-text">UASC</span>
              <span className="text-[8px] tracking-widest uppercase text-uasc-sub opacity-55">Dubai Police</span>
            </div>
          </Link>

          {/* System status — pushed to the right */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="block w-1.5 h-1.5 rounded-full bg-uasc-teal animate-pulse" />
            <span className="text-[9px] tracking-[0.18em] uppercase text-uasc-sub opacity-60">
              Systems Online
            </span>
          </div>
        </nav>

        <main className="pt-[52px]">{children}</main>
      </body>
    </html>
  );
}
