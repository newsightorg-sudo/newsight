'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { FolderTree, Plus, CheckCircle2, AlertCircle, ExternalLink, ArrowRight, Eye } from 'lucide-react';
import { Category } from '@/lib/types';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#079FE3');
  const [orderIndex, setOrderIndex] = useState(0);
  const [showInNav, setShowInNav] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      //
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          color,
          order_index: Number(orderIndex),
          show_in_nav: showInNav ? 1 : 0,
        }),
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: `Category "${name}" created successfully.` });
        setName('');
        setDescription('');
        await loadCategories();
      } else {
        const d = await res.json();
        setFeedback({ type: 'error', text: d.error || 'Failed to create category.' });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Network communication error.' });
    }
  }

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Categories & Desks Management"
        subtitle="Manage newsroom editorial desks, homepage sections, navigation bar order, and taxonomy."
      />

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs">
        {/* Add Category Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131F32] p-6 border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#DCE7F2] dark:border-[#27364B] pb-3">
            <Plus className="w-4 h-4 text-[#079FE3]" />
            <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
              Create Editorial Desk / Category
            </h2>
          </div>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Category / Desk Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Defense & Aerospace"
                required
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3] font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Desk Scope & Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Focus of reporting and beat coverage in this section..."
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                  Accent Color Token
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
                    className="w-full px-2.5 py-2 font-mono text-[11px] bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                  Display Order Weight
                </label>
                <input
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="show-nav-check"
                checked={showInNav}
                onChange={(e) => setShowInNav(e.target.checked)}
                className="rounded border-[#DCE7F2] text-[#079FE3] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="show-nav-check" className="font-semibold text-[#174A7E] dark:text-[#F4F7FB] cursor-pointer">
                Display in Primary Site Header Navigation
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold uppercase tracking-wider text-xs rounded-lg transition shadow-xs cursor-pointer"
            >
              Add Editorial Desk
            </button>
          </form>
        </div>

        {/* Existing Categories Table (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#DCE7F2] dark:border-[#27364B] flex items-center justify-between bg-[#F0F6FC] dark:bg-[#0D1626]/50">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-[#079FE3]" />
              <h3 className="font-bold text-sm text-[#174A7E] dark:text-[#F4F7FB]">
                Active Editorial Categories & Desks
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E3F0FC] text-[#1261A6] dark:bg-[#1A2942] dark:text-[#079FE3]">
              {categories.length} Desks
            </span>
          </div>

          <div className="divide-y divide-[#E5EDF5] dark:divide-[#27364B] max-h-[640px] overflow-y-auto">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-[#F3F8FE] dark:hover:bg-[#1A2942]/30 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: c.color || '#079FE3' }}
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-[#174A7E] dark:text-[#F4F7FB] truncate">
                      {c.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10.5px] text-[#7890A8] font-mono mt-0.5">
                      <span>slug: {c.slug}</span>
                      <span>•</span>
                      <span>Weight: {c.order_index}</span>
                      {c.show_in_nav === 1 && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-[#16845B] border border-emerald-200 text-[9px] font-bold">
                          NAV
                        </span>
                      )}
                    </div>
                    {c.description && (
                      <p className="text-[11px] text-[#496784] dark:text-[#B6C3D4] line-clamp-1 mt-0.5">
                        {c.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/category/${c.slug}`}
                    target="_blank"
                    className="p-1.5 text-[#079FE3] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] rounded-md transition"
                    title="View Public Category"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
