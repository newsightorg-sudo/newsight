'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  X, Search, Home, PlaySquare, LayoutGrid, Film, Award, TrendingUp,
  FileText, ShieldCheck, Mail, ExternalLink, ChevronRight, User,
  Radio, Camera, Newspaper, Sparkles
} from 'lucide-react';
import NewsightLogo from './NewsightLogo';
import ThemeToggle from './ThemeToggle';
import { useTheme } from './ThemeProvider';
import { InstagramIcon, LinkedinIcon, XTwitterIcon, FacebookIcon } from './SocialIcons';

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string; name: string; slug: string }[];
  shows: { id: string; title: string; slug: string }[];
  user?: any;
}

export default function NewsightNavDrawer({
  isOpen,
  onClose,
  categories = [],
  shows = [],
  user
}: NavDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, isMounted } = useTheme();
  const isDark = isMounted ? theme === 'dark' : true;

  const [searchQuery, setSearchQuery] = useState('');
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  // Synchronize opening and closing animation states with isOpen
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Clean up body overflow style on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!shouldRender) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  const primaryNav = [
    { label: 'Home Page', href: '/', icon: Home },
    { label: 'Video Reports', href: '/video', icon: PlaySquare },
    { label: 'Original Shows', href: '/shows', icon: Film, badge: 'Programs' },
    { label: 'Live Coverage', href: '/live', icon: Radio, badge: 'Live', badgeColor: 'bg-[#D71920]' },
    { label: 'Photo Stories', href: '/photos', icon: Camera },
    { label: 'Reporters Roster', href: '/reporters', icon: User },
    { label: 'Opinion & Analysis', href: '/opinion', icon: FileText },
    { label: 'All Categories', href: '/categories', icon: LayoutGrid },
  ];

  return (
    <div 
      className={`fixed inset-0 z-50 flex select-none ${
        isAnimating ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <aside 
        className={`relative ml-0 mr-auto w-full max-w-lg md:max-w-xl h-full overflow-y-auto flex flex-col z-10 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform border-r ${
          isAnimating ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDark 
            ? 'bg-[#080B11] border-[#252D39] text-[#F5F7FA]' 
            : 'bg-white border-[#E2EAF2] text-[#174A7E]'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Site Navigation"
      >
        {/* Drawer Header */}
        <div className={`sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'bg-[#0A0E15] border-[#252D39]' : 'bg-[#F7FAFE] border-[#E8EEF5]'
        }`}>
          <NewsightLogo size="md" />
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark 
                  ? 'text-[#A4ADBB] hover:text-white hover:bg-[#1B2432]' 
                  : 'text-[#294767] hover:text-[#079FE3] hover:bg-[#E5F2FC]'
              }`}
              aria-label="Close navigation drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar inside Drawer */}
        <div className={`p-5 border-b ${
          isDark ? 'bg-[#0E131C] border-[#252D39]' : 'bg-white border-[#E2EAF2]'
        }`}>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search newsroom stories, topics, reporters..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors focus:outline-none ${
                isDark 
                  ? 'bg-[#121925] border border-[#252D39] text-[#F5F7FA] placeholder-[#707B8B] focus:border-[#079FE3]' 
                  : 'bg-[#F0F7FD] border border-[#DCE7F2] text-[#174A7E] placeholder-[#71869C] focus:border-[#079FE3]'
              }`}
            />
            <Search className={`absolute left-3.5 top-3 w-4 h-4 ${
              isDark ? 'text-[#707B8B]' : 'text-[#356DA8]'
            }`} />
          </form>
        </div>

        {/* Content sections */}
        <div className="p-6 space-y-7 flex-1 text-xs">
          {/* 1. Primary Editorial Sections */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#71869C] dark:text-[#707B8B] mb-3">
              Editorial Sections & Formats
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {primaryNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={onClose}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors group ${
                      isActive
                        ? 'bg-[#079FE3] text-white border-[#079FE3]'
                        : isDark
                        ? 'bg-[#121925] hover:bg-[#1B2432] border-[#252D39] text-[#F5F7FA]'
                        : 'bg-[#F0F7FD] hover:bg-[#E5F2FC] border-[#DCE7F2] text-[#174A7E]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#079FE3]'}`} />
                      <span className="font-semibold truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded text-white shrink-0 ${
                        item.badgeColor || 'bg-[#1261A6]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 2. News Desks & Categories */}
          {categories.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#71869C] dark:text-[#707B8B]">
                  Editorial Desks & Beats
                </h3>
                <Link 
                  href="/categories" 
                  onClick={onClose}
                  className="text-xs font-bold text-[#079FE3] hover:underline flex items-center gap-1"
                >
                  <span>Browse All</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.slice(0, 12).map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    prefetch={true}
                    onClick={onClose}
                    className={`px-3 py-2 rounded-lg border font-semibold transition-colors flex items-center justify-between group ${
                      isDark
                        ? 'bg-[#121925] hover:bg-[#1B2432] border-[#252D39] text-[#F5F7FA] hover:text-[#079FE3]'
                        : 'bg-[#F0F7FD] hover:bg-[#E5F2FC] border-[#DCE7F2] text-[#174A7E] hover:text-[#079FE3]'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <ChevronRight className="w-3 h-3 opacity-60 group-hover:opacity-100 text-[#079FE3] shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 3. Original Programs & Shows */}
          {shows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#71869C] dark:text-[#707B8B]">
                  Featured Broadcast Programs
                </h3>
                <Link 
                  href="/shows" 
                  onClick={onClose}
                  className="text-xs font-bold text-[#079FE3] hover:underline flex items-center gap-1"
                >
                  <span>All Shows</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {shows.slice(0, 4).map((show) => (
                  <Link
                    key={show.slug}
                    href={`/shows/${show.slug}`}
                    onClick={onClose}
                    className={`p-2.5 rounded-lg border font-semibold transition-colors truncate block ${
                      isDark
                        ? 'bg-[#121925] hover:bg-[#1B2432] border-[#252D39] text-[#F5F7FA]'
                        : 'bg-[#F0F7FD] hover:bg-[#E5F2FC] border-[#DCE7F2] text-[#174A7E]'
                    }`}
                  >
                    {show.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 4. Standards & Editorial Governance */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#71869C] dark:text-[#707B8B] mb-2.5">
              Standards & Transparency
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <Link href="/about" onClick={onClose} className="text-[#71869C] dark:text-[#A4ADBB] hover:text-[#079FE3] hover:underline">
                About NEWSIGHT
              </Link>
              <Link href="/editorial-policy" onClick={onClose} className="text-[#71869C] dark:text-[#A4ADBB] hover:text-[#079FE3] hover:underline">
                Editorial Independence
              </Link>
              <Link href="/corrections-policy" onClick={onClose} className="text-[#71869C] dark:text-[#A4ADBB] hover:text-[#079FE3] hover:underline">
                Corrections Policy
              </Link>
              <Link href="/fact-checking" onClick={onClose} className="text-[#71869C] dark:text-[#A4ADBB] hover:text-[#079FE3] hover:underline">
                Fact-Checking Standards
              </Link>
              <Link href="/contact" onClick={onClose} className="text-[#71869C] dark:text-[#A4ADBB] hover:text-[#079FE3] hover:underline">
                Bureau Contact
              </Link>
              <Link href="/privacy" onClick={onClose} className="text-[#71869C] dark:text-[#A4ADBB] hover:text-[#079FE3] hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* 5. Official Socials */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#71869C] dark:text-[#707B8B] mb-2.5">
              Official Network Socials
            </h3>
            <div className="flex items-center gap-2.5">
              <a
                href="https://www.instagram.com/oxyfied._?obrf=ZW1tOXpiZHhsdncw&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                  isDark
                    ? 'bg-[#121925] hover:bg-[#1B2432] border-[#252D39] text-[#A4ADBB] hover:text-pink-500'
                    : 'bg-[#F0F7FD] hover:bg-[#E5F2FC] border-[#DCE7F2] text-[#294767] hover:text-pink-500'
                }`}
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/oxyfied/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                  isDark
                    ? 'bg-[#121925] hover:bg-[#1B2432] border-[#252D39] text-[#A4ADBB] hover:text-[#0077b5]'
                    : 'bg-[#F0F7FD] hover:bg-[#E5F2FC] border-[#DCE7F2] text-[#294767] hover:text-[#0077b5]'
                }`}
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/oxyfiedorg?s=11"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                  isDark
                    ? 'bg-[#121925] hover:bg-[#1B2432] border-[#252D39] text-[#A4ADBB] hover:text-white'
                    : 'bg-[#F0F7FD] hover:bg-[#E5F2FC] border-[#DCE7F2] text-[#294767] hover:text-[#174A7E]'
                }`}
              >
                <XTwitterIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/share/1LLfbwJwE3/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                  isDark
                    ? 'bg-[#121925] hover:bg-[#1B2432] border-[#252D39] text-[#A4ADBB] hover:text-blue-500'
                    : 'bg-[#F0F7FD] hover:bg-[#E5F2FC] border-[#DCE7F2] text-[#294767] hover:text-blue-600'
                }`}
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 6. Admin / Account Portal Access */}
          <div className={`pt-4 border-t ${
            isDark ? 'border-[#252D39]' : 'border-[#E2EAF2]'
          }`}>
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#1261A6] text-white flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-bold">{user.name}</div>
                    <div className="text-[10px] text-[#71869C]">{user.role}</div>
                  </div>
                </div>
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="px-3.5 py-1.5 bg-[#079FE3] hover:bg-[#1261A6] text-white text-xs font-bold rounded-lg transition shadow-xs"
                >
                  Admin CMS
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-[#174A7E] dark:text-[#F4F7FB] block">
                    Newsroom Staff Access
                  </span>
                  <span className="text-[10px] text-[#71869C]">
                    Accredited reporters and desk editors
                  </span>
                </div>
                <Link
                  href="/admin/login"
                  onClick={onClose}
                  className="px-3.5 py-1.5 bg-[#D71920] hover:bg-red-700 text-xs font-bold text-white uppercase tracking-wider rounded-lg shadow-xs transition flex items-center gap-1.5 shrink-0"
                >
                  <User className="w-3.5 h-3.5 text-white" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
