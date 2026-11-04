import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import { Shield, BookOpen, Users, Award, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About NEWSIGHT | Digital News & Video Journalism Platform',
  description: 'Our mission, editorial philosophy, verification methodology, and commitment to independent digital journalism.',
};

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* Masthead */}
        <div className="border-b border-[#252D39] pb-6">
          <span className="text-xs font-black uppercase tracking-widest text-[#E50914] block mb-1">
            EDITORIAL MISSION
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            About NEWSIGHT
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[#A4ADBB] leading-relaxed">
            A digital-first video journalism and investigative news platform established to report with uncompromising fidelity on constitutional governance, global diplomacy, industrial economics, and regional ecological realities.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[#121925] border border-[#252D39] space-y-2">
            <Shield className="w-6 h-6 text-[#E50914]" />
            <h3 className="text-sm font-bold text-white">Editorial Sovereignty</h3>
            <p className="text-xs text-[#A4ADBB] leading-relaxed">
              No commercial advertisers, corporate interests, or state agencies exert influence over story selection or investigative findings.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#121925] border border-[#252D39] space-y-2">
            <BookOpen className="w-6 h-6 text-[#075DEB]" />
            <h3 className="text-sm font-bold text-white">Primary Verification</h3>
            <p className="text-xs text-[#A4ADBB] leading-relaxed">
              Every data point, satellite telemetry report, and legal ruling is vetted against primary source archives and sworn filings.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#121925] border border-[#252D39] space-y-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Video-First Reporting</h3>
            <p className="text-xs text-[#A4ADBB] leading-relaxed">
              Ground correspondents equipped with high-fidelity visual recording tools capture unvarnished reality on location.
            </p>
          </div>
        </div>

        {/* Editorial Charter Prose */}
        <div className="article-prose space-y-4 pt-4 border-t border-[#252D39]">
          <h2>Our Journalistic Mandate</h2>
          <p>
            NEWSIGHT was founded on the conviction that a healthy democracy demands an unyielding, non-partisan press capable of scrutinizing institutions without fear or deference. In an era dominated by algorithmic outrage and unverified aggregation, our newsroom commits to painstaking ground dispatches, verified telemetry, and measured editorial restraint.
          </p>

          <blockquote>
            &ldquo;A newsroom that trades factual verification for viral speed or partisan applause forfeits the sacred trust of journalism. Our loyalty belongs solely to verifiable truth and our audience.&rdquo;
            <br />
            <span className="text-xs font-semibold not-italic text-[#707B8B] block mt-1">
              — Editorial Charter, NEWSIGHT Network
            </span>
          </blockquote>

          <h2>Video Journalism & Ground Dispatches</h2>
          <p>
            Rather than relying on studio soundbites, NEWSIGHT invests in deep on-the-record field reporting. From the solar boat yards of Vembanad Lake to deep space antenna cleanrooms and high-altitude Himalayan microgrids, our reporters produce visual documents that inform and endure.
          </p>

          <h2>Transparency & Corrections Policy</h2>
          <p>
            When factual errors occur, we correct them swiftly and transparently. We do not stealth-edit stories. A permanent correction notice detailing what changed and why is appended directly to the top of the modified report.
          </p>
        </div>

      </div>
    </PublicLayout>
  );
}
