'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  FolderTree, Plus, CheckCircle2, AlertCircle, ExternalLink, 
  Edit3, Trash2, X, Search, RotateCcw, AlertTriangle, Layers,
  Compass, ArrowUpDown
} from 'lucide-react';
import { Category } from '@/lib/types';
import Link from 'next/link';

const PRESET_COLORS = [
  '#E50914', // News Red
  '#079FE3', // Brand Sky Blue
  '#075DEB', // Cobalt Blue
  '#10B981', // Emerald Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#EC4899', // Pink
  '#64748B', // Slate
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#079FE3');
  const [orderIndex, setOrderIndex] = useState(0);
  const [showInNav, setShowInNav] = useState(true);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      }
    } catch (_) {
      setFeedback({ type: 'error', text: 'Failed to load newsroom categories.' });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setColor('#079FE3');
    setOrderIndex(0);
    setShowInNav(true);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setColor(cat.color || '#079FE3');
    setOrderIndex(Number(cat.order_index) || 0);
    setShowInNav(cat.show_in_nav === 1);

    // Smooth scroll to form on mobile/small screens
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        // UPDATE existing category
        const res = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim(),
            color,
            order_index: Number(orderIndex),
            show_in_nav: showInNav ? 1 : 0,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setFeedback({ type: 'success', text: `Desk "${name}" updated successfully.` });
          resetForm();
          await loadCategories();
        } else {
          setFeedback({ type: 'error', text: data.error || 'Failed to update category.' });
        }
      } else {
        // CREATE new category
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim(),
            color,
            order_index: Number(orderIndex),
            show_in_nav: showInNav ? 1 : 0,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setFeedback({ type: 'success', text: `Desk "${name}" added to newsroom.` });
          resetForm();
          await loadCategories();
        } else {
          setFeedback({ type: 'error', text: data.error || 'Failed to create category.' });
        }
      }
    } catch (_) {
      setFeedback({ type: 'error', text: 'Network communication error.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete(force = false) {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const url = `/api/categories?id=${encodeURIComponent(deleteTarget.id)}${force ? '&force=true' : ''}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        setFeedback({ type: 'success', text: `Desk "${deleteTarget.name}" deleted successfully.` });
        if (editingId === deleteTarget.id) {
          resetForm();
        }
        setDeleteTarget(null);
        await loadCategories();
      } else if (res.status === 409) {
        // Category contains articles -> prompt for forced reassignment
        const confirmed = window.confirm(
          `"${deleteTarget.name}" currently has ${data.articleCount} assigned articles. Would you like to force delete and automatically reassign these articles to an active newsroom desk?`
        );
        if (confirmed) {
          await confirmDelete(true);
        }
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to delete category.' });
      }
    } catch (_) {
      setFeedback({ type: 'error', text: 'Network error deleting category.' });
    } finally {
      setIsDeleting(false);
    }
  }

  // Filtered categories
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  // Aggregate stats
  const totalArticles = useMemo(() => {
    return categories.reduce((sum, c: any) => sum + (Number(c.article_count) || 0), 0);
  }, [categories]);

  const navDesksCount = useMemo(() => {
    return categories.filter((c) => c.show_in_nav === 1).length;
  }, [categories]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Categories & Desks Management"
        subtitle="Create, edit, reorder, and configure newsroom editorial desks, header navigation taxonomy, and beat assignments."
      />

      {/* System Feedback Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-2 animate-in fade-in duration-150 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-[#16845B] dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-[#D71920] dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="font-semibold">{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="underline font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white dark:bg-[#131F32] p-4 rounded-xl border border-[#DCE7F2] dark:border-[#27364B] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-[#71869C] dark:text-[#7890A8]">
              Total Editorial Desks
            </span>
            <div className="text-2xl font-black text-[#174A7E] dark:text-[#F4F7FB] font-mono mt-0.5">
              {categories.length}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#E3F0FC] dark:bg-[#1A2942] text-[#079FE3] flex items-center justify-center">
            <FolderTree className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#131F32] p-4 rounded-xl border border-[#DCE7F2] dark:border-[#27364B] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-[#71869C] dark:text-[#7890A8]">
              Header Navigation Desks
            </span>
            <div className="text-2xl font-black text-[#16845B] dark:text-emerald-400 font-mono mt-0.5">
              {navDesksCount}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#16845B] dark:text-emerald-400 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#131F32] p-4 rounded-xl border border-[#DCE7F2] dark:border-[#27364B] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-[#71869C] dark:text-[#7890A8]">
              Articles in Taxonomy
            </span>
            <div className="text-2xl font-black text-[#075DEB] font-mono mt-0.5">
              {totalArticles}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#075DEB] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Form (5 cols) + Table/List (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs">
        
        {/* ADD / EDIT FORM (5 cols) */}
        <div
          ref={formRef}
          className={`lg:col-span-5 bg-white dark:bg-[#131F32] p-6 border rounded-xl shadow-xs space-y-4 transition-all duration-200 ${
            editingId
              ? 'border-[#079FE3] ring-2 ring-[#079FE3]/20'
              : 'border-[#DCE7F2] dark:border-[#27364B]'
          }`}
        >
          {/* Form Header */}
          <div className="flex items-center justify-between border-b border-[#DCE7F2] dark:border-[#27364B] pb-3">
            <div className="flex items-center gap-2">
              {editingId ? (
                <>
                  <Edit3 className="w-4 h-4 text-[#079FE3]" />
                  <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
                    Edit Desk Details
                  </h2>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-[#079FE3]" />
                  <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
                    Create Editorial Desk
                  </h2>
                </>
              )}
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#71869C] hover:text-[#D71920] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Cancel Edit</span>
              </button>
            )}
          </div>

          {editingId && (
            <div className="p-2.5 rounded-lg bg-[#E3F0FC] dark:bg-[#1A2942] border border-[#079FE3]/30 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-[#1261A6] dark:text-[#079FE3]">
                Editing Desk ID: <code className="font-mono font-bold">{editingId}</code>
              </span>
              <span className="text-[10px] text-[#71869C]">Make changes and save</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Name */}
            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Category / Desk Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  // Auto-generate slug when creating new category
                  if (!editingId && !slug) {
                    // Let the API handle it, or keep user input clean
                  }
                }}
                placeholder="e.g. Defense & Strategic Affairs"
                required
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3] font-semibold text-xs sm:text-sm"
              />
            </div>

            {/* Custom URL Slug */}
            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                URL Slug <span className="text-[10px] text-[#71869C] font-normal">(Optional, auto-generated if left blank)</span>
              </label>
              <div className="flex items-center">
                <span className="px-2.5 py-2 bg-[#F0F7FD] dark:bg-[#0D1626] border border-r-0 border-[#DCE7F2] dark:border-[#27364B] rounded-l-lg text-[#71869C] font-mono text-[11px]">
                  /category/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="defense-strategic-affairs"
                  className="flex-1 px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-r-lg focus:outline-none focus:border-[#079FE3] font-mono text-xs"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Desk Scope & Coverage Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Core topics, investigative focus, and beat reporting scope..."
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
              />
            </div>

            {/* Color & Order Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-9 h-9 p-0.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-2.5 py-2 font-mono text-[11px] bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg uppercase"
                  />
                </div>

                {/* Color Swatches */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                        color === c ? 'scale-125 ring-2 ring-[#079FE3]' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                      title={`Select ${c}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                  Display Weight <span className="text-[10px] text-[#71869C] font-normal">(Sort)</span>
                </label>
                <input
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3] font-mono text-xs"
                />
                <p className="text-[10px] text-[#71869C] mt-1">Lower values appear first in lists.</p>
              </div>
            </div>

            {/* Navigation Toggle */}
            <div className="p-3 rounded-lg bg-[#F0F7FD] dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] flex items-center justify-between gap-3">
              <div>
                <label htmlFor="show-nav-check" className="font-bold text-[#174A7E] dark:text-[#F4F7FB] block cursor-pointer">
                  Show in Primary Header Navigation
                </label>
                <span className="text-[10px] text-[#71869C] block">
                  Category appears in the top navigation bar when articles are published.
                </span>
              </div>
              <input
                type="checkbox"
                id="show-nav-check"
                checked={showInNav}
                onChange={(e) => setShowInNav(e.target.checked)}
                className="w-4 h-4 rounded border-[#DCE7F2] text-[#079FE3] focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold uppercase tracking-wider text-xs rounded-lg transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {submitting
                  ? editingId ? 'Updating Desk...' : 'Creating Desk...'
                  : editingId ? 'Update Editorial Desk' : 'Add Editorial Desk'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#1A2942] dark:hover:bg-[#27364B] text-[#294767] dark:text-[#B6C3D4] font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* CATEGORIES TABLE & LIST (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs overflow-hidden flex flex-col">
          {/* Table Header & Search */}
          <div className="p-4 border-b border-[#DCE7F2] dark:border-[#27364B] bg-[#F0F6FC] dark:bg-[#0D1626]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-[#079FE3]" />
              <h3 className="font-bold text-sm text-[#174A7E] dark:text-[#F4F7FB]">
                Active Editorial Desks
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E3F0FC] text-[#1261A6] dark:bg-[#1A2942] dark:text-[#079FE3]">
                {filteredCategories.length} of {categories.length}
              </span>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#7890A8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search desks by name or slug..."
                className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-xs text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-[#7890A8] hover:text-[#174A7E]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Categories List */}
          <div className="divide-y divide-[#E5EDF5] dark:divide-[#27364B] max-h-[720px] overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center text-[#7890A8] text-xs">
                Loading editorial taxonomy...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-12 text-center text-[#7890A8] text-xs space-y-2">
                <p className="font-semibold">No categories match &ldquo;{searchQuery}&rdquo;.</p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-[#079FE3] font-bold underline"
                  >
                    Clear Search Filter
                  </button>
                )}
              </div>
            ) : (
              filteredCategories.map((c) => {
                const isSelected = editingId === c.id;
                const articleCount = Number((c as any).article_count || 0);

                return (
                  <div
                    key={c.id}
                    className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                      isSelected
                        ? 'bg-[#E5F2FC]/70 dark:bg-[#1A2942]/60 border-l-4 border-[#079FE3]'
                        : 'hover:bg-[#F3F8FE] dark:hover:bg-[#1A2942]/30'
                    }`}
                  >
                    {/* Left: Color dot & Details */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs mt-1"
                        style={{ backgroundColor: c.color || '#079FE3' }}
                        title={`Color: ${c.color}`}
                      />
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-[#174A7E] dark:text-[#F4F7FB]">
                            {c.name}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded bg-[#F0F7FD] dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[10px] font-mono text-[#496784] dark:text-[#A4ADBB]">
                            /{c.slug}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10.5px] text-[#7890A8] font-mono flex-wrap pt-0.5">
                          <span>Weight: {c.order_index}</span>
                          <span>•</span>
                          <span className={articleCount > 0 ? 'text-[#075DEB] font-bold' : ''}>
                            {articleCount} {articleCount === 1 ? 'Article' : 'Articles'}
                          </span>
                          {c.show_in_nav === 1 && (
                            <>
                              <span>•</span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-[#16845B] border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-[9px] font-bold uppercase">
                                Nav Bar
                              </span>
                            </>
                          )}
                        </div>

                        {c.description && (
                          <p className="text-[11px] text-[#496784] dark:text-[#B6C3D4] line-clamp-1 pt-0.5">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions (Edit, Delete, View) */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#079FE3] text-white shadow-xs'
                            : 'text-[#079FE3] bg-[#E3F0FC] hover:bg-[#079FE3] hover:text-white dark:bg-[#1A2942] dark:hover:bg-[#079FE3]'
                        }`}
                        title="Edit Desk"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#D71920] bg-red-50 hover:bg-[#D71920] hover:text-white dark:bg-red-950/30 dark:hover:bg-[#D71920] transition cursor-pointer"
                        title="Delete Desk"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      {/* External Link */}
                      <Link
                        href={`/category/${c.slug}`}
                        target="_blank"
                        className="p-1.5 text-[#7890A8] hover:text-[#079FE3] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] rounded-lg transition"
                        title="View Public Category Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#D71920]">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#D71920]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#174A7E] dark:text-[#F4F7FB]">
                  Delete Category / Desk
                </h3>
                <p className="text-xs text-[#71869C]">This action modifies newsroom taxonomy.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F0F7FD] dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-[#174A7E] dark:text-[#F4F7FB]">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: deleteTarget.color || '#079FE3' }}
                />
                <span>{deleteTarget.name}</span>
                <code className="text-[11px] font-mono text-[#71869C]">({deleteTarget.slug})</code>
              </div>
              <p className="text-[#496784] dark:text-[#B6C3D4]">
                {Number((deleteTarget as any).article_count || 0) > 0 ? (
                  <span className="text-[#D71920] font-semibold">
                    Warning: This desk currently contains {Number((deleteTarget as any).article_count)} article(s).
                    Deleting will safely reassign those articles to an active desk so no stories are lost.
                  </span>
                ) : (
                  <span>This desk currently has 0 articles and can be safely removed.</span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-xs font-bold text-[#496784] hover:bg-[#F0F7FD] dark:hover:bg-[#1A2942] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(Number((deleteTarget as any).article_count || 0) > 0)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#D71920] hover:bg-red-700 text-white transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
