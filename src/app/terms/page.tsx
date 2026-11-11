import React from 'react';
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';

export const metadata: Metadata = {
  title: 'Terms & Conditions of Service | NEWSIGHT',
  description: 'Terms governing the access, viewing, syndication, and usage of NEWSIGHT video and written content.',
};

export const dynamic = 'force-dynamic';

export default async function TermsPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* Masthead */}
        <div className="border-b border-[#252D39] pb-6">
          <span className="text-xs font-black uppercase tracking-widest text-[#075DEB] block mb-1">
            TERMS OF SERVICE
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Terms & Conditions
          </h1>
          <p className="mt-3 text-base text-[#A4ADBB]">
            Effective Date: 2026 • NEWSIGHT Digital Journalism Network
          </p>
        </div>

        <div className="article-prose space-y-4">
          <h2>1. Intellectual Property & Syndication</h2>
          <p>
            All original video footage, audio broadcasts, graphics, investigative reports, and articles published on NEWSIGHT are protected under Indian and international copyright conventions. Content may not be scraped, rebroadcast, or re-hosted on commercial platforms without explicit written syndication agreements.
          </p>

          <h2>2. Fair Use & Academic Citation</h2>
          <p>
            Journalists, researchers, and academic institutions may quote brief passages or embed official video players provided clear attribution to &ldquo;NEWSIGHT&rdquo; and an active hyperlink to the original source report are preserved.
          </p>

          <h2>3. Video Streaming Usage</h2>
          <p>
            The video streams provided on NEWSIGHT are delivered for personal, non-commercial viewing. Any attempt to circumvent stream security, extract raw transport files for resale, or inject unauthorized overlay advertisements is strictly prohibited.
          </p>

          <h2>4. Community Discourse Rules</h2>
          <p>
            Comments containing hate speech, defamatory assertions, commercial spam, or personal harassment will be removed immediately. Repeated violations result in permanent commentary bans.
          </p>
        </div>

      </div>
    </PublicLayout>
  );
}
