import React from 'react';
import Link from 'next/link';
import { ArrowRight, Feather } from 'lucide-react';
import { Article } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface OpinionSectionProps {
  opinions: Article[];
}

export default function OpinionSection({ opinions }: OpinionSectionProps) {
  if (!opinions || opinions.length === 0) return null;

  return (
    <section className="py-8 border-b border-zinc-200 bg-zinc-50/60 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3 mb-6">
          <div className="flex items-center space-x-2">
            <Feather className="w-5 h-5 text-zinc-800" />
            <h3 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-950">
              Opinion & Editorial Analysis
            </h3>
          </div>
          <Link
            href="/opinion"
            className="text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-red-700 flex items-center space-x-1 transition"
          >
            <span>All Columns & Essays</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Opinion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {opinions.map((op) => (
            <article
              key={op.id}
              className="bg-white p-5 border border-zinc-200 flex flex-col justify-between group hover:border-zinc-400 transition shadow-xs"
            >
              <div>
                {/* Author Card Header */}
                <div className="flex items-center space-x-3 pb-3 mb-3 border-b border-zinc-100">
                  {op.reporter_avatar ? (
                    <img
                      src={op.reporter_avatar}
                      alt={op.reporter_name || 'Columnist'}
                      className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition duration-300"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center font-serif text-lg font-bold text-zinc-600">
                      {op.reporter_name?.charAt(0) || 'C'}
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-700">
                      Editorial Column
                    </span>
                    <h4 className="text-sm font-bold text-zinc-900 leading-tight">
                      {op.reporter_name}
                    </h4>
                    <span className="text-[11px] text-zinc-500 line-clamp-1">
                      {op.reporter_title || 'Contributing Editor'}
                    </span>
                  </div>
                </div>

                {/* Opinion Headline */}
                <h5 className="font-headline text-lg font-bold text-zinc-950 group-hover:text-red-900 transition-colors leading-snug">
                  <Link href={`/article/${op.slug}`}>
                    "{op.title}"
                  </Link>
                </h5>

                {/* Excerpt / Deck */}
                <p className="mt-2 text-xs sm:text-sm text-zinc-600 font-sans line-clamp-3 leading-relaxed">
                  {op.deck}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400 font-sans">
                <span>{op.reading_time_minutes} min read</span>
                <Link
                  href={`/article/${op.slug}`}
                  className="font-semibold text-zinc-800 group-hover:text-red-700 flex items-center space-x-0.5"
                >
                  <span>Read Essay</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
