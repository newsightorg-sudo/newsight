import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPhotoStories, getEditorialSettings, getCategories } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import PublicLayout from '@/components/public/PublicLayout';
import { Camera, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Photo Stories & Visual Journalism | NEWSIGHT',
  description: 'Documentary photography, coastal chronicles, cultural heritage, and ground photo essays.',
};

export default async function PhotoStoriesPage() {
  const user = await getCurrentUser();
  const settings = getEditorialSettings();
  const categories = getCategories(true);
  const stories = getPhotoStories(10);

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
            <Camera className="w-4 h-4" />
            <span>Documentary Photography Unit</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F5F7FA] tracking-tight">
            Photo Essays & Visual Chronicles
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#A4ADBB] font-sans max-w-2xl leading-relaxed">
            High-resolution visual narratives documenting environmental transformations, frontline communities, craftsmanship, and historic moments.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stories.map((story) => (
            <article key={story.id} className="group border border-[#252D39] bg-[#121925] rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#1B2432] transition duration-200">
              <div>
                <Link href={`/photos/${story.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-[#0A0E15]">
                  <img
                    src={story.featured_image}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute bottom-3 left-3 bg-[#080B11]/85 backdrop-blur-md text-[#F5F7FA] text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded border border-[#252D39] flex items-center space-x-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#E50914]" />
                    <span>Photo Essay • {story.items?.length || 3} Plates</span>
                  </span>
                </Link>

                <div className="p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] group-hover:text-[#E50914] transition leading-snug">
                    <Link href={`/photos/${story.slug}`}>
                      {story.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-xs sm:text-sm text-[#A4ADBB] font-sans leading-relaxed line-clamp-3">
                    {story.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-[#252D39] text-xs text-[#707B8B] font-sans flex items-center justify-between">
                <span>Photography: <strong className="text-[#A4ADBB]">{story.photographer}</strong></span>
                <Link
                  href={`/photos/${story.slug}`}
                  className="font-bold text-[#F5F7FA] group-hover:text-[#E50914] flex items-center space-x-1"
                >
                  <span>View Full Essay</span>
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

