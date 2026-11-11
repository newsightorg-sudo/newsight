'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Menu, Search, Bell, User as UserIcon, LogOut, 
  ExternalLink, X, PlaySquare, Newspaper, ArrowRight, 
  Loader2, Sparkles, ChevronRight, Radio, Flame, ShieldCheck
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
  reporter?: string;
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
  'Space Telemetry',
  'Kerala Maritime'
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

  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (!user) {
      fetch('/api/auth/me')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.user) setCurrentUser(data.user);
        })
        .catch(() => {});
    } else {
      setCurrentUser(user);
    }
  }, [user]);

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

  // Genuine unread notification state
  const [hasUnreadAlert, setHasUnreadAlert] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Check for unread alerts
  useEffect(() => {
    if (breakingNews?.title) {
      const lastRead = sessionStorage.getItem('newsight_read_alert');
      if (lastRead !== breakingNews.title) {
        setHasUnreadAlert(true);
      }
    }
  }, [breakingNews]);

  // Handle mobile search focus
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

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K
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
        //
      } finally {
        setIsSearching(false);
      }
    }, 200);

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
      router.push('/');
      router.refresh();
    } catch (_) {}
  };

  // Curate Primary Desk Navigation Links
  const curatedDesks = categories.length > 0
    ? categories.slice(0, 9)
    : [
        { id: '1', name: 'Top Stories', slug: 'top-stories' },
        { id: '2', name: 'Politics', slug: 'politics' },
        { id: '3', name: 'Technology', slug: 'technology' },
        { id: '4', name: 'Business', slug: 'business' },
        { id: '5', name: 'World', slug: 'world' },
        { id: '6', name: 'Kerala', slug: 'kerala' },
        { id: '7', name: 'Opinion', slug: 'opinion' },
      ];

  return (
    <>
      {/* Navigation Drawer */}
      <NewsightNavDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        categories={categories}
        shows={shows}
        user={currentUser}
      />

      {/* Permanent Sticky 2-Tier Header - Stays pinned when scrolling */}
      <header className={`sticky top-0 z-40 w-full select-none ${
        isDark 
          ? 'bg-[#080B11]/95 border-b border-[#252D39] text-[#F5F7FA]' 
          : 'bg-white/95 border-b border-[#E2EAF2] text-[#174A7E]'
      } backdrop-blur-md shadow-xs`}>
        
        {/* Tier 1: Main Top Bar */}
        <div className="max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* 1. LEFT: Drawer toggle & NEWSIGHT Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer ${
                isDark 
                  ? 'text-[#A4ADBB] hover:text-white hover:bg-[#1B2432]' 
                  : 'text-[#294767] hover:text-[#079FE3] hover:bg-[#F0F7FD]'
              }`}
              aria-label="Open navigation drawer"
              title="Full Navigation Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <NewsightLogo size="md" />
          </div>

          {/* 2. CENTER: Omnibox Search Bar with Instant Autocomplete */}
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
                placeholder="Search articles, investigative reports, dispatches..."
                className={`w-full pl-10 pr-20 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm transition-all focus:outline-none shadow-2xs ${
                  isDark
                    ? 'bg-[#121925] border border-[#252D39] text-[#F5F7FA] placeholder-[#707B8B] focus:border-[#079FE3] focus:ring-1 focus:ring-[#079FE3]'
                    : 'bg-[#F0F7FD] border border-[#DCE7F2] text-[#174A7E] placeholder-[#71869C] focus:bg-white focus:border-[#079FE3] focus:ring-2 focus:ring-[#079FE3]/20'
                }`}
              />
              <Search className={`absolute left-3.5 top-3 w-4 h-4 ${isDark ? 'text-[#707B8B]' : 'text-[#356DA8]'}`} />

              {/* Action buttons inside search bar: Clear & Keyboard Shortcut */}
              <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className={`p-0.5 rounded ${isDark ? 'text-[#707B8B] hover:text-white' : 'text-[#71869C] hover:text-[#174A7E]'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className={`hidden lg:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${
                    isDark
                      ? 'text-[#707B8B] bg-[#1B2432] border border-[#252D39]'
                      : 'text-[#71869C] bg-white border border-[#DCE7F2]'
                  }`}>
                    ⌘K
                  </kbd>
                )}
              </div>
            </form>

            {/* Instant Desktop Search Autocomplete Dropdown */}
            {isSearchFocused && (
              <div className={`absolute left-0 right-0 mt-2 rounded-xl shadow-2xl border overflow-hidden z-50 animate-in fade-in duration-150 ${
                isDark 
                  ? 'bg-[#0E131C] border-[#252D39] text-[#F5F7FA]' 
                  : 'bg-white border-[#DCE7F2] text-[#174A7E]'
              }`}>
                {/* Empty State: Trending Searches */}
                {searchQuery.trim().length < 2 && (
                  <div className="p-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#71869C] dark:text-[#707B8B] mb-2 px-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#079FE3]" />
                      <span>Trending Topics in the Newsroom</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {TRENDING_TOPICS.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => handleTopicClick(topic)}
                          className={`px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                            isDark
                              ? 'bg-[#121925] hover:bg-[#1B2432] text-[#A4ADBB] hover:text-white border-[#252D39]'
                              : 'bg-[#F0F7FD] hover:bg-[#E5F2FC] text-[#294767] hover:text-[#087FC1] border-[#DCE7F2]'
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isSearching && (
                  <div className="p-4 flex items-center justify-center gap-2 text-xs text-[#71869C]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#079FE3]" />
                    <span>Searching editorial archives...</span>
                  </div>
                )}

                {/* Results State */}
                {!isSearching && searchQuery.trim().length >= 2 && (
                  <div className={`max-h-96 overflow-y-auto divide-y ${
                    isDark ? 'divide-[#252D39]/60' : 'divide-[#E5EDF5]'
                  }`}>
                    {/* Articles */}
                    {searchResults.articles.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#079FE3] flex items-center gap-1.5">
                          <Newspaper className="w-3 h-3" />
                          <span>Written Bylines ({searchResults.articles.length})</span>
                        </div>
                        {searchResults.articles.map((art) => (
                          <Link
                            key={art.id}
                            href={`/article/${art.slug}`}
                            onClick={() => setIsSearchFocused(false)}
                            className={`flex items-center gap-3 p-2 rounded-lg transition-colors group ${
                              isDark ? 'hover:bg-[#1B2432]' : 'hover:bg-[#F0F7FD]'
                            }`}
                          >
                            {art.image && (
                              <div className="relative w-12 h-9 rounded bg-black shrink-0 overflow-hidden border border-zinc-700/30">
                                <img
                                  src={art.image}
                                  alt={art.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold truncate group-hover:text-[#079FE3] ${
                                isDark ? 'text-[#F5F7FA]' : 'text-[#174A7E]'
                              }`}>
                                {art.title}
                              </p>
                              <span className="text-[10px] text-[#71869C]">
                                {art.category}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Videos */}
                    {searchResults.videos.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D71920] flex items-center gap-1.5">
                          <PlaySquare className="w-3 h-3" />
                          <span>Video Reports ({searchResults.videos.length})</span>
                        </div>
                        {searchResults.videos.map((vid) => (
                          <Link
                            key={vid.id}
                            href={`/video/${vid.slug}`}
                            onClick={() => setIsSearchFocused(false)}
                            className={`flex items-center gap-3 p-2 rounded-lg transition-colors group ${
                              isDark ? 'hover:bg-[#1B2432]' : 'hover:bg-[#F0F7FD]'
                            }`}
                          >
                            <div className="relative w-12 h-8 rounded bg-black shrink-0 overflow-hidden">
                              <img
                                src={vid.thumbnail}
                                alt={vid.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold truncate group-hover:text-[#079FE3] ${
                                isDark ? 'text-[#F5F7FA]' : 'text-[#174A7E]'
                              }`}>
                                {vid.title}
                              </p>
                              <span className="text-[10px] text-[#71869C] uppercase font-bold">
                                {vid.category} • {vid.duration}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Empty Match */}
                    {searchResults.videos.length === 0 && searchResults.articles.length === 0 && (
                      <div className="p-4 text-center text-xs text-[#71869C]">
                        No direct matches found. Press Enter to view complete results.
                      </div>
                    )}

                    {/* Search Footer */}
                    <div className={`p-2 ${isDark ? 'bg-[#0A0E15]' : 'bg-[#F0F7FD]'}`}>
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="w-full py-1.5 px-3 flex items-center justify-between text-xs font-bold text-[#079FE3] hover:underline"
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

          {/* 3. RIGHT: Search (Mobile), Live Badge, Theme Toggle, Alerts, Account */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              className={`p-2 rounded-xl md:hidden transition-colors ${
                isDark
                  ? 'text-[#A4ADBB] hover:text-white hover:bg-[#1B2432]'
                  : 'text-[#294767] hover:text-[#079FE3] hover:bg-[#F0F7FD]'
              }`}
              aria-label="Open Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Quick Live Link */}
            <Link
              href="/live"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-red-500/10 text-[#D71920] border border-red-500/20 hover:bg-red-500/20 transition animate-pulse"
              title="Watch Live Coverage & Blogs"
            >
              <span className="w-2 h-2 rounded-full bg-[#D71920]" />
              <span>Live Desk</span>
            </Link>

            {/* Theme Toggle Button */}
            <ThemeToggle className={
              isDark
                ? 'text-[#A4ADBB] hover:text-white hover:bg-[#1B2432]'
                : 'text-[#294767] hover:text-[#079FE3] hover:bg-[#F0F7FD]'
            } />

            {/* Editorial Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={handleNotificationClick}
                className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
                  isDark
                    ? 'text-[#A4ADBB] hover:text-white hover:bg-[#1B2432]'
                    : 'text-[#294767] hover:text-[#079FE3] hover:bg-[#F0F7FD]'
                }`}
                aria-label="Editorial Notifications"
                title="Desk Dispatches & Breaking Alerts"
              >
                <Bell className="w-5 h-5" />
                {hasUnreadAlert && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D71920] rounded-full ring-2 ring-white dark:ring-[#080B11]" />
                )}
              </button>

              {isNotifOpen && (
                <div className={`absolute right-0 mt-2 w-72 sm:w-96 rounded-2xl shadow-2xl py-2 z-50 border animate-in fade-in duration-150 ${
                  isDark ? 'bg-[#0E131C] border-[#252D39]' : 'bg-white border-[#DCE7F2]'
                }`}>
                  <div className={`px-4 py-2.5 border-b flex items-center justify-between ${
                    isDark ? 'border-[#252D39]' : 'border-[#E5EDF5]'
                  }`}>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#71869C] dark:text-[#A4ADBB]">
                      Editorial Alerts & Tickers
                    </span>
                    <span className="text-[10px] font-mono text-[#079FE3] font-bold">
                      VERIFIED DESK
                    </span>
                  </div>

                  <div className={`max-h-72 overflow-y-auto divide-y ${
                    isDark ? 'divide-[#252D39]/50' : 'divide-[#E5EDF5]'
                  }`}>
                    {breakingNews && (
                      <Link
                        href={breakingNews.url || '/'}
                        onClick={() => setIsNotifOpen(false)}
                        className={`p-3.5 block transition-colors ${
                          isDark ? 'hover:bg-[#1B2432]' : 'hover:bg-[#F0F7FD]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-[#D71920] text-white">
                            BREAKING
                          </span>
                          <span className="text-[10px] text-[#71869C] font-mono">{breakingNews.time || 'Just now'}</span>
                        </div>
                        <p className={`text-xs font-semibold line-clamp-2 ${
                          isDark ? 'text-[#F5F7FA]' : 'text-[#174A7E]'
                        }`}>
                          {breakingNews.title}
                        </p>
                      </Link>
                    )}

                    <Link
                      href="/shows/the-daily-brief"
                      onClick={() => setIsNotifOpen(false)}
                      className={`p-3.5 block transition-colors ${
                        isDark ? 'hover:bg-[#1B2432]' : 'hover:bg-[#F0F7FD]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-[#1261A6] text-white">
                          SPECIAL REPORT
                        </span>
                        <span className="text-[10px] text-[#71869C]">Daily Briefing</span>
                      </div>
                      <p className={`text-xs font-medium line-clamp-2 ${
                        isDark ? 'text-[#F5F7FA]' : 'text-[#294767]'
                      }`}>
                        Supreme Court Constitution Bench reserves verdict on digital intermediary safeguards.
                      </p>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile / Staff Sign In Menu */}
            <div className="relative" ref={profileRef}>
              {currentUser ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                      isDark
                        ? 'bg-[#121925] hover:bg-[#1B2432] border-[#252D39] text-white'
                        : 'bg-[#F0F7FD] hover:bg-[#E5F2FC] border-[#DCE7F2] text-[#174A7E]'
                    }`}
                  >
                    <span className="hidden sm:inline max-w-[100px] truncate text-xs font-bold">
                      {currentUser.name}
                    </span>
                    <div className="w-7 h-7 rounded-full text-white bg-[#1261A6] flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                      {currentUser.name?.charAt(0) || 'A'}
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className={`absolute right-0 mt-2 w-60 rounded-xl shadow-2xl py-2 z-50 border animate-in fade-in duration-150 ${
                      isDark ? 'bg-[#0E131C] border-[#252D39]' : 'bg-white border-[#DCE7F2]'
                    }`}>
                      <div className={`px-4 py-2.5 border-b ${
                        isDark ? 'border-[#252D39]' : 'border-[#E5EDF5]'
                      }`}>
                        <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-[#174A7E]'}`}>
                          {currentUser.name}
                        </p>
                        <p className="text-[10px] text-[#71869C] truncate">{currentUser.email}</p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[#079FE3]/20 text-[#079FE3] border border-[#079FE3]/30 rounded">
                          {currentUser.role}
                        </span>
                      </div>

                      <div className="py-1 text-xs">
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className={`flex items-center justify-between px-4 py-2 font-semibold transition ${
                            isDark ? 'text-[#F5F7FA] hover:bg-[#1B2432]' : 'text-[#174A7E] hover:bg-[#F0F7FD]'
                          }`}
                        >
                          <span>Editorial CMS Panel</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#079FE3]" />
                        </Link>
                        <Link
                          href="/admin/articles/create"
                          onClick={() => setIsProfileOpen(false)}
                          className={`flex items-center px-4 py-2 transition ${
                            isDark ? 'text-[#F5F7FA] hover:bg-[#1B2432]' : 'text-[#294767] hover:bg-[#F0F7FD]'
                          }`}
                        >
                          Write New Article
                        </Link>
                      </div>

                      <div className={`pt-1 border-t ${isDark ? 'border-[#252D39]' : 'border-[#E5EDF5]'}`}>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#D71920] hover:bg-red-50 dark:hover:bg-red-950/30 text-left font-semibold cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D71920] hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow-xs shadow-red-500/20 shrink-0"
                  title="Editorial Staff Portal Access"
                >
                  <UserIcon className="w-3.5 h-3.5 text-white" />
                  <span className="font-bold text-white tracking-wide">Sign In</span>
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* Tier 2: Category & News Desk Navigation Bar */}
        <div className={`border-t overflow-x-auto no-scrollbar py-1 px-3 sm:px-6 flex items-center gap-1 sm:gap-2 text-xs font-semibold select-none ${
          isDark 
            ? 'bg-[#0A0E15]/90 border-[#1F2734]' 
            : 'bg-[#F7FAFE] border-[#E8EEF5]'
        }`}>
          <Link
            href="/"
            prefetch={true}
            className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors ${
              pathname === '/'
                ? 'bg-[#079FE3] text-white font-bold'
                : isDark
                ? 'text-[#A4ADBB] hover:text-white hover:bg-[#121925]'
                : 'text-[#294767] hover:text-[#079FE3] hover:bg-[#E5F2FC]'
            }`}
          >
            Home
          </Link>

          {curatedDesks.map((cat) => {
            const href = `/category/${cat.slug}`;
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={cat.id || cat.slug}
                href={href}
                prefetch={true}
                className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#079FE3] text-white font-bold'
                    : isDark
                    ? 'text-[#A4ADBB] hover:text-white hover:bg-[#121925]'
                    : 'text-[#294767] hover:text-[#079FE3] hover:bg-[#E5F2FC]'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}

          <Link
            href="/shows"
            prefetch={true}
            className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors ${
              pathname.startsWith('/shows')
                ? 'bg-[#079FE3] text-white font-bold'
                : isDark
                ? 'text-[#A4ADBB] hover:text-white hover:bg-[#121925]'
                : 'text-[#294767] hover:text-[#079FE3] hover:bg-[#E5F2FC]'
            }`}
          >
            Shows
          </Link>

          <Link
            href="/photos"
            prefetch={true}
            className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors ${
              pathname.startsWith('/photos')
                ? 'bg-[#079FE3] text-white font-bold'
                : isDark
                ? 'text-[#A4ADBB] hover:text-white hover:bg-[#121925]'
                : 'text-[#294767] hover:text-[#079FE3] hover:bg-[#E5F2FC]'
            }`}
          >
            Photo Stories
          </Link>

          <Link
            href="/reporters"
            prefetch={true}
            className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors ${
              pathname.startsWith('/reporters')
                ? 'bg-[#079FE3] text-white font-bold'
                : isDark
                ? 'text-[#A4ADBB] hover:text-white hover:bg-[#121925]'
                : 'text-[#294767] hover:text-[#079FE3] hover:bg-[#E5F2FC]'
            }`}
          >
            Reporters
          </Link>

          <div className="ml-auto pl-2 shrink-0">
            <Link
              href="/live"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition"
            >
              <Radio className="w-3 h-3 animate-pulse" />
              <span>24x7 Broadcast</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
