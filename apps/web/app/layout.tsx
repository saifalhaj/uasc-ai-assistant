import type { Metadata } from "next";
import Image from "next/image";
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

        <nav className="glass-nav fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-5 py-3 border-b border-uasc-border">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/UASCLogoWhite.png"
              alt="UASC"
              width={26}
              height={26}
              unoptimized
              className="opacity-70"
            />
            <div className="flex flex-col leading-none">
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-uasc-text">UASC</span>
              <span className="text-[8px] tracking-widest uppercase text-uasc-sub opacity-55">Dubai Police</span>
            </div>
          </Link>

          <div className="h-5 w-px bg-uasc-border" />

          {/* System status */}
          <div className="flex items-center gap-1.5">
            <span className="block w-1.5 h-1.5 rounded-full bg-uasc-teal animate-pulse" />
            <span className="text-[9px] tracking-[0.18em] uppercase text-uasc-sub opacity-60">
              Systems Online
            </span>
          </div>

          {/* Home button */}
          <div className="ml-auto">
            <Link
              href="/"
              className="text-[11px] tracking-[0.18em] uppercase text-uasc-sub hover:text-uasc-text transition-colors duration-200 px-3 py-1.5 rounded border border-uasc-border hover:border-uasc-muted"
            >
              Home
            </Link>
          </div>
        </nav>

        <main className="pt-[52px]">{children}</main>
      </body>
    </html>
  );
}
