'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlaySquare, Film, LayoutGrid, BookOpen } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home, exact: true },
    { label: 'Stories', href: '/video', icon: BookOpen },
    { label: 'Shows', href: '/shows', icon: Film },
    { label: 'Categories', href: '/categories', icon: LayoutGrid },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === '/';
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <nav 
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0A0E15]/95 backdrop-blur-lg border-t border-[#252D39] px-2 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] flex items-center justify-around text-[#A4ADBB] select-none shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
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
                ? 'text-[#075DEB]' 
                : 'text-[#A4ADBB] hover:text-white'
            }`}
          >
            {/* Top Active Indicator Bar */}
            {active && (
              <span className="absolute -top-1 inset-x-3 h-0.5 bg-[#075DEB] rounded-full shadow-[0_0_8px_#075DEB]" />
            )}

            <div className="relative">
              <Icon className={`w-5 h-5 mb-0.5 transition-colors ${active ? 'text-[#075DEB]' : ''}`} />
            </div>
            <span className={`tracking-tight ${active ? 'font-bold text-white' : ''}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
