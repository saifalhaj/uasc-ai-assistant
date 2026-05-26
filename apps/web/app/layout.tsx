import type { Metadata } from 'next';
import './globals.css';
import { inter, mono, ar } from './fonts';
import { GridBackground } from '@/components/chrome/GridBackground';
import { Topbar } from '@/components/chrome/Topbar';
import { Statusbar } from '@/components/chrome/Statusbar';

export const metadata: Metadata = {
  title: 'UASC — Operational Intelligence',
  description: 'Cited operational answers for the Unmanned Aerial Systems Centre.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${mono.variable} ${ar.variable}`}>
      <body className="bg-bg-base text-text-mid overflow-hidden h-screen">
        <GridBackground />
        <div className="relative z-10 grid grid-rows-[44px_1fr_28px] h-screen">
          <Topbar
            user={{ name: 'Operator', clearance: 'L2 · OPS' }}
            crumbs={[{ label: 'UASC' }]}
          />
          <main className="relative overflow-hidden">{children}</main>
          <Statusbar
            version="1.0.5"
            lastSync="live"
            model="UASC-RAG-v3"
            corpus="operational corpus"
            screen="UASC"
          />
        </div>
      </body>
    </html>
  );
}
