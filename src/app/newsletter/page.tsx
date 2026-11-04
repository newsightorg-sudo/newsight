import React from 'react';
import type { Metadata } from 'next';
import { getEditorialSettings, getCategories } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import PublicLayout from '@/components/public/PublicLayout';
import NewsletterBlock from '@/components/public/NewsletterBlock';
import { Mail, Check, ShieldCheck, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Daily Newsletters & Editorial Briefings | NEWSIGHT',
  description: 'Subscribe to curated morning dispatches, weekend investigative digests, and regional alerts.',
};

export default async function NewsletterPage() {
  const user = await getCurrentUser();
  const settings = getEditorialSettings();
  const categories = getCategories(true);

  return (
    <PublicLayout
      user={user}
      settings={settings}
      categories={categories}
      activeSidebar="categories"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="border-b border-[#252D39] pb-6 mb-8">
          <div className="flex items-center space-x-2 text-[#E50914] font-sans text-xs font-extrabold uppercase tracking-widest mb-2">
            <Mail className="w-4 h-4" />
            <span>Direct Editorial Delivery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F5F7FA] tracking-tight">
            NEWSIGHT Briefings & Newsletters
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#A4ADBB] font-sans leading-relaxed">
            Curated daily video briefings and investigative summaries delivered to your inbox without algorithmic distortion. Read by decision-makers, researchers, scholars, and engaged citizens.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8 text-xs font-sans">
          <div className="p-5 border border-[#252D39] bg-[#121925] rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] flex items-center justify-center mb-3 font-bold">
              06:00
            </div>
            <h3 className="font-bold text-[#F5F7FA] text-sm">Morning Flagship</h3>
            <p className="mt-1.5 text-[#A4ADBB] leading-relaxed">
              Essential national overview, key parliamentary events, and market openings before the business day commences.
            </p>
          </div>

          <div className="p-5 border border-[#252D39] bg-[#121925] rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3 font-bold">
              KL
            </div>
            <h3 className="font-bold text-[#F5F7FA] text-sm">Kerala Regional Desk</h3>
            <p className="mt-1.5 text-[#A4ADBB] leading-relaxed">
              Dedicated weekly dispatch covering Western Ghats ecology, maritime ports, and district policy across Kerala.
            </p>
          </div>

          <div className="p-5 border border-[#252D39] bg-[#121925] rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-3 font-bold">
              INV
            </div>
            <h3 className="font-bold text-[#F5F7FA] text-sm">Investigative Dispatch</h3>
            <p className="mt-1.5 text-[#A4ADBB] leading-relaxed">
              In-depth public interest investigations, open-source satellite audits, and corporate compliance records.
            </p>
          </div>
        </div>

        {/* Subscription Block */}
        <NewsletterBlock />
      </div>
    </PublicLayout>
  );
}

