import React from 'react';
import type { Metadata } from 'next';
import { getKeralaArticles, getEditorialSettings, getCategories } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import PublicLayout from '@/components/public/PublicLayout';
import KeralaDistrictSection from '@/components/public/KeralaDistrictSection';
import { MapPin, Waves, Building, Trees } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kerala Regional Bureau | NEWSIGHT',
  description: 'In-depth regional reporting, environmental conservation, district governance, and maritime commerce across Kerala.',
};

export default async function KeralaBureauPage() {
  const user = await getCurrentUser();
  const settings = getEditorialSettings();
  const categories = getCategories(true);
  const articles = getKeralaArticles('All', 20);

  return (
    <PublicLayout
      user={user}
      settings={settings}
      categories={categories}
      activeSidebar="categories"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Kerala Masthead */}
        <div className="border-b border-[#252D39] pb-6 mb-8">
          <div className="flex items-center space-x-2 text-emerald-400 font-sans text-xs font-extrabold uppercase tracking-widest mb-2">
            <MapPin className="w-4 h-4" />
            <span>Southern Bureau Dispatches</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F5F7FA] tracking-tight">
            Kerala & Western Ghats Regional Desk
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#A4ADBB] font-sans max-w-3xl leading-relaxed">
            Coordinated coverage across all 14 revenue districts: coastal wetland hydrology, agrarian cooperatives, high-range slope stabilization, urban transit expansion, and Malabar commerce.
          </p>

          {/* Regional Stats & Focal Points */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#252D39] text-xs font-sans">
            <div className="flex items-center space-x-2.5 text-[#F5F7FA] bg-[#121925] border border-[#252D39] p-3 rounded-lg">
              <Trees className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Western Ghats Agroforestry</span>
            </div>
            <div className="flex items-center space-x-2.5 text-[#F5F7FA] bg-[#121925] border border-[#252D39] p-3 rounded-lg">
              <Waves className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Coastal Maritime Economy</span>
            </div>
            <div className="flex items-center space-x-2.5 text-[#F5F7FA] bg-[#121925] border border-[#252D39] p-3 rounded-lg">
              <Building className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Decentralized Panchayats</span>
            </div>
            <div className="flex items-center space-x-2.5 text-[#F5F7FA] bg-[#121925] border border-[#252D39] p-3 rounded-lg">
              <MapPin className="w-4 h-4 text-[#E50914] shrink-0" />
              <span>14 Revenue Districts</span>
            </div>
          </div>
        </div>

        {/* Interactive District Section */}
        <KeralaDistrictSection initialArticles={articles} />
      </div>
    </PublicLayout>
  );
}

