import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Award, Clock, ArrowRight, ShieldCheck, Film } from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';
import VideoPlayer from '@/components/public/VideoPlayer';
import VideoCard from '@/components/public/VideoCard';
import { getClassicVideos } from '@/lib/data';

export const metadata: Metadata = {
  title: 'NEWSIGHT Classics | Archival Documentaries & Historic Hearings',
  description: 'Curated archival dispatches, historic Supreme Court hearings, and milestone investigative documentaries from the NEWSIGHT archives.',
};

export const dynamic = 'force-dynamic';

export default async function ClassicsPage() {
  const classics = getClassicVideos(12);
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
            NEWSIGHT Classics & Historic Archives
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#A4ADBB] max-w-2xl leading-relaxed">
            Preserved landmark video journalism: landmark constitutional hearings, foundational ground dispatches, and watershed investigations that shaped public policy.
          </p>
        </div>

        {/* Featured Classic Spotlight */}
        {featuredClassic && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#121925] to-[#0A0E15] border border-amber-400/30 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <VideoPlayer
                src={featuredClassic.video_url}
                poster={featuredClassic.thumbnail_url}
                title={featuredClassic.title}
              />
            </div>

            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase rounded">
                  ARCHIVAL MASTER
                </span>
                <span className="text-xs font-mono text-[#A4ADBB]">{featuredClassic.duration}</span>
              </div>

              <Link href={`/video/${featuredClassic.slug}`}>
                <h2 className="text-lg sm:text-xl font-bold text-white hover:text-amber-400 leading-snug">
                  {featuredClassic.title}
                </h2>
              </Link>

              <p className="text-xs sm:text-sm text-[#A4ADBB] line-clamp-3 leading-relaxed">
                {featuredClassic.summary}
              </p>

              <div className="pt-3 border-t border-[#252D39]/50 flex items-center justify-between text-xs">
                <span className="text-[#707B8B]">{featuredClassic.reporter_name || 'Archival Unit'}</span>
                <Link
                  href={`/video/${featuredClassic.slug}`}
                  className="font-bold text-amber-400 hover:underline"
                >
                  Watch Archival Report →
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
            {gridClassics.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>

      </div>
    </PublicLayout>
  );
}
