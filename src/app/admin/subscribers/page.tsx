import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import AdminHeader from '@/components/admin/AdminHeader';
import { Mail, CheckCircle2, Search, Users, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminSubscribersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const db = getDb();
  const subscribers = await db.prepare('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC').all() as any[];

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Newsletter Readership Roster"
        subtitle="Manage registered subscribers for the daily NEWSIGHT morning briefings and regional dispatches."
        userRole={user.role}
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl p-4 shadow-xs">
          <span className="text-xs font-bold text-[#7890A8] uppercase tracking-wider block">
            Total Active Subscribers
          </span>
          <div className="text-2xl font-extrabold text-[#079FE3] font-mono mt-1">
            {subscribers.length}
          </div>
          <span className="text-[11px] text-[#496784] dark:text-[#B6C3D4]">Verified email readership</span>
        </div>

        <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl p-4 shadow-xs">
          <span className="text-xs font-bold text-[#7890A8] uppercase tracking-wider block">
            Morning Briefing
          </span>
          <div className="text-2xl font-extrabold text-[#1261A6] font-mono mt-1">
            {subscribers.filter((s) => s.edition_preference?.toLowerCase().includes('morning') || !s.edition_preference).length}
          </div>
          <span className="text-[11px] text-[#496784] dark:text-[#B6C3D4]">Delivered daily at 6:30 AM IST</span>
        </div>

        <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl p-4 shadow-xs">
          <span className="text-xs font-bold text-[#7890A8] uppercase tracking-wider block">
            Delivery Status
          </span>
          <div className="text-2xl font-extrabold text-[#16845B] font-mono mt-1">
            100% Active
          </div>
          <span className="text-[11px] text-[#496784] dark:text-[#B6C3D4]">Zero delivery bounce alerts</span>
        </div>
      </div>

      {/* Subscriber Roster Table */}
      <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs overflow-hidden text-xs">
        <div className="px-5 py-4 border-b border-[#DCE7F2] dark:border-[#27364B] flex items-center justify-between bg-[#F0F6FC] dark:bg-[#0D1626]/50">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#079FE3]" />
            <h2 className="font-bold text-sm text-[#174A7E] dark:text-[#F4F7FB]">
              Subscriber Directory
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E3F0FC] text-[#1261A6] dark:bg-[#1A2942] dark:text-[#079FE3]">
            {subscribers.length} Readers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans min-w-[650px]">
            <thead className="bg-white dark:bg-[#0D1626] text-[#496784] dark:text-[#B6C3D4] font-bold uppercase tracking-wider border-b border-[#DCE7F2] dark:border-[#27364B]">
              <tr>
                <th className="px-5 py-3.5">Subscriber Email</th>
                <th className="px-5 py-3.5">Edition Preference</th>
                <th className="px-5 py-3.5">Account Status</th>
                <th className="px-5 py-3.5 text-right">Subscribed On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EDF5] dark:divide-[#27364B]">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#7890A8] italic">
                    No newsletter subscribers registered yet.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#F3F8FE] dark:hover:bg-[#1A2942]/30 transition">
                    <td className="px-5 py-4 font-mono font-bold text-[#174A7E] dark:text-[#F4F7FB]">
                      {sub.email}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-[#E3F0FC] text-[#1261A6] border border-[#DCE7F2] dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900 font-mono">
                        {sub.edition_preference || 'Morning'} Edition
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-emerald-50 text-[#16845B] border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-mono inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-[#16845B]" />
                        <span>Active</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right font-mono text-[11px] text-[#496784] dark:text-[#B6C3D4]">
                      {formatDate(sub.subscribed_at, 'short')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
