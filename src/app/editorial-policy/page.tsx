import React from 'react';
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import { BookOpen, CheckCircle, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Editorial Standards & Charter | NEWSIGHT',
  description: 'The principles governing our reporting, primary verification procedures, anonymous sourcing, and editorial independence.',
};

export const dynamic = 'force-dynamic';

export default async function EditorialPolicyPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* Masthead */}
        <div className="border-b border-[#252D39] pb-6">
          <span className="text-xs font-black uppercase tracking-widest text-[#E50914] block mb-1">
            NEWSROOM STANDARDS
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Editorial Standards & Guidelines
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[#A4ADBB] leading-relaxed">
            The formal operating principles that guide every reporter, video journalist, correspondent, and editor representing NEWSIGHT.
          </p>
        </div>

        <div className="article-prose space-y-4">
          <h2>1. Accuracy and Verification</h2>
          <p>
            Accuracy is the cornerstone of our journalism. We do not publish assertions of fact based solely on social media conjecture, uncorroborated press releases, or single-source leaks. Every statistical claim, legal interpretation, and factual assertion is scrutinized against original documentary records.
          </p>

          <h2>2. Anonymous Sourcing Protocol</h2>
          <p>
            We strive to place all sources on the record. Anonymous sources are permitted only under strict criteria:
          </p>
          <ul>
            <li>The information is vital to the public interest and cannot be obtained through open records.</li>
            <li>The source faces credible risk of reprisal, loss of livelihood, or physical danger.</li>
            <li>The identity of the source is known to and approved by at least one senior editor.</li>
            <li>The information is corroborated by independent documentation or physical evidence.</li>
          </ul>

          <h2>3. Separation of News and Opinion</h2>
          <p>
            NEWSIGHT maintains an uncompromised firewall between news reporting and commentary. Video dispatches, news articles, and ground reports report observed facts objectively. Columns, essays, and editorial debates are distinctly labeled as <strong>OPINION</strong> to avoid audience confusion.
          </p>

          <h2>4. Video Journalism Integrity</h2>
          <p>
            Video footage broadcast on NEWSIGHT is authentic. We do not stage news events, reenact factual scenarios without clear labeling, or digitally manipulate audio/visual telemetry to mislead viewers. Deepfakes and unverified viral clips are rigorously fact-checked before broadcast.
          </p>

          <h2>5. Right to Respond</h2>
          <p>
            When an individual or institution is the subject of investigative criticism, reasonable effort is made to obtain their perspective and include their response prior to publication.
          </p>
        </div>

      </div>
    </PublicLayout>
  );
}
