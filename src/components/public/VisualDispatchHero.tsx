'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, Maximize2, X, ChevronRight, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface VisualDispatchArticle {
  id: string;
  title: string;
  slug: string;
  deck?: string;
  summary?: string;
  featured_image: string;
  category_name?: string;
  category?: string;
  reading_time_minutes?: number;
  duration?: string;
  published_at?: string;
  created_at?: string;
  reporter_name?: string;
  views_count?: number;
}

interface VisualDispatchHeroProps {
  article: VisualDispatchArticle;
}

function formatReadingTime(mins?: number, duration?: string) {
  if (mins) return `${mins} min read`;
  if (duration) {
    if (duration.includes(':')) {
      const parsed = parseInt(duration.split(':')[0], 10);
      return `${Math.max(parsed || 5, 3)} min read`;
    }
    return duration;
  }
  return '6 min read';
}

export default function VisualDispatchHero({ article }: VisualDispatchHeroProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  if (!article) return null;

  const categoryLabel = article.category_name || article.category || 'Ground Report';
  const readingTime = formatReadingTime(article.reading_time_minutes, article.duration);
  const publishedDate = formatDate(article.published_at || article.created_at);
  const deck = article.deck || article.summary || '';

  // Handle keyboard Escape for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen]);

  return (
    <div className="flex flex-col gap-3">
      {/* High-Impact Visual Photo Dispatch Frame */}
      <div 
        className="relative w-full aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden border border-[#252D39] shadow-2xl group cursor-pointer"
        onClick={() => {
          if (article.featured_image) setIsLightboxOpen(true);
        }}
      >
        {article.featured_image ? (
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#121925] to-[#1A2536] text-[#707B8B] p-6 text-center">
            <Camera className="w-12 h-12 text-[#252D39] mb-2" />
            <span className="text-xs uppercase font-mono tracking-widest text-[#707B8B]">Newsight Visual Dispatch</span>
          </div>
        )}

        {/* Top-Left Category / Field Photography Badge */}
        <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-md border border-white/10 flex items-center gap-1.5 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg">
          <Camera className="w-3.5 h-3.5 text-[#E50914]" />
          <span>NEWSROOM VISUAL DISPATCH</span>
        </div>

        {/* Bottom-Right Enlarge Trigger */}
        {article.featured_image && (
          <div 
            className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/85 backdrop-blur-md text-white border border-white/10 group-hover:bg-[#E50914] transition-colors shadow-lg flex items-center gap-1.5 text-xs font-semibold"
            title="Click to enlarge photograph"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] uppercase tracking-wider">Enlarge Photo</span>
          </div>
        )}

        {/* Bottom Title Gradient Strip */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 sm:p-5 pt-8 text-white pointer-events-none">
          <p className="text-xs sm:text-base font-bold line-clamp-1 drop-shadow-md pr-28 text-white">
            {article.title}
          </p>
        </div>
      </div>

      {/* Headline & Metadata Editorial Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#121925] border border-[#252D39] flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#707B8B]">
          <span className="px-2 py-0.5 bg-[#E50914] text-white font-bold text-[10px] uppercase rounded">
            {categoryLabel}
          </span>
          <span>•</span>
          <span className="font-mono text-white font-medium">{readingTime}</span>
          <span>•</span>
          <span>Published {publishedDate}</span>
          {article.reporter_name && (
            <>
              <span>•</span>
              <span className="text-[#A4ADBB] font-medium">Reported by {article.reporter_name}</span>
            </>
          )}
        </div>

        <Link href={`/article/${article.slug}`}>
          <h1 className="text-lg sm:text-2xl font-bold text-[#F5F7FA] hover:text-[#075DEB] transition-colors leading-snug">
            {article.title}
          </h1>
        </Link>

        {deck && (
          <p className="text-xs sm:text-sm text-[#A4ADBB] leading-relaxed line-clamp-3">
            {deck}
          </p>
        )}

        <div className="pt-2 flex items-center justify-between border-t border-[#252D39]/50 text-xs">
          <Link 
            href={`/article/${article.slug}`} 
            className="font-bold text-[#075DEB] hover:text-blue-400 flex items-center gap-1 uppercase tracking-wider text-[11px]"
          >
            Read Full Story & Analysis <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          {article.views_count ? (
            <span className="text-[11px] text-[#707B8B] flex items-center gap-1 font-mono">
              <Eye className="w-3.5 h-3.5" />
              {article.views_count.toLocaleString()} reads
            </span>
          ) : null}
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 text-white select-none animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 z-20" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate max-w-lg">
                {article.title}
              </span>
            </div>

            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-[#E50914] text-white transition-colors cursor-pointer"
              aria-label="Close photo viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Central Image View */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img
              src={article.featured_image}
              alt={article.title}
              className="max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Bottom Caption */}
          <div className="pt-3 border-t border-white/10 text-center max-w-4xl mx-auto z-20" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs sm:text-sm text-[#A4ADBB] font-sans">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-xs">ESC</kbd> or click anywhere to exit viewer
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
