import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UASC Agent — Dubai Police",
  description: "Unmanned Aerial Systems Center Intelligence Agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-uasc-bg text-uasc-text">
        <nav className="bg-uasc-card border-b border-uasc-border px-6 py-3 flex items-center gap-4">
          <span className="font-semibold text-sm tracking-widest uppercase text-uasc-text">UASC</span>
          <span className="text-xs text-uasc-muted">Dubai Police — Unmanned Aerial Systems Center</span>
          <div className="ml-auto flex gap-6 text-sm">
            <a href="/" className="text-uasc-sub hover:text-uasc-text transition-colors">Home</a>
            <a href="/upload" className="text-uasc-sub hover:text-uasc-text transition-colors">Upload</a>
            <a href="/chat" className="text-uasc-sub hover:text-uasc-text transition-colors">Chat</a>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
