'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Radio, ChevronDown } from 'lucide-react';
import { Category } from '@/lib/types';

interface MainHeaderProps {
  publicationName?: string;
  tagline?: string;
  categories: Category[];
}

export default function MainHeader({
  publicationName = 'THE DAILY SIGNAL',
  tagline = 'Independent Journalism • Uncompromising Truth',
  categories,
}: MainHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  interface MainNavItem {
    name: string;
    href: string;
    isLive?: boolean;
  }

  const navItems: MainNavItem[] = [
    { name: 'Home', href: '/' },
    { name: 'India', href: '/category/india' },
    { name: 'Kerala', href: '/regional/kerala' },
    { name: 'World', href: '/category/world' },
    { name: 'Politics', href: '/category/politics' },
    { name: 'Business', href: '/category/business' },
    { name: 'Technology', href: '/category/technology' },
    { name: 'Science', href: '/category/science' },
    { name: 'Health', href: '/category/health' },
    { name: 'Sports', href: '/category/sports' },
    { name: 'Investigations', href: '/category/investigations' },
    { name: 'Opinion', href: '/opinion' },
    { name: 'Video', href: '/video' },
    { name: 'Photo Stories', href: '/photos' },
  ];

  return (
    <header className="border-b border-zinc-200 bg-white">
      {/* Brand & Masthead Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          {/* Left: Weather & Market Snippet */}
          <div className="hidden md:flex flex-col text-xs text-zinc-500">
            <span className="font-semibold text-zinc-800">Financial Markets</span>
            <span className="tracking-tight">
              BSE Sensex <strong className="text-emerald-700">84,320.15 (+0.42%)</strong>
            </span>
            <span className="tracking-tight text-zinc-400">
              Nifty 50 <strong className="text-emerald-700">25,710.40 (+0.38%)</strong>
            </span>
          </div>

          {/* Center: Iconic Newspaper Wordmark */}
          <div className="text-center">
            <Link href="/" className="inline-block group">
              <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 uppercase hover:text-red-900 transition-colors">
                {publicationName}
              </h1>
            </Link>
            <p className="text-xs sm:text-sm text-zinc-500 font-serif italic mt-1 tracking-wide">
              {tagline}
            </p>
          </div>

          {/* Right: Quick actions & mobile toggle */}
          <div className="flex items-center justify-end space-x-3">
            <Link
              href="/live"
              className="hidden lg:inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition"
            >
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              <span>LIVE BLOGS</span>
            </Link>

            <Link
              href="/search"
              aria-label="Search articles"
              className="p-1.5 text-zinc-600 hover:text-zinc-900 transition"
            >
              <Search className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-zinc-800 hover:text-red-700 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="border-t border-b border-zinc-200 bg-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-between overflow-x-auto text-xs font-bold uppercase tracking-wider text-zinc-800 no-scrollbar py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name} className="whitespace-nowrap px-2 first:pl-0 last:pr-0">
                  <Link
                    href={item.href}
                    className={`py-1 inline-flex items-center space-x-1 hover:text-red-700 transition ${
                      isActive
                        ? 'text-red-700 border-b-2 border-red-700 font-extrabold'
                        : 'text-zinc-800'
                    }`}
                  >
                    {item.isLive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block mr-1 animate-pulse"></span>
                    )}
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-zinc-50 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-zinc-800">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded hover:bg-zinc-200 transition flex items-center space-x-1.5"
              >
                {item.isLive && (
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                )}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
          <div className="pt-3 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-600">
            <Link href="/reporters" className="hover:text-red-700 font-medium">
              Journalists Directory
            </Link>
            <Link href="/admin/login" className="hover:text-red-700 font-medium">
              Newsroom Staff Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
