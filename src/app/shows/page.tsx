import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Film, Play, Clock, ChevronRight, Calendar, User, Sparkles 
} from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';
import { getShows } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Shows & Programs | NEWSIGHT Prime Time Lineup',
  description: 'Explore NEWSIGHT’s flagship investigative programs, debate shows, deep explainers, and prime-time broadcasts.',
};

export const dynamic = 'force-dynamic';

export default async function ShowsDirectoryPage() {
  const shows = getShows();

  return (
    <PublicLayout>
      <div className="px-3 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Masthead */}
        <div className="border-b border-[#252D39] pb-5">
          <div className="flex items-center gap-2 text-[#075DEB] text-xs font-black uppercase tracking-widest mb-1.5">
            <Film className="w-4 h-4" />
            <span>NEWSIGHT Studios</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Flagship Programs & Broadcast Shows
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#A4ADBB] max-w-2xl leading-relaxed">
            In-depth journalism formats anchored by senior correspondents. Dedicated longform investigations, nightly debates, and visual telemetry dispatches.
          </p>
        </div>

        {/* Shows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show) => (
            <div
              key={show.id}
              className="group flex flex-col rounded-2xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] overflow-hidden transition-all shadow-md hover:border-[#075DEB]/60"
            >
              {/* Cover Image Area */}
              <div className="relative aspect-[16/9] bg-black overflow-hidden">
                <img
                  src={show.cover_image}
                  alt={show.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-[#075DEB] text-white text-[10px] font-black uppercase tracking-wider rounded">
                    PROGRAM
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  {show.host_name && (
                    <span className="bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-medium border border-white/10 flex items-center gap-1">
                      <User className="w-3 h-3 text-[#A4ADBB]" />
                      <span>{show.host_name}</span>
                    </span>
                  )}
                  {show.episode_count !== undefined && (
                    <span className="font-mono text-[11px] text-[#A4ADBB] bg-black/70 px-2 py-0.5 rounded border border-white/10">
                      {show.episode_count} Episodes
                    </span>
                  )}
                </div>
              </div>

              {/* Show Details */}
              <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-[#075DEB] transition-colors leading-snug">
                    {show.title}
                  </h2>
                  <p className="text-xs text-[#A4ADBB] mt-2 leading-relaxed line-clamp-3">
                    {show.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#252D39]/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#707B8B] text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-[#075DEB]" />
                    <span>{show.schedule_info || 'Regular Broadcast'}</span>
                  </div>

                  <Link
                    href={`/shows/${show.slug}`}
                    className="px-3 py-1.5 bg-[#075DEB] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Watch Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </PublicLayout>
  );
}
