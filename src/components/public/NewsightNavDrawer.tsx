'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  X, Search, Home, PlaySquare, LayoutGrid, Film, Award, TrendingUp,
  FileText, ShieldCheck, Mail, ExternalLink, ChevronRight, User
} from 'lucide-react';
import NewsightLogo from './NewsightLogo';
import ThemeToggle from './ThemeToggle';
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
      }, 320);
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

  interface PrimaryNavItem {
    label: string;
    href: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
  }

  const primaryNav: PrimaryNavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Top Stories', href: '/top-videos', icon: TrendingUp },
    { label: 'All Shows', href: '/shows', icon: Film },
    { label: 'NEWSIGHT Classics', href: '/classics', icon: Award },
    { label: 'Categories Directory', href: '/categories', icon: LayoutGrid },
    { label: 'Newsroom Reporters', href: '/reporters', icon: User },
  ];

  return (
    <div 
      className={`fixed inset-0 z-50 flex ${
        isAnimating ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Dark Backdrop with smooth fade transition */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel with smooth spring transform */}
      <aside 
        className={`relative ml-0 mr-auto w-full max-w-xl md:max-w-2xl bg-[#080B11] border-r border-[#252D39] text-[#F5F7FA] h-full overflow-y-auto flex flex-col z-10 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
          isAnimating ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Site Navigation"
      >
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#0A0E15] border-b border-[#252D39]">
          <NewsightLogo size="md" />
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onClose}
              className="p-2 text-[#A4ADBB] hover:text-white hover:bg-[#1B2432] rounded-md transition-colors"
              aria-label="Close navigation drawer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search Bar inside Drawer */}
        <div className="p-6 border-b border-[#252D39] bg-[#0E131C]">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, reports and stories..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#121925] border border-[#252D39] rounded-lg text-sm text-[#F5F7FA] placeholder-[#707B8B] focus:outline-none focus:border-[#075DEB] transition-colors"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-[#707B8B]" />
          </form>
        </div>

        {/* Content sections */}
        <div className="p-6 space-y-8 flex-1">
          {/* 1. Primary Story & Editorial Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#707B8B] mb-3">
              Editorial & Stories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {primaryNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#121925] hover:bg-[#1B2432] border border-[#252D39]/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[#A4ADBB] group-hover:text-white" />
                      <span className="text-sm font-medium text-[#F5F7FA]">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold text-white uppercase rounded ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 2. Top Shows */}
          {shows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#707B8B]">
                  Featured Series & Columns
                </h3>
                <Link 
                  href="/shows" 
                  onClick={onClose}
                  className="text-xs font-semibold text-[#075DEB] hover:underline flex items-center gap-1"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {shows.map((show) => (
                  <Link
                    key={show.slug}
                    href={`/shows/${show.slug}`}
                    onClick={onClose}
                    className="p-2.5 rounded-lg bg-[#121925] hover:bg-[#1B2432] border border-[#252D39]/40 text-xs font-medium text-[#F5F7FA] transition-colors truncate"
                  >
                    {show.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 3. News Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#707B8B]">
                News Desks & Categories
              </h3>
              <Link 
                href="/categories" 
                onClick={onClose}
                className="text-xs font-semibold text-[#075DEB] hover:underline flex items-center gap-1"
              >
                Browse All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={onClose}
                  className="px-3 py-2.5 rounded-lg bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] text-xs font-semibold text-[#F5F7FA] hover:text-[#075DEB] transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{cat.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#707B8B] group-hover:text-[#075DEB] opacity-60 group-hover:opacity-100 transition-all shrink-0 ml-1" />
                </Link>
              ))}
            </div>
          </div>

          {/* 4. Editorial Policies & Governance */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#707B8B] mb-3">
              Standards & Editorial Transparency
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link href="/about" onClick={onClose} className="text-[#A4ADBB] hover:text-white hover:underline py-1">
                About NEWSIGHT
              </Link>
              <Link href="/editorial-policy" onClick={onClose} className="text-[#A4ADBB] hover:text-white hover:underline py-1">
                Editorial Policy
              </Link>
              <Link href="/corrections-policy" onClick={onClose} className="text-[#A4ADBB] hover:text-white hover:underline py-1">
                Corrections Policy
              </Link>
              <Link href="/fact-checking" onClick={onClose} className="text-[#A4ADBB] hover:text-white hover:underline py-1">
                Fact-Checking Standards
              </Link>
              <Link href="/conflict-of-interest" onClick={onClose} className="text-[#A4ADBB] hover:text-white hover:underline py-1">
                Conflict of Interest
              </Link>
              <Link href="/contact" onClick={onClose} className="text-[#A4ADBB] hover:text-white hover:underline py-1">
                Contact Bureau
              </Link>
              <Link href="/privacy" onClick={onClose} className="text-[#A4ADBB] hover:text-white hover:underline py-1">
                Privacy Policy
              </Link>
              <Link href="/terms" onClick={onClose} className="text-[#A4ADBB] hover:text-white hover:underline py-1">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Social Follow */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#707B8B] mb-2.5">
              Connect & Follow
            </h3>
            <div className="flex items-center gap-2.5">
              <a
                href="https://www.instagram.com/oxyfied._?obrf=ZW1tOXpiZHhsdncw&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] flex items-center justify-center text-[#A4ADBB] hover:text-pink-500 transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/oxyfied/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] flex items-center justify-center text-[#A4ADBB] hover:text-[#0077b5] transition-colors"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/oxyfiedorg?s=11"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="w-9 h-9 rounded-lg bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] flex items-center justify-center text-[#A4ADBB] hover:text-white transition-colors"
              >
                <XTwitterIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/share/1LLfbwJwE3/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] flex items-center justify-center text-[#A4ADBB] hover:text-blue-500 transition-colors"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Theme Mode Toggle for Mobile Visitors */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#707B8B] mb-2">
              Appearance & Theme
            </h3>
            <ThemeToggle variant="drawer" />
          </div>

          {/* Admin / Account Quick Access */}
          <div className="pt-4 border-t border-[#252D39] flex items-center justify-between">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1B2432] border border-[#252D39] flex items-center justify-center text-xs font-bold text-white">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{user.name}</div>
                  <div className="text-[10px] text-[#707B8B]">{user.role}</div>
                </div>
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="ml-4 px-3 py-1 bg-[#075DEB] hover:bg-blue-600 text-white text-xs font-semibold rounded"
                >
                  Admin CMS
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full gap-3">
                <span className="text-xs text-[#A4ADBB]">Newsroom Staff & Editorial Portal</span>
                <Link
                  href="/admin/login"
                  onClick={onClose}
                  className="px-4 py-1.5 bg-[#E50914] hover:bg-red-700 text-xs font-bold text-white uppercase tracking-wider rounded-lg shadow-sm transition-colors shrink-0 flex items-center gap-1.5"
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
