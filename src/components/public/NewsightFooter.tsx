'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, CheckCircle2, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { XTwitterIcon, FacebookIcon, InstagramIcon, LinkedinIcon } from './SocialIcons';
import NewsightLogo from './NewsightLogo';
import { EditorialSettings } from '@/lib/types';

interface FooterProps {
  settings?: EditorialSettings;
}

export default function NewsightFooter({ settings }: FooterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, editionPreference: 'India' })
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (_) {
      setStatus('error');
    }
  };

  return (
    <footer className="w-full bg-[#0A0E15] border-t border-[#252D39] text-[#A4ADBB] text-xs mt-auto">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <NewsightLogo size="lg" />
            <p className="text-sm text-[#A4ADBB] max-w-md leading-relaxed">
              NEWSIGHT is an independent digital news and photojournalism publication. Dedicated to rigorous verification, in-depth investigative reporting, and field dispatches across science, governance, economy, and ecology.
            </p>

            {/* Newsletter Box */}
            <div className="pt-2 max-w-md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-2">
                NEWSIGHT Morning Briefing
              </h4>
              <p className="text-xs text-[#707B8B] mb-2.5">
                Delivered daily at 6:30 AM IST. Key stories, investigative reporting, and context.
              </p>

              {status === 'success' ? (
                <div className="flex items-center gap-2 p-2.5 bg-[#121925] border border-emerald-500/40 text-emerald-400 rounded-lg text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Subscribed successfully. Check your inbox for confirmation.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="flex-1 px-3 py-2 bg-[#121925] border border-[#252D39] rounded-lg text-xs text-white placeholder-[#707B8B] focus:outline-none focus:border-[#075DEB]"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-4 py-2 bg-[#E50914] hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors shrink-0 flex items-center gap-1"
                  >
                    <span>{status === 'loading' ? 'Joining...' : 'Subscribe'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 2: Stories & Series */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-3">
              Special Series & Columns
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/video" className="hover:text-white transition-colors">
                  Latest Field Reports
                </Link>
              </li>
              <li>
                <Link href="/top-videos" className="hover:text-white transition-colors">
                  Top Trending Stories
                </Link>
              </li>
              <li>
                <Link href="/shows/the-daily-brief" className="hover:text-white transition-colors">
                  The Daily Brief
                </Link>
              </li>
              <li>
                <Link href="/shows/ground-report" className="hover:text-white transition-colors">
                  Ground Report
                </Link>
              </li>
              <li>
                <Link href="/shows/the-big-interview" className="hover:text-white transition-colors">
                  The Big Interview
                </Link>
              </li>
              <li>
                <Link href="/shows/news-explained" className="hover:text-white transition-colors">
                  News Explained
                </Link>
              </li>
              <li>
                <Link href="/classics" className="hover:text-white transition-colors">
                  NEWSIGHT Classics
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: News Desks */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-3">
              Editorial Desks
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/category/politics" className="hover:text-white transition-colors">
                  National Politics
                </Link>
              </li>
              <li>
                <Link href="/category/india" className="hover:text-white transition-colors">
                  India & States
                </Link>
              </li>
              <li>
                <Link href="/category/world" className="hover:text-white transition-colors">
                  World Affairs
                </Link>
              </li>
              <li>
                <Link href="/category/business" className="hover:text-white transition-colors">
                  Business & Markets
                </Link>
              </li>
              <li>
                <Link href="/category/technology" className="hover:text-white transition-colors">
                  Technology & AI
                </Link>
              </li>
              <li>
                <Link href="/category/environment" className="hover:text-white transition-colors">
                  Environment & Climate
                </Link>
              </li>
              <li>
                <Link href="/category/science" className="hover:text-white transition-colors">
                  Science & Space
                </Link>
              </li>
              <li>
                <Link href="/category/opinion" className="hover:text-white transition-colors">
                  Opinion & Essays
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Transparency & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-3">
              Trust & Standards
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About NEWSIGHT
                </Link>
              </li>
              <li>
                <Link href="/editorial-policy" className="hover:text-white transition-colors">
                  Editorial Charter
                </Link>
              </li>
              <li>
                <Link href="/corrections-policy" className="hover:text-white transition-colors">
                  Corrections Policy
                </Link>
              </li>
              <li>
                <Link href="/fact-checking" className="hover:text-white transition-colors">
                  Fact-Checking Protocol
                </Link>
              </li>
              <li>
                <Link href="/conflict-of-interest" className="hover:text-white transition-colors">
                  Conflict of Interest
                </Link>
              </li>
              <li>
                <Link href="/reporters" className="hover:text-white transition-colors">
                  Newsroom Directory
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Editorial Bureau
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright and Socials */}
        <div className="pt-8 mt-8 border-t border-[#252D39] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#707B8B]">
          <p>
            {settings?.footer_text || '© 2026 NEWSIGHT Digital News Media. All rights reserved. Registered under journalistic publishing guidelines.'}
          </p>

          <div className="flex items-center gap-4 text-[#A4ADBB]">
            {/* 1. Instagram */}
            <a 
              href={settings?.instagram_url || 'https://www.instagram.com/oxyfied._?obrf=ZW1tOXpiZHhsdncw&utm_source=qr'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-pink-500 transition-colors"
              aria-label="Follow us on Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>

            {/* 2. LinkedIn */}
            <a 
              href={settings?.linkedin_url || 'https://www.linkedin.com/company/oxyfied/'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#0077b5] transition-colors"
              aria-label="Follow us on LinkedIn"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>

            {/* 3. X (replaces YouTube) */}
            <a 
              href={settings?.twitter_url || 'https://x.com/oxyfiedorg?s=11'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors"
              aria-label="Follow us on X"
            >
              <XTwitterIcon className="w-4 h-4" />
            </a>

            {/* 4. Facebook */}
            <a 
              href={settings?.facebook_url || 'https://www.facebook.com/share/1LLfbwJwE3/?mibextid=wwXIfr'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-blue-500 transition-colors"
              aria-label="Follow us on Facebook"
            >
              <FacebookIcon className="w-4 h-4" />
            </a></div>
        </div>
      </div>
    </footer>
  );
}
