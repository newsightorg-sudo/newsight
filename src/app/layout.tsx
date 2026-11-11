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
    default: 'NEWSIGHT | Professional Digital News & Video Journalism',
    template: '%s | NEWSIGHT',
  },
  description: 'Independent digital news and video journalism platform. Live broadcasts, in-depth ground reports, documentary investigations, and verified news coverage.',
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
      <head>
        <link rel="icon" href="/logo3.png" type="image/png" />
        <link rel="shortcut icon" href="/logo3.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo3.png" />
        {/* Anti-FOUC Early Theme Initializer */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('newsight_theme');
                  var theme = stored === 'dark' ? 'dark' : 'light';



                  var root = document.documentElement;
                  root.classList.remove('light', 'dark');
                  root.classList.add(theme);
                  root.setAttribute('data-theme', theme);
                  root.style.colorScheme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
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
