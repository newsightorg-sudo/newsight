'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Clock, ArrowRight, Video, CheckCircle2 } from 'lucide-react';
import { VideoItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import VideoPlayer from '@/components/public/VideoPlayer';

interface VideoJournalismRailProps {
  videos: VideoItem[];
}

export default function VideoJournalismRail({ videos }: VideoJournalismRailProps) {
  if (!videos || videos.length === 0) return null;

  const [activeVideo, setActiveVideo] = useState<VideoItem>(videos[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  return (
    <section className="bg-zinc-950 text-white py-10 my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-6">
          <div className="flex items-center space-x-2.5">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-red-500">
              Audio-Visual Desk
            </span>
            <span className="text-zinc-600">|</span>
            <h3 className="font-headline text-xl sm:text-2xl font-bold text-zinc-100">
              Video Journalism & Documentaries
            </h3>
          </div>
          <Link
            href="/video"
            className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white flex items-center space-x-1 transition"
          >
            <span>All Video Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Featured Video Player & Playlist Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Video Player (8 cols) */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden shadow-2xl">
              <VideoPlayer
                src={activeVideo.video_url}
                poster={activeVideo.thumbnail_url}
                title={activeVideo.title}
              />
            </div>

            {/* Video Details */}
            <div className="mt-4">
              <div className="flex items-center space-x-3 text-xs text-zinc-400 font-sans mb-1.5">
                <span className="bg-red-950 text-red-400 font-bold uppercase tracking-wider px-2 py-0.5 border border-red-900/50">
                  {activeVideo.category.replace('_', ' ')}
                </span>
                <span>•</span>
                <span>{formatDate(activeVideo.published_at, 'full')}</span>
                {activeVideo.reporter_name && (
                  <>
                    <span>•</span>
                    <span className="text-zinc-300">By {activeVideo.reporter_name}</span>
                  </>
                )}
              </div>
              <h4 className="font-headline text-xl sm:text-2xl font-bold text-white leading-snug">
                {activeVideo.title}
              </h4>
              <p className="mt-2 text-sm text-zinc-300 font-sans leading-relaxed">
                {activeVideo.summary}
              </p>
            </div>
          </div>

          {/* Playlist Rail (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-800 pb-2">
              Recent Dispatches ({videos.length})
            </h4>

            <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1">
              {videos.map((vid) => {
                const isCurrent = vid.id === activeVideo.id;
                return (
                  <div
                    key={vid.id}
                    onClick={() => {
                      setActiveVideo(vid);
                      setIsPlaying(true);
                    }}
                    className={`flex gap-3 p-2.5 rounded cursor-pointer transition border ${
                      isCurrent
                        ? 'bg-zinc-900 border-red-700/60'
                        : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-28 h-18 shrink-0 overflow-hidden bg-zinc-800">
                      <img
                        src={vid.thumbnail_url}
                        alt={vid.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/85 text-[10px] font-mono px-1 text-white">
                        {vid.duration}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col justify-between overflow-hidden">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                        {vid.category.replace('_', ' ')}
                      </span>
                      <h5 className="text-xs font-semibold text-zinc-200 line-clamp-2 hover:text-white transition">
                        {vid.title}
                      </h5>
                      <span className="text-[10px] text-zinc-500 mt-1">
                        {vid.reporter_name || 'NEWSIGHT Video'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
