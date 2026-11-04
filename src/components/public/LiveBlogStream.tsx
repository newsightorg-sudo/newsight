'use client';

import React, { useState, useEffect } from 'react';
import { LiveBlog, LiveUpdate } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { RefreshCw, Filter, ArrowDownUp, CheckCircle, Radio } from 'lucide-react';

interface LiveBlogStreamProps {
  initialBlog: LiveBlog;
}

export default function LiveBlogStream({ initialBlog }: LiveBlogStreamProps) {
  const [updates, setUpdates] = useState<LiveUpdate[]>(initialBlog.updates || []);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [keyEventsOnly, setKeyEventsOnly] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Auto-poll updates every 15 seconds if blog is active
  useEffect(() => {
    if (initialBlog.status !== 'ACTIVE') return;

    const interval = setInterval(async () => {
      await fetchLatestUpdates();
    }, 15000);

    return () => clearInterval(interval);
  }, [initialBlog.id, initialBlog.status]);

  async function fetchLatestUpdates() {
    try {
      setIsRefreshing(true);
      const res = await fetch(`/api/live-blogs/${initialBlog.id}/updates`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.updates)) {
          setUpdates(data.updates);
          setLastRefreshed(new Date());
        }
      }
    } catch (e) {
      // Quiet poll failure
    } finally {
      setIsRefreshing(false);
    }
  }

  // Filter & Sort
  const filteredUpdates = updates.filter((u) => {
    if (keyEventsOnly && !u.is_key_event) return false;
    return true;
  });

  const sortedUpdates = [...filteredUpdates].sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#121925] border border-[#252D39] rounded-xl text-xs font-sans">
        <div className="flex items-center space-x-3">
          {initialBlog.status === 'ACTIVE' && (
            <div className="flex items-center space-x-1.5 text-[#E50914] font-extrabold uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-ping"></span>
              <span>LIVE COVERAGE ACTIVE</span>
            </div>
          )}
          <span className="text-[#707B8B]">
            Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <button
            onClick={fetchLatestUpdates}
            disabled={isRefreshing}
            className="p-1 hover:text-[#F5F7FA] transition text-[#A4ADBB] cursor-pointer"
            title="Refresh updates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#E50914]' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-1.5 cursor-pointer text-[#A4ADBB] hover:text-[#F5F7FA] font-medium select-none">
            <input
              type="checkbox"
              checked={keyEventsOnly}
              onChange={(e) => setKeyEventsOnly(e.target.checked)}
              className="rounded bg-[#0E131C] border-[#252D39] text-[#E50914] focus:ring-0"
            />
            <span>Key Events Only</span>
          </label>

          <span className="text-[#252D39]">|</span>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center space-x-1 font-semibold text-[#A4ADBB] hover:text-[#F5F7FA] transition cursor-pointer"
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Stream List */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 sm:before:left-4 before:w-0.5 before:bg-[#252D39]">
        {sortedUpdates.length === 0 ? (
          <div className="py-12 text-center text-[#707B8B] font-sans text-sm bg-[#121925] border border-[#252D39] rounded-xl">
            No updates match the selected filter.
          </div>
        ) : (
          sortedUpdates.map((update) => (
            <article
              key={update.id}
              className={`relative pl-8 sm:pl-10 group ${
                update.is_key_event ? 'p-5 bg-[#E50914]/10 border border-[#E50914]/30 rounded-xl' : ''
              }`}
            >
              {/* Timeline Pin */}
              <div
                className={`absolute left-1.5 sm:left-2.5 top-2 w-3.5 h-3.5 rounded-full border-2 ${
                  update.is_key_event
                    ? 'border-[#E50914] bg-[#E50914]'
                    : 'border-[#707B8B] bg-[#080B11]'
                }`}
              />

              {/* Timestamp & Badge */}
              <div className="flex items-center space-x-2 text-xs font-sans mb-1.5">
                <span className="font-mono font-bold text-[#F5F7FA]">
                  {update.timestamp}
                </span>
                {update.is_key_event ? (
                  <span className="bg-[#E50914] text-white font-extrabold uppercase text-[10px] px-2 py-0.5 rounded tracking-wider">
                    Key Development
                  </span>
                ) : null}
                <span className="text-[#707B8B]">•</span>
                <span className="text-[#707B8B]">By {update.author_name}</span>
              </div>

              {/* Update Title */}
              <h4 className="text-lg sm:text-xl font-bold text-[#F5F7FA] leading-snug">
                {update.title}
              </h4>

              {/* Image if present */}
              {update.image_url && (
                <div className="my-3 aspect-[16/9] w-full overflow-hidden bg-[#0A0E15] border border-[#252D39] rounded-lg max-w-xl">
                  <img
                    src={update.image_url}
                    alt={update.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content Body */}
              <div className="mt-2 text-sm text-[#A4ADBB] font-sans leading-relaxed">
                {update.content}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
