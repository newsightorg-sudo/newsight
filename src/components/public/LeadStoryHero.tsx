import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, User } from 'lucide-react';
import { Article } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface LeadStoryHeroProps {
  leadStory: Article | null;
  secondaryStories: Article[];
}

export default function LeadStoryHero({
  leadStory,
  secondaryStories,
}: LeadStoryHeroProps) {
  if (!leadStory) return null;

  return (
    <section className="border-b border-zinc-200 pb-8 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Lead Story (8 cols on desktop) */}
        <article className="lg:col-span-8 group">
          <Link href={`/article/${leadStory.slug}`} className="block">
            {/* Featured Image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 mb-4 rounded-none border border-zinc-200">
              <img
                src={leadStory.featured_image}
                alt={leadStory.title}
                className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                loading="eager"
              />
              {leadStory.category_name && (
                <span className="absolute top-3 left-3 bg-zinc-900/90 text-white font-sans text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 backdrop-blur-sm">
                  {leadStory.category_name}
                </span>
              )}
            </div>

            {/* Headline */}
            <h2 className="headline-lead text-2xl sm:text-3xl lg:text-4xl text-zinc-950 group-hover:text-red-900 transition-colors">
              {leadStory.title}
            </h2>
          </Link>

          {/* Subheadline / Deck */}
          <p className="mt-3 text-base sm:text-lg text-zinc-700 font-sans leading-relaxed">
            {leadStory.deck}
          </p>

          {/* Byline and Metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500 font-sans border-t border-zinc-100 pt-3">
            {leadStory.reporter_name && (
              <div className="flex items-center space-x-1.5 font-semibold text-zinc-800">
                {leadStory.reporter_avatar && (
                  <img
                    src={leadStory.reporter_avatar}
                    alt={leadStory.reporter_name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                )}
                <Link
                  href={`/reporters/${leadStory.reporter_slug || ''}`}
                  className="hover:text-red-700 transition"
                >
                  By {leadStory.reporter_name}
                </Link>
              </div>
            )}
            <span>•</span>
            <time dateTime={leadStory.published_at}>
              {formatDate(leadStory.published_at, 'full')}
            </time>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{leadStory.reading_time_minutes} min read</span>
            </span>
          </div>
        </article>

        {/* Secondary Stories Column (4 cols on desktop) */}
        <aside aria-label="Secondary Lead Stories" className="lg:col-span-4 lg:border-l lg:border-zinc-200 lg:pl-8 space-y-6">
          <div className="border-b-2 border-zinc-900 pb-1.5 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900">
              Developing & Secondary Leads
            </h3>
          </div>

          {secondaryStories.map((story, idx) => (
            <article
              key={story.id}
              className={`group ${
                idx !== secondaryStories.length - 1 ? 'border-b border-zinc-200 pb-5' : ''
              }`}
            >
              <div className="flex flex-col gap-2">
                {/* Category kicker */}
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-red-800 font-sans">
                  <span>{story.category_name || 'News'}</span>
                  <span className="text-zinc-400 font-normal">
                    {formatDate(story.published_at, 'relative')}
                  </span>
                </div>

                {/* Secondary Headline */}
                <h4 className="headline-card text-lg sm:text-xl text-zinc-900 group-hover:text-red-900 transition-colors">
                  <Link href={`/article/${story.slug}`}>
                    {story.title}
                  </Link>
                </h4>

                {/* Thumbnail if present */}
                {story.featured_image && idx === 0 && (
                  <Link href={`/article/${story.slug}`} className="block mt-1">
                    <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-100 border border-zinc-200">
                      <img
                        src={story.featured_image}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                )}

                {/* Summary */}
                <p className="text-xs sm:text-sm text-zinc-600 font-sans line-clamp-2 mt-1">
                  {story.deck}
                </p>

                {/* Reporter Byline */}
                {story.reporter_name && (
                  <div className="text-[11px] text-zinc-500 font-sans mt-1">
                    By <span className="font-semibold text-zinc-700">{story.reporter_name}</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </aside>
      </div>
    </section>
  );
}
