import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, Eye, Clock, ChevronRight } from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';
import VideoCard from '@/components/public/VideoCard';
import { getTopVideos, getVideos } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Top Stories & Most Read | NEWSIGHT',
  description: 'Most-read journalistic investigations, field reports, and prime editorial stories on NEWSIGHT ranked by verified readership.',
};

export const dynamic = 'force-dynamic';

export default async function TopVideosPage() {
  const topVideos = getTopVideos(16);

  return (
    <PublicLayout>
      <div className="px-3 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Masthead */}
        <div className="border-b border-[#252D39] pb-5">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>Audience Engagement & Readership</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Top Stories & Verified Rankings
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#A4ADBB] max-w-2xl leading-relaxed">
            Leading photojournalism dispatches and field reports ordered strictly by authentic platform audience readership and engagement.
          </p>
        </div>

        {/* Ranked Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {topVideos.map((video, idx) => (
            <div key={video.id} className="relative flex flex-col">
              <div className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/90 text-amber-400 border border-amber-400/40 flex items-center justify-center text-xs font-black font-mono shadow-lg">
                #{idx + 1}
              </div>
              <VideoCard video={video} />
            </div>
          ))}
        </div>

      </div>
    </PublicLayout>
  );
}
