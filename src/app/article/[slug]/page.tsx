import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  getArticleBySlug, getRelatedArticles, getEditorialSettings, 
  getCommentsForArticle, getVideosByCategory 
} from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import PublicLayout from '@/components/public/PublicLayout';
import ReadingProgressBar from '@/components/public/ReadingProgressBar';
import SocialShareBar from '@/components/public/SocialShareBar';
import CommentBox from '@/components/public/CommentBox';
import VideoCard from '@/components/public/VideoCard';
import { 
  Clock, Calendar, AlertTriangle, User, PlaySquare, ChevronRight, Share2 
} from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Article Not Found | NEWSIGHT' };

  return {
    title: `${article.title} | NEWSIGHT`,
    description: article.deck,
    openGraph: {
      title: article.title,
      description: article.deck,
      images: [article.featured_image],
      type: 'article',
      publishedTime: article.published_at || undefined,
      authors: [article.reporter_name || 'NEWSIGHT'],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const user = await getCurrentUser();
  const settings = getEditorialSettings();
  const relatedArticles = getRelatedArticles(article.id, article.category_id, 3);
  const relatedVideos = getVideosByCategory(article.category_name || 'News', 3);
  const comments = getCommentsForArticle(article.id);

  // Schema.org NewsArticle structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.deck,
    image: [article.featured_image],
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: [{
      '@type': 'Person',
      name: article.reporter_name,
      jobTitle: article.reporter_title,
    }],
    publisher: {
      '@type': 'Organization',
      name: 'NEWSIGHT',
      logo: {
        '@type': 'ImageObject',
        url: 'https://newsight.media/logo3.png',
      },
    },
  };

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgressBar />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#707B8B] uppercase tracking-wider">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/category/${article.category_slug}`} className="hover:text-white text-[#075DEB] font-bold">
            {article.category_name}
          </Link>
          {article.district && (
            <>
              <span>/</span>
              <span className="text-[#A4ADBB]">{article.district}</span>
            </>
          )}
        </nav>

        {/* Main Editorial Headline */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#F5F7FA] leading-tight tracking-tight">
          {article.title}
        </h1>

        {/* Subheadline / Deck */}
        <p className="text-base sm:text-lg text-[#A4ADBB] leading-relaxed border-l-2 border-[#E50914] pl-4 py-1 italic">
          {article.deck}
        </p>

        {/* Reporter Card & Editorial Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-[#252D39] text-xs text-[#A4ADBB]">
          <div className="flex items-center gap-3">
            {article.reporter_avatar ? (
              <img
                src={article.reporter_avatar}
                alt={article.reporter_name || 'Reporter'}
                className="w-11 h-11 rounded-full object-cover border border-[#252D39]"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#1B2432] flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
            )}
            <div>
              <Link
                href={`/reporters/${article.reporter_slug || ''}`}
                className="font-bold text-sm text-white hover:text-[#075DEB] transition block"
              >
                {article.reporter_name}
              </Link>
              <span className="text-[#707B8B] text-[11px]">
                {article.reporter_title || 'Correspondent, NEWSIGHT'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end text-[#707B8B] text-xs space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#A4ADBB]" />
              <span>Published: {formatDate(article.published_at || article.created_at, 'full')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#A4ADBB]" />
              <span>{article.reading_time_minutes} min read</span>
            </div>
          </div>
        </div>

        {/* Social Sharing Bar */}
        <div className="py-2 flex items-center justify-between">
          <SocialShareBar
            url={`https://newsight.media/article/${article.slug}`}
            title={article.title}
          />
        </div>

        {/* Featured Image */}
        <figure className="rounded-xl overflow-hidden border border-[#252D39] bg-black">
          <div className="relative aspect-[16/9] w-full">
            <img
              src={article.featured_image}
              alt={article.image_caption || article.title}
              className="w-full h-full object-cover"
            />
          </div>
          {(article.image_caption || article.image_credit) && (
            <figcaption className="p-3 bg-[#0E131C] text-xs text-[#707B8B] flex flex-col sm:flex-row justify-between gap-1">
              <span>{article.image_caption}</span>
              {article.image_credit && (
                <span className="font-semibold text-[#A4ADBB] shrink-0">Photo: {article.image_credit}</span>
              )}
            </figcaption>
          )}
        </figure>

        {/* Correction Notice Alert if applicable */}
        {article.correction_notice && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Correction & Editorial Update:</strong>
              <p className="mt-0.5 leading-relaxed">{article.correction_notice}</p>
            </div>
          </div>
        )}

        {/* Article Body Content */}
        <div 
          className="article-prose pt-4"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {/* Source attribution */}
        {article.source_attribution && (
          <div className="p-3.5 rounded-lg bg-[#0E131C] border border-[#252D39] text-xs text-[#707B8B]">
            <strong className="text-[#A4ADBB]">Source Attribution:</strong> {article.source_attribution}
          </div>
        )}

        {/* Related Videos Rail */}
        {relatedVideos.length > 0 && (
          <section className="pt-8 border-t border-[#252D39] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlaySquare className="w-4 h-4 text-[#E50914]" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Related Video Broadcasts
                </h3>
              </div>
              <Link href="/video" className="text-xs font-bold text-[#075DEB] hover:underline uppercase">
                All Videos
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedVideos.map((vid) => (
                <VideoCard key={vid.id} video={vid} />
              ))}
            </div>
          </section>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="pt-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white pb-2 border-b border-[#252D39]">
              More from {article.category_name}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((art) => (
                <Link
                  key={art.id}
                  href={`/article/${art.slug}`}
                  className="p-3.5 rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] block group transition-colors"
                >
                  <h4 className="text-xs font-bold text-white group-hover:text-[#075DEB] line-clamp-2 leading-snug">
                    {art.title}
                  </h4>
                  <p className="text-[11px] text-[#707B8B] mt-2">
                    {formatDate(art.published_at || art.created_at)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Comment Section */}
        <section className="pt-8 border-t border-[#252D39]">
          <CommentBox
            articleId={article.id}
            initialComments={comments}
          />
        </section>

      </article>
    </PublicLayout>
  );
}
