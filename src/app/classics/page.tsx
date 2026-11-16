import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Award, Clock, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';
import { getArticlesByCategory, getLatestArticles } from '@/lib/data';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'NEWSIGHT Classics | Archival Investigations & Historic Journalism',
  description: 'Curated archival dispatches, historic constitutional analyses, and milestone investigative reporting from the NEWSIGHT archives.',
};

export const dynamic = 'force-dynamic';

export default async function ClassicsPage() {
  const [investigations, latest] = await Promise.all([
    getArticlesByCategory('investigations', 12),
    getLatestArticles(8)
  ]);

  const classics = investigations.length > 0 ? investigations : latest;
  const featuredClassic = classics[0];
  const gridClassics = classics.slice(1);

  return (
    <PublicLayout>
      <div className="px-3 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Masthead */}
        <div className="border-b border-[#252D39] pb-5">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Award className="w-4 h-4" />
            <span>Editorial Retrospectives</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            NEWSIGHT Classics & Landmark Archives
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#A4ADBB] max-w-2xl leading-relaxed">
            Preserved landmark journalism: landmark constitutional analyses, foundational ground dispatches, and watershed investigative reporting that shaped public discourse.
          </p>
        </div>

        {/* Featured Classic Spotlight */}
        {featuredClassic && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#121925] to-[#0A0E15] border border-amber-400/30 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-xl group">
                <img
                  src={featuredClassic.featured_image}
                  alt={featuredClassic.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/80 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider rounded border border-amber-400/30">
                  {featuredClassic.category_name || 'Investigation'}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase rounded">
                  ARCHIVAL MASTER
                </span>
                <span className="text-xs font-mono text-[#A4ADBB]">
                  {featuredClassic.reading_time_minutes || 10} min read
                </span>
              </div>

              <Link href={`/article/${featuredClassic.slug}`}>
                <h2 className="text-lg sm:text-xl font-bold text-white hover:text-amber-400 leading-snug">
                  {featuredClassic.title}
                </h2>
              </Link>

              <p className="text-xs sm:text-sm text-[#A4ADBB] line-clamp-3 leading-relaxed">
                {featuredClassic.deck}
              </p>

              <div className="pt-3 border-t border-[#252D39]/50 flex items-center justify-between text-xs">
                <span className="text-[#707B8B]">{featuredClassic.reporter_name || 'Archival Unit'}</span>
                <Link
                  href={`/article/${featuredClassic.slug}`}
                  className="font-bold text-amber-400 hover:underline flex items-center gap-1"
                >
                  Read Classic Report <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Grid of Classics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#252D39] pb-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Curated Archival Collection ({classics.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {gridClassics.map((art) => (
              <Link
                key={art.id}
                href={`/article/${art.slug}`}
                className="flex flex-col justify-between p-3.5 rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] transition-all group"
              >
                <div className="space-y-2.5">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black/50 border border-[#252D39]/60">
                    <img
                      src={art.featured_image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/85 text-[10px] font-mono font-bold text-white rounded">
                      {art.reading_time_minutes || 5} MIN READ
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-amber-400 uppercase tracking-wider">
                      {art.category_name || 'Archive'}
                    </span>
                    <span className="text-[#707B8B]">
                      {formatDate(art.published_at || art.created_at)}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-[#F5F7FA] group-hover:text-amber-400 line-clamp-2 leading-snug transition-colors">
                    {art.title}
                  </h4>

                  {art.deck && (
                    <p className="text-[11px] text-[#A4ADBB] line-clamp-2 leading-relaxed">
                      {art.deck}
                    </p>
                  )}
                </div>

                <div className="pt-2 mt-2 border-t border-[#252D39]/40 flex items-center justify-between text-[11px] text-amber-400 font-semibold">
                  <span className="text-[#707B8B] truncate max-w-[120px]">
                    {art.reporter_name || 'NEWSIGHT Archive'}
                  </span>
                  <span className="flex items-center gap-0.5">
                    Read Report <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </PublicLayout>
  );
}
