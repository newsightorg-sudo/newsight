'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Menu, Search, Bell, User as UserIcon, LogOut, 
  ExternalLink, X, PlaySquare, Newspaper, ArrowRight, Loader2, Sparkles, ChevronRight
} from 'lucide-react';
import NewsightLogo from './NewsightLogo';
import NewsightNavDrawer from './NewsightNavDrawer';
import ThemeToggle from './ThemeToggle';
import { useTheme } from './ThemeProvider';

interface SearchResultVideo {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  duration: string;
  category: string;
}

interface SearchResultArticle {
  id: string;
  title: string;
  slug: string;
  image: string;
  category: string;
  reporter: string;
}

interface NewsightHeaderProps {
  user?: any;
  breakingNews?: { title: string; url: string; time?: string };
  categories?: { id: string; name: string; slug: string }[];
  shows?: { id: string; title: string; slug: string }[];
}

const TRENDING_TOPICS = [
  'Semiconductor Corridor',
  'Solar Catamarans',
  'Constitution Bench',
  'Fiscal Deficit',
  'Space Telemetry'
];

const DESK_LINKS = [
  { label: 'India', href: '/category/india' },
  { label: 'World', href: '/category/world' },
  { label: 'Business', href: '/category/business' },
  { label: 'Tech', href: '/category/technology' },
  { label: 'Kerala', href: '/category/kerala' },
  { label: 'Shows', href: '/shows' },
];

