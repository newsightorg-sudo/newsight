import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getAllArticlesAdmin } from '@/lib/data';
import AdminHeader from '@/components/admin/AdminHeader';
import { CheckSquare, CheckCircle, ArrowRight, Eye, AlertCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function ReviewQueuePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const inReviewArticles = getAllArticlesAdmin('IN_REVIEW');
  const approvedArticles = getAllArticlesAdmin('APPROVED');

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Editorial Review Queue"
        subtitle="Review, fact-check, and authorize dispatches submitted by newsroom staff correspondents."
        userRole={user.role}
      />

      <div className="space-y-8 text-xs">
        {/* In Review Section */}
        <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#DCE7F2] dark:border-[#27364B] flex items-center justify-between bg-[#F0F6FC] dark:bg-[#0D1626]/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-[#D99018] flex items-center justify-center shrink-0">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
                  Submissions Awaiting Editor Clearance
                </h2>
                <p className="text-[11px] text-[#7890A8]">
                  Correspondents have filed these stories for desk fact-checking and publication authorization.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full font-mono text-xs font-bold bg-amber-50 text-[#D99018] border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
              {inReviewArticles.length} Pending
            </span>
          </div>

          <div className="divide-y divide-[#E5EDF5] dark:divide-[#27364B]">
            {inReviewArticles.length === 0 ? (
              <div className="p-12 text-center text-[#7890A8] italic">
                The review queue is currently clear. No pending reporter drafts awaiting approval.
              </div>
            ) : (
              inReviewArticles.map((art) => (
                <div
                  key={art.id}
                  className="p-6 flex flex-col sm:flex-row items-start justify-between gap-4 hover:bg-[#F3F8FE] dark:hover:bg-[#1A2942]/30 transition"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="px-2.5 py-0.5 rounded bg-[#E3F0FC] text-[#1261A6] font-bold uppercase">
                        {art.category_name}
                      </span>
                      <span className="text-[#496784] dark:text-[#B6C3D4]">
                        Filed by <strong className="text-[#174A7E] dark:text-[#F4F7FB]">{art.reporter_name}</strong>
                      </span>
                      <span className="text-[#7890A8]">
                        • {formatDate(art.created_at, 'relative')}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#174A7E] dark:text-[#F4F7FB] leading-snug">
                      <Link href={`/admin/articles/${art.id}/edit`} className="hover:text-[#079FE3]">
                        {art.title}
                      </Link>
                    </h3>

                    {art.deck && (
                      <p className="text-[#496784] dark:text-[#B6C3D4] text-xs leading-relaxed max-w-3xl">
                        {art.deck}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/admin/articles/${art.id}/edit`}
                      className="px-4 py-2 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold uppercase tracking-wider text-[11px] rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Review & Authorize</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Approved for Scheduling Section */}
        <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#DCE7F2] dark:border-[#27364B] flex items-center justify-between bg-[#F0F6FC] dark:bg-[#0D1626]/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E3F0FC] dark:bg-[#1A2942] text-[#079FE3] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
                  Approved Articles Ready for Immediate Broadcast
                </h2>
                <p className="text-[11px] text-[#7890A8]">
                  These stories have passed editorial fact-checks and can be published on demand.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full font-mono text-xs font-bold bg-[#E3F0FC] text-[#1261A6] border border-[#DCE7F2] dark:bg-blue-950/40 dark:text-blue-300">
              {approvedArticles.length} Ready
            </span>
          </div>

          <div className="divide-y divide-[#E5EDF5] dark:divide-[#27364B]">
            {approvedArticles.length === 0 ? (
              <div className="p-8 text-center text-[#7890A8] italic">
                No approved articles in queue.
              </div>
            ) : (
              approvedArticles.map((art) => (
                <div
                  key={art.id}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#F3F8FE] dark:hover:bg-[#1A2942]/30 transition"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-[#E3F0FC] text-[#1261A6] font-bold uppercase">
                        {art.category_name}
                      </span>
                      <span className="text-[#7890A8]">
                        Author: {art.reporter_name}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#174A7E] dark:text-[#F4F7FB]">
                      <Link href={`/admin/articles/${art.id}/edit`} className="hover:text-[#079FE3]">
                        {art.title}
                      </Link>
                    </h4>
                  </div>

                  <Link
                    href={`/admin/articles/${art.id}/edit`}
                    className="px-3.5 py-1.5 bg-[#16845B] hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-[11px] rounded-lg transition shadow-xs shrink-0"
                  >
                    Publish Now →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
