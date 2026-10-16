import type { Metadata, Viewport } from 'next';
import { Noto_Naskh_Arabic, Noto_Sans_Bengali } from 'next/font/google';
import { Boot } from '@/components/boot';
import './globals.css';

const bn = Noto_Sans_Bengali({ subsets: ['bengali', 'latin'], weight: ['400', '500', '600', '700'], variable: '--nf-bn', display: 'swap' });
const ar = Noto_Naskh_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600'], variable: '--nf-ar', display: 'swap' });

// The elevenlabs.io credit stays in the title on every public build (free plan terms).
export const metadata: Metadata = {
  title: 'Setu · voices by elevenlabs.io',
  description: 'Learn Arabic from the Arabic you already speak in Bangla.',
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, viewportFit: 'cover',
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#F5F5F7' }, { media: '(prefers-color-scheme: dark)', color: '#000000' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${bn.variable} ${ar.variable}`}>
      <body>
        <Boot>{children}</Boot>
      </body>
    </html>
  );
}
