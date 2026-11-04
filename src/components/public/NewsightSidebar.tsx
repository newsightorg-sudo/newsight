'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, PlaySquare, LayoutGrid, Film, Award, TrendingUp, ShieldCheck 
} from 'lucide-react';

interface NewsightSidebarProps {
  adSettings?: {
    ad_active?: boolean;
    ad_image_url?: string;
    ad_target_url?: string;
    ad_title?: string;
  };
  activeItem?: string;
}

export default function NewsightSidebar({ adSettings, activeItem }: NewsightSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home, key: 'home' },
    { label: 'Categories', href: '/categories', icon: LayoutGrid, key: 'categories' },
    { label: 'Shows', href: '/shows', icon: Film, key: 'shows' },
    { label: 'NEWSIGHT Classics', href: '/classics', icon: Award, key: 'classics' },
    { label: 'Top Stories', href: '/top-videos', icon: TrendingUp, key: 'top-videos' },
  ];

  const isItemActive = (href: string, key?: string) => {
    if (activeItem) {
      return activeItem === key || activeItem === href.replace('/', '');
    }
    if (href === '/') {
      return pathname === '/';
    }
    if (href === '/video') {
      return pathname === '/video' || pathname.startsWith('/video/');
    }
    if (href === '/shows') {
      return pathname === '/shows' || pathname.startsWith('/shows/');
    }
    if (href === '/categories') {
      return pathname === '/categories' || pathname.startsWith('/category/');
    }
    if (href === '/classics') {
      return pathname === '/classics';
    }
    if (href === '/top-videos') {
      return pathname === '/top-videos';
    }
    return pathname === href;
  };

  const showAd = adSettings?.ad_active && adSettings?.ad_image_url;

  return (
    <aside 
      className="hidden md:flex flex-col w-[104px] lg:w-[114px] shrink-0 bg-[#0A0E15] border-r border-[#252D39] min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] sticky top-14 sm:top-16 z-30 select-none py-3 justify-between"
      aria-label="Primary Left Sidebar Navigation"
    >
      {/* Primary Navigation Icons */}
      <div className="flex flex-col items-center gap-1.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.href, item.key);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`w-full flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all text-center group ${
                active 
                  ? 'bg-[#075DEB] text-white shadow-lg shadow-[#075DEB]/25 font-bold' 
                  : 'text-[#A4ADBB] hover:text-[#F5F7FA] hover:bg-[#1B2432]'
              }`}
            >
              <div className="relative mb-1">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${active ? 'text-white' : 'text-[#A4ADBB] group-hover:text-white'}`} />
              </div>
              <span className={`text-[10px] lg:text-[10.5px] leading-tight ${active ? 'font-bold text-white' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Area: Configurable Advertisement or Verified Newsroom Desk Status */}
      <div className="px-2 mt-auto pt-3 flex flex-col gap-2">
        {showAd && (
          <div className="pt-2 border-t border-[#252D39]/60">
            <Link
              href={adSettings.ad_target_url || '#'}
              className="block group overflow-hidden rounded-lg border border-[#252D39] bg-[#121925] hover:border-[#075DEB] transition-colors text-center"
              title={adSettings.ad_title || 'Featured Showcase'}
            >
              <div className="relative w-full aspect-[4/5] bg-zinc-900 overflow-hidden">
                <img
                  src={adSettings.ad_image_url}
                  alt={adSettings.ad_title || 'Advertisement'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-[8px] font-bold text-zinc-400 uppercase tracking-wider rounded">
                  AD
                </span>
              </div>
              <p className="p-1 text-[9px] text-[#A4ADBB] font-medium leading-tight line-clamp-2">
                {adSettings.ad_title || 'Special Series'}
              </p>
            </Link>
          </div>
        )}

        {/* Verified Newsroom Desk Badge */}
        <div className="p-2 rounded-xl bg-[#121925] border border-[#252D39] text-center">
          <div className="flex items-center justify-center gap-1.5 text-[9.5px] font-black uppercase text-emerald-400 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>NEWSROOM DESK</span>
          </div>
          <p className="text-[8.5px] text-[#707B8B] mt-0.5 font-medium leading-tight">
            Verified Journalism
          </p>
        </div>
      </div>
    </aside>
  );
}
