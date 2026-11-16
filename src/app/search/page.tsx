import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { searchArticles, getCategories } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import PublicLayout from '@/components/public/PublicLayout';
import { Search, Newspaper, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Search Articles, Investigations & Stories | NEWSIGHT',
  description: 'Search through published field reports, investigative archives, and verified news stories.',
};

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', category = 'all' } = await searchParams;
  const [categories, articles] = await Promise.all([
    getCategories(),
    q.trim() ? searchArticles(q, { category }) : Promise.resolve([])
  ]);

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
              Search across published field investigations, reporter bylines, photojournalism, and editorial desks.
            </p>
          </div>

          <form action="/search" method="GET" className="relative flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search articles, investigations, topics..."
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
              <span className="text-[#707B8B] font-mono text-[11px]">
                Found {articles.length} result{articles.length === 1 ? '' : 's'} for &ldquo;{q}&rdquo;
              </span>
            </div>
          )}
        </div>

        {/* Results Stream */}
        {q ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#252D39] pb-2">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-[#075DEB]" />
                <h2 className="text-sm font-black uppercase tracking-wider text-white">
                  Matching Articles & Written Journalism ({articles.length})
                </h2>
              </div>
            </div>

            {articles.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#121925] border border-[#252D39] text-[#707B8B] space-y-2">
                <p className="font-semibold text-white">No articles matched your search query.</p>
                <p className="text-xs">Try searching with broader terms, reporter names, or desk categories.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {articles.map((art) => (
                  <Link
                    key={art.id}
                    href={`/article/${art.slug}`}
                    className="p-4 rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] flex flex-col sm:flex-row gap-4 group transition-colors"
                  >
                    <div className="relative w-full sm:w-44 aspect-video bg-black rounded-lg overflow-hidden shrink-0 border border-[#252D39]/50">
                      <img
                        src={art.featured_image}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/85 text-[10px] font-mono font-bold text-white rounded">
                        {art.reading_time_minutes || 5} MIN
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-[10px] text-[#707B8B] mb-1">
                          <span className="text-[#E50914] font-bold uppercase">{art.category_name}</span>
                          <span>•</span>
                          <span>{formatDate(art.published_at || art.created_at)}</span>
                          {art.reporter_name && (
                            <>
                              <span>•</span>
                              <span>By {art.reporter_name}</span>
                            </>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#075DEB] transition-colors leading-snug">
                          {art.title}
                        </h3>

                        {art.deck && (
                          <p className="text-xs text-[#A4ADBB] line-clamp-2 mt-1 leading-relaxed">
                            {art.deck}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 mt-2 border-t border-[#252D39]/40 flex items-center justify-between text-[11px] text-[#707B8B]">
                        <span className="text-[10px] uppercase font-bold text-zinc-400">
                          {art.article_type || 'Article'}
                        </span>
                        <span className="text-[#075DEB] font-semibold flex items-center gap-0.5">
                          Read Story <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-[#0E131C] border border-[#252D39] text-[#707B8B]">
            Enter a search topic, keyword, or reporter name above to explore NEWSIGHT articles.
          </div>
        )}

      </div>
    </PublicLayout>
  );
}
