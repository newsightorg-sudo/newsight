import React from 'react';
import Link from 'next/link';
import { AlertCircle, ChevronRight } from 'lucide-react';

interface BreakingNewsBarProps {
  active?: boolean;
  headline: string;
  url?: string;
  timeLabel?: string;
}

export default function BreakingNewsBar({
  active = true,
  headline,
  url = '#',
  timeLabel = 'LIVE UPDATE'
}: BreakingNewsBarProps) {
  if (!active || !headline) return null;

  return (
    <div className="w-full bg-[#0E131C] border-b border-[#252D39] py-2 px-3 sm:px-6">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-1">
          {/* Badge */}
          <span className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 bg-[#E50914] text-white font-black text-[10px] tracking-wider uppercase rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>{timeLabel}</span>
          </span>

          {/* Headline Link */}
          <Link
            href={url}
            className="text-[#F5F7FA] hover:text-[#075DEB] font-medium truncate transition-colors text-xs sm:text-[13px]"
          >
            {headline}
          </Link>
        </div>

        <Link
          href={url}
          className="shrink-0 hidden sm:flex items-center gap-0.5 text-[11px] font-bold text-[#A4ADBB] hover:text-white transition-colors uppercase"
        >
          <span>Full Report</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
