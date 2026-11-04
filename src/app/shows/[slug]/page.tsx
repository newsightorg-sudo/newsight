import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  getShowBySlug, getVideosByShow, getArticlesByCategory 
} from '@/lib/data';
import PublicLayout from '@/components/public/PublicLayout';
import VideoPlayer from '@/components/public/VideoPlayer';
import VideoCard from '@/components/public/VideoCard';
import { 
  Film, User, Calendar, Play, ChevronRight, Clock, Newspaper, ArrowLeft 
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ShowPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ShowPageProps): Promise<Metadata> {
  const { slug } = await params;
  const show = getShowBySlug(slug);
  if (!show) return { title: 'Show Not Found | NEWSIGHT' };

  return {
    title: `${show.title} | NEWSIGHT Flagship Programs`,
    description: show.description,
  };
}

export default async function ShowDetailPage({ params }: ShowPageProps) {
  const { slug } = await params;
  const show = getShowBySlug(slug);

  if (!show) {
    notFound();
  }

  const episodes = show.videos || [];
  const latestEpisode = episodes[0];
  const previousEpisodes = episodes.slice(1);

  return (
    <PublicLayout>
      <div className="px-3 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#707B8B]">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shows" className="hover:text-white transition-colors">Shows</Link>
          <span>/</span>
          <span className="text-[#A4ADBB]">{show.title}</span>
        </div>

        {/* Hero Show Header */}
        <div className="relative rounded-2xl overflow-hidden border border-[#252D39] bg-[#0E131C]">
          {show.banner_image && (
            <div className="absolute inset-0 opacity-20">
              <img
                src={show.banner_image}
                alt={show.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0E131C] via-[#0E131C]/90 to-transparent" />
            </div>
          )}

          <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#075DEB] text-white text-[10px] font-black uppercase tracking-wider rounded">
                  FLAGSHIP PROGRAM
                </span>
                {show.schedule_info && (
                  <span className="text-xs text-[#A4ADBB] flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#075DEB]" />
                    {show.schedule_info}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {show.title}
              </h1>

              <p className="text-xs sm:text-sm text-[#A4ADBB] leading-relaxed">
                {show.description}
              </p>

              {show.host_name && (
                <div className="flex items-center gap-2 pt-1 text-xs text-white">
                  <User className="w-4 h-4 text-[#075DEB]" />
                  <span>Hosted by <strong className="text-white">{show.host_name}</strong></span>
                </div>
              )}
            </div>

            <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-[#121925] border border-[#252D39] rounded-xl text-center min-w-[140px]">
              <span className="text-2xl font-black text-white font-mono">{episodes.length}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#707B8B]">
                Available Episodes
              </span>
            </div>
          </div>
        </div>

        {/* Latest Episode Feature */}
        {latestEpisode && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#252D39] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-pulse" />
                <h2 className="text-sm font-black uppercase tracking-wider text-white">
                  Latest Episode
                </h2>
              </div>
              <span className="text-xs text-[#707B8B]">
                Published {formatDate(latestEpisode.published_at)}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 rounded-2xl bg-[#121925] border border-[#252D39] items-center">
              <div className="lg:col-span-8">
                <VideoPlayer
                  src={latestEpisode.video_url}
                  poster={latestEpisode.thumbnail_url}
                  title={latestEpisode.title}
                />
              </div>

              <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#E50914] block mb-1">
                    SEASON PREMIERE / LATEST BROADCAST
                  </span>
                  <Link href={`/video/${latestEpisode.slug}`}>
                    <h3 className="text-lg font-bold text-white hover:text-[#075DEB] leading-snug">
                      {latestEpisode.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#A4ADBB] mt-2 line-clamp-3 leading-relaxed">
                    {latestEpisode.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#252D39]/50 flex items-center justify-between text-xs">
                  <span className="font-mono text-[#707B8B]">{latestEpisode.duration}</span>
                  <Link
                    href={`/video/${latestEpisode.slug}`}
                    className="font-bold text-[#075DEB] hover:underline flex items-center gap-0.5"
                  >
                    <span>Full Discussion</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Previous Episodes Grid */}
        {previousEpisodes.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-[#252D39] pb-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Archived Broadcasts & Previous Episodes ({previousEpisodes.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {previousEpisodes.map((ep) => (
                <VideoCard key={ep.id} video={ep} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state if no episodes */}
        {episodes.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-[#121925] border border-[#252D39]">
            <Film className="w-10 h-10 text-[#707B8B] mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Upcoming Program</h3>
            <p className="text-xs text-[#A4ADBB] max-w-md mx-auto">
              New episodes for {show.title} are currently being produced by the investigative desk. Check back soon.
            </p>
          </div>
        )}

      </div>
    </PublicLayout>
  );
}
