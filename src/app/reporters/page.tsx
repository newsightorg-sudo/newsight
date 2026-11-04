import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Users, Mail, ArrowRight, ChevronRight, Award, Video, FileText 
} from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';
import { getReporters } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Journalists & Bureau Chiefs | NEWSIGHT Newsroom',
  description: 'Meet the correspondents, investigative reporters, and editors leading NEWSIGHT’s video dispatches.',
};

export const dynamic = 'force-dynamic';

export default async function ReportersDirectoryPage() {
  const reporters = getReporters();

  return (
    <PublicLayout>
      <div className="px-3 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Masthead */}
        <div className="border-b border-[#252D39] pb-5">
          <div className="flex items-center gap-2 text-[#075DEB] text-xs font-black uppercase tracking-widest mb-1.5">
            <Users className="w-4 h-4" />
            <span>NEWSIGHT Newsroom Staff</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Correspondents & Bureau Desks
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#A4ADBB] max-w-2xl leading-relaxed">
            Our newsroom operates under strict independence and verification standards. Explore the beats, profiles, and filed reports of our reporters across national, legal, and science desks.
          </p>
          <div className="mt-3 inline-block px-2.5 py-1 bg-[#121925] border border-[#252D39] rounded text-[10px] text-[#707B8B]">
            * Note: Demonstration profiles clearly labeled as newsroom sample credentials.
          </div>
        </div>

        {/* Reporters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reporters.map((rep) => (
            <div
              key={rep.id}
              className="p-6 rounded-2xl bg-[#121925] hover:bg-[#1B2432] border border-[#252D39] flex flex-col justify-between group transition-all hover:border-[#075DEB]/60 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={rep.avatar_url}
                    alt={rep.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#252D39] group-hover:border-[#075DEB] transition-colors"
                  />
                  <div>
                    <h2 className="text-base font-bold text-white group-hover:text-[#075DEB] transition-colors">
                      {rep.name}
                    </h2>
                    <span className="text-xs text-[#075DEB] font-semibold block">
                      {rep.title}
                    </span>
                    <span className="text-[11px] text-[#707B8B] block mt-0.5">
                      Beat: {rep.beat}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#A4ADBB] leading-relaxed line-clamp-3">
                  {rep.bio}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#252D39]/50 flex items-center justify-between text-xs">
                <span className="text-[#707B8B]">{rep.email}</span>
                <Link
                  href={`/reporters/${rep.slug}`}
                  className="font-bold text-[#075DEB] hover:underline flex items-center gap-0.5"
                >
                  <span>View Byline</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </PublicLayout>
  );
}
