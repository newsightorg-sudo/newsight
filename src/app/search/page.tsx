import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  searchArticles, searchVideos, getCategories 
} from '@/lib/data';
import { formatDate } from '@/lib/utils';
import PublicLayout from '@/components/public/PublicLayout';
import VideoCard from '@/components/public/VideoCard';
import { Search, Filter, PlaySquare, Newspaper, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Search Videos, News & Stories | NEWSIGHT',
  description: 'Search through published video dispatches, investigative archives, and verified news stories.',
};

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    tab?: string;
    category?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', tab = 'all', category = 'all' } = await searchParams;
  const categories = getCategories();

  const articles = q.trim() ? searchArticles(q, { category }) : [];
  const videos = q.trim() ? searchVideos(q) : [];

  const totalResults = articles.length + videos.length;
  const showVideos = tab === 'all' || tab === 'videos';
  const showArticles = tab === 'all' || tab === 'articles';

  return (
    <PublicLayout>
      <div className="px-3 sm:px-6 lg:px-8 py-6 space-y-8 max-w-6xl mx-auto">
        
        {/* Search Header Form */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0E131C] border border-[#252D39] space-y-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              Search NEWSIGHT Archives
            </h1>
            <p className="text-xs sm:text-sm text-[#A4ADBB] mt-1">
              Search across published video broadcasts, field investigations, reporter bylines, and editorial desks.
            </p>
          </div>

          <form action="/search" method="GET" className="relative flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search videos, news and stories..."
                className="w-full pl-10 pr-4 py-3 bg-[#121925] border border-[#252D39] rounded-xl text-sm text-white placeholder-[#707B8B] focus:outline-none focus:border-[#075DEB]"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#707B8B]" />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-[#075DEB] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shrink-0"
            >
              Search
            </button>
          </form>

          {/* Result Filter Tabs */}
          {q && (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#252D39]/50 text-xs">
              <div className="flex items-center gap-2">
                <Link
                  href={`/search?q=${encodeURIComponent(q)}&tab=all`}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    tab === 'all' 
                      ? 'bg-[#075DEB] text-white' 
                      : 'bg-[#121925] text-[#A4ADBB] hover:text-white border border-[#252D39]'
                  }`}
                >
                  All Matches ({totalResults})
                </Link>
                <Link
                  href={`/search?q=${encodeURIComponent(q)}&tab=videos`}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                    tab === 'videos' 
                      ? 'bg-[#075DEB] text-white' 
                      : 'bg-[#121925] text-[#A4ADBB] hover:text-white border border-[#252D39]'
                  }`}
                >
                  <PlaySquare className="w-3.5 h-3.5" />
                  <span>Videos ({videos.length})</span>
                </Link>
                <Link
                  href={`/search?q=${encodeURIComponent(q)}&tab=articles`}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                    tab === 'articles' 
                      ? 'bg-[#075DEB] text-white' 
                      : 'bg-[#121925] text-[#A4ADBB] hover:text-white border border-[#252D39]'
                  }`}
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>Articles ({articles.length})</span>
                </Link>
              </div>

              <span className="text-[#707B8B] font-mono text-[11px]">
                Showing results for &ldquo;{q}&rdquo;
              </span>
            </div>
          )}
        </div>

        {/* Results Stream */}
        {q ? (
          <div className="space-y-8">
            
            {/* Matching Videos */}
            {showVideos && videos.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#252D39] pb-2">
                  <div className="flex items-center gap-2">
                    <PlaySquare className="w-4 h-4 text-[#E50914]" />
                    <h2 className="text-sm font-black uppercase tracking-wider text-white">
                      Matching Video Reports ({videos.length})
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((vid) => (
                    <VideoCard key={vid.id} video={vid} />
                  ))}
                </div>
              </div>
            )}

            {/* Matching Articles */}
            {showArticles && articles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#252D39] pb-2">
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-[#075DEB]" />
                    <h2 className="text-sm font-black uppercase tracking-wider text-white">
                      Matching Articles & Written Journalism ({articles.length})
                    </h2>
                  </div>
                </div>

                <div className="space-y-3">
                  {articles.map((art) => (
                    <Link
                      key={art.id}
                      href={`/article/${art.slug}`}
                      className="p-4 rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] flex flex-col sm:flex-row gap-4 group transition-colors"
                    >
                      <div className="relative w-full sm:w-44 aspect-video shrink-0 bg-black rounded-lg overflow-hidden border border-[#252D39]/50">
                        <img
                          src={art.featured_image}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-[10px] text-[#707B8B] mb-1">
                            <span className="text-[#075DEB] font-bold uppercase">{art.category_name}</span>
                            <span>•</span>
                            <span>{formatDate(art.published_at || art.created_at)}</span>
                            <span>•</span>
                            <span>{art.reporter_name}</span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#075DEB] leading-snug">
                            {art.title}
                          </h3>
                          <p className="text-xs text-[#A4ADBB] line-clamp-2 mt-1 leading-relaxed">
                            {art.deck}
                          </p>
                        </div>
                        <div className="pt-2 mt-2 border-t border-[#252D39]/40 text-xs text-[#075DEB] font-semibold flex items-center gap-0.5">
                          <span>Read Full Story</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Zero results */}
            {totalResults === 0 && (
              <div className="p-12 text-center rounded-2xl bg-[#121925] border border-[#252D39] space-y-2">
                <Search className="w-10 h-10 text-[#707B8B] mx-auto mb-2" />
                <h3 className="text-base font-bold text-white">No reports match your query</h3>
                <p className="text-xs text-[#A4ADBB] max-w-sm mx-auto">
                  Try broader search terms, or explore topics across our news categories.
                </p>
              </div>
            )}

          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-[#121925] border border-[#252D39]">
            <p className="text-xs text-[#A4ADBB]">Enter search terms above to query video archives and written articles.</p>
          </div>
        )}

      </div>
    </PublicLayout>
  );
}
