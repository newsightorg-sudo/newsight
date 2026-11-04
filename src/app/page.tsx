import React from 'react';
import Link from 'next/link';
import { 
  Play, ChevronRight, TrendingUp, Sparkles, Film, 
  Clock, ArrowUpRight, Award, Compass, Eye, Newspaper, Flame, PlaySquare, BookOpen
} from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';
import VideoPlayer from '@/components/public/VideoPlayer';
import VideoCard from '@/components/public/VideoCard';
import { 
  getVideos, getFeaturedVideos, getJustAddedVideos, getTopVideos, 
  getShows, getLatestArticles, getArticlesByCategory, getOpinionArticles 
} from '@/lib/data';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function formatReadingTime(duration?: string) {
  if (!duration) return '5 min read';
  if (duration.includes(':')) {
    const mins = parseInt(duration.split(':')[0], 10);
    return `${Math.max(mins || 5, 2)} min read`;
  }
  return duration;
}

export default async function HomePage() {
  const allVideos = getVideos(12);
  const featured = allVideos.find(v => v.is_featured === 1) || allVideos[0];
  const sideRailVideos = allVideos.filter(v => v.id !== featured?.id).slice(0, 4);
  const latestVideos = getVideos(8);
  const justAdded = getJustAddedVideos(4);
  const editorPicks = getFeaturedVideos(4);
  const topRankedVideos = getTopVideos(4);
  const shows = getShows();
  
  // Written news articles
  const latestArticles = getLatestArticles(8);
  const politicsArticles = getArticlesByCategory('politics', 3);
  const businessArticles = getArticlesByCategory('business', 3);
  const techArticles = getArticlesByCategory('technology', 3);
  const worldArticles = getArticlesByCategory('world', 3);
  const opinionArticles = getOpinionArticles(3);

  return (
    <PublicLayout>
      <div className="px-3 sm:px-5 lg:px-6 py-4 sm:py-6 space-y-10 sm:space-y-12">
        
        {/* ==================================================
            SECTION A: FEATURED STORY & B: LATEST STORIES RAIL
            ================================================== */}
        <section aria-labelledby="featured-story-heading">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
            
            {/* Main Featured Lead Story (8 cols on XL) */}
            <div className="xl:col-span-8 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-pulse" />
                  <h2 
                    id="featured-story-heading" 
                    className="text-xs font-black uppercase tracking-widest text-[#E50914]"
                  >
                    FEATURED STORY
                  </h2>
                </div>
                {featured?.category && (
                  <span className="text-[11px] font-bold text-[#A4ADBB] uppercase tracking-wider bg-[#121925] px-2 py-0.5 rounded border border-[#252D39]">
                    {featured.category}
                  </span>
                )}
              </div>

              {featured ? (
                <div className="flex flex-col gap-3">
                  <VideoPlayer
                    src={featured.video_url}
                    poster={featured.thumbnail_url}
                    title={featured.title}
                  />

                  {/* Headline & Metadata */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#121925] border border-[#252D39] flex flex-col gap-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#707B8B]">
                      <span className="px-2 py-0.5 bg-[#E50914] text-white font-bold text-[10px] uppercase rounded">
                        {featured.category}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-white font-medium">{formatReadingTime(featured.duration)}</span>
                      <span>•</span>
                      <span>Published {formatDate(featured.published_at)}</span>
                      {featured.reporter_name && (
                        <>
                          <span>•</span>
                          <span className="text-[#A4ADBB] font-medium">Reported by {featured.reporter_name}</span>
                        </>
                      )}
                      {featured.show_title && (
                        <>
                          <span>•</span>
                          <Link 
                            href={`/shows/${featured.show_slug}`} 
                            className="text-[#075DEB] hover:underline font-semibold"
                          >
                            Part of {featured.show_title}
                          </Link>
                        </>
                      )}
                    </div>

                    <Link href={`/video/${featured.slug}`}>
                      <h1 className="text-lg sm:text-2xl font-bold text-[#F5F7FA] hover:text-[#075DEB] transition-colors leading-snug">
                        {featured.title}
                      </h1>
                    </Link>

                    <p className="text-xs sm:text-sm text-[#A4ADBB] leading-relaxed line-clamp-3">
                      {featured.summary}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-[#252D39]/50 text-xs">
                      <Link 
                        href={`/video/${featured.slug}`} 
                        className="font-bold text-[#075DEB] hover:text-blue-400 flex items-center gap-1 uppercase tracking-wider text-[11px]"
                      >
                        Read Full Story & Analysis <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      {featured.views_count && (
                        <span className="text-[11px] text-[#707B8B] flex items-center gap-1 font-mono">
                          <Eye className="w-3.5 h-3.5" />
                          {featured.views_count.toLocaleString()} reads
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-[#121925] rounded-xl flex items-center justify-center text-[#707B8B] border border-[#252D39]">
                  No featured story currently configured.
                </div>
              )}
            </div>

            {/* SECTION B (Beside Featured on XL): Latest Dispatches Rail */}
            <div className="xl:col-span-4 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#075DEB]" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#F5F7FA]">
                    LATEST DISPATCHES
                  </h3>
                </div>
                <Link
                  href="/video"
                  className="text-[11px] font-bold text-[#075DEB] hover:underline flex items-center gap-0.5 uppercase tracking-wider"
                >
                  All Stories <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {sideRailVideos.map((vid) => (
                  <VideoCard
                    key={vid.id}
                    video={vid}
                    layout="horizontal"
                  />
                ))}
              </div>
            </div>

          </div>
        </section>


        {/* ==================================================
            SECTION B CONTINUED: LATEST STORIES 4-COLUMN GRID
            ================================================== */}
        <section aria-labelledby="latest-stories-heading" className="pt-2">
          <div className="flex items-center justify-between mb-4 border-b border-[#252D39] pb-2.5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#E50914]" />
              <h2 id="latest-stories-heading" className="text-sm font-black uppercase tracking-wider text-white">
                Latest Field Reports & Stories
              </h2>
            </div>
            <Link 
              href="/video" 
              className="text-xs font-bold text-[#075DEB] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              View More <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestVideos.slice(0, 4).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>


        {/* ==================================================
            SECTION C: JUST ADDED
            ================================================== */}
        <section aria-labelledby="just-added-heading">
          <div className="flex items-center justify-between mb-4 border-b border-[#252D39] pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h2 id="just-added-heading" className="text-sm font-black uppercase tracking-wider text-white">
                Recent Dispatches & Articles
              </h2>
              <span className="text-[10px] font-medium text-[#707B8B] hidden sm:inline">
                (Chronological editorial publication feed)
              </span>
            </div>
            <Link 
              href="/video?sort=latest" 
              className="text-xs font-bold text-[#075DEB] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              Latest Order <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {justAdded.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>


        {/* ==================================================
            SECTION E: TOP SERIES & COLUMNS
            ================================================== */}
        <section aria-labelledby="top-shows-heading">
          <div className="flex items-center justify-between mb-4 border-b border-[#252D39] pb-2.5">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#075DEB]" />
              <h2 id="top-shows-heading" className="text-sm font-black uppercase tracking-wider text-white">
                NEWSIGHT Special Series & Columns
              </h2>
            </div>
            <Link 
              href="/shows" 
              className="text-xs font-bold text-[#075DEB] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              All Series Directory <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shows.slice(0, 4).map((show) => (
              <Link
                key={show.slug}
                href={`/shows/${show.slug}`}
                className="group flex flex-col rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] overflow-hidden transition-all shadow-sm"
              >
                <div className="relative aspect-[16/10] bg-black overflow-hidden">
                  <img
                    src={show.cover_image}
                    alt={show.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded border border-white/10">
                      {show.host_name ? `Author: ${show.host_name}` : 'NEWSIGHT Desk'}
                    </span>
                    {show.episode_count !== undefined && (
                      <span className="text-[10px] font-mono text-[#A4ADBB]">
                        {show.episode_count} Stories
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#075DEB] transition-colors">
                      {show.title}
                    </h3>
                    <p className="text-xs text-[#A4ADBB] line-clamp-2 mt-1 leading-relaxed">
                      {show.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#252D39]/40 flex items-center justify-between text-[11px]">
                    <span className="text-[#707B8B] font-medium">{show.schedule_info || 'Weekly'}</span>
                    <span className="font-bold text-[#075DEB] flex items-center gap-0.5 uppercase tracking-wider text-[10px]">
                      Read Series <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>


        {/* ==================================================
            SECTION F: TOP STORIES (RANKED BY ACTUAL READERSHIP)
            ================================================== */}
        <section aria-labelledby="top-videos-heading">
          <div className="flex items-center justify-between mb-4 border-b border-[#252D39] pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h2 id="top-videos-heading" className="text-sm font-black uppercase tracking-wider text-white">
                Top Stories & Most Read Reports
              </h2>
            </div>
            <Link 
              href="/top-videos" 
              className="text-xs font-bold text-[#075DEB] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              Full Rankings <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topRankedVideos.map((video, idx) => (
              <div key={video.id} className="relative">
                <span className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/85 text-amber-400 border border-amber-400/30 flex items-center justify-center text-xs font-black font-mono">
                  #{idx + 1}
                </span>
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        </section>


        {/* ==================================================
            SECTION G: LATEST NEWS (WRITTEN JOURNALISM SECTION)
            ================================================== */}
        <section aria-labelledby="written-news-heading" className="pt-4 border-t border-[#252D39]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-[#E50914]" />
              <div>
                <h2 id="written-news-heading" className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                  Latest News & Deep Journalism
                </h2>
                <p className="text-xs text-[#707B8B]">
                  Field dispatches, parliamentary coverage, financial investigations, and opinion columns
                </p>
              </div>
            </div>
            <Link 
              href="/category/news" 
              className="text-xs font-bold text-[#075DEB] hover:underline flex items-center gap-1 uppercase tracking-wider shrink-0"
            >
              All Desks <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Multi-column Editorial Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Main Article Stream (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {latestArticles.slice(0, 4).map((art, idx) => (
                <Link
                  key={art.id}
                  href={`/article/${art.slug}`}
                  className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] transition-all group"
                >
                  <div className="relative w-full sm:w-48 aspect-video sm:aspect-[4/3] shrink-0 bg-black rounded-lg overflow-hidden border border-[#252D39]/50">
                    <img
                      src={art.featured_image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {art.category_name && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/80 text-[9px] font-bold text-white uppercase rounded">
                        {art.category_name}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] text-[#707B8B] mb-1">
                        <span>{art.reporter_name || 'Staff Reporter'}</span>
                        <span>•</span>
                        <span>{formatDate(art.published_at || art.created_at)}</span>
                        <span>•</span>
                        <span>{art.reading_time_minutes} min read</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#075DEB] transition-colors leading-snug">
                        {art.title}
                      </h3>
                      <p className="text-xs text-[#A4ADBB] line-clamp-2 mt-1.5 leading-relaxed">
                        {art.deck}
                      </p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-[#252D39]/40 flex items-center justify-between text-[11px] text-[#707B8B]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {art.article_type}
                      </span>
                      <span className="text-[#075DEB] font-semibold flex items-center gap-0.5">
                        Read Story <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right Beats & Desks Rail (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Politics Desk Box */}
              <div className="p-4 rounded-xl bg-[#0E131C] border border-[#252D39]">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#252D39]">
                  <span className="text-xs font-black uppercase tracking-wider text-[#b91c1c]">
                    Politics & Governance
                  </span>
                  <Link href="/category/politics" className="text-[11px] font-semibold text-[#075DEB] hover:underline">
                    More
                  </Link>
                </div>
                <div className="divide-y divide-[#252D39]/50">
                  {politicsArticles.map((art) => (
                    <Link
                      key={art.id}
                      href={`/article/${art.slug}`}
                      className="block py-2.5 group"
                    >
                      <h4 className="text-xs font-semibold text-[#F5F7FA] group-hover:text-[#075DEB] transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </h4>
                      <span className="text-[10px] text-[#707B8B] mt-1 inline-block">
                        {formatDate(art.published_at || art.created_at)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Technology & AI Desk Box */}
              <div className="p-4 rounded-xl bg-[#0E131C] border border-[#252D39]">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#252D39]">
                  <span className="text-xs font-black uppercase tracking-wider text-[#075DEB]">
                    Technology & Digital Economy
                  </span>
                  <Link href="/category/technology" className="text-[11px] font-semibold text-[#075DEB] hover:underline">
                    More
                  </Link>
                </div>
                <div className="divide-y divide-[#252D39]/50">
                  {techArticles.map((art) => (
                    <Link
                      key={art.id}
                      href={`/article/${art.slug}`}
                      className="block py-2.5 group"
                    >
                      <h4 className="text-xs font-semibold text-[#F5F7FA] group-hover:text-[#075DEB] transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </h4>
                      <span className="text-[10px] text-[#707B8B] mt-1 inline-block">
                        {formatDate(art.published_at || art.created_at)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Opinion & Editorial Columns */}
              {opinionArticles.length > 0 && (
                <div className="p-4 rounded-xl bg-[#0E131C] border border-[#252D39]">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#252D39]">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      Editorial Opinion & Essays
                    </span>
                    <Link href="/category/opinion" className="text-[11px] font-semibold text-[#075DEB] hover:underline">
                      More
                    </Link>
                  </div>
                  <div className="divide-y divide-[#252D39]/50">
                    {opinionArticles.map((art) => (
                      <Link
                        key={art.id}
                        href={`/article/${art.slug}`}
                        className="block py-2.5 group"
                      >
                        <span className="text-[10px] text-amber-400/90 font-bold block mb-0.5">
                          {art.reporter_name}
                        </span>
                        <h4 className="text-xs font-semibold text-[#F5F7FA] group-hover:text-[#075DEB] transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
