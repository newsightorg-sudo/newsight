import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  getVideoBySlug, getRelatedVideos, getArticlesByCategory 
} from '@/lib/data';
import { formatDate } from '@/lib/utils';
import PublicLayout from '@/components/public/PublicLayout';
import VideoPlayer from '@/components/public/VideoPlayer';
import VideoCard from '@/components/public/VideoCard';
import SocialShareBar from '@/components/public/SocialShareBar';
import { 
  Clock, Eye, Film, Share2, User, ChevronRight, Newspaper, ArrowLeft
} from 'lucide-react';

interface VideoPageProps {
  params: Promise<{ slug: string }>;
}

function formatReadingTime(duration?: string) {
  if (!duration) return '5 min read';
  if (duration.includes(':')) {
    const mins = parseInt(duration.split(':')[0], 10);
    return `${Math.max(mins || 5, 2)} min read`;
  }
  return duration;
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vid = getVideoBySlug(slug);
  if (!vid) return { title: 'Story Not Found | NEWSIGHT' };

  return {
    title: `${vid.title} | NEWSIGHT Journalism`,
    description: vid.summary,
    openGraph: {
      title: vid.title,
      description: vid.summary,
      images: [vid.thumbnail_url],
      type: 'article',
    }
  };
}

export default async function VideoWatchPage({ params }: VideoPageProps) {
  const { slug } = await params;
  const video = getVideoBySlug(slug);

  if (!video) {
    notFound();
  }

  const relatedVideos = getRelatedVideos(video.id, video.category, 6);
  const relatedArticles = getArticlesByCategory(video.category.toLowerCase(), 3);

  return (
    <PublicLayout>
      <div className="px-3 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#707B8B]">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/video" className="hover:text-white transition-colors">Stories</Link>
          <span>/</span>
          <span className="text-[#A4ADBB] truncate max-w-sm">{video.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Visual Dispatch View */}
            <VideoPlayer
              src={video.video_url}
              poster={video.thumbnail_url}
              title={video.title}
              autoPlay={false}
            />

            {/* Headline, Tags & Metadata */}
            <div className="p-5 sm:p-6 rounded-xl bg-[#121925] border border-[#252D39] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252D39]/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#E50914] text-white font-extrabold text-[10px] uppercase rounded">
                    {video.category}
                  </span>
                  <span className="text-xs font-mono text-[#A4ADBB] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatReadingTime(video.duration)}
                  </span>
                  {video.show_title && (
                    <Link
                      href={`/shows/${video.show_slug}`}
                      className="px-2 py-0.5 bg-[#075DEB]/20 text-[#075DEB] hover:bg-[#075DEB]/30 border border-[#075DEB]/30 text-[10.5px] font-bold rounded flex items-center gap-1"
                    >
                      <Film className="w-3 h-3" />
                      <span>{video.show_title}</span>
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-[#707B8B]">
                  <span>Published {formatDate(video.published_at)}</span>
                  {video.views_count && (
                    <span className="flex items-center gap-1 font-mono">
                      <Eye className="w-3.5 h-3.5" />
                      {video.views_count.toLocaleString()} reads
                    </span>
                  )}
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#F5F7FA] leading-snug">
                {video.title}
              </h1>

              <p className="text-sm sm:text-base text-[#A4ADBB] leading-relaxed border-l-2 border-[#E50914] pl-4 py-1">
                {video.summary}
              </p>

              {/* Reporter Attribution */}
              {video.reporter_name && (
                <div className="pt-4 border-t border-[#252D39]/60 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    {video.reporter_avatar ? (
                      <img
                        src={video.reporter_avatar}
                        alt={video.reporter_name}
                        className="w-10 h-10 rounded-full object-cover border border-[#252D39]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#1B2432] flex items-center justify-center text-white">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Reported by {video.reporter_name}
                      </span>
                      <span className="text-[11px] text-[#707B8B]">
                        {video.reporter_title || 'Audio-Visual Correspondent, NEWSIGHT'}
                      </span>
                    </div>
                  </div>

                  {/* Share controls */}
                  <SocialShareBar
                    url={`https://newsight.media/video/${video.slug}`}
                    title={video.title}
                  />
                </div>
              )}
            </div>

            {/* Related Written Articles Desk */}
            {relatedArticles.length > 0 && (
              <div className="p-5 rounded-xl bg-[#0E131C] border border-[#252D39] space-y-4">
                <div className="flex items-center justify-between border-b border-[#252D39] pb-2">
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-[#075DEB]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                      Related Articles & Context
                    </h3>
                  </div>
                  <Link href={`/category/${video.category.toLowerCase()}`} className="text-xs font-semibold text-[#075DEB] hover:underline">
                    More in {video.category}
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {relatedArticles.map((art) => (
                    <Link
                      key={art.id}
                      href={`/article/${art.slug}`}
                      className="p-3 rounded-lg bg-[#121925] hover:bg-[#1B2432] border border-[#252D39]/50 block group"
                    >
                      <h4 className="text-xs font-semibold text-white group-hover:text-[#075DEB] line-clamp-2 leading-snug">
                        {art.title}
                      </h4>
                      <span className="text-[10px] text-[#707B8B] mt-2 block">
                        {formatDate(art.published_at || art.created_at)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Rail: Related Stories (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#252D39]">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Related Stories
              </h3>
              <Link href="/video" className="text-[11px] font-bold text-[#075DEB] hover:underline uppercase">
                All Stories
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {relatedVideos.map((vid) => (
                <VideoCard
                  key={vid.id}
                  video={vid}
                  layout="horizontal"
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </PublicLayout>
  );
}
