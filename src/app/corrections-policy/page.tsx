import React from 'react';
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Corrections & Retractions Policy | NEWSIGHT',
  description: 'Our transparent protocol for handling factual corrections, clarifications, and journalistic accountability.',
};

export const dynamic = 'force-dynamic';

export default async function CorrectionsPolicyPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* Masthead */}
        <div className="border-b border-[#252D39] pb-6">
          <span className="text-xs font-black uppercase tracking-widest text-[#E50914] block mb-1">
            ACCOUNTABILITY PROTOCOL
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Corrections & Clarifications
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[#A4ADBB] leading-relaxed">
            NEWSIGHT operates under an explicit commitment to transparency. When factual errors occur, we correct them promptly, prominently, and without evasiveness.
          </p>
        </div>

        <div className="article-prose space-y-4">
          <h2>Correction vs Clarification</h2>
          <p>
            A <strong>Correction</strong> is issued when a substantive fact—such as a name, figure, timeline, quotation, or legal status—was stated incorrectly in the published report.
          </p>
          <p>
            A <strong>Clarification</strong> is issued when factual details were accurate but ambiguous phrasing or omitted context may have generated a misleading impression.
          </p>

          <h2>Placement of Corrections</h2>
          <p>
            Corrections are appended directly at the top or bottom of the original article with a distinct amber alert banner indicating the timestamp of the correction and exactly what details were updated. For video broadcasts, an editorial disclaimer note is added to the video description, and an on-screen lower third correction is included in subsequent broadcasts.
          </p>

          <h2>How to Request a Correction</h2>
          <p>
            Readers, officials, and subjects of coverage can notify our grievance and corrections desk at <code>corrections@newsight.media</code>. Submissions should cite the specific URL, the contested sentence, and primary documentation supporting the correction request.
          </p>
        </div>

      </div>
    </PublicLayout>
  );
}
