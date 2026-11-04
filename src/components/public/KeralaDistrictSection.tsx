'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { Article } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface KeralaDistrictSectionProps {
  initialArticles: Article[];
}

const DISTRICTS = [
  'All',
  'Wayanad',
  'Kochi',
  'Thiruvananthapuram',
  'Kozhikode',
  'Thrissur',
  'Kannur',
  'Alappuzha',
];

export default function KeralaDistrictSection({
  initialArticles,
}: KeralaDistrictSectionProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');

  const filteredArticles = selectedDistrict === 'All'
    ? initialArticles
    : initialArticles.filter(
        (a) => a.district?.toLowerCase() === selectedDistrict.toLowerCase()
      );

  return (
    <section className="py-6 border-b border-[#252D39]">
      {/* Section Header with District Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#252D39] pb-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-sans text-xs font-extrabold uppercase tracking-widest">
            <MapPin className="w-4 h-4" />
            <span>Southern Bureau Desk</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA] mt-1">
            Kerala & Regional Reporting
          </h3>
          <p className="text-xs text-[#A4ADBB] font-sans mt-0.5">
            Decentralized ground reports, coastal ecology, district governance, and Malabar commerce.
          </p>
        </div>

        {/* District Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs font-semibold">
          {DISTRICTS.map((dist) => (
            <button
              key={dist}
              onClick={() => setSelectedDistrict(dist)}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer text-xs font-semibold ${
                selectedDistrict === dist
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-[#121925] border border-[#252D39] text-[#A4ADBB] hover:text-[#F5F7FA] hover:bg-[#1B2432]'
              }`}
            >
              {dist}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      {filteredArticles.length === 0 ? (
        <div className="py-12 text-center text-[#707B8B] font-sans text-sm bg-[#121925] border border-dashed border-[#252D39] rounded-xl">
          No dispatches filed for {selectedDistrict} district in this edition. View other districts above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, idx) => (
            <article
              key={article.id}
              className={`group flex flex-col justify-between bg-[#121925] border border-[#252D39] hover:border-[#1B2432] p-4 rounded-xl transition duration-200 ${
                idx === 0 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div>
                {/* Photo */}
                {article.featured_image && (
                  <Link href={`/article/${article.slug}`} className="block mb-3">
                    <div className="aspect-[16/10] w-full overflow-hidden bg-[#0A0E15] rounded-lg border border-[#252D39]/50">
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                )}

                {/* District Tag */}
                <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-sans mb-1.5">
                  <span className="bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    {article.district || 'Kerala'}
                  </span>
                  <span className="text-[#707B8B] font-normal">
                    {formatDate(article.published_at, 'relative')}
                  </span>
                </div>

                {/* Headline */}
                <h4 className="text-base sm:text-lg font-bold text-[#F5F7FA] group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                  <Link href={`/article/${article.slug}`}>
                    {article.title}
                  </Link>
                </h4>

                {/* Deck */}
                <p className="mt-2 text-xs sm:text-sm text-[#A4ADBB] font-sans line-clamp-3 leading-relaxed">
                  {article.deck}
                </p>
              </div>

              {/* Byline */}
              <div className="mt-4 pt-3 border-t border-[#252D39] text-xs text-[#707B8B] font-sans flex items-center justify-between">
                <span>By <strong className="text-[#A4ADBB]">{article.reporter_name || 'Kerala Bureau'}</strong></span>
                <Link
                  href={`/article/${article.slug}`}
                  className="font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center space-x-1"
                >
                  <span>Read</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Section Footer Link */}
      <div className="mt-6 text-center">
        <Link
          href="/regional/kerala"
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-white transition bg-[#121925] border border-[#252D39] hover:border-emerald-500/50 px-4 py-2 rounded-lg"
        >
          <span>Explore Complete Kerala Regional Archive</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
