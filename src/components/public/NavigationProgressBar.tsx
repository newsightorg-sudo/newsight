'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname or searchParams change, navigation finished
  useEffect(() => {
    if (isNavigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept internal link clicks to trigger instant visual feedback
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // Don't trigger if default was prevented or user clicked with modifier keys
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Handle internal relative links only
      if (href.startsWith('/') && !href.startsWith('//') && !target.getAttribute('target') && !target.hasAttribute('download')) {
        const currentUrl = window.location.pathname + window.location.search;
        if (href !== currentUrl && !href.startsWith('#')) {
          setIsNavigating(true);
          setProgress(25);

          const t1 = setTimeout(() => setProgress(55), 100);
          const t2 = setTimeout(() => setProgress(78), 300);
          const t3 = setTimeout(() => setProgress(90), 800);

          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
          };
        }
      }
    }

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, []);

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 inset-x-0 h-[2.5px] z-[99999] pointer-events-none overflow-hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-[#D71920] via-[#079FE3] to-[#D71920] shadow-[0_0_12px_rgba(215,25,32,0.9)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 
            ? 'width 150ms ease-out, opacity 250ms 100ms' 
            : 'width 220ms cubic-bezier(0.1, 0.5, 0.5, 1)'
        }}
      />
    </div>
  );
}

