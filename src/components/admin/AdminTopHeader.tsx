'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, Search, ExternalLink, Sun, Moon, 
  User, LogOut, Settings, ShieldCheck, X, ChevronDown
} from 'lucide-react';
import { useTheme } from '@/components/public/ThemeProvider';
import { UserRole } from '@/lib/types';

interface AdminTopHeaderProps {
  userName?: string;
  userRole?: UserRole;
  onOpenMobileSidebar: () => void;
}

export default function AdminTopHeader({
  userName,
  userRole,
  onOpenMobileSidebar,
}: AdminTopHeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Derive human-readable section / breadcrumb from path
  function getBreadcrumb() {
    if (pathname === '/admin') return { section: 'Newsroom', page: 'Operations Center' };
    if (pathname.startsWith('/admin/articles/create')) return { section: 'Newsroom', page: 'Compose Article' };
    if (pathname.includes('/edit')) return { section: 'Newsroom', page: 'Edit Article' };
    if (pathname.startsWith('/admin/articles')) return { section: 'Newsroom', page: 'Article Management' };
    if (pathname.startsWith('/admin/review-queue')) return { section: 'Newsroom', page: 'Editorial Review Queue' };
    if (pathname.startsWith('/admin/reporters')) return { section: 'Newsroom', page: 'Reporters & Staff' };
    if (pathname.startsWith('/admin/categories')) return { section: 'Newsroom', page: 'Categories & Desks' };
    if (pathname.startsWith('/admin/media')) return { section: 'Media', page: 'Media Library' };
    if (pathname.startsWith('/admin/videos')) return { section: 'Media', page: 'Video Journalism' };
    if (pathname.startsWith('/admin/shows')) return { section: 'Media', page: 'Shows & Programs' };
    if (pathname.startsWith('/admin/live-blogs')) return { section: 'Community', page: 'Live Coverage Blogs' };
    if (pathname.startsWith('/admin/subscribers')) return { section: 'Community', page: 'Newsletter Subscribers' };
    if (pathname.startsWith('/admin/settings')) return { section: 'System', page: 'Platform Settings' };
    return { section: 'Newsroom', page: 'Dashboard' };
  }

  const breadcrumb = getBreadcrumb();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `/admin/articles?search=${encodeURIComponent(searchQuery.trim())}`;
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-[#0D1626] border-b border-[#E2EAF2] dark:border-[#27364B] px-4 sm:px-6 flex items-center justify-between gap-4 font-sans transition-colors">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-lg text-[#174A7E] dark:text-[#B6C3D4] hover:bg-[#F0F7FD] dark:hover:bg-[#131F32] lg:hidden transition"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs truncate">
          <span className="font-semibold uppercase tracking-wider text-[#71869C] dark:text-[#7890A8]">
            {breadcrumb.section}
          </span>
          <span className="text-[#DCE7F2] dark:text-[#27364B]">/</span>
          <span className="font-bold text-[#174A7E] dark:text-[#F4F7FB] truncate">
            {breadcrumb.page}
          </span>
        </div>
      </div>

      {/* Right: Search, Live Site, Theme Toggle, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#356DA8] dark:text-[#7890A8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search articles..."
            className="w-48 lg:w-64 pl-8 pr-3 py-1.5 text-xs bg-[#F0F7FD] dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#71869C] rounded-lg focus:outline-none focus:border-[#079FE3] dark:focus:border-[#079FE3] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#71869C] hover:text-[#174A7E] dark:hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </form>

        {/* View Live Site Button */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#174A7E] dark:text-[#B6C3D4] bg-[#F0F7FD] hover:bg-[#E5F2FC] dark:bg-[#131F32] dark:hover:bg-[#1A2942] hover:text-[#079FE3] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg transition"
          title="Open Public News Site in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#079FE3]" />
          <span className="hidden sm:inline">View Live Site</span>
        </Link>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-lg text-[#174A7E] dark:text-[#B6C3D4] bg-[#F0F7FD] hover:bg-[#E5F2FC] dark:bg-[#131F32] dark:hover:bg-[#1A2942] border border-[#DCE7F2] dark:border-[#27364B] transition cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-[#174A7E]" />
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#F0F7FD] dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] hover:bg-[#E5F2FC] dark:hover:bg-[#1A2942] transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#1261A6] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {(userName || 'Admin').charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-[#174A7E] dark:text-[#F4F7FB] leading-tight">
                {userName || 'Administrator'}
              </span>
              <span className="block text-[10px] text-[#087FC1] font-semibold leading-tight uppercase font-mono">
                {userRole || 'STAFF'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#71869C] hidden sm:block" />
          </button>

          {userDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xl z-50 py-1.5 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 bg-[#F0F7FD] dark:bg-[#0D1626] border-b border-[#DCE7F2] dark:border-[#27364B]">
                  <p className="font-bold text-[#174A7E] dark:text-[#F4F7FB] truncate">
                    {userName || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-[#71869C] font-mono uppercase tracking-wider">
                    Role: {userRole || 'REPORTER'}
                  </p>
                </div>

                <Link
                  href="/admin/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-[#294767] dark:text-[#B6C3D4] hover:bg-[#F0F7FD] dark:hover:bg-[#1A2942] hover:text-[#087FC1] transition"
                >
                  <Settings className="w-3.5 h-3.5 text-[#356DA8]" />
                  <span>Platform Settings</span>
                </Link>

                <div className="pt-1 border-t border-[#DCE7F2] dark:border-[#27364B]">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-[#D71920] hover:bg-red-50 dark:hover:bg-red-950/30 text-left transition font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Newsroom</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

