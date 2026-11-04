import React from 'react';
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy | NEWSIGHT',
  description: 'Our data protection principles, cookie practices, and reader privacy policies.',
};

export const dynamic = 'force-dynamic';

export default async function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* Masthead */}
        <div className="border-b border-[#252D39] pb-6">
          <span className="text-xs font-black uppercase tracking-widest text-[#075DEB] block mb-1">
            LEGAL & COMPLIANCE
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Privacy Policy
          </h1>
          <p className="mt-3 text-base text-[#A4ADBB]">
            Effective Date: 2026 • NEWSIGHT Digital Journalism Network
          </p>
        </div>

        <div className="article-prose space-y-4">
          <h2>1. Reader Privacy Commitment</h2>
          <p>
            NEWSIGHT respects the digital privacy of our readers and viewers. We do not participate in third-party data broker networks, nor do we deploy fingerprinting trackers designed to monitor your behavior across unrelated web properties.
          </p>

          <h2>2. Data We Process</h2>
          <ul>
            <li><strong>Newsletter Subscriptions:</strong> When you subscribe to our morning briefings, your email address is used strictly to deliver verified editorial newsletters.</li>
            <li><strong>Video Playback Telemetry:</strong> Aggregate viewing data (duration watched, buffer health) is analyzed without personal identifiers to optimize stream performance.</li>
            <li><strong>Reader Discussion:</strong> When contributing to article comments, your provided display name and comment are published publicly following editorial moderation.</li>
          </ul>

          <h2>3. Cookies and Storage</h2>
          <p>
            We use strictly necessary session cookies to preserve reader preferences (such as volume level and dark theme mode) and authenticate editorial newsroom staff.
          </p>

          <h2>4. Data Rights and Contact</h2>
          <p>
            You may request deletion of your subscriber data or commentary records at any time by contacting our data protection desk at <code>privacy@newsight.media</code>.
          </p>
        </div>

      </div>
    </PublicLayout>
  );
}
