import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clock, User } from 'lucide-react';
import { VideoItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface VideoCardProps {
  video: VideoItem;
  layout?: 'grid' | 'compact' | 'horizontal';
  showCategory?: boolean;
}

function formatReadingTime(duration?: string) {
  if (!duration) return '5 MIN READ';
  if (duration.includes(':')) {
    const mins = parseInt(duration.split(':')[0], 10);
    return `${Math.max(mins || 5, 2)} MIN READ`;
  }
  return duration;
}

export default function VideoCard({
  video,
  layout = 'grid',
  showCategory = true
}: VideoCardProps) {
  if (layout === 'horizontal') {
    return (
      <Link
        href={`/video/${video.slug}`}
        className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] transition-all group"
      >
        <div className="relative w-36 sm:w-44 aspect-video shrink-0 bg-black rounded-lg overflow-hidden border border-[#252D39]/50">
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg">
              <ArrowUpRight className="w-4 h-4 text-white" />
            </div>
          </div>
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/85 text-[10px] font-mono font-bold text-white rounded">
            {formatReadingTime(video.duration)}
          </span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            {showCategory && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E50914] mb-1 inline-block">
                {video.category}
              </span>
            )}
            <h4 className="text-xs sm:text-sm font-bold text-[#F5F7FA] group-hover:text-white line-clamp-2 leading-snug">
              {video.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[#707B8B] mt-2">
            <span>{formatDate(video.published_at)}</span>
            {video.reporter_name && (
              <>
                <span>•</span>
                <span className="text-[#A4ADBB] truncate">{video.reporter_name}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/video/${video.slug}`}
      className="flex flex-col rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] overflow-hidden transition-all group shadow-sm hover:shadow-md"
    >
      {/* 16:9 Thumbnail Area */}
      <div className="relative w-full aspect-video bg-black overflow-hidden">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Hover Read Indicator Overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-xl">
            <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Reading Time Badge */}
        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/85 text-[10px] font-mono font-bold text-white rounded tracking-tight">
          {formatReadingTime(video.duration)}
        </span>

        {/* Category Pill Badge */}
        {showCategory && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-[9.5px] font-extrabold uppercase tracking-wider text-white border border-[#252D39] rounded">
            {video.category}
          </span>
        )}
      </div>

      {/* Story Headline and Details */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2">
        <h4 className="text-xs sm:text-sm font-semibold text-[#F5F7FA] group-hover:text-white line-clamp-2 leading-snug">
          {video.title}
        </h4>

        <div className="flex items-center justify-between text-[11px] text-[#707B8B] pt-1 border-t border-[#252D39]/40 mt-auto">
          <span className="truncate">{video.reporter_name || 'NEWSIGHT Desk'}</span>
          <span className="shrink-0">{formatDate(video.published_at)}</span>
        </div>
      </div>
    </Link>
  );
}
