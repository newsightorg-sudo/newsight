'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlaySquare, Film, LayoutGrid, Radio } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { theme, isMounted } = useTheme();
  const isDark = isMounted ? theme === 'dark' : true;

  const navItems = [
    { label: 'Home', href: '/', icon: Home, exact: true },
    { label: 'Video', href: '/video', icon: PlaySquare },
    { label: 'Live', href: '/live', icon: Radio, pulse: true },
    { label: 'Shows', href: '/shows', icon: Film },
    { label: 'Desks', href: '/categories', icon: LayoutGrid },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === '/';
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <nav 
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-lg border-t px-2 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] flex items-center justify-around select-none shadow-lg transition-colors ${
        isDark
          ? 'bg-[#080B11]/95 border-[#252D39] text-[#A4ADBB]'
          : 'bg-white/95 border-[#E2EAF2] text-[#71869C]'
      }`}
      aria-label="Mobile Navigation Bar"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center py-1.5 px-3 rounded-xl text-[10px] font-semibold transition-all duration-200 active:scale-95 ${
              active 
                ? 'text-[#079FE3]' 
                : isDark
                ? 'text-[#A4ADBB] hover:text-white'
                : 'text-[#71869C] hover:text-[#174A7E]'
            }`}
          >
            {/* Active Top Indicator Bar */}
            {active && (
              <span className="absolute -top-1 inset-x-3 h-0.5 bg-[#079FE3] rounded-full shadow-[0_0_8px_#079FE3]" />
            )}

            <div className="relative">
              <Icon className={`w-5 h-5 mb-0.5 transition-colors ${active ? 'text-[#079FE3]' : ''}`} />
              {item.pulse && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#D71920] animate-pulse" />
              )}
            </div>
            <span className={`tracking-tight ${
              active 
                ? 'font-bold text-[#079FE3]' 
                : isDark 
                ? 'text-[#A4ADBB]' 
                : 'text-[#71869C]'
            }`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
