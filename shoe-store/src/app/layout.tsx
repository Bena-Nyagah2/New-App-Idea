import type { Metadata, Viewport } from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Providers } from './providers';
import { ThemeProvider } from '@/components/theme-provider';
import { DiscountBanner } from '@/components/discount-banner';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Shoe Store | Quality Shoes in Nairobi',
  description: 'Shop the latest running, lifestyle, and basketball shoes. Fast delivery in Nairobi via Uber Boda. Pay online or cash on delivery.',
  keywords: ['shoes', 'sneakers', 'running shoes', 'Nairobi', 'Kenya', 'cash on delivery'],
  authors: [{ name: 'Shoe Store' }],
  creator: 'Shoe Store',
  publisher: 'Shoe Store',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://shoestore.vercel.app',
    siteName: 'Shoe Store',
    title: 'Shoe Store | Quality Shoes in Nairobi',
    description: 'Shop the latest running, lifestyle, and basketball shoes. Fast delivery in Nairobi.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Shoe Store - Quality Shoes in Nairobi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shoe Store | Quality Shoes in Nairobi',
    description: 'Shop the latest running, lifestyle, and basketball shoes. Fast delivery in Nairobi.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: '#ed8914',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

async function getServerTheme(): Promise<string> {
  try {
    const result = await db.select({ value: settings.value }).from(settings).where(eq(settings.key, 'theme')).limit(1);
    return result.length > 0 ? result[0].value : 'default';
  } catch {
    return 'default';
  }
}

async function getServerThemeMode(): Promise<string> {
  try {
    const result = await db.select({ value: settings.value }).from(settings).where(eq(settings.key, 'theme-mode')).limit(1);
    return result.length > 0 ? result[0].value : 'auto';
  } catch {
    return 'auto';
  }
}

const VALID_THEMES = ['default', 'christmas', 'easter', 'back-to-school', 'black-friday'];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, themeMode] = await Promise.all([getServerTheme(), getServerThemeMode()]);
  const safeTheme = VALID_THEMES.includes(theme) ? theme : 'default';

  const themeClasses = [
    safeTheme !== 'default' ? `theme-${safeTheme}` : '',
    themeMode === 'dark' ? 'dark' : '',
  ].filter(Boolean).join(' ');

  return (
    <html lang="en-KE" className={`${fredoka.variable} ${nunito.variable} antialiased ${themeClasses}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://api.paystack.co" />
      </head>
      <body className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--font-body)] text-[var(--color-text)]">
        <Providers>
          <ThemeProvider initialTheme={safeTheme} initialMode={themeMode}>
            <DiscountBanner />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
