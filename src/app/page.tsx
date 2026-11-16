import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, TrendingUp, Clock, ArrowUpRight, 
  ShieldCheck, Newspaper, Flame, BookOpen
} from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';
import VisualDispatchHero from '@/components/public/VisualDispatchHero';
import { 
  getLatestArticles, getArticlesByCategory, getOpinionArticles, 
  getInvestigativeArticles, getFieldReportArticles, getRecentDispatchArticles 
} from '@/lib/data';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [
    topStoriesArticles,
    investigativeArticles,
    fieldReportArticles,
    recentDispatchArticles,
    latestArticles,
    politicsArticles,
    techArticles,
    opinionArticles
  ] = await Promise.all([
    getArticlesByCategory('top-stories', 4),
    getInvestigativeArticles(4),
    getFieldReportArticles(4),
    getRecentDispatchArticles(4),
    getLatestArticles(24),
    getArticlesByCategory('politics', 3),
    getArticlesByCategory('technology', 3),
    getOpinionArticles(3)
  ]);

  // Dynamic content derived entirely from database
  const featuredArticle = latestArticles[0];
  const sideRailArticles = latestArticles.slice(1, 5);
  const fieldReports = fieldReportArticles;
  const recentFeed = recentDispatchArticles;
  const specialInvestigations = investigativeArticles;

  return (
    <PublicLayout>
      <div className="px-3 sm:px-5 lg:px-6 py-4 sm:py-6 space-y-10 sm:space-y-12">
        {latestArticles.length === 0 ? (
          /* Empty Database State (Clean & Dynamic) */
          <div className="py-24 px-4 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#121925] border border-[#252D39] text-[#079FE3] flex items-center justify-center mx-auto shadow-md">
              <Newspaper className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-white">No Articles Published Yet</h2>
            <p className="text-xs text-[#A4ADBB] leading-relaxed">
              The database is currently clean with zero articles. When new reports and articles are published from the Editorial CMS, they will appear here in real-time.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/articles/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#079FE3] hover:bg-[#1261A6] text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                <span>Write First Dispatch</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ==================================================
                SECTION A: FEATURED STORY & B: LATEST STORIES RAIL
                ================================================== */}
            <section aria-labelledby="featured-story-heading">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
                
                {/* Main Featured Lead Story */}
                <div className={`${sideRailArticles.length > 0 ? 'xl:col-span-8' : 'xl:col-span-12'} flex flex-col gap-3`}>
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
                    {featuredArticle?.category_name && (
                      <span className="text-[11px] font-bold text-[#A4ADBB] uppercase tracking-wider bg-[#121925] px-2 py-0.5 rounded border border-[#252D39]">
                        {featuredArticle.category_name}
                      </span>
                    )}
                  </div>

                  <VisualDispatchHero article={featuredArticle} />
                </div>

                {/* SECTION B (Beside Featured on XL): Latest Dispatches Rail */}
                {sideRailArticles.length > 0 && (
                  <div className="xl:col-span-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#075DEB]" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#F5F7FA]">
                          LATEST DISPATCHES
                        </h3>
                      </div>
                      <Link
                        href="/category/top-stories"
                        className="text-[11px] font-bold text-[#075DEB] hover:underline flex items-center gap-0.5 uppercase tracking-wider"
                      >
                        All Stories <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="flex flex-col gap-3">
                      {sideRailArticles.map((art) => (
                        <Link
                          key={art.id}
                          href={`/article/${art.slug}`}
                          className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] transition-all group"
                        >
                          <div className="relative w-36 sm:w-44 aspect-video shrink-0 bg-black rounded-lg overflow-hidden border border-[#252D39]/50">
                            <img
                              src={art.featured_image}
                              alt={art.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-8 h-8 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg">
                                <ArrowUpRight className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/85 text-[10px] font-mono font-bold text-white rounded">
                              {art.reading_time_minutes || 5} MIN READ
                            </span>
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              {art.category_name && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E50914] mb-1 inline-block">
                                  {art.category_name}
                                </span>
                              )}
                              <h4 className="text-xs sm:text-sm font-bold text-[#F5F7FA] group-hover:text-white line-clamp-2 leading-snug">
                                {art.title}
                              </h4>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-[#707B8B] pt-1">
                              <span>{formatDate(art.published_at || art.created_at)}</span>
                              {art.reporter_name && (
                                <span className="truncate max-w-[90px]">{art.reporter_name}</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </section>


            {/* ==================================================
                SECTION B CONTINUED: LATEST FIELD REPORTS & STORIES (DYNAMIC)
                ================================================== */}
            {fieldReports.length > 0 && (
              <section aria-labelledby="latest-stories-heading" className="pt-2">
                <div className="flex items-center justify-between mb-4 border-b border-[#252D39] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#E50914]" />
                    <h2 id="latest-stories-heading" className="text-sm font-black uppercase tracking-wider text-white">
                      Latest Field Reports & Stories
                    </h2>
                  </div>
                  <Link 
                    href="/category/field-reports" 
                    className="text-xs font-bold text-[#075DEB] hover:underline flex items-center gap-1 uppercase tracking-wider"
                  >
                    View More <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {fieldReports.map((art) => (
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
                          <span className="font-bold text-[#E50914] uppercase tracking-wider">
                            {art.category_name || 'Report'}
                          </span>
                          <span className="text-[#707B8B]">
                            {formatDate(art.published_at || art.created_at)}
                          </span>
                        </div>

                        <h3 className="text-xs sm:text-sm font-bold text-[#F5F7FA] group-hover:text-white line-clamp-2 leading-snug transition-colors">
                          {art.title}
                        </h3>

                        {art.deck && (
                          <p className="text-[11px] text-[#A4ADBB] line-clamp-2 leading-relaxed">
                            {art.deck}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 mt-2 border-t border-[#252D39]/40 flex items-center justify-between text-[11px] text-[#075DEB] font-semibold">
                        <span className="text-[#707B8B] truncate max-w-[120px]">
                          {art.reporter_name || 'Newsroom Desk'}
                        </span>
                        <span className="flex items-center gap-0.5">
                          Read Story <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}


            {/* ==================================================
                SECTION C: RECENT DISPATCHES & ARTICLES (DYNAMIC)
                ================================================== */}
            {recentFeed.length > 0 && (
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
                    href="/category/recent-dispatches" 
                    className="text-xs font-bold text-[#075DEB] hover:underline flex items-center gap-1 uppercase tracking-wider"
                  >
                    All Articles <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentFeed.map((art) => (
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
                          <span className="font-bold text-[#E50914] uppercase tracking-wider">
                            {art.category_name || 'News'}
                          </span>
                          <span className="text-[#707B8B]">
                            {formatDate(art.published_at || art.created_at)}
                          </span>
                        </div>

                        <h3 className="text-xs sm:text-sm font-bold text-[#F5F7FA] group-hover:text-white line-clamp-2 leading-snug transition-colors">
                          {art.title}
                        </h3>

                        {art.deck && (
                          <p className="text-[11px] text-[#A4ADBB] line-clamp-2 leading-relaxed">
                            {art.deck}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 mt-2 border-t border-[#252D39]/40 flex items-center justify-between text-[11px] text-[#075DEB] font-semibold">
                        <span className="text-[#707B8B] truncate max-w-[120px]">
                          {art.reporter_name || 'Desk Staff'}
                        </span>
                        <span className="flex items-center gap-0.5">
                          Read Article <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}


            {/* ==================================================
                SECTION E: SPECIAL INVESTIGATIONS & GROUND DESKS (DYNAMIC)
                ================================================== */}
            {specialInvestigations.length > 0 && (
              <section aria-labelledby="top-investigations-heading">
                <div className="flex items-center justify-between mb-4 border-b border-[#252D39] pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#075DEB]" />
                    <h2 id="top-investigations-heading" className="text-sm font-black uppercase tracking-wider text-white">
                      Special Investigations & Ground Desks
                    </h2>
                  </div>
                  <Link 
                    href="/category/investigations" 
                    className="text-xs font-bold text-[#075DEB] hover:underline flex items-center gap-1 uppercase tracking-wider"
                  >
                    Investigations Desk <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {specialInvestigations.map((art) => (
                    <Link
                      key={art.id}
                      href={`/article/${art.slug}`}
                      className="group flex flex-col rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] overflow-hidden transition-all shadow-sm"
                    >
                      <div className="relative aspect-[16/10] bg-black overflow-hidden">
                        <img
                          src={art.featured_image}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded border border-white/10">
                            {art.reporter_name ? `Author: ${art.reporter_name}` : 'NEWSIGHT Bureau'}
                          </span>
                          <span className="text-[10px] font-mono text-[#A4ADBB]">
                            {art.reading_time_minutes || 6} Min Read
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-[#075DEB] transition-colors line-clamp-2 leading-snug">
                            {art.title}
                          </h3>
                          {art.deck && (
                            <p className="text-xs text-[#A4ADBB] line-clamp-2 mt-1 leading-relaxed">
                              {art.deck}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[#252D39]/40 flex items-center justify-between text-[11px]">
                          <span className="text-[#707B8B] font-medium">{formatDate(art.published_at || art.created_at)}</span>
                          <span className="font-bold text-[#075DEB] flex items-center gap-0.5 uppercase tracking-wider text-[10px]">
                            Read Investigation <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}


            {/* ==================================================
                SECTION F: TOP STORIES (DYNAMIC)
                ================================================== */}
            {topStoriesArticles.length > 0 && (
              <section aria-labelledby="top-stories-heading">
                <div className="flex items-center justify-between mb-4 border-b border-[#252D39] pb-2.5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <h2 id="top-stories-heading" className="text-sm font-black uppercase tracking-wider text-white">
                      Top Stories & Most Read Reports
                    </h2>
                  </div>
                  <Link 
                    href="/category/top-stories" 
                    className="text-xs font-bold text-[#075DEB] hover:underline flex items-center gap-1 uppercase tracking-wider"
                  >
                    Full Rankings <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topStoriesArticles.map((art, idx) => (
                    <Link
                      key={art.id}
                      href={`/article/${art.slug}`}
                      className="relative flex flex-col justify-between p-3.5 rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] transition-all group"
                    >
                      <div className="space-y-2.5">
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-black/50 border border-[#252D39]/60">
                          <img
                            src={art.featured_image}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/85 text-amber-400 border border-amber-400/30 flex items-center justify-center text-xs font-black font-mono shadow-md">
                            #{idx + 1}
                          </span>
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-[10px] font-mono text-zinc-300 rounded">
                            {art.reading_time_minutes || 5} min read
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#707B8B]">
                          <span className="font-bold text-[#E50914] uppercase">{art.category_name || 'Top Story'}</span>
                          <span>{formatDate(art.published_at || art.created_at)}</span>
                        </div>

                        <h3 className="text-xs sm:text-sm font-bold text-[#F5F7FA] group-hover:text-[#075DEB] transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h3>

                        {art.deck && (
                          <p className="text-[11px] text-[#A4ADBB] line-clamp-2 leading-relaxed">
                            {art.deck}
                          </p>
                        )}
                      </div>

                      <div className="pt-2.5 mt-2.5 border-t border-[#252D39]/40 flex items-center justify-between text-[11px] text-[#075DEB] font-semibold">
                        <span>Read Article</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}


            {/* ==================================================
                SECTION G: LATEST NEWS (WRITTEN JOURNALISM SECTION)
                ================================================== */}
            {latestArticles.length > 0 && (
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
                    href="/category/top-stories" 
                    className="text-xs font-bold text-[#075DEB] hover:underline flex items-center gap-1 uppercase tracking-wider shrink-0"
                  >
                    All Desks <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Multi-column Editorial Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Main Article Stream */}
                  <div className={`${politicsArticles.length > 0 || techArticles.length > 0 || opinionArticles.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
                    {latestArticles.slice(0, 6).map((art) => (
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
                              <span>{art.reading_time_minutes || 5} min read</span>
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#075DEB] transition-colors leading-snug">
                              {art.title}
                            </h3>
                            {art.deck && (
                              <p className="text-xs text-[#A4ADBB] line-clamp-2 mt-1.5 leading-relaxed">
                                {art.deck}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 mt-2 border-t border-[#252D39]/40 flex items-center justify-between text-[11px] text-[#707B8B]">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              {art.category_name || 'Article'}
                            </span>
                            <span className="text-[#075DEB] font-semibold flex items-center gap-0.5">
                              Read Story <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Right Beats & Desks Rail (Only if beats have articles) */}
                  {(politicsArticles.length > 0 || techArticles.length > 0 || opinionArticles.length > 0) && (
                    <div className="lg:col-span-5 space-y-6">
                      
                      {/* Politics Desk Box */}
                      {politicsArticles.length > 0 && (
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
                      )}

                      {/* Technology & AI Desk Box */}
                      {techArticles.length > 0 && (
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
                      )}

                      {/* Opinion & Editorial Columns */}
                      {opinionArticles.length > 0 && (
                        <div className="p-4 rounded-xl bg-[#0E131C] border border-[#252D39]">
                          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#252D39]">
                            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                              Editorial Opinion & Essays
                            </span>
                            <Link href="/opinion" className="text-[11px] font-semibold text-[#075DEB] hover:underline">
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
                  )}

                </div>
              </section>
            )}

          </>
        )}
      </div>
    </PublicLayout>
  );
}
