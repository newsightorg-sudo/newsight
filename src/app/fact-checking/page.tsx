import React from 'react';
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import { CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Fact-Checking Code & Methodology | NEWSIGHT',
  description: 'Our systematic multi-tiered verification framework for claims, technical data, and investigative findings.',
};

export const dynamic = 'force-dynamic';

export default async function FactCheckingPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* Masthead */}
        <div className="border-b border-[#252D39] pb-6">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400 block mb-1">
            VERIFICATION PROTOCOL
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Fact-Checking Code & Methodology
          </h1>
          <p className="mt-3 text-base text-[#A4ADBB]">
            How NEWSIGHT verifies technical statistics, judicial records, satellite telemetry, and political assertions before broadcast.
          </p>
        </div>

        <div className="article-prose space-y-4">
          <h2>Primary Source Primacy</h2>
          <p>
            Whenever possible, our reporters verify facts through primary sources: statutory filings, gazette notifications, audited corporate balance sheets, parliamentary debates, certified court orders, and satellite remote-sensing datasets. Secondary reporting by other media outlets is never cited as definitive proof of fact.
          </p>

          <h2>Four-Eyes Review Protocol</h2>
          <p>
            No investigative documentary or lead report is released without a four-eyes editorial review. A dedicated desk editor independently cross-examines citations, reviews unedited footage, and verifies attribution before transmission.
          </p>

          <h2>Handling Video Evidence</h2>
          <p>
            With the proliferation of AI-generated imagery and synthetic voice clones, NEWSIGHT applies rigorous forensic checks to all civilian and whistleblower video submissions:
          </p>
          <ul>
            <li>EXIF telemetry extraction and sensor timestamp corroboration.</li>
            <li>Solar shadow alignment and astronomical ephemeris cross-referencing.</li>
            <li>Audio waveform analysis to identify frequency clipping typical of synthetic voices.</li>
            <li>Geolocation verification against satellite imagery.</li>
          </ul>
        </div>

      </div>
    </PublicLayout>
  );
}
