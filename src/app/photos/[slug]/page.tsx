import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPhotoStoryBySlug, getEditorialSettings, getCategories } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import PublicLayout from '@/components/public/PublicLayout';
import { Camera, Calendar, User } from 'lucide-react';

interface PhotoStoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PhotoStoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = getPhotoStoryBySlug(slug);
  if (!story) return { title: 'Photo Essay Not Found' };

  return {
    title: `${story.title} | NEWSIGHT Visual Journalism`,
    description: story.summary,
  };
}

export default async function PhotoStoryDetailPage({ params }: PhotoStoryPageProps) {
  const { slug } = await params;
  const story = getPhotoStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  const user = await getCurrentUser();
  const settings = getEditorialSettings();
  const categories = getCategories(true);

  return (
    <PublicLayout
      user={user}
      settings={settings}
      categories={categories}
      activeSidebar="categories"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-sans uppercase tracking-wider text-[#707B8B] mb-4">
          <Link href="/photos" className="hover:text-[#E50914] transition">Photo Stories</Link>
          <span>/</span>
          <span className="text-[#F5F7FA] font-bold">Visual Chronicle</span>
        </nav>

        {/* Title & Deck */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F5F7FA] leading-tight tracking-tight">
          {story.title}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#A4ADBB] font-sans leading-relaxed border-l-3 border-[#E50914] pl-4">
          {story.summary}
        </p>

        {/* Attribution Bar */}
        <div className="mt-6 py-3 border-y border-[#252D39] text-xs font-sans text-[#A4ADBB] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4 text-[#E50914]" />
            <span>Photography by <strong className="text-[#F5F7FA]">{story.photographer}</strong></span>
          </div>
          <div>
            <span>Published {formatDate(story.published_at, 'full')}</span>
          </div>
        </div>

        {/* Gallery of Images */}
        <div className="my-10 space-y-12">
          {story.items?.map((item, idx) => (
            <figure key={item.id} className="border border-[#252D39] bg-[#121925] p-3 sm:p-5 rounded-xl">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#080B11] rounded-lg">
                <img
                  src={item.image_url}
                  alt={item.caption}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-[#080B11]/80 backdrop-blur-sm text-[#F5F7FA] font-mono text-xs px-2.5 py-1 rounded border border-[#252D39]">
                  Plate #{idx + 1}
                </span>
              </div>
              <figcaption className="mt-4 text-xs sm:text-sm text-[#A4ADBB] font-sans flex flex-col sm:flex-row justify-between gap-2 pt-3 border-t border-[#252D39]">
                <p className="leading-relaxed flex-1 text-[#F5F7FA]">{item.caption}</p>
                {item.credit && (
                  <span className="text-[#707B8B] text-xs italic shrink-0">
                    Photo: {item.credit}
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

