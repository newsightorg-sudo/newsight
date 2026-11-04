import React from 'react';
import Link from 'next/link';
import { Camera, ArrowRight } from 'lucide-react';
import { PhotoStory } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface PhotoStoriesRailProps {
  photoStories: PhotoStory[];
}

export default function PhotoStoriesRail({ photoStories }: PhotoStoriesRailProps) {
  if (!photoStories || photoStories.length === 0) return null;

  return (
    <section className="py-8 border-b border-zinc-200">
      <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3 mb-6">
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-zinc-900" />
          <h3 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-950">
            Photo Journalism & Visual Essays
          </h3>
        </div>
        <Link
          href="/photos"
          className="text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-red-700 flex items-center space-x-1"
        >
          <span>All Visual Stories</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photoStories.map((story) => (
          <article key={story.id} className="group flex flex-col justify-between bg-zinc-900 text-white p-4">
            <div>
              <Link href={`/photos/${story.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-black mb-3">
                <img
                  src={story.featured_image}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <span className="absolute bottom-2 left-2 bg-black/80 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 text-zinc-200 flex items-center space-x-1">
                  <Camera className="w-3 h-3" />
                  <span>Photo Essay</span>
                </span>
              </Link>

              <h4 className="font-headline text-lg sm:text-xl font-bold text-zinc-100 group-hover:text-red-400 transition leading-snug">
                <Link href={`/photos/${story.slug}`}>
                  {story.title}
                </Link>
              </h4>

              <p className="mt-2 text-xs sm:text-sm text-zinc-400 font-sans line-clamp-2">
                {story.summary}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
              <span>Photo: {story.photographer}</span>
              <Link
                href={`/photos/${story.slug}`}
                className="font-semibold text-zinc-200 hover:text-white flex items-center space-x-1"
              >
                <span>View Gallery</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
