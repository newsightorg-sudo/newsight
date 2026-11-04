import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getLiveBlogBySlug, getEditorialSettings, getCategories } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import PublicLayout from '@/components/public/PublicLayout';
import LiveBlogStream from '@/components/public/LiveBlogStream';
import { Radio, Calendar, User, Clock } from 'lucide-react';

interface LiveBlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LiveBlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = getLiveBlogBySlug(slug);
  if (!blog) return { title: 'Live Blog Not Found' };

  return {
    title: `LIVE: ${blog.title} | NEWSIGHT`,
    description: blog.summary,
  };
}

export default async function LiveBlogPage({ params }: LiveBlogPageProps) {
  const { slug } = await params;
  const blog = getLiveBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const user = await getCurrentUser();
  const settings = getEditorialSettings();
  const categories = getCategories(true);

  return (
    <PublicLayout
      user={user}
      settings={settings}
      categories={categories}
      activeSidebar="live"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Live Breadcrumb & Status */}
        <div className="flex items-center space-x-2 text-xs font-sans mb-4">
          <Link href="/" className="text-[#A4ADBB] hover:text-[#E50914] uppercase tracking-wider transition">
            Home
          </Link>
          <span className="text-[#252D39]">/</span>
          {blog.status === 'ACTIVE' ? (
            <span className="flex items-center space-x-1.5 bg-[#E50914] text-white font-extrabold uppercase px-2.5 py-0.5 rounded text-[11px] tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              <span>LIVE UPDATES</span>
            </span>
          ) : (
            <span className="bg-[#1B2432] text-[#A4ADBB] font-extrabold uppercase px-2 py-0.5 rounded text-[11px] border border-[#252D39]">
              CONCLUDED
            </span>
          )}
        </div>

        {/* Live Blog Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F5F7FA] leading-tight tracking-tight">
          {blog.title}
        </h1>

        {/* Summary */}
        <p className="mt-4 text-base sm:text-lg text-[#A4ADBB] font-sans leading-relaxed border-l-3 border-[#E50914] pl-4 italic">
          {blog.summary}
        </p>

        {/* Live Blog Attribution Strip */}
        <div className="mt-6 py-3 border-y border-[#252D39] text-xs font-sans text-[#A4ADBB] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {blog.reporter_avatar && (
              <img
                src={blog.reporter_avatar}
                alt={blog.reporter_name || 'Correspondent'}
                className="w-6 h-6 rounded-full object-cover"
              />
            )}
            <span>Live reporting anchored by <strong className="text-[#F5F7FA]">{blog.reporter_name || 'Desk Staff'}</strong></span>
          </div>
          <div className="flex items-center space-x-3 text-[#707B8B]">
            <span>Started {formatDate(blog.started_at, 'full')}</span>
          </div>
        </div>

        {/* Real-time Stream & Polling */}
        <div className="mt-8">
          <LiveBlogStream initialBlog={blog} />
        </div>
      </div>
    </PublicLayout>
  );
}

