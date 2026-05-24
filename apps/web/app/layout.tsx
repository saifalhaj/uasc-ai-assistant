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
      <body className="min-h-screen bg-uasc-light">
        <nav className="bg-uasc-navy text-white px-6 py-3 flex items-center gap-4 shadow">
          <span className="text-uasc-gold font-bold text-lg tracking-wide">UASC</span>
          <span className="text-sm opacity-70">Dubai Police — Unmanned Aerial Systems Center</span>
          <div className="ml-auto flex gap-4 text-sm">
            <a href="/" className="hover:text-uasc-gold transition-colors">Home</a>
            <a href="/upload" className="hover:text-uasc-gold transition-colors">Upload</a>
            <a href="/chat" className="hover:text-uasc-gold transition-colors">Chat</a>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
