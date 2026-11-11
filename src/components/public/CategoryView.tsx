'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PlaySquare, Newspaper, ChevronRight } from 'lucide-react';
import VideoCard from '@/components/public/VideoCard';
import { formatDate } from '@/lib/utils';
import { Article, VideoItem, Category } from '@/lib/types';

interface CategoryViewProps {
  category: Category;
  articles: Article[];
  videos: VideoItem[];
}

export default function CategoryView({ category, articles, videos }: CategoryViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'articles'>('all');

  const showVideos = activeTab === 'all' || activeTab === 'videos';
  const showArticles = activeTab === 'all' || activeTab === 'articles';

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Masthead */}
      <div className="p-6 rounded-2xl bg-[#0E131C] border border-[#252D39] space-y-3">
        <div className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: category.color || '#E50914' }} 
          />
          <span className="text-xs font-black uppercase tracking-widest text-[#707B8B]">
            EDITORIAL DESK
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {category.name}
        </h1>

        <p className="text-xs sm:text-sm text-[#A4ADBB] max-w-2xl leading-relaxed">
          {category.description || `Comprehensive continuous journalism, video investigations, and dispatches in ${category.name}.`}
        </p>

        {/* Instant Client-Side Filter Tabs */}
        <div className="pt-2 flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'all' 
                ? 'bg-[#075DEB] text-white shadow-xs' 
                : 'bg-[#121925] text-[#A4ADBB] hover:text-white border border-[#252D39]'
            }`}
          >
            All Coverage ({videos.length + articles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'videos' 
                ? 'bg-[#075DEB] text-white shadow-xs' 
                : 'bg-[#121925] text-[#A4ADBB] hover:text-white border border-[#252D39]'
            }`}
          >
            <PlaySquare className="w-3.5 h-3.5" />
            <span>Video Reports ({videos.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('articles')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'articles' 
                ? 'bg-[#075DEB] text-white shadow-xs' 
                : 'bg-[#121925] text-[#A4ADBB] hover:text-white border border-[#252D39]'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Articles ({articles.length})</span>
          </button>
        </div>
      </div>

      {/* Video Reports Section */}
      {showVideos && videos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#252D39] pb-2">
            <div className="flex items-center gap-2">
              <PlaySquare className="w-4 h-4 text-[#E50914]" />
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Video Dispatches in {category.name}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((vid) => (
              <VideoCard key={vid.id} video={vid} />
            ))}
          </div>
        </div>
      )}

      {/* Written Articles Section */}
      {showArticles && articles.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-[#252D39] pb-2">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#075DEB]" />
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Written Articles & In-Depth Reports
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((art) => (
              <Link
                key={art.id}
                href={`/article/${art.slug}`}
                prefetch={true}
                className="p-4 rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] flex flex-col justify-between group transition-all"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[16/10] bg-black rounded-lg overflow-hidden border border-[#252D39]/50">
                    <img
                      src={art.featured_image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-[10px] text-[#707B8B] flex items-center justify-between">
                    <span>{art.reporter_name || 'Desk Staff'}</span>
                    <span>{formatDate(art.published_at || art.created_at)}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#075DEB] leading-snug line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-[#A4ADBB] line-clamp-2 leading-relaxed">
                    {art.deck}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#252D39]/40 flex items-center justify-between text-xs text-[#075DEB] font-semibold">
                  <span>{art.reading_time_minutes} min read</span>
                  <span className="flex items-center gap-0.5">Read <ChevronRight className="w-3.5 h-3.5" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {videos.length === 0 && articles.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[#121925] border border-[#252D39]">
          <p className="text-sm text-[#A4ADBB]">No stories or video reports currently filed under this desk.</p>
          <Link href="/" prefetch={true} className="mt-4 inline-block px-4 py-2 bg-[#075DEB] text-white text-xs font-bold rounded-lg">
            Return Home
          </Link>
        </div>
      )}
    </div>
  );
}

