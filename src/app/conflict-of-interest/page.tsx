import React from 'react';
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import { ShieldCheck, Scale, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Conflict of Interest Policy | NEWSIGHT',
  description: 'Ethical rules governing financial disclosures, gift bans, political neutrality, and reporter independence.',
};

export const dynamic = 'force-dynamic';

export default async function ConflictOfInterestPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* Masthead */}
        <div className="border-b border-[#252D39] pb-6">
          <span className="text-xs font-black uppercase tracking-widest text-[#075DEB] block mb-1">
            INSTITUTIONAL ETHICS
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Conflict of Interest Policy
          </h1>
          <p className="mt-3 text-base text-[#A4ADBB]">
            Preserving editorial credibility through complete financial, political, and institutional independence.
          </p>
        </div>

        <div className="article-prose space-y-4">
          <h2>1. Financial Disclosures</h2>
          <p>
            Journalists covering business, markets, and macroeconomic beats are prohibited from trading equities, bonds, or commodities of individual corporations they report on. Any personal holdings must be in diversified blind mutual funds.
          </p>

          <h2>2. Gifts, Hospitality & Junkets</h2>
          <p>
            NEWSIGHT correspondents do not accept paid travel, luxury accommodation, honoraria, or gifts from corporate entities, political campaigns, or foreign governments. All transportation and accommodation expenses incurred during reporting assignments are funded directly by our newsroom budget.
          </p>

          <h2>3. Political Non-Partisanship</h2>
          <p>
            Staff journalists and video correspondents must maintain strict political neutrality. They are barred from making political donations, running for public office, or speaking at partisan campaign rallies.
          </p>
        </div>

      </div>
    </PublicLayout>
  );
}
