'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, Search, ExternalLink, Sun, Moon, 
  User, LogOut, Settings, ShieldCheck, X, ChevronDown,
  Plus, CheckSquare, Bell, FileText, Users, Sparkles,
  Command, ArrowRight, Loader2, Home
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
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Derive human-readable section / breadcrumb from path with clickable links
  function getBreadcrumbs() {
    const crumbs = [{ label: 'Newsroom', href: '/admin' }];

    if (pathname === '/admin') {
      crumbs.push({ label: 'Operations Desk', href: '/admin' });
    } else if (pathname.startsWith('/admin/articles/create')) {
      crumbs.push({ label: 'Articles', href: '/admin/articles' });
      crumbs.push({ label: 'Compose Story', href: pathname });
    } else if (pathname.includes('/edit')) {
      crumbs.push({ label: 'Articles', href: '/admin/articles' });
      crumbs.push({ label: 'Edit Story', href: pathname });
    } else if (pathname.startsWith('/admin/articles')) {
      crumbs.push({ label: 'Articles & Bylines', href: '/admin/articles' });
    } else if (pathname.startsWith('/admin/review-queue')) {
      crumbs.push({ label: 'Review Queue', href: '/admin/review-queue' });
    } else if (pathname.startsWith('/admin/reporters')) {
      crumbs.push({ label: 'Reporters & Credentials', href: '/admin/reporters' });
    } else if (pathname.startsWith('/admin/categories')) {
      crumbs.push({ label: 'Desks & Categories', href: '/admin/categories' });
    } else if (pathname.startsWith('/admin/media')) {
      crumbs.push({ label: 'Media Library', href: '/admin/media' });
    } else if (pathname.startsWith('/admin/videos')) {
      crumbs.push({ label: 'Video Journalism', href: '/admin/videos' });
    } else if (pathname.startsWith('/admin/shows')) {
      crumbs.push({ label: 'Shows & Programs', href: '/admin/shows' });
    } else if (pathname.startsWith('/admin/live-blogs')) {
      crumbs.push({ label: 'Live Coverage', href: '/admin/live-blogs' });
    } else if (pathname.startsWith('/admin/subscribers')) {
      crumbs.push({ label: 'Subscribers', href: '/admin/subscribers' });
    } else if (pathname.startsWith('/admin/settings')) {
      crumbs.push({ label: 'Platform Settings', href: '/admin/settings' });
    } else {
      crumbs.push({ label: 'Dashboard', href: pathname });
    }

    return crumbs;
  }

  const breadcrumbs = getBreadcrumbs();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      } else if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setUserDropdownOpen(false);
        setNotifDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live search for articles
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.articles || []);
        }
      } catch (err) {
        //
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchFocused(false);
    router.push(`/admin/articles?search=${encodeURIComponent(searchQuery.trim())}`);
  }

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 bg-white/95 dark:bg-[#0D1626]/95 backdrop-blur-md border-b border-[#E2EAF2] dark:border-[#27364B] px-4 sm:px-6 flex items-center justify-between gap-4 font-sans transition-colors select-none">
      {/* 1. Left: Mobile Menu Toggle & Interactive Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-lg text-[#174A7E] dark:text-[#B6C3D4] hover:bg-[#F0F7FD] dark:hover:bg-[#131F32] lg:hidden transition cursor-pointer"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean Interactive Breadcrumb Bar */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs truncate">
          <Link
            href="/admin"
            className="p-1 rounded text-[#71869C] dark:text-[#7890A8] hover:text-[#079FE3] hover:bg-[#F0F7FD] dark:hover:bg-[#131F32] transition"
            title="Newsroom Operations Center"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>

          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href + idx}>
                <span className="text-[#DCE7F2] dark:text-[#27364B] text-[10px]">/</span>
                {isLast ? (
                  <span className="font-bold text-[#174A7E] dark:text-[#F4F7FB] truncate">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="font-medium text-[#71869C] dark:text-[#7890A8] hover:text-[#079FE3] transition truncate"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* 2. Center: Omnibox Instant Search with Quick Actions & Autocomplete */}
      <div 
        ref={searchContainerRef}
        className="relative flex-1 max-w-xs md:max-w-md lg:max-w-lg hidden sm:block"
      >
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#356DA8] dark:text-[#7890A8]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search newsroom stories, reporters, desks..."
            className="w-full pl-9 pr-14 py-1.5 text-xs bg-[#F0F7FD] dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#71869C] rounded-lg focus:outline-none focus:border-[#079FE3] focus:ring-1 focus:ring-[#079FE3] transition shadow-2xs"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="text-[#71869C] hover:text-[#174A7E] dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#71869C] dark:text-[#7890A8] bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded">
                ⌘K
              </kbd>
            )}
          </div>
        </form>

        {/* Search Results & Quick Action Palette Dropdown */}
        {isSearchFocused && (
          <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-2xl overflow-hidden z-50 text-xs animate-in fade-in duration-150">
            {searchQuery.trim().length < 2 ? (
              <div className="p-3 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#71869C] dark:text-[#7890A8] px-1 block">
                  Quick Newsroom Actions
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    href="/admin/articles/create"
                    onClick={() => setIsSearchFocused(false)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#F0F7FD] dark:bg-[#0D1626] hover:bg-[#E5F2FC] dark:hover:bg-[#1A2942] text-[#174A7E] dark:text-[#F4F7FB] transition font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#079FE3]" />
                    <span>Create New Story</span>
                  </Link>
                  <Link
                    href="/admin/review-queue"
                    onClick={() => setIsSearchFocused(false)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#F0F7FD] dark:bg-[#0D1626] hover:bg-[#E5F2FC] dark:hover:bg-[#1A2942] text-[#174A7E] dark:text-[#F4F7FB] transition font-semibold"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                    <span>Review Queue</span>
                  </Link>
                  <Link
                    href="/admin/reporters"
                    onClick={() => setIsSearchFocused(false)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#F0F7FD] dark:bg-[#0D1626] hover:bg-[#E5F2FC] dark:hover:bg-[#1A2942] text-[#174A7E] dark:text-[#F4F7FB] transition font-semibold"
                  >
                    <Users className="w-3.5 h-3.5 text-[#1261A6] dark:text-[#079FE3]" />
                    <span>Reporters & Staff</span>
                  </Link>
                  <Link
                    href="/admin/settings"
                    onClick={() => setIsSearchFocused(false)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#F0F7FD] dark:bg-[#0D1626] hover:bg-[#E5F2FC] dark:hover:bg-[#1A2942] text-[#174A7E] dark:text-[#F4F7FB] transition font-semibold"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#71869C]" />
                    <span>Platform Settings</span>
                  </Link>
                </div>
              </div>
            ) : isSearching ? (
              <div className="p-4 flex items-center justify-center gap-2 text-xs text-[#71869C]">
                <Loader2 className="w-4 h-4 animate-spin text-[#079FE3]" />
                <span>Searching editorial database...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-72 overflow-y-auto divide-y divide-[#E5EDF5] dark:divide-[#27364B]">
                <div className="p-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#079FE3] px-2 py-1 block">
                    Matching Stories ({searchResults.length})
                  </span>
                  {searchResults.map((art) => (
                    <Link
                      key={art.id}
                      href={`/admin/articles/${art.id}/edit`}
                      onClick={() => setIsSearchFocused(false)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F0F7FD] dark:hover:bg-[#1A2942] transition"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-[#174A7E] dark:text-[#F4F7FB] truncate">
                          {art.title}
                        </p>
                        <span className="text-[10px] text-[#71869C]">
                          {art.category || 'News'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#079FE3] shrink-0">
                        Edit →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[#71869C]">
                No matching articles found. Press Enter to view all results.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Right Controls: Quick Story Button, Live Site, Alerts, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Prominent Quick "+ Story" Button */}
        <Link
          href="/admin/articles/create"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#079FE3] hover:bg-[#1261A6] text-white text-xs font-bold rounded-lg transition shadow-xs shadow-[#079FE3]/20 cursor-pointer"
          title="Compose and publish new story"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">New Story</span>
        </Link>

        {/* View Live Public Site */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#174A7E] dark:text-[#B6C3D4] bg-[#F0F7FD] hover:bg-[#E5F2FC] dark:bg-[#131F32] dark:hover:bg-[#1A2942] hover:text-[#079FE3] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg transition"
          title="Open Public News Site in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#079FE3]" />
          <span className="hidden md:inline">Live Site</span>
        </Link>

        {/* Theme Toggle Button */}
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

        {/* Newsroom Status / Alerts Center */}
        <div className="relative" ref={notifMenuRef}>
          <button
            type="button"
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="p-2 rounded-lg text-[#174A7E] dark:text-[#B6C3D4] bg-[#F0F7FD] hover:bg-[#E5F2FC] dark:bg-[#131F32] dark:hover:bg-[#1A2942] border border-[#DCE7F2] dark:border-[#27364B] transition cursor-pointer relative"
            title="Desk Alerts & System Status"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#079FE3] rounded-full ring-2 ring-white dark:ring-[#0D1626]" />
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-[#DCE7F2] dark:border-[#27364B] flex items-center justify-between">
                <span className="font-bold text-[#174A7E] dark:text-[#F4F7FB]">
                  Desk Operations Alert
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Neon Lakebase Online
                </span>
              </div>
              <div className="p-3 space-y-2">
                <Link
                  href="/admin/review-queue"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#F0F7FD] dark:bg-[#0D1626] hover:bg-[#E5F2FC] dark:hover:bg-[#1A2942] transition"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="font-bold text-[#174A7E] dark:text-[#F4F7FB]">Editorial Review</p>
                      <p className="text-[10px] text-[#71869C]">Submissions awaiting editor sign-off</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#71869C]" />
                </Link>

                <Link
                  href="/admin/subscribers"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#F0F7FD] dark:bg-[#0D1626] hover:bg-[#E5F2FC] dark:hover:bg-[#1A2942] transition"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#079FE3]" />
                    <div>
                      <p className="font-bold text-[#174A7E] dark:text-[#F4F7FB]">Daily Morning Briefing</p>
                      <p className="text-[10px] text-[#71869C]">Registered newsletter readership</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#71869C]" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Credential Dropdown */}
        <div className="relative" ref={userMenuRef}>
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
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-2xl py-1.5 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 bg-[#F0F7FD] dark:bg-[#0D1626] border-b border-[#DCE7F2] dark:border-[#27364B]">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="font-bold text-[#174A7E] dark:text-[#F4F7FB] truncate">
                    {userName || 'Administrator'}
                  </p>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#079FE3]" />
                </div>
                <p className="text-[10px] text-[#71869C] font-mono uppercase tracking-wider">
                  Role: {userRole || 'REPORTER'}
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/admin/articles"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-[#294767] dark:text-[#B6C3D4] hover:bg-[#F0F7FD] dark:hover:bg-[#1A2942] hover:text-[#087FC1] transition"
                >
                  <FileText className="w-3.5 h-3.5 text-[#356DA8]" />
                  <span>My Bylines & Articles</span>
                </Link>

                {userRole === 'SUPER_ADMIN' && (
                  <Link
                    href="/admin/reporters"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-[#294767] dark:text-[#B6C3D4] hover:bg-[#F0F7FD] dark:hover:bg-[#1A2942] hover:text-[#087FC1] transition"
                  >
                    <Users className="w-3.5 h-3.5 text-[#356DA8]" />
                    <span>Reporters & Credentials</span>
                  </Link>
                )}

                <Link
                  href="/admin/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-[#294767] dark:text-[#B6C3D4] hover:bg-[#F0F7FD] dark:hover:bg-[#1A2942] hover:text-[#087FC1] transition"
                >
                  <Settings className="w-3.5 h-3.5 text-[#356DA8]" />
                  <span>Platform Settings</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-[#DCE7F2] dark:border-[#27364B]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-[#D71920] hover:bg-red-50 dark:hover:bg-red-950/30 text-left transition font-semibold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Newsroom</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
