import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { 
  getEditorialStats, getAllArticlesAdmin, getEditorialSettings, 
  getShows, getCategories, getReporters 
} from '@/lib/data';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  FileText, CheckSquare, Users, Video, Film, Mail, 
  ArrowRight, PlusCircle, AlertCircle, ExternalLink, Edit3, 
  FolderTree, Image as ImageIcon, Radio, Clock, ShieldAlert, Sparkles
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const stats = getEditorialStats();
  const allArticles = getAllArticlesAdmin('ALL');
  const inReviewArticles = allArticles.filter((a) => a.status === 'IN_REVIEW').slice(0, 5);
  const recentlyPublished = allArticles.filter((a) => a.status === 'PUBLISHED').slice(0, 6);
  const recentActivity = allArticles.slice(0, 6);
  const settings = getEditorialSettings();
  const shows = getShows();
  const categories = getCategories();

  // Dynamic time-of-day greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const kpiCards = [
    {
      title: 'Published Articles',
      value: stats.published,
      description: 'Live across newsroom editions',
      icon: FileText,
      iconColor: 'text-[#16845B]',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      href: '/admin/articles?status=PUBLISHED',
    },
    {
      title: 'Draft Articles',
      value: stats.drafts,
      description: 'In editorial composition',
      icon: FileText,
      iconColor: 'text-[#356DA8]',
      iconBg: 'bg-[#E3F0FC] dark:bg-[#1A2942]',
      href: '/admin/articles?status=DRAFT',
    },
    {
      title: 'Pending Reviews',
      value: stats.inReview,
      description: 'Awaiting editor clearance',
      icon: CheckSquare,
      iconColor: 'text-[#D99018]',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40',
      href: '/admin/review-queue',
    },
    {
      title: 'Total Reporters',
      value: stats.totalReporters,
      description: 'Accredited field journalists',
      icon: Users,
      iconColor: 'text-[#1261A6]',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
      href: '/admin/reporters',
    },
    {
      title: 'Published Shows & Video',
      value: stats.totalVideos + shows.length,
      description: 'Broadcast documentaries & reports',
      icon: Video,
      iconColor: 'text-[#079FE3]',
      iconBg: 'bg-sky-50 dark:bg-sky-950/40',
      href: '/admin/videos',
    },
    {
      title: 'Total Subscribers',
      value: stats.subscribers,
      description: 'Daily briefing readership',
      icon: Mail,
      iconColor: 'text-[#7890A8]',
      iconBg: 'bg-slate-100 dark:bg-slate-800/40',
      href: '/admin/subscribers',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* 6. Top Welcome & Newsroom Overview */}
      <AdminHeader
        title={`${timeGreeting}, ${user.name}`}
        subtitle={`Welcome to the ${settings.publication_name} Editorial Operations Center. Real-time newsroom tracking, desk assignments, and publishing workflow.`}
        userRole={user.role}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/articles/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#079FE3] hover:bg-[#1261A6] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Article</span>
            </Link>
          </div>
        }
      />

      {/* Active Breaking News Callout */}
      {settings.breaking_banner_active && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D71920] animate-pulse" />
            <strong className="font-bold text-[#D71920] uppercase tracking-wider text-[11px] font-mono">
              Breaking News Banner Active:
            </strong>
            <span className="text-[#174A7E] dark:text-[#F4F7FB] font-medium truncate max-w-xl">
              {settings.breaking_headline}
            </span>
          </div>
          <Link
            href="/admin/settings"
            className="text-xs font-bold text-[#D71920] hover:underline shrink-0"
          >
            Configure Banner →
          </Link>
        </div>
      )}

      {/* Quick Actions Strip */}
      <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <span className="text-[10px] font-mono uppercase font-bold text-[#7890A8] px-2 py-1 shrink-0">
            Quick Actions:
          </span>
          <Link
            href="/admin/articles/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E3F0FC] dark:bg-[#1A2942] text-[#079FE3] hover:bg-[#079FE3] hover:text-white transition whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Compose Article</span>
          </Link>
          <Link
            href="/admin/reporters"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0F7FD] dark:bg-[#0D1626] text-[#174A7E] dark:text-[#B6C3D4] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] hover:text-[#079FE3] border border-[#DCE7F2] dark:border-[#27364B] transition whitespace-nowrap"
          >
            <Users className="w-3.5 h-3.5 text-[#079FE3]" />
            <span>Add Reporter</span>
          </Link>
          <Link
            href="/admin/media"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0F7FD] dark:bg-[#0D1626] text-[#174A7E] dark:text-[#B6C3D4] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] hover:text-[#079FE3] border border-[#DCE7F2] dark:border-[#27364B] transition whitespace-nowrap"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#079FE3]" />
            <span>Upload Photos</span>
          </Link>
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0F7FD] dark:bg-[#0D1626] text-[#174A7E] dark:text-[#B6C3D4] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] hover:text-[#079FE3] border border-[#DCE7F2] dark:border-[#27364B] transition whitespace-nowrap"
          >
            <FolderTree className="w-3.5 h-3.5 text-[#079FE3]" />
            <span>Manage Categories</span>
          </Link>
          <Link
            href="/admin/videos"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0F7FD] dark:bg-[#0D1626] text-[#174A7E] dark:text-[#B6C3D4] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] hover:text-[#079FE3] border border-[#DCE7F2] dark:border-[#27364B] transition whitespace-nowrap"
          >
            <Video className="w-3.5 h-3.5 text-[#079FE3]" />
            <span>Video Journalism</span>
          </Link>
        </div>
      </div>

      {/* 6. KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.title}
              href={kpi.href}
              className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl p-4.5 shadow-xs hover:border-[#079FE3] dark:hover:border-[#079FE3] hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#174A7E] dark:text-[#F4F7FB] truncate">
                  {kpi.title}
                </span>
                <div className={`w-8 h-8 rounded-lg ${kpi.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${kpi.iconColor}`} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#079FE3] font-mono">
                {kpi.value}
              </div>
              <p className="text-[11px] text-[#7890A8] dark:text-[#7890A8] mt-1 truncate">
                {kpi.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Two Column Newsroom Dashboard Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Editorial Review Queue + Recent Activity */}
        <div className="lg:col-span-7 space-y-6">
          {/* B. Editorial Review Queue */}
          <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-[#DCE7F2] dark:border-[#27364B] flex items-center justify-between bg-[#F0F6FC] dark:bg-[#0D1626]/50">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#D99018]" />
                <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
                  Editorial Review Queue
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-[#D99018] border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
                  {stats.inReview} Pending
                </span>
                <Link
                  href="/admin/review-queue"
                  className="text-xs font-bold text-[#079FE3] hover:underline"
                >
                  View All →
                </Link>
              </div>
            </div>

            <div className="divide-y divide-[#E5EDF5] dark:divide-[#27364B]">
              {inReviewArticles.length === 0 ? (
                <div className="p-8 text-center text-[#7890A8] text-xs italic">
                  Review queue is clear. No dispatches awaiting editorial authorization.
                </div>
              ) : (
                inReviewArticles.map((art) => (
                  <div
                    key={art.id}
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs hover:bg-[#F3F8FE] dark:hover:bg-[#1A2942]/30 transition"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-[#E3F0FC] text-[#1261A6] font-bold uppercase">
                          {art.category_name}
                        </span>
                        <span className="text-[#7890A8]">
                          By {art.reporter_name || 'Staff'} • {formatDate(art.created_at, 'relative')}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#174A7E] dark:text-[#F4F7FB] line-clamp-1 text-xs">
                        <Link href={`/admin/articles/${art.id}/edit`} className="hover:text-[#079FE3]">
                          {art.title}
                        </Link>
                      </h3>
                      {art.deck && (
                        <p className="text-[11px] text-[#496784] dark:text-[#B6C3D4] line-clamp-1">
                          {art.deck}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/admin/articles/${art.id}/edit`}
                      className="px-3 py-1.5 bg-[#E3F0FC] hover:bg-[#079FE3] text-[#1261A6] hover:text-white font-bold rounded-lg text-xs transition whitespace-nowrap shrink-0 border border-[#DCE7F2] dark:border-[#27364B] dark:bg-[#1A2942] dark:text-[#079FE3]"
                    >
                      Review & Authorize
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* A. Recent Publishing Activity */}
          <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-[#DCE7F2] dark:border-[#27364B] flex items-center justify-between bg-[#F0F6FC] dark:bg-[#0D1626]/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#079FE3]" />
                <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
                  Recent Newsroom Activity
                </h2>
              </div>
              <Link
                href="/admin/articles"
                className="text-xs font-bold text-[#079FE3] hover:underline"
              >
                All Articles →
              </Link>
            </div>

            <div className="divide-y divide-[#E5EDF5] dark:divide-[#27364B]">
              {recentActivity.map((art) => (
                <div
                  key={art.id}
                  className="p-4 flex items-center justify-between gap-3 text-xs hover:bg-[#F3F8FE] dark:hover:bg-[#1A2942]/30 transition"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-[#E3F0FC] text-[#1261A6] font-bold uppercase font-mono">
                        {art.category_name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase font-mono ${
                          art.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-[#16845B] border border-emerald-200'
                            : art.status === 'IN_REVIEW'
                            ? 'bg-amber-50 text-[#D99018] border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {art.status}
                      </span>
                      <span className="text-[#7890A8] font-mono">
                        {formatDate(art.created_at, 'short')}
                      </span>
                    </div>

                    <h4 className="font-bold text-[#174A7E] dark:text-[#F4F7FB] truncate">
                      <Link href={`/admin/articles/${art.id}/edit`} className="hover:text-[#079FE3]">
                        {art.title}
                      </Link>
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      href={`/admin/articles/${art.id}/edit`}
                      className="p-1.5 text-[#174A7E] dark:text-[#B6C3D4] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] hover:text-[#079FE3] rounded-md transition"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/article/${art.slug}`}
                      target="_blank"
                      className="p-1.5 text-[#7890A8] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] hover:text-[#079FE3] rounded-md transition"
                      title="View Story"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Recently Published Articles + Desks */}
        <div className="lg:col-span-5 space-y-6">
          {/* C. Recently Published Articles */}
          <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-[#DCE7F2] dark:border-[#27364B] flex items-center justify-between bg-[#F0F6FC] dark:bg-[#0D1626]/50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#16845B]" />
                <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
                  Live on Public Edition
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#16845B] font-bold">
                {stats.published} Live Stories
              </span>
            </div>

            <div className="divide-y divide-[#E5EDF5] dark:divide-[#27364B]">
              {recentlyPublished.map((art) => (
                <div
                  key={art.id}
                  className="p-3.5 flex items-center gap-3 text-xs hover:bg-[#F3F8FE] dark:hover:bg-[#1A2942]/30 transition"
                >
                  {art.featured_image ? (
                    <img
                      src={art.featured_image}
                      alt=""
                      className="w-14 h-11 object-cover rounded-md border border-[#DCE7F2] dark:border-[#27364B] shrink-0 bg-[#EDF4FC]"
                    />
                  ) : (
                    <div className="w-14 h-11 rounded-md bg-[#EDF4FC] dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] flex items-center justify-center text-[#7890A8] shrink-0 text-[10px] font-mono">
                      LIVE
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-[#174A7E] dark:text-[#F4F7FB] truncate">
                      <Link href={`/article/${art.slug}`} target="_blank" className="hover:text-[#079FE3]">
                        {art.title}
                      </Link>
                    </h4>
                    <div className="flex items-center gap-2 text-[10.5px] text-[#7890A8] font-mono mt-0.5">
                      <span className="text-[#079FE3] font-bold">{art.category_name}</span>
                      <span>•</span>
                      <span>{art.published_at ? formatDate(art.published_at, 'short') : 'Published'}</span>
                    </div>
                  </div>

                  <Link
                    href={`/article/${art.slug}`}
                    target="_blank"
                    className="p-1.5 text-[#7890A8] hover:text-[#079FE3] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] rounded-md transition shrink-0"
                    title="Open Live Story"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Editorial Desks Overview */}
          <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-[#DCE7F2] dark:border-[#27364B] flex items-center justify-between bg-[#F0F6FC] dark:bg-[#0D1626]/50">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-[#1261A6]" />
                <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
                  Newsroom Desks
                </h2>
              </div>
              <Link
                href="/admin/categories"
                className="text-xs font-bold text-[#079FE3] hover:underline"
              >
                Configure →
              </Link>
            </div>

            <div className="p-4 grid grid-cols-2 gap-2 text-xs">
              {categories.slice(0, 8).map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/articles?category=${c.id}`}
                  className="p-2.5 rounded-lg border border-[#DCE7F2] dark:border-[#27364B] bg-[#F0F7FD] dark:bg-[#0D1626] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] transition flex items-center justify-between"
                >
                  <span className="font-bold text-[#174A7E] dark:text-[#F4F7FB] truncate">
                    {c.name}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#7890A8]" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

