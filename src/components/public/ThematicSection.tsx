import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldAlert, Sparkles, TrendingUp, Cpu } from 'lucide-react';
import { Article } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface ThematicSectionProps {
  title: string;
  categorySlug: string;
  kicker: string;
  articles: Article[];
  layoutType?: 'headline-dense' | 'lead-and-rail' | 'investigative-deep';
  accentColor?: string;
}

export default function ThematicSection({
  title,
  categorySlug,
  kicker,
  articles,
  layoutType = 'lead-and-rail',
  accentColor = '#0f172a',
}: ThematicSectionProps) {
  if (!articles || articles.length === 0) return null;

  const leadStory = articles[0];
  const otherStories = articles.slice(1, 4);

  // 1. Investigative Deep Layout
  if (layoutType === 'investigative-deep') {
    return (
      <section className="py-8 border-b border-zinc-200">
        <div className="flex items-center justify-between border-b-2 border-red-900 pb-3 mb-6">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-800" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-800 block">
                {kicker}
              </span>
              <h3 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-950">
                {title}
              </h3>
            </div>
          </div>
          <Link
            href={`/category/${categorySlug}`}
            className="text-xs font-bold uppercase tracking-wider text-red-800 hover:text-red-950 flex items-center space-x-1"
          >
            <span>All Investigations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-zinc-900 text-white p-6 sm:p-8 border border-zinc-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {leadStory.featured_image && (
              <div className="lg:col-span-7">
                <Link href={`/article/${leadStory.slug}`} className="block group">
                  <div className="aspect-[16/10] overflow-hidden border border-zinc-700 bg-zinc-800">
                    <img
                      src={leadStory.featured_image}
                      alt={leadStory.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
              </div>
            )}
            <div className="lg:col-span-5 space-y-4">
              <span className="inline-block bg-red-700 text-white text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5">
                Special Investigation
              </span>
              <h4 className="font-headline text-2xl sm:text-3xl font-bold leading-tight hover:text-red-300 transition">
                <Link href={`/article/${leadStory.slug}`}>
                  {leadStory.title}
                </Link>
              </h4>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {leadStory.deck}
              </p>
              <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                <span>By {leadStory.reporter_name}</span>
                <span>{leadStory.reading_time_minutes} min longform read</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 2. Headline Dense Layout (for Politics, World, Policy)
  if (layoutType === 'headline-dense') {
    return (
      <section className="py-8 border-b border-zinc-200">
        <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3 mb-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-600 block">
              {kicker}
            </span>
            <h3 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-950">
              {title}
            </h3>
          </div>
          <Link
            href={`/category/${categorySlug}`}
            className="text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-red-700 flex items-center space-x-1"
          >
            <span>Section Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
          {articles.slice(0, 3).map((art, idx) => (
            <article key={art.id} className={`group ${idx > 0 ? 'pt-5 md:pt-0 md:pl-6' : ''}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-800">
                {art.article_type}
              </span>
              <h4 className="headline-card text-lg sm:text-xl text-zinc-950 group-hover:text-red-900 transition mt-1">
                <Link href={`/article/${art.slug}`}>
                  {art.title}
                </Link>
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 mt-2 line-clamp-3">
                {art.deck}
              </p>
              <div className="mt-3 text-xs text-zinc-400 flex items-center justify-between">
                <span>By {art.reporter_name}</span>
                <span>{formatDate(art.published_at, 'relative')}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  // 3. Lead & Rail Layout (Standard Editorial Balance)
  return (
    <section className="py-8 border-b border-zinc-200">
      <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3 mb-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-600 block">
            {kicker}
          </span>
          <h3 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-950">
            {title}
          </h3>
        </div>
        <Link
          href={`/category/${categorySlug}`}
          className="text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-red-700 flex items-center space-x-1"
        >
          <span>More in {title}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Lead card with photo */}
        <div className="lg:col-span-7 group">
          <Link href={`/article/${leadStory.slug}`} className="block">
            {leadStory.featured_image && (
              <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-100 border border-zinc-200 mb-3">
                <img
                  src={leadStory.featured_image}
                  alt={leadStory.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                />
              </div>
            )}
            <h4 className="headline-card text-xl sm:text-2xl text-zinc-950 group-hover:text-red-900 transition">
              {leadStory.title}
            </h4>
          </Link>
          <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
            {leadStory.deck}
          </p>
          <div className="mt-3 text-xs text-zinc-400 flex items-center space-x-2">
            <span>By {leadStory.reporter_name}</span>
            <span>•</span>
            <span>{formatDate(leadStory.published_at, 'short')}</span>
          </div>
        </div>

        {/* Rail stories */}
        <div className="lg:col-span-5 space-y-4 lg:border-l lg:border-zinc-200 lg:pl-6">
          {otherStories.map((story) => (
            <article key={story.id} className="group border-b border-zinc-100 pb-4 last:border-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {story.category_name}
              </span>
              <h5 className="font-headline text-base font-bold text-zinc-900 group-hover:text-red-900 transition mt-0.5">
                <Link href={`/article/${story.slug}`}>
                  {story.title}
                </Link>
              </h5>
              <div className="mt-1 text-xs text-zinc-400">
                <span>By {story.reporter_name}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
