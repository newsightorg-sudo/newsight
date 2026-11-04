import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  LayoutGrid, ArrowRight, Video, FileText, ChevronRight 
} from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';
import { getCategories } from '@/lib/data';

export const metadata: Metadata = {
  title: 'News Categories & Editorial Desks | NEWSIGHT',
  description: 'Explore all 21 NEWSIGHT news categories, video reporting desks, and specialized coverage units.',
};

export const dynamic = 'force-dynamic';

export default async function CategoriesDirectoryPage() {
  const categories = getCategories();

  return (
    <PublicLayout>
      <div className="px-3 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Masthead */}
        <div className="border-b border-[#252D39] pb-5">
          <div className="flex items-center gap-2 text-[#075DEB] text-xs font-black uppercase tracking-widest mb-1.5">
            <LayoutGrid className="w-4 h-4" />
            <span>Coverage Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Categories & Editorial Desks
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#A4ADBB] max-w-2xl leading-relaxed">
            Browse all specialized reporting desks. Each section features verified video investigations, field reports, and analytical written journalism.
          </p>
        </div>

        {/* Clean Grid of Category Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="p-5 rounded-xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] flex flex-col justify-between group transition-all shadow-sm hover:border-[#075DEB]/60"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: cat.color || '#E50914' }} 
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#707B8B]">
                    DESK
                  </span>
                </div>

                <h2 className="text-base font-bold text-white group-hover:text-[#075DEB] transition-colors">
                  {cat.name}
                </h2>

                <p className="text-xs text-[#A4ADBB] line-clamp-2 mt-1.5 leading-relaxed">
                  {cat.description || `Verified reporting, video investigations, and updates in ${cat.name}.`}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#252D39]/50 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#707B8B] font-medium">Explore Desk</span>
                <span className="text-[#075DEB] group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-bold">
                  View <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </PublicLayout>
  );
}
