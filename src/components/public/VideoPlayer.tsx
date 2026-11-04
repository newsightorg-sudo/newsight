'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Maximize2, X, Image as ImageIcon } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
}

// Robust helper to extract 11-character YouTube video ID
export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Pattern matching youtube.com/watch, youtu.be, embed, live, shorts
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([\w-]{11})/i;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }

  // Pure 11-character ID check
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export default function VideoPlayer({
  src,
  poster,
  title,
  autoPlay = false,
  className = ''
}: VideoPlayerProps) {
  const youtubeId = getYouTubeId(src);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [hasFallenBack, setHasFallenBack] = useState(false);

  // Determine initial high-res image source
  const defaultPoster = poster 
    || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : '')
    || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=85';

  const [currentImg, setCurrentImg] = useState<string>(defaultPoster);

  useEffect(() => {
    setCurrentImg(defaultPoster);
    setHasFallenBack(false);
  }, [defaultPoster]);

  // Handle keyboard Escape for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen]);

  const handleImageError = () => {
    if (youtubeId && !hasFallenBack) {
      setHasFallenBack(true);
      setCurrentImg(`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`);
    }
  };

  return (
    <>
      <div 
        className={`relative w-full aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden border border-[#252D39] shadow-2xl group cursor-pointer ${className}`}
        onClick={() => setIsLightboxOpen(true)}
      >
        {/* High-Resolution Editorial Photograph */}
        <img
          src={currentImg}
          alt={title || "NEWSIGHT Editorial Visual Coverage"}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />

        {/* Top-Left Category / Field Photography Badge */}
        <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-md border border-white/10 flex items-center gap-1.5 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg">
          <Camera className="w-3.5 h-3.5 text-[#E50914]" />
          <span>Newsroom Visual Dispatch</span>
        </div>

        {/* Bottom-Right Enlarge Trigger */}
        <div 
          className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/85 backdrop-blur-md text-white border border-white/10 group-hover:bg-[#E50914] transition-colors shadow-lg flex items-center gap-1.5 text-xs font-semibold"
          title="Click to enlarge photograph"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px] uppercase tracking-wider">Enlarge Photo</span>
        </div>

        {/* Bottom Title Gradient Strip */}
        {title && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-5 pt-8 text-white pointer-events-none">
            <p className="text-xs sm:text-sm font-semibold line-clamp-1 drop-shadow-md pr-28">
              {title}
            </p>
          </div>
        )}
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 text-white select-none animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 z-20" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate max-w-lg">
                {title || 'NEWSIGHT Photographic Dispatch'}
              </span>
            </div>

            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-[#E50914] text-white transition-colors cursor-pointer"
              aria-label="Close photo viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Central Image View */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentImg}
              alt={title || "NEWSIGHT Photograph"}
              className="max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Bottom Caption */}
          <div className="pt-3 border-t border-white/10 text-center max-w-4xl mx-auto z-20" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs sm:text-sm text-[#A4ADBB] font-sans">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-xs">ESC</kbd> or click anywhere to exit viewer
            </p>
          </div>
        </div>
      )}
    </>
  );
}
