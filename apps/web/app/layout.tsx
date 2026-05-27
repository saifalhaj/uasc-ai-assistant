import type { Metadata } from 'next';
import './globals.css';
import { inter, mono, ar } from './fonts';
import { GridBackground } from '@/components/chrome/GridBackground';
import { Statusbar } from '@/components/chrome/Statusbar';
import { TopbarNav } from './TopbarNav';

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
          <TopbarNav />
          <main className="relative overflow-hidden">{children}</main>
          <Statusbar
            version={process.env.APP_VERSION || '0.1.0'}
            lastSync="live"
            model="UASC-claude-sonnet-4-6"
            screen="UASC"
          />
        </div>
      </body>
    </html>
  );
}
