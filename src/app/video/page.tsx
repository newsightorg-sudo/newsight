import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  getVideos, getCategories, getShows 
} from '@/lib/data';
import PublicLayout from '@/components/public/PublicLayout';
import VideoPlayer from '@/components/public/VideoPlayer';
import VideoCard from '@/components/public/VideoCard';
import { BookOpen, Filter, Film, Sparkles, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Editorial Stories & Field Dispatches | NEWSIGHT',
  description: 'In-depth visual investigations, ground reports, explainers, and longform photojournalism stories.',
};

export const dynamic = 'force-dynamic';

interface VideoHubProps {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

function formatReadingTime(duration?: string) {
  if (!duration) return '5 min read';
  if (duration.includes(':')) {
    const mins = parseInt(duration.split(':')[0], 10);
    return `${Math.max(mins || 5, 2)} min read`;
  }
  return duration;
}

export default async function VideoHubPage({ searchParams }: VideoHubProps) {
  const { category, sort } = await searchParams;
  const categories = getCategories();
  const shows = getShows();
  let videos = getVideos(30);

  if (category && category !== 'all') {
    videos = videos.filter(v => v.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (sort === 'views') {
    videos = [...videos].sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
  }

  const featured = videos[0];
  const gridVideos = videos.slice(1);

  return (
    <PublicLayout>
      <div className="px-3 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Masthead */}
        <div className="border-b border-[#252D39] pb-5">
          <div className="flex items-center gap-2 text-[#E50914] text-xs font-black uppercase tracking-widest mb-1.5">
            <BookOpen className="w-4 h-4" />
            <span>Visual Field Dispatches</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Latest Stories & Ground Reports
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#A4ADBB] max-w-2xl leading-relaxed">
            Photojournalism dispatches, ground reports, and deep investigative stories filed by correspondents from ecological frontiers, laboratory cleanrooms, and parliamentary corridors.
          </p>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 no-scrollbar text-xs">
            <Link
              href="/video"
              className={`px-3 py-1.5 rounded-full font-semibold transition-colors shrink-0 ${
                !category || category === 'all'
                  ? 'bg-[#075DEB] text-white'
                  : 'bg-[#121925] text-[#A4ADBB] hover:text-white border border-[#252D39]'
              }`}
            >
              All Dispatches
            </Link>
            {['Ground Report', 'Science', 'Business', 'Technology', 'Environment', 'Politics', 'Sports', 'Classics'].map((cat) => (
              <Link
                key={cat}
                href={`/video?category=${encodeURIComponent(cat.toLowerCase())}`}
                className={`px-3 py-1.5 rounded-full font-semibold transition-colors shrink-0 ${
                  category?.toLowerCase() === cat.toLowerCase()
                    ? 'bg-[#075DEB] text-white'
                    : 'bg-[#121925] text-[#A4ADBB] hover:text-white border border-[#252D39]'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Lead Featured Player */}
        {featured && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#121925] border border-[#252D39] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <VideoPlayer
                src={featured.video_url}
                poster={featured.thumbnail_url}
                title={featured.title}
              />
            </div>

            <div className="lg:col-span-4 flex flex-col justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 bg-[#E50914] text-white text-[10px] font-black uppercase rounded tracking-wider inline-block mb-2">
                  {featured.category}
                </span>
                <Link href={`/video/${featured.slug}`}>
                  <h2 className="text-lg sm:text-xl font-bold text-white hover:text-[#075DEB] transition-colors leading-snug">
                    {featured.title}
                  </h2>
                </Link>
                <p className="text-xs sm:text-sm text-[#A4ADBB] line-clamp-3 mt-2 leading-relaxed">
                  {featured.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-[#252D39]/50 flex items-center justify-between text-xs text-[#707B8B]">
                <span>{formatReadingTime(featured.duration)}</span>
                <Link
                  href={`/video/${featured.slug}`}
                  className="font-bold text-[#075DEB] hover:underline"
                >
                  Read Story →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Story Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              All Field Dispatches ({videos.length})
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#707B8B]">Sort:</span>
              <Link 
                href="/video?sort=latest" 
                className={`font-semibold hover:text-white ${!sort || sort === 'latest' ? 'text-[#075DEB]' : 'text-[#707B8B]'}`}
              >
                Latest
              </Link>
              <span className="text-[#252D39]">|</span>
              <Link 
                href="/video?sort=views" 
                className={`font-semibold hover:text-white ${sort === 'views' ? 'text-[#075DEB]' : 'text-[#707B8B]'}`}
              >
                Most Read
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {gridVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>

      </div>
    </PublicLayout>
  );
}
