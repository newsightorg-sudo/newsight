import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React, { Suspense } from 'react';
import './globals.css';
import { ThemeProvider } from '@/components/public/ThemeProvider';
import NavigationProgressBar from '@/components/public/NavigationProgressBar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'NEWSIGHT | Professional Digital News & Visual Journalism',
    template: '%s | NEWSIGHT',
  },
  description: 'Independent digital news and photojournalism publication. Live dispatches, in-depth ground reports, documentary investigations, and verified news coverage.',
  metadataBase: new URL('https://newsight.media'),
  icons: {
    icon: '/logo3.png',
    shortcut: '/logo3.png',
    apple: '/logo3.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'NEWSIGHT',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#080B11' },
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} antialiased`}
    >
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[#E50914] selection:text-white flex flex-col">
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
