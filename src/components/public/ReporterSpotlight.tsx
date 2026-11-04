import React from 'react';
import Link from 'next/link';
import { Users, ArrowRight, ExternalLink } from 'lucide-react';
import { Reporter } from '@/lib/types';

interface ReporterSpotlightProps {
  reporters: Reporter[];
}

export default function ReporterSpotlight({ reporters }: ReporterSpotlightProps) {
  if (!reporters || reporters.length === 0) return null;

  return (
    <section className="py-8 border-b border-zinc-200">
      <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3 mb-6">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-zinc-900" />
          <h3 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-950">
            Newsroom Staff & Editorial Bureaus
          </h3>
        </div>
        <Link
          href="/reporters"
          className="text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-red-700 flex items-center space-x-1"
        >
          <span>Complete Staff Directory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reporters.slice(0, 6).map((rep) => (
          <div
            key={rep.id}
            className="flex items-start space-x-4 p-4 border border-zinc-200 bg-zinc-50/50 hover:bg-white hover:border-zinc-400 transition"
          >
            <img
              src={rep.avatar_url}
              alt={rep.name}
              className="w-16 h-16 rounded-full object-cover shrink-0 border border-zinc-300"
            />
            <div className="overflow-hidden">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 block">
                {rep.beat}
              </span>
              <h4 className="font-headline text-base font-bold text-zinc-950 hover:text-red-700 transition">
                <Link href={`/reporters/${rep.slug}`}>
                  {rep.name}
                </Link>
              </h4>
              <p className="text-xs text-zinc-600 line-clamp-2 mt-1">
                {rep.bio}
              </p>
              <Link
                href={`/reporters/${rep.slug}`}
                className="mt-2 inline-flex items-center space-x-1 text-xs font-semibold text-zinc-800 hover:text-red-700 transition"
              >
                <span>Read Bylines</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
