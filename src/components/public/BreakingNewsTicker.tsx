import React from 'react';
import Link from 'next/link';
import { AlertCircle, ChevronRight } from 'lucide-react';

interface BreakingNewsTickerProps {
  active: boolean;
  headline: string;
  url: string;
  timeLabel?: string;
}

export default function BreakingNewsTicker({
  active,
  headline,
  url,
  timeLabel = 'Just In',
}: BreakingNewsTickerProps) {
  if (!active || !headline) return null;

  return (
    <aside aria-label="Breaking News Alert" className="bg-red-700 text-white border-y border-red-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="flex items-center space-x-1.5 shrink-0 bg-red-900 text-white font-extrabold uppercase px-2 py-0.5 tracking-wider text-[11px] rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            <span>BREAKING</span>
          </div>
          {timeLabel && (
            <span className="shrink-0 text-red-200 text-xs hidden sm:inline">
              [{timeLabel}]
            </span>
          )}
          <Link
            href={url || '#'}
            className="font-medium hover:underline truncate hover:text-red-100 transition"
          >
            {headline}
          </Link>
        </div>

        <Link
          href={url || '#'}
          className="shrink-0 hidden md:flex items-center space-x-1 font-semibold text-xs text-red-100 hover:text-white transition"
        >
          <span>Full Report</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
