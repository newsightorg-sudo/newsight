import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getOpinionArticles, getEditorialSettings, getCategories } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import PublicLayout from '@/components/public/PublicLayout';
import { Feather, ArrowRight, Quote } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Opinion, Columns & Editorials | NEWSIGHT',
  description: 'Rigorous commentary, philosophical essays, legal analysis, and editorial stances on governance and society.',
};

export default async function OpinionPage() {
  const user = await getCurrentUser();
  const settings = getEditorialSettings();
  const categories = getCategories(true);
  const opinions = getOpinionArticles(12);

  return (
    <PublicLayout
      user={user}
      settings={settings}
      categories={categories}
      activeSidebar="categories"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Masthead */}
        <div className="border-b border-[#252D39] pb-6 mb-8">
          <div className="flex items-center space-x-2 text-[#E50914] font-sans text-xs font-extrabold uppercase tracking-widest mb-2">
            <Feather className="w-4 h-4" />
            <span>NEWSIGHT Editorial Board & Columnists</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F5F7FA] tracking-tight">
            Opinion, Analysis & Cultural Essays
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#A4ADBB] font-sans max-w-3xl leading-relaxed">
            Unfettered viewpoints, constitutional perspectives, economic scrutiny, and long-form philosophical inquiries from senior correspondents and contributing scholars.
          </p>
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opinions.map((op) => (
            <article
              key={op.id}
              className="p-6 border border-[#252D39] bg-[#121925] rounded-xl flex flex-col justify-between group hover:bg-[#1B2432]/70 hover:border-[#252D39]/80 transition duration-200"
            >
              <div>
                {/* Columnist info */}
                <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-[#252D39]">
                  {op.reporter_avatar && (
                    <img
                      src={op.reporter_avatar}
                      alt={op.reporter_name || 'Columnist'}
                      className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition"
                    />
                  )}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E50914] block">
                      Columnist
                    </span>
                    <h3 className="text-sm font-bold text-[#F5F7FA]">
                      {op.reporter_name}
                    </h3>
                    <span className="text-xs text-[#707B8B] line-clamp-1">
                      {op.reporter_title || 'Contributing Editor'}
                    </span>
                  </div>
                </div>

                {/* Headline */}
                <h2 className="text-lg sm:text-xl font-bold text-[#F5F7FA] group-hover:text-[#E50914] transition leading-snug">
                  <Link href={`/article/${op.slug}`}>
                    "{op.title}"
                  </Link>
                </h2>

                {/* Excerpt */}
                <p className="mt-3 text-xs sm:text-sm text-[#A4ADBB] font-sans line-clamp-3 leading-relaxed">
                  {op.deck}
                </p>
              </div>

              {/* Byline Footer */}
              <div className="mt-6 pt-4 border-t border-[#252D39] text-xs text-[#707B8B] font-sans flex items-center justify-between">
                <span>{op.reading_time_minutes} min read</span>
                <Link
                  href={`/article/${op.slug}`}
                  className="font-bold text-[#F5F7FA] group-hover:text-[#E50914] flex items-center space-x-1"
                >
                  <span>Read Full Essay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

