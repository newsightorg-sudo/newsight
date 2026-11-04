'use client';

import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  className?: string;
  variant?: 'header' | 'drawer' | 'compact';
  showLabel?: boolean;
}

export default function ThemeToggle({
  className = '',
  variant = 'header',
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme, isMounted } = useTheme();
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  // Determine active state & target action
  const isDark = theme === 'dark';
  const targetTheme = isDark ? 'light' : 'dark';
  const tooltipText = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  const ariaLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  // Fallback for SSR / pre-hydration to prevent layout shift
  if (!isMounted) {
    return (
      <button
        type="button"
        className={`p-2 rounded-lg text-[#A4ADBB] hover:text-[#F5F7FA] hover:bg-[#1B2432] transition-colors ${className}`}
        aria-label="Theme toggle"
        disabled
      >
        <span className="w-5 h-5 block opacity-0" />
      </button>
    );
  }

  if (variant === 'drawer') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between p-3 rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] text-[#F5F7FA] transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#075DEB] ${className}`}
        aria-label={ariaLabel}
        title={tooltipText}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-[#080B11] border border-[#252D39] text-[#F5F7FA] group-hover:text-amber-400 dark:group-hover:text-amber-400 transition-colors">
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-sky-400 transition-transform duration-300 group-hover:-rotate-12" />
            )}
          </div>
          <div className="text-left">
            <span className="text-xs font-semibold block text-[#F5F7FA]">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
            <span className="text-[10px] text-[#707B8B]">
              Tap to switch to {targetTheme} theme
            </span>
          </div>
        </div>

        <div className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[#252D39] transition-colors duration-200 ease-in-out group-hover:bg-[#364152]">
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              !isDark ? 'translate-x-4 bg-amber-400' : 'translate-x-0 bg-blue-500'
            }`}
          />
        </div>
      </button>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleTheme}
        onMouseEnter={() => setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
        onFocus={() => setIsTooltipVisible(true)}
        onBlur={() => setIsTooltipVisible(false)}
        className={`relative p-2 rounded-lg active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#075DEB] border border-transparent group ${
          className || 'text-[#A4ADBB] hover:text-[#F5F7FA] hover:bg-[#1B2432] hover:border-[#252D39]/60'
        }`}
        aria-label={ariaLabel}
        title={tooltipText}
      >
        {isDark ? (
          <Sun
            className="w-5 h-5 text-current group-hover:text-amber-500 transition-all duration-300 transform group-hover:rotate-45 group-hover:scale-110"
            aria-hidden="true"
          />
        ) : (
          <Moon
            className="w-5 h-5 text-current group-hover:text-sky-600 transition-all duration-300 transform group-hover:-rotate-12 group-hover:scale-110"
            aria-hidden="true"
          />
        )}
        <span className="sr-only">{tooltipText}</span>
      </button>

      {/* Accessible Micro-Tooltip */}
      {isTooltipVisible && (
        <div
          role="tooltip"
          className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 text-[11px] font-medium text-white bg-[#0E131C] border border-[#252D39] rounded-md shadow-xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
        >
          {tooltipText}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-b-4 border-b-[#0E131C]" />
        </div>
      )}
    </div>
  );
}
