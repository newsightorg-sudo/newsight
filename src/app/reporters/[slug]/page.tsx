import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  getReporterBySlug, getArticlesByReporter, getVideos 
} from '@/lib/data';
import { formatDate } from '@/lib/utils';
import PublicLayout from '@/components/public/PublicLayout';
import VideoCard from '@/components/public/VideoCard';
import { 
  Mail, Clock, ArrowRight, ShieldCheck, Globe, PlaySquare, 
  Newspaper, ChevronRight 
} from 'lucide-react';

interface ReporterPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ReporterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const reporter = getReporterBySlug(slug);
  if (!reporter) return { title: 'Reporter Not Found | NEWSIGHT' };

  return {
    title: `${reporter.name} — Byline Archive | NEWSIGHT`,
    description: reporter.bio,
  };
}

export default async function ReporterProfilePage({ params }: ReporterPageProps) {
  const { slug } = await params;
  const reporter = getReporterBySlug(slug);

  if (!reporter) {
    notFound();
  }

  const articles = getArticlesByReporter(reporter.id, 20);
  const reporterVideos = getVideos(12).filter(v => v.reporter_id === reporter.id);

  return (
    <PublicLayout>
      <div className="px-3 sm:px-6 lg:px-8 py-6 space-y-8 max-w-6xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#707B8B]">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/reporters" className="hover:text-white transition-colors">Reporters</Link>
          <span>/</span>
          <span className="text-[#A4ADBB]">{reporter.name}</span>
        </div>

        {/* Profile Bio Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0E131C] border border-[#252D39] flex flex-col sm:flex-row items-start gap-6">
          <img
            src={reporter.avatar_url}
            alt={reporter.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-[#252D39] shrink-0"
          />

          <div className="flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#075DEB]/20 text-[#075DEB] border border-[#075DEB]/30 text-[10px] font-bold uppercase rounded">
                BEAT: {reporter.beat}
              </span>
              <span className="text-[10px] text-[#707B8B] font-mono">
                Staff Correspondent
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {reporter.name}
            </h1>

            <p className="text-xs font-semibold text-[#A4ADBB]">
              {reporter.title}
            </p>

            <p className="text-xs sm:text-sm text-[#A4ADBB] leading-relaxed pt-1">
              {reporter.bio}
            </p>

            <div className="pt-3 border-t border-[#252D39]/60 flex items-center gap-4 text-xs text-[#707B8B]">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#075DEB]" />
                <span className="text-[#F5F7FA]">{reporter.email}</span>
              </span>
              {reporter.twitter && (
                <span className="flex items-center gap-1 text-[#075DEB]">
                  <span>{reporter.twitter}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Published Video Reports */}
        {reporterVideos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#252D39] pb-2">
              <div className="flex items-center gap-2">
                <PlaySquare className="w-4 h-4 text-[#E50914]" />
                <h2 className="text-sm font-black uppercase tracking-wider text-white">
                  Video Dispatches by {reporter.name} ({reporterVideos.length})
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reporterVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}

        {/* Published Articles */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-[#252D39] pb-2">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#075DEB]" />
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Written Bylines & Investigative Reports ({articles.length})
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {articles.map((art) => (
              <Link
                key={art.id}
                href={`/article/${art.slug}`}
                className="p-4 rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] flex flex-col sm:flex-row gap-4 group transition-colors"
              >
                <div className="relative w-full sm:w-44 aspect-video shrink-0 bg-black rounded-lg overflow-hidden border border-[#252D39]/50">
                  <img
                    src={art.featured_image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] text-[#707B8B] mb-1">
                      <span className="text-[#075DEB] font-bold uppercase">{art.category_name}</span>
                      <span>•</span>
                      <span>{formatDate(art.published_at || art.created_at)}</span>
                      <span>•</span>
                      <span>{art.reading_time_minutes} min read</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#075DEB] leading-snug">
                      {art.title}
                    </h3>
                    <p className="text-xs text-[#A4ADBB] line-clamp-2 mt-1 leading-relaxed">
                      {art.deck}
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-[#252D39]/40 text-xs text-[#075DEB] font-semibold flex items-center gap-0.5">
                    <span>Read Article</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </PublicLayout>
  );
}
