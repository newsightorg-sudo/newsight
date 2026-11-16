'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, ChevronRight, ArrowUpRight, Sparkles, Newspaper } from 'lucide-react';
import VisualDispatchHero from './VisualDispatchHero';
import { formatDate } from '@/lib/utils';
import { Article } from '@/lib/types';

interface LiveHeroSectionProps {
  initialFeaturedArticle: Article | null;
  initialSideRailArticles: Article[];
  initialTotal: number;
}

export default function LiveHeroSection({
  initialFeaturedArticle,
  initialSideRailArticles = [],
  initialTotal = 0,
}: LiveHeroSectionProps) {
  const router = useRouter();

  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(initialFeaturedArticle);
  const [sideRailArticles, setSideRailArticles] = useState<Article[]>(initialSideRailArticles);
  const [total, setTotal] = useState(initialTotal);
  const [liveAlert, setLiveAlert] = useState<{ title: string; id: string } | null>(null);

  // Keep track of the current latest article ID to detect newly published articles
  const currentFeaturedIdRef = useRef<string | null>(initialFeaturedArticle?.id || null);
  const currentTotalRef = useRef<number>(initialTotal);

  useEffect(() => {
    let isMounted = true;

    async function checkForUpdates() {
      try {
        const res = await fetch('/api/articles/latest', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });

        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        const newFeatured = data.featuredArticle as Article | null;
        const newTotal = Number(data.total || 0);

        // Detect if a new article was uploaded/published
        const hasNewArticle =
          newFeatured &&
          newFeatured.id !== currentFeaturedIdRef.current;

        const totalChanged = newTotal !== currentTotalRef.current;

        if (hasNewArticle || (totalChanged && newFeatured)) {
          // Update ref
          currentFeaturedIdRef.current = newFeatured ? newFeatured.id : null;
          currentTotalRef.current = newTotal;

          // Smoothly update client state
          setFeaturedArticle(newFeatured);
          setSideRailArticles(data.sideRailArticles || []);
          setTotal(newTotal);

          // Flash live alert banner
          if (newFeatured) {
            setLiveAlert({ title: newFeatured.title, id: newFeatured.id });
            setTimeout(() => {
              if (isMounted) setLiveAlert(null);
            }, 6000);
          }

          // Trigger Next.js router refresh for the rest of the page
          router.refresh();
        } else if (newTotal === 0 && currentTotalRef.current > 0) {
          // All data wiped
          currentFeaturedIdRef.current = null;
          currentTotalRef.current = 0;
          setFeaturedArticle(null);
          setSideRailArticles([]);
          setTotal(0);
          router.refresh();
        }
      } catch (_) {
        // Silently catch background poll error
      }
    }

    // Poll every 3.5 seconds
    const interval = setInterval(checkForUpdates, 3500);

    // Also check immediately when user switches tabs or window gains focus
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', checkForUpdates);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', checkForUpdates);
    };
  }, [router]);

  // If database is clean with 0 articles
  if (!featuredArticle || total === 0) {
    return (
      <div className="py-24 px-4 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#121925] border border-[#252D39] text-[#079FE3] flex items-center justify-center mx-auto shadow-md">
          <Newspaper className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white">No Articles Published Yet</h2>
        <p className="text-xs text-[#A4ADBB] leading-relaxed">
          The database is currently clean with zero articles. When new reports and articles are published from the Editorial CMS, they will appear here automatically without refreshing.
        </p>
        <div className="pt-2">
          <Link
            href="/admin/articles/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#079FE3] hover:bg-[#1261A6] text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            <span>Write First Dispatch</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Live Flash Alert when new article comes live */}
      {liveAlert && (
        <div className="p-3 rounded-xl bg-red-600/15 border border-red-500/40 text-white flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-ping shrink-0" />
            <span className="px-1.5 py-0.5 rounded bg-[#E50914] text-[9.5px] font-black uppercase text-white shrink-0">
              LIVE DISPATCH
            </span>
            <span className="text-xs font-bold truncate">
              {liveAlert.title}
            </span>
          </div>
          <Link
            href={`/article/${featuredArticle.slug}`}
            className="text-xs font-bold text-[#079FE3] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Read Story</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Hero & Dispatches Grid */}
      <section aria-labelledby="featured-story-heading">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Main Featured Lead Story */}
          <div className={`${sideRailArticles.length > 0 ? 'xl:col-span-8' : 'xl:col-span-12'} flex flex-col gap-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-pulse" />
                <h2
                  id="featured-story-heading"
                  className="text-xs font-black uppercase tracking-widest text-[#E50914]"
                >
                  FEATURED STORY
                </h2>
              </div>
              {featuredArticle.category_name && (
                <span className="text-[11px] font-bold text-[#A4ADBB] uppercase tracking-wider bg-[#121925] px-2 py-0.5 rounded border border-[#252D39]">
                  {featuredArticle.category_name}
                </span>
              )}
            </div>

            <div className="animate-in fade-in duration-300">
              <VisualDispatchHero article={featuredArticle} />
            </div>
          </div>

          {/* Beside Featured on XL: Latest Dispatches Rail */}
          {sideRailArticles.length > 0 && (
            <div className="xl:col-span-4 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#075DEB]" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#F5F7FA]">
                    LATEST DISPATCHES
                  </h3>
                </div>
                <Link
                  href="/category/top-stories"
                  className="text-[11px] font-bold text-[#075DEB] hover:underline flex items-center gap-0.5 uppercase tracking-wider"
                >
                  All Stories <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="flex flex-col gap-3 animate-in fade-in duration-300">
                {sideRailArticles.map((art) => (
                  <Link
                    key={art.id}
                    href={`/article/${art.slug}`}
                    className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] transition-all group"
                  >
                    <div className="relative w-36 sm:w-44 aspect-video shrink-0 bg-black rounded-lg overflow-hidden border border-[#252D39]/50">
                      {art.featured_image ? (
                        <img
                          src={art.featured_image}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#151D2A] text-[#707B8B]">
                          <Newspaper className="w-6 h-6 text-[#252D39]" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg">
                          <ArrowUpRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/85 text-[10px] font-mono font-bold text-white rounded">
                        {art.reading_time_minutes || 5} MIN READ
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        {art.category_name && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E50914] mb-1 inline-block">
                            {art.category_name}
                          </span>
                        )}
                        <h4 className="text-xs sm:text-sm font-bold text-[#F5F7FA] group-hover:text-white line-clamp-2 leading-snug">
                          {art.title}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#707B8B] pt-1">
                        <span>{formatDate(art.published_at || art.created_at)}</span>
                        {art.reporter_name && (
                          <span className="truncate max-w-[90px]">{art.reporter_name}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
