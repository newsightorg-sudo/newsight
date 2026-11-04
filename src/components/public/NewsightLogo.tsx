'use client';

import React from 'react';
import Link from 'next/link';

interface NewsightLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  withBadge?: boolean;
}

export default function NewsightLogo({ 
  className = '', 
  size = 'md',
  withBadge = false,
}: NewsightLogoProps) {
  const heightClasses = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-12'
  }[size];

  const logoImg = (
    <img
      src="/logo3.png"
      alt="NEWSIGHT"
      className={`${heightClasses} w-auto object-contain transition-transform duration-200 group-hover:scale-105`}
    />
  );

  return (
    <Link 
      href="/" 
      className={`inline-flex items-center select-none group shrink-0 ${className}`}
      aria-label="NEWSIGHT Home"
    >
      {withBadge ? (
        <div className="bg-[#080B11] px-2.5 py-1 rounded-xl border border-sky-900/30 shadow-xs flex items-center transition-all duration-200 group-hover:border-sky-500/50 group-hover:shadow-sm">
          {logoImg}
        </div>
      ) : (
        logoImg
      )}
    </Link>
  );
}
