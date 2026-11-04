'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Globe, User as UserIcon, Mail } from 'lucide-react';

interface TopUtilityBarProps {
  user?: { name: string; role: string } | null;
}

export default function TopUtilityBar({ user }: TopUtilityBarProps) {
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [edition, setEdition] = useState<string>('India');

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setCurrentDateStr(formatted);
  }, []);

  return (
    <div className="bg-zinc-100 border-b border-zinc-200 text-xs text-zinc-600 font-sans tracking-wide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* Date & Edition */}
        <div className="flex items-center space-x-4">
          <span className="font-medium text-zinc-800">
            {currentDateStr || 'Today’s Edition'}
          </span>
          <span className="text-zinc-300">|</span>
          <div className="flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              className="bg-transparent border-0 text-zinc-700 font-medium focus:ring-0 cursor-pointer p-0 text-xs"
              aria-label="Select Edition"
            >
              <option value="India">India Edition</option>
              <option value="Global">Global Edition</option>
              <option value="SouthAsia">South Asia Edition</option>
            </select>
          </div>
          <span className="hidden md:inline text-zinc-300">|</span>
          <span className="hidden md:inline text-zinc-500">
            ePaper Available
          </span>
        </div>

        {/* Right Utility: Newsletter, Search, Account */}
        <div className="flex items-center space-x-4">
          <Link
            href="/newsletter"
            className="flex items-center space-x-1 text-zinc-700 hover:text-red-700 transition font-medium"
          >
            <Mail className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Daily Newsletters</span>
          </Link>
          <span className="text-zinc-300">|</span>
          <Link
            href="/search"
            className="flex items-center space-x-1 text-zinc-700 hover:text-red-700 transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
          </Link>
          <span className="text-zinc-300">|</span>
          {user ? (
            <Link
              href="/admin"
              className="flex items-center space-x-1.5 font-semibold text-zinc-900 hover:text-red-700 transition"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Newsroom CMS ({user.name.split(' ')[0]})</span>
            </Link>
          ) : (
            <Link
              href="/admin/login"
              className="flex items-center space-x-1 text-zinc-700 hover:text-red-700 transition font-medium"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Editorial Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
