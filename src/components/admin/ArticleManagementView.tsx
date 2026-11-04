'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, Filter, PlusCircle, Edit3, ExternalLink, Trash2, 
  CheckCircle2, Clock, AlertCircle, RefreshCw, ChevronLeft, 
  ChevronRight, ArrowUpDown, ShieldCheck, Archive, Send
} from 'lucide-react';
import { Article, Category, Reporter, UserRole } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import AdminHeader from '@/components/admin/AdminHeader';

interface ArticleManagementViewProps {
  initialArticles: Article[];
  categories: Category[];
  reporters: Reporter[];
  userRole?: UserRole;
  initialStatus?: string;
}

export default function ArticleManagementView({
  initialArticles,
  categories,
  reporters,
  userRole,
  initialStatus = 'ALL',
}: ArticleManagementViewProps) {
  const router = useRouter();

  // State
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [authorFilter, setAuthorFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const canApproveOrPublish = userRole === 'SUPER_ADMIN' || userRole === 'EDITOR';

  // Real Counts for Status Filter Tabs
  const statusCounts = useMemo(() => {
    const counts = {
      ALL: articles.length,
      PUBLISHED: 0,
      IN_REVIEW: 0,
      APPROVED: 0,
      DRAFT: 0,
      ARCHIVED: 0,
    };
    articles.forEach((art) => {
      const s = art.status as keyof typeof counts;
      if (counts[s] !== undefined) {
        counts[s]++;
      }
    });
    return counts;
  }, [articles]);

  const filterTabs = [
    { label: 'All Dispatches', value: 'ALL', count: statusCounts.ALL },
    { label: 'Published', value: 'PUBLISHED', count: statusCounts.PUBLISHED },
    { label: 'In Review', value: 'IN_REVIEW', count: statusCounts.IN_REVIEW },
    { label: 'Approved', value: 'APPROVED', count: statusCounts.APPROVED },
    { label: 'Drafts', value: 'DRAFT', count: statusCounts.DRAFT },
    { label: 'Archived', value: 'ARCHIVED', count: statusCounts.ARCHIVED },
  ];

  // Filtered & Sorted Articles
  const filteredArticles = useMemo(() => {
    return articles
      .filter((art) => {
        // Status filter
        if (selectedStatus !== 'ALL' && art.status !== selectedStatus) {
          return false;
        }
        // Category filter
        if (categoryFilter !== 'ALL' && art.category_id !== categoryFilter && art.category_name !== categoryFilter) {
          return false;
        }
        // Author filter
        if (authorFilter !== 'ALL' && art.reporter_id !== authorFilter && art.reporter_name !== authorFilter) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = art.title?.toLowerCase().includes(q);
          const matchDeck = art.deck?.toLowerCase().includes(q);
          const matchReporter = art.reporter_name?.toLowerCase().includes(q);
          const matchCategory = art.category_name?.toLowerCase().includes(q);
          if (!matchTitle && !matchDeck && !matchReporter && !matchCategory) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at || a.published_at || 0).getTime();
        const dateB = new Date(b.created_at || b.published_at || 0).getTime();
        return sortOrder === 'NEWEST' ? dateB - dateA : dateA - dateB;
      });
  }, [articles, selectedStatus, categoryFilter, authorFilter, searchQuery, sortOrder]);

  // Paginated Articles
  const totalPages = Math.ceil(filteredArticles.length / pageSize) || 1;
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredArticles.slice(start, start + pageSize);
  }, [filteredArticles, currentPage, pageSize]);

  // Selection helpers
  const allCurrentPageSelected = paginatedArticles.length > 0 && paginatedArticles.every((art) => selectedIds.has(art.id));

  function toggleSelectAll() {
    const newSelected = new Set(selectedIds);
    if (allCurrentPageSelected) {
      paginatedArticles.forEach((art) => newSelected.delete(art.id));
    } else {
      paginatedArticles.forEach((art) => newSelected.add(art.id));
    }
    setSelectedIds(newSelected);
  }

  function toggleSelectOne(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  function resetFilters() {
    setSelectedStatus('ALL');
    setCategoryFilter('ALL');
    setAuthorFilter('ALL');
    setSearchQuery('');
    setSortOrder('NEWEST');
    setCurrentPage(1);
  }

  // Bulk Operations
  async function handleBulkStatusChange(targetStatus: string) {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to change ${selectedIds.size} article(s) to ${targetStatus}?`)) return;

    setIsBulkProcessing(true);
    setActionFeedback(null);

    try {
      const idsArray = Array.from(selectedIds);
      let successCount = 0;

      for (const id of idsArray) {
        const res = await fetch(`/api/articles/${id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: targetStatus }),
        });
        if (res.ok) successCount++;
      }

      setArticles((prev) =>
        prev.map((art) => (selectedIds.has(art.id) ? { ...art, status: targetStatus as any } : art))
      );
      setSelectedIds(new Set());
      setActionFeedback({
        type: 'success',
        text: `Successfully transitioned ${successCount} article(s) to ${targetStatus}.`,
      });
      router.refresh();
    } catch (e) {
      setActionFeedback({ type: 'error', text: 'Error executing bulk status update.' });
    } finally {
      setIsBulkProcessing(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`PERMANENT DELETION: Are you sure you want to permanently delete ${selectedIds.size} selected article(s)? This action cannot be reversed.`)) return;

    setIsBulkProcessing(true);
    setActionFeedback(null);

    try {
      const idsArray = Array.from(selectedIds);
      for (const id of idsArray) {
        await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      }

      setArticles((prev) => prev.filter((art) => !selectedIds.has(art.id)));
      setSelectedIds(new Set());
      setActionFeedback({
        type: 'success',
        text: `Permanently removed ${idsArray.length} article(s) from the newsroom database.`,
      });
      router.refresh();
    } catch (e) {
      setActionFeedback({ type: 'error', text: 'Error executing bulk deletion.' });
    } finally {
      setIsBulkProcessing(false);
    }
  }

  async function handleDeleteSingle(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        setActionFeedback({ type: 'success', text: `Article "${title}" deleted.` });
        router.refresh();
      } else {
        const d = await res.json();
        setActionFeedback({ type: 'error', text: d.error || 'Failed to delete article.' });
      }
    } catch (_) {
      setActionFeedback({ type: 'error', text: 'Network error deleting article.' });
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* 4. Page Header */}
      <AdminHeader
        title="Article Management"
        subtitle="Manage newsroom stories, drafts, editorial approvals, and publication schedules."
        userRole={userRole}
        actions={
          <Link
            href="/admin/articles/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#079FE3] hover:bg-[#1261A6] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Article</span>
          </Link>
        }
      />

      {/* Feedback Alert */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-[#16845B] dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-[#D71920] dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="font-medium">{actionFeedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-xs underline font-bold cursor-pointer hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 5A. Status Filters Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {filterTabs.map((tab) => {
          const isActive = selectedStatus === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setSelectedStatus(tab.value);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-[#E5F2FC] dark:bg-[#1A2942] text-[#087FC1] dark:text-[#079FE3] border border-[#087FC1]/40 font-bold shadow-xs'
                  : 'bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#B6C3D4] hover:bg-[#F0F7FD] dark:hover:bg-[#1A2942] hover:text-[#087FC1]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isActive
                    ? 'bg-[#087FC1] text-white'
                    : 'bg-[#F0F7FD] dark:bg-[#0D1626] text-[#607991] dark:text-[#7890A8]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 5B. Search and Filter Toolbar */}
      <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] p-4 rounded-xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#356DA8] dark:text-[#7890A8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search headline, reporter, or summary..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#71869C] rounded-lg focus:outline-none focus:border-[#079FE3]"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3] cursor-pointer"
            >
              <option value="ALL">All Categories / Desks</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Author Dropdown */}
          <div>
            <select
              value={authorFilter}
              onChange={(e) => {
                setAuthorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3] cursor-pointer"
            >
              <option value="ALL">All Staff Reporters</option>
              {reporters.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name} ({r.beat})
                </option>
              ))}
            </select>
          </div>

          {/* Sort & Reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#B6C3D4] hover:bg-[#F0F7FD] dark:hover:bg-[#1A2942] rounded-lg transition font-medium cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#079FE3]" />
              <span>{sortOrder === 'NEWEST' ? 'Newest First' : 'Oldest First'}</span>
            </button>

            {(searchQuery || categoryFilter !== 'ALL' || authorFilter !== 'ALL' || selectedStatus !== 'ALL') && (
              <button
                type="button"
                onClick={resetFilters}
                className="py-2 px-3 text-xs text-[#7890A8] hover:text-[#D71920] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition font-medium border border-transparent hover:border-red-200 cursor-pointer"
                title="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Bulk Actions Floating Bar */}
        {selectedIds.size > 0 && (
          <div className="p-3 bg-[#E3F0FC] dark:bg-[#1A2942] border border-[#079FE3]/30 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 font-bold text-[#174A7E] dark:text-[#F4F7FB]">
              <span className="w-2 h-2 rounded-full bg-[#079FE3]" />
              <span>{selectedIds.size} article(s) selected</span>
            </div>

            <div className="flex items-center gap-2">
              {canApproveOrPublish && (
                <button
                  type="button"
                  disabled={isBulkProcessing}
                  onClick={() => handleBulkStatusChange('PUBLISHED')}
                  className="px-3 py-1.5 bg-[#16845B] hover:bg-emerald-700 text-white font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Publish Selected</span>
                </button>
              )}

              <button
                type="button"
                disabled={isBulkProcessing}
                onClick={() => handleBulkStatusChange('ARCHIVED')}
                className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive</span>
              </button>

              {canApproveOrPublish && (
                <button
                  type="button"
                  disabled={isBulkProcessing}
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-[#D71920] hover:bg-red-700 text-white font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="px-2.5 py-1.5 text-[#496784] dark:text-[#B6C3D4] hover:underline"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5C. Article Table */}
      <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans min-w-[900px]">
            <thead className="bg-[#F0F6FC] dark:bg-[#0D1626] text-[#174A7E] dark:text-[#B6C3D4] font-bold uppercase tracking-wider border-b border-[#DCE7F2] dark:border-[#27364B]">
              <tr>
                <th className="px-4 py-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all on this page"
                    className="rounded border-[#DCE7F2] text-[#079FE3] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5 min-w-[280px]">Article</th>
                <th className="px-4 py-3.5 min-w-[130px]">Category</th>
                <th className="px-4 py-3.5 min-w-[150px]">Author</th>
                <th className="px-4 py-3.5 min-w-[140px]">Flags</th>
                <th className="px-4 py-3.5 min-w-[120px]">Status</th>
                <th className="px-4 py-3.5 min-w-[130px]">Published Date</th>
                <th className="px-4 py-3.5 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EDF5] dark:divide-[#27364B] bg-white dark:bg-transparent">
              {paginatedArticles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#E5F2FC] dark:bg-[#1A2942] text-[#087FC1] flex items-center justify-center mx-auto">
                        <Search className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-base text-[#174A7E] dark:text-[#F4F7FB]">
                        No matching dispatches found
                      </h3>
                      <p className="text-xs text-[#71869C]">
                        Try adjusting your filters, search keyword, or status tabs to view articles.
                      </p>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="px-4 py-2 bg-[#079FE3] text-white font-bold rounded-lg hover:bg-[#1261A6] transition text-xs cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((art) => {
                  const isSelected = selectedIds.has(art.id);
                  return (
                    <tr
                      key={art.id}
                      className={`transition ${
                        isSelected
                          ? 'bg-[#E5F2FC] dark:bg-[#1A2942]/60'
                          : 'bg-white hover:bg-[#F3F8FE] dark:bg-transparent dark:hover:bg-[#1A2942]/30'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(art.id)}
                          aria-label={`Select article ${art.title}`}
                          className="rounded border-[#DCE7F2] text-[#079FE3] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* ARTICLE (Thumbnail, Headline, Summary, ID) */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-3">
                          {art.featured_image ? (
                            <img
                              src={art.featured_image}
                              alt=""
                              className="w-14 h-10 object-cover rounded-md border border-[#DCE7F2] dark:border-[#27364B] shrink-0 bg-[#EDF4FC] dark:bg-[#0D1626]"
                            />
                          ) : (
                            <div className="w-14 h-10 rounded-md bg-[#EDF4FC] dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] flex items-center justify-center text-[#7890A8] shrink-0 text-[10px] font-mono">
                              NEWS
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/admin/articles/${art.id}/edit`}
                              className="font-bold text-[#174A7E] dark:text-[#F4F7FB] hover:text-[#079FE3] dark:hover:text-[#079FE3] block text-xs leading-snug line-clamp-2 transition"
                            >
                              {art.title}
                            </Link>
                            {art.deck && (
                              <p className="text-[11px] text-[#607991] dark:text-[#B6C3D4] line-clamp-1 mt-0.5">
                                {art.deck}
                              </p>
                            )}
                            <span className="text-[9.5px] font-mono text-[#71869C] block mt-0.5">
                              ID: {art.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-[#E5F2FC] text-[#087FC1] border border-[#DCE7F2] dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900 inline-block font-mono">
                          {art.category_name}
                        </span>
                      </td>

                      {/* AUTHOR */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#1261A6] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {(art.reporter_name || 'D').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-[#294767] dark:text-[#F4F7FB] truncate max-w-[130px]">
                            {art.reporter_name || 'Desk Staff'}
                          </span>
                        </div>
                      </td>

                      {/* FLAGS */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-wrap items-center gap-1">
                          {art.is_breaking === 1 && (
                            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-[#FDE8E8] text-[#D71920] border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800">
                              BREAKING
                            </span>
                          )}
                          {art.is_lead === 1 && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-50 text-[#D99018] border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                              LEAD
                            </span>
                          )}
                          {art.is_featured === 1 && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-[#E5F2FC] text-[#087FC1] border border-[#DCE7F2] dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800">
                              FEATURED
                            </span>
                          )}
                          {art.is_opinion === 1 && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
                              OPINION
                            </span>
                          )}
                          {art.is_breaking !== 1 && art.is_lead !== 1 && art.is_featured !== 1 && art.is_opinion !== 1 && (
                            <span className="text-[10px] text-[#71869C] font-mono">—</span>
                          )}
                        </div>
                      </td>

                      {/* STATUS (Light backgrounds, no dark badge bg) */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border font-mono inline-flex items-center gap-1.5 ${
                            art.status === 'PUBLISHED'
                              ? 'bg-[#EBF9F1] text-[#16845B] border-[#C3ECD2] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                              : art.status === 'IN_REVIEW'
                              ? 'bg-[#FEF6E7] text-[#D99018] border-[#FCE1B6] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                              : art.status === 'APPROVED'
                              ? 'bg-[#E5F2FC] text-[#087FC1] border-[#BCE0FD] dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                              : art.status === 'DRAFT'
                              ? 'bg-[#EEF4F9] text-[#496784] border-[#DCE7F2] dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700'
                              : 'bg-[#F1F5F9] text-[#71869C] border-[#DCE7F2] dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              art.status === 'PUBLISHED'
                                ? 'bg-[#16845B]'
                                : art.status === 'IN_REVIEW'
                                ? 'bg-[#D99018]'
                                : art.status === 'APPROVED'
                                ? 'bg-[#087FC1]'
                                : 'bg-[#71869C]'
                            }`}
                          />
                          <span>{art.status}</span>
                        </span>
                      </td>

                      {/* PUBLISHED DATE */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-[#607991] dark:text-[#B6C3D4] font-mono text-[11px]">
                        {art.published_at ? formatDate(art.published_at, 'short') : 'Not Published'}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/articles/${art.id}/edit`}
                            title="Edit Article"
                            className="p-1.5 rounded-lg text-[#607991] dark:text-[#B6C3D4] hover:bg-[#F0F7FD] dark:hover:bg-[#1A2942] hover:text-[#087FC1] transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>

                          {art.status === 'PUBLISHED' ? (
                            <Link
                              href={`/article/${art.slug}`}
                              target="_blank"
                              title="View Public Article"
                              className="p-1.5 rounded-lg text-[#607991] dark:text-[#B6C3D4] hover:bg-[#F0F7FD] dark:hover:bg-[#1A2942] hover:text-[#087FC1] transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <Link
                              href={`/article/${art.slug}`}
                              target="_blank"
                              title="Preview Draft"
                              className="p-1.5 rounded-lg text-[#71869C] hover:bg-[#F0F7FD] dark:hover:bg-[#1A2942] hover:text-[#087FC1] transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteSingle(art.id, art.title)}
                            title="Delete Article"
                            className="p-1.5 rounded-lg text-[#71869C] hover:text-[#D71920] hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5D. Pagination & Rows per page */}
        <div className="px-4 py-3.5 bg-[#F0F6FC] dark:bg-[#0D1626] border-t border-[#DCE7F2] dark:border-[#27364B] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-[#294767] dark:text-[#B6C3D4]">
            <span>
              Showing <strong className="text-[#174A7E] dark:text-[#F4F7FB]">{filteredArticles.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-[#174A7E] dark:text-[#F4F7FB]">
                {Math.min(currentPage * pageSize, filteredArticles.length)}
              </strong>{' '}
              of <strong className="text-[#174A7E] dark:text-[#F4F7FB]">{filteredArticles.length}</strong> dispatches
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[#71869C]">| Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="py-1 px-2 bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-md font-mono text-[11px] cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#B6C3D4] bg-white dark:bg-[#131F32] hover:bg-[#F0F7FD] dark:hover:bg-[#1A2942] disabled:opacity-40 transition cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-mono font-bold text-[#174A7E] dark:text-[#F4F7FB]">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#B6C3D4] bg-white dark:bg-[#131F32] hover:bg-[#F0F7FD] dark:hover:bg-[#1A2942] disabled:opacity-40 transition cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