export default function NewsightHeader({
  user,
  breakingNews,
  categories = [],
  shows = []
}: NewsightHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, isMounted } = useTheme();
  const isDark = isMounted ? theme === 'dark' : true;

  // Navigation & Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Search states & autocomplete
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    videos: SearchResultVideo[];
    articles: SearchResultArticle[];
  }>({ videos: [], articles: [] });

  // Genuine unread notification state (No fake counters)
  const [hasUnreadAlert, setHasUnreadAlert] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Auto-hide on scroll down, reveal on scroll up
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = Math.max(0, window.scrollY);

      // Always show at or near the very top of the page
      if (currentScrollY <= 20) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Do not hide if any modal, drawer, or dropdown is currently open/focused
      if (isDrawerOpen || isMobileSearchOpen || isNotifOpen || isProfileOpen || isSearchFocused) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollY.current;

      // Small threshold to avoid micro-jitter
      if (Math.abs(diff) < 6) {
        return;
      }

      if (diff > 0 && currentScrollY > 80) {
        // Scrolling down -> hide navbar (slide up)
        setIsVisible(false);
      } else if (diff < 0) {
        // Scrolling up -> reveal navbar (slide down)
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDrawerOpen, isMobileSearchOpen, isNotifOpen, isProfileOpen, isSearchFocused]);

  // Initialize unread alert state honestly from breaking news presence
  useEffect(() => {
    if (breakingNews?.title) {
      const readAlertId = sessionStorage.getItem('newsight_read_alert');
      if (readAlertId !== breakingNews.title) {
        setHasUnreadAlert(true);
      }
    }
  }, [breakingNews]);

  // Lock body scroll when mobile search modal is open
  useEffect(() => {
    if (isMobileSearchOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSearchOpen]);

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K to focus search, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setIsMobileSearchOpen(true);
        } else {
          searchInputRef.current?.focus();
          setIsSearchFocused(true);
        }
      } else if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setIsNotifOpen(false);
        setIsProfileOpen(false);
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search autocomplete
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults({ videos: [], articles: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error('Search autocomplete error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      setIsMobileSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTopicClick = (topic: string) => {
    setSearchQuery(topic);
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(topic)}`);
  };

  const handleNotificationClick = () => {
    setIsNotifOpen(!isNotifOpen);
    if (breakingNews?.title) {
      sessionStorage.setItem('newsight_read_alert', breakingNews.title);
      setHasUnreadAlert(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (_) {}
  };

  return (
    <>
      {/* Spacer to preserve document layout flow */}
      <div className="h-14 sm:h-16 w-full shrink-0" aria-hidden="true" />

      {/* Auto-hiding header with smooth slide transitions */}
      <header className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ease-in-out shadow-xs ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      } ${
        isDark 
          ? 'bg-[#080B11] border-b border-[#252D39] text-[#F5F7FA]' 
          : 'bg-white border-b border-[#E5E7EB] text-[#171A21]'
      }`}>
        <div className="max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* 1. LEFT: Menu drawer toggle & NEWSIGHT Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-[#A4ADBB] hover:text-white hover:bg-[#1B2432]' 
                  : 'text-[#4B5563] hover:text-[#171A21] hover:bg-[#F3F5F7]'
              }`}
              aria-label="Open navigation drawer"
              title="Full Navigation Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <NewsightLogo size="md" />
          </div>

          {/* 2. CENTER: Desktop Search Bar with Autocomplete Suggestions Dropdown */}
          <div 
            ref={searchContainerRef}
            className="relative flex-1 max-w-md lg:max-w-xl hidden md:block"
          >
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, reports and stories..."
                className={`w-full pl-10 pr-20 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-xs focus:outline-none ${
                  isDark
                    ? 'bg-[#121925] border border-[#252D39] text-[#F5F7FA] placeholder-[#707B8B] focus:border-[#075DEB] focus:ring-1 focus:ring-[#075DEB]'
                    : 'bg-[#F3F5F7] border border-[#E5E7EB] text-[#171A21] placeholder-[#6B7280] focus:bg-white focus:border-[#075DEB] focus:ring-2 focus:ring-[#075DEB]/20'
                }`}
              />
              <Search className={`absolute left-3.5 top-3 w-4 h-4 ${isDark ? 'text-[#707B8B]' : 'text-[#6B7280]'}`} />

              {/* Action buttons inside search bar: Clear & Keyboard Shortcut */}
              <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className={`p-0.5 rounded ${isDark ? 'text-[#707B8B] hover:text-white' : 'text-[#6B7280] hover:text-[#171A21]'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className={`hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded ${
                    isDark
                      ? 'text-[#707B8B] bg-[#1B2432] border border-[#252D39]'
                      : 'text-[#6B7280] bg-white border border-[#E5E7EB]'
                  }`}>
                    ⌘K
                  </kbd>
                )}
              </div>
            </form>

            {/* Instant Desktop Search Suggestions & Autocomplete Dropdown */}
            {isSearchFocused && (
              <div className="absolute left-0 right-0 mt-2 bg-[#0E131C] border border-[#252D39] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150">
                {/* When Query is Empty: Show Trending Topics */}
                {searchQuery.trim().length < 2 && (
                  <div className="p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#707B8B] mb-2 px-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#075DEB]" />
                      <span>Trending Searches</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {TRENDING_TOPICS.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => handleTopicClick(topic)}
                          className="px-2.5 py-1 text-xs bg-[#121925] hover:bg-[#1B2432] text-[#A4ADBB] hover:text-white border border-[#252D39] rounded-lg transition-colors"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading Indicator */}
                {isSearching && (
                  <div className="p-4 flex items-center justify-center gap-2 text-xs text-[#A4ADBB]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#075DEB]" />
                    <span>Searching archives...</span>
                  </div>
                )}

                {/* Search Results Display */}
                {!isSearching && searchQuery.trim().length >= 2 && (
                  <div className="max-h-96 overflow-y-auto divide-y divide-[#252D39]/50">
                    {/* Matching Videos */}
                    {searchResults.videos.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E50914] flex items-center gap-1.5">
                          <PlaySquare className="w-3 h-3" />
                          <span>Field Dispatches ({searchResults.videos.length})</span>
                        </div>
                        {searchResults.videos.map((vid) => (
                          <Link
                            key={vid.id}
                            href={`/video/${vid.slug}`}
                            onClick={() => setIsSearchFocused(false)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1B2432] transition-colors group"
                          >
                            <div className="relative w-14 h-9 rounded bg-black shrink-0 overflow-hidden border border-[#252D39]">
                              <img
                                src={vid.thumbnail}
                                alt={vid.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[8px] font-mono px-0.5 text-zinc-300 rounded">
                                {vid.duration}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#F5F7FA] truncate group-hover:text-[#075DEB]">
                                {vid.title}
                              </p>
                              <span className="text-[10px] text-[#707B8B] uppercase font-bold">
                                {vid.category}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Matching Articles */}
                    {searchResults.articles.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#075DEB] flex items-center gap-1.5">
                          <Newspaper className="w-3 h-3" />
                          <span>Articles ({searchResults.articles.length})</span>
                        </div>
                        {searchResults.articles.map((art) => (
                          <Link
                            key={art.id}
                            href={`/article/${art.slug}`}
                            onClick={() => setIsSearchFocused(false)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1B2432] transition-colors group"
                          >
                            <div className="relative w-14 h-9 rounded bg-black shrink-0 overflow-hidden border border-[#252D39]">
                              <img
                                src={art.image}
                                alt={art.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#F5F7FA] truncate group-hover:text-[#075DEB]">
                                {art.title}
                              </p>
                              <span className="text-[10px] text-[#707B8B]">
                                {art.category} • {art.reporter}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* No matches */}
                    {searchResults.videos.length === 0 && searchResults.articles.length === 0 && (
                      <div className="p-4 text-center text-xs text-[#707B8B]">
                        No direct matches for &ldquo;{searchQuery}&rdquo;. Press Enter to explore all archives.
                      </div>
                    )}

                    {/* Footer link to full search page */}
                    <div className="p-2 bg-[#0A0E15]">
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="w-full py-1.5 px-3 flex items-center justify-between text-xs font-bold text-[#075DEB] hover:text-blue-400 rounded-lg hover:bg-[#121925] transition-colors"
                      >
                        <span>View all matching results for &ldquo;{searchQuery}&rdquo;</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. DESKTOP DESK QUICK LINKS (xl screens) */}
          <nav 
            className={`hidden xl:flex items-center gap-1 text-xs font-semibold ${
              isDark ? 'text-[#A4ADBB]' : 'text-[#4B5563]'
            }`}
            aria-label="Editorial Desks Navigation"
          >
            {DESK_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    isActive 
                      ? isDark
                        ? 'text-[#075DEB] font-bold bg-[#121925]'
                        : 'text-[#075DEB] font-bold bg-[#E8F0FF]' 
                      : isDark
                        ? 'hover:text-white hover:bg-[#121925]'
                        : 'hover:text-[#171A21] hover:bg-[#F3F5F7]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* 4. RIGHT: Search Toggle (mobile), Theme Toggle, Alerts Bell, Account */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className={`p-2 rounded-lg md:hidden transition-colors ${
                isDark
                  ? 'text-[#A4ADBB] hover:text-white hover:bg-[#1B2432]'
                  : 'text-[#4B5563] hover:text-[#171A21] hover:bg-[#F3F5F7]'
              }`}
              aria-label="Open Search"
              title="Search News & Video Archives"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle className={
              isDark
                ? 'text-[#A4ADBB] hover:text-white hover:bg-[#1B2432]'
                : 'text-[#4B5563] hover:text-[#171A21] hover:bg-[#F3F5F7]'
            } />

            {/* Editorial Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleNotificationClick}
                className={`relative p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'text-[#A4ADBB] hover:text-white hover:bg-[#1B2432]'
                    : 'text-[#4B5563] hover:text-[#171A21] hover:bg-[#F3F5F7]'
                }`}
                aria-label="Editorial Notifications"
                title="Desk Dispatches & Breaking Alerts"
              >
                <Bell className="w-5 h-5" />
                {hasUnreadAlert && (
                  <span className={`absolute top-1.5 right-1.5 w-2 h-2 bg-[#E50914] rounded-full ring-2 ${
                    isDark ? 'ring-[#080B11]' : 'ring-white'
                  }`} />
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-[#0E131C] border border-[#252D39] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-[#252D39] flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#A4ADBB]">
                      Editorial Alerts
                    </span>
                    <span className="text-[10px] text-[#707B8B]">Verified Desk Dispatches</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#252D39]/50">
                    {breakingNews && (
                      <Link
                        href={breakingNews.url || '/'}
                        onClick={() => setIsNotifOpen(false)}
                        className="p-3.5 block hover:bg-[#1B2432] transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-[#E50914] text-white">
                            BREAKING
                          </span>
                          <span className="text-[10px] text-[#707B8B]">{breakingNews.time || 'Just now'}</span>
                        </div>
                        <p className="text-xs text-[#F5F7FA] font-medium line-clamp-2">
                          {breakingNews.title}
                        </p>
                      </Link>
                    )}

                    <Link
                      href="/video/inside-first-solar-electric-catamarans-vembanad-lake"
                      onClick={() => setIsNotifOpen(false)}
                      className="p-3.5 block hover:bg-[#1B2432] transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-[#075DEB] text-white">
                          NEW GROUND REPORT
                        </span>
                        <span className="text-[10px] text-[#707B8B]">2 hours ago</span>
                      </div>
                      <p className="text-xs text-[#F5F7FA] font-medium line-clamp-2">
                        Inside the First Solar-Powered Electric Catamarans of Vembanad Lake
                      </p>
                    </Link>

                    <Link
                      href="/shows/the-daily-brief"
                      onClick={() => setIsNotifOpen(false)}
                      className="p-3.5 block hover:bg-[#1B2432] transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-zinc-700 text-white">
                          PRIME TIME
                        </span>
                        <span className="text-[10px] text-[#707B8B]">Tonight 9:00 PM</span>
                      </div>
                      <p className="text-xs text-[#F5F7FA] font-medium line-clamp-2">
                        The Daily Brief: Supreme Court Constitution Bench reviews digital telemetry rights.
                      </p>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile / Sign In Menu - Compact on Mobile to Prevent Overflow */}
            <div className="relative" ref={profileRef}>
              {user ? (
                <div>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center gap-1.5 p-1 sm:pl-2.5 rounded-full text-xs font-semibold transition-all shadow-xs hover:shadow-sm ${
                      isDark
                        ? 'bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] text-white'
                        : 'bg-[#F3F5F7] hover:bg-zinc-200 border border-[#E5E7EB] text-[#171A21]'
                    }`}
                    title={`Logged in as ${user.name}`}
                  >
                    {/* User Name: hidden on mobile, visible on desktop */}
                    <span className={`hidden sm:inline max-w-[100px] truncate text-xs font-semibold ${
                      isDark ? 'text-white' : 'text-[#171A21]'
                    }`}>
                      {user.name}
                    </span>
                    {/* Circular Initial Avatar */}
                    <div className="w-7 h-7 rounded-full text-white bg-[#075DEB] flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#0E131C] border border-[#252D39] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                      <div className="px-4 py-2 border-b border-[#252D39]">
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-[#707B8B] truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[#075DEB]/20 text-[#075DEB] border border-[#075DEB]/30 rounded">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center justify-between px-4 py-2 text-xs text-[#F5F7FA] hover:bg-[#1B2432]"
                        >
                          <span>Editorial CMS Panel</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#707B8B]" />
                        </Link>
                        <Link
                          href="/admin/articles/create"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center px-4 py-2 text-xs text-[#F5F7FA] hover:bg-[#1B2432]"
                        >
                          New Article
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-[#252D39]">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-[#1B2432] text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/admin/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E50914] hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-[#E50914]/20 shrink-0"
                  title="Newsroom Staff Sign In"
                >
                  <UserIcon className="w-3.5 h-3.5 text-white" />
                  <span className="font-bold text-white tracking-wide">Sign In</span>
                </Link>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* FULL-SCREEN IMMERSIVE MOBILE SEARCH MODAL */}
      {isMobileSearchOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#080B11]/98 backdrop-blur-2xl flex flex-col md:hidden animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Search"
        >
          {/* Top Search Input Row */}
          <div className="p-3 bg-[#0A0E15] border-b border-[#252D39] flex items-center gap-2 shrink-0">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, reports and stories..."
                className="w-full pl-9 pr-8 py-2.5 bg-[#121925] border border-[#252D39] rounded-xl text-xs text-[#F5F7FA] placeholder-[#707B8B] focus:outline-none focus:border-[#075DEB]"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-[#707B8B]" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    mobileSearchInputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-2.5 p-0.5 text-[#707B8B] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="px-2.5 py-2 text-xs font-semibold text-[#A4ADBB] hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Scrollable Results & Suggestions Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* When Query is Empty: Show Trending Searches & Quick Desks */}
            {searchQuery.trim().length < 2 && (
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#707B8B] mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#075DEB]" />
                    <span>Popular Searches</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleTopicClick(topic)}
                        className="px-3 py-1.5 text-xs bg-[#121925] hover:bg-[#1B2432] text-[#F5F7FA] border border-[#252D39] rounded-lg transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#707B8B] mb-2.5">
                    Jump to Editorial Desk
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {DESK_LINKS.map((desk) => (
                      <Link
                        key={desk.href}
                        href={desk.href}
                        onClick={() => setIsMobileSearchOpen(false)}
                        className="p-2.5 rounded-lg bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] text-[#F5F7FA] font-medium flex items-center justify-between"
                      >
                        <span>{desk.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#707B8B]" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isSearching && (
              <div className="py-8 flex items-center justify-center gap-2 text-xs text-[#A4ADBB]">
                <Loader2 className="w-4 h-4 animate-spin text-[#075DEB]" />
                <span>Searching archives...</span>
              </div>
            )}

            {/* Live Autocomplete Results on Mobile */}
            {!isSearching && searchQuery.trim().length >= 2 && (
              <div className="space-y-4">
                {/* Videos */}
                {searchResults.videos.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#E50914] mb-2 flex items-center gap-1.5">
                      <PlaySquare className="w-3.5 h-3.5" />
                      <span>Featured Dispatches ({searchResults.videos.length})</span>
                    </p>
                    <div className="space-y-2">
                      {searchResults.videos.map((vid) => (
                        <Link
                          key={vid.id}
                          href={`/video/${vid.slug}`}
                          onClick={() => setIsMobileSearchOpen(false)}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] transition-colors"
                        >
                          <div className="relative w-16 h-10 rounded-lg bg-black shrink-0 overflow-hidden border border-[#252D39]">
                            <img
                              src={vid.thumbnail}
                              alt={vid.title}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[8px] font-mono px-0.5 text-zinc-300 rounded">
                              {vid.duration}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#F5F7FA] line-clamp-1">
                              {vid.title}
                            </p>
                            <span className="text-[10px] text-[#707B8B] uppercase font-bold">
                              {vid.category}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Articles */}
                {searchResults.articles.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#075DEB] mb-2 flex items-center gap-1.5">
                      <Newspaper className="w-3.5 h-3.5" />
                      <span>Written Journalism ({searchResults.articles.length})</span>
                    </p>
                    <div className="space-y-2">
                      {searchResults.articles.map((art) => (
                        <Link
                          key={art.id}
                          href={`/article/${art.slug}`}
                          onClick={() => setIsMobileSearchOpen(false)}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] transition-colors"
                        >
                          <div className="relative w-16 h-10 rounded-lg bg-black shrink-0 overflow-hidden border border-[#252D39]">
                            <img
                              src={art.image}
                              alt={art.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#F5F7FA] line-clamp-1">
                              {art.title}
                            </p>
                            <span className="text-[10px] text-[#707B8B]">
                              {art.category} • {art.reporter}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Matches */}
                {searchResults.videos.length === 0 && searchResults.articles.length === 0 && (
                  <div className="py-8 text-center text-xs text-[#707B8B]">
                    No direct matches for &ldquo;{searchQuery}&rdquo;.
                  </div>
                )}

                {/* Full Search Button */}
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full py-2.5 px-4 bg-[#075DEB] hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-between transition-colors shadow-md"
                >
                  <span>Explore full archives for &ldquo;{searchQuery}&rdquo;</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-out Navigation Drawer */}
      <NewsightNavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        categories={categories}
        shows={shows}
        user={user}
      />
    </>
  );
}
