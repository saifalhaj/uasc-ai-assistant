import { Inter, JetBrains_Mono, Noto_Sans_Arabic } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
});

export const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
});

export const ar = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-ar',
});
