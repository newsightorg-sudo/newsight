'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Radio, PlusCircle, Send, CheckCircle2, AlertCircle, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import { LiveBlog, Category, Reporter } from '@/lib/types';
import Link from 'next/link';

export default function AdminLiveBlogsPage() {
  const [liveBlogs, setLiveBlogs] = useState<LiveBlog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [loading, setLoading] = useState(true);

  // New Blog Form
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogSummary, setNewBlogSummary] = useState('');
  const [newBlogCategory, setNewBlogCategory] = useState('');
  const [newBlogReporter, setNewBlogReporter] = useState('');

  // New Update Form
  const [selectedBlogId, setSelectedBlogId] = useState('');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [updateImage, setUpdateImage] = useState('');
  const [isKeyEvent, setIsKeyEvent] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [resBlogs, resCats, resReps] = await Promise.all([
        fetch('/api/live-blogs').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/reporters').then((r) => r.json()),
      ]);

      if (resBlogs.liveBlogs) {
        setLiveBlogs(resBlogs.liveBlogs);
        if (resBlogs.liveBlogs.length > 0) {
          setSelectedBlogId(resBlogs.liveBlogs[0].id);
        }
      }
      if (resCats.categories) {
        setCategories(resCats.categories);
        setNewBlogCategory(resCats.categories[0]?.id || '');
      }
      if (resReps.reporters) {
        setReporters(resReps.reporters);
        setNewBlogReporter(resReps.reporters[0]?.id || '');
      }
    } catch (e) {
      //
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBlog(e: React.FormEvent) {
    e.preventDefault();
    if (!newBlogTitle || !newBlogSummary) return;

    try {
      const res = await fetch('/api/live-blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newBlogTitle,
          summary: newBlogSummary,
          category_id: newBlogCategory,
          reporter_id: newBlogReporter,
          status: 'ACTIVE',
        }),
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: `Live Blog "${newBlogTitle}" created and activated.` });
        setNewBlogTitle('');
        setNewBlogSummary('');
        await loadData();
      } else {
        const d = await res.json();
        setFeedback({ type: 'error', text: d.error || 'Failed to create blog.' });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Network error.' });
    }
  }

  async function handlePostUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBlogId || !updateTitle || !updateContent) return;

    try {
      const res = await fetch(`/api/live-blogs/${selectedBlogId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updateTitle,
          content: updateContent,
          image_url: updateImage,
          is_key_event: isKeyEvent ? 1 : 0,
        }),
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: 'Live update dispatched to readers in real time.' });
        setUpdateTitle('');
        setUpdateContent('');
        setUpdateImage('');
        setIsKeyEvent(false);
      } else {
        const d = await res.json();
        setFeedback({ type: 'error', text: d.error || 'Failed to post update.' });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Post update error.' });
    }
  }

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Live Coverage & Rolling Dispatches"
        subtitle="Manage live breaking news blogs and dispatch real-time timestamped updates to active readers."
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
        {/* Post Update to Active Blog (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131F32] p-6 border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE7F2] dark:border-[#27364B] pb-3">
            <div className="flex items-center gap-2 text-[#079FE3] font-bold uppercase text-[11px] tracking-wider">
              <Radio className="w-4 h-4 text-[#D71920] animate-pulse" />
              <span className="text-[#174A7E] dark:text-[#F4F7FB]">Dispatch Real-Time Update</span>
            </div>
            <span className="text-[11px] text-[#7890A8] font-mono">Instant reader broadcast</span>
          </div>

          <form onSubmit={handlePostUpdate} className="space-y-4">
            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Target Live Blog *
              </label>
              <select
                value={selectedBlogId}
                onChange={(e) => setSelectedBlogId(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3] cursor-pointer"
              >
                {liveBlogs.map((b) => (
                  <option key={b.id} value={b.id}>
                    [{b.status}] {b.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Update Headline / Timestamp Cue *
              </label>
              <input
                type="text"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
                placeholder="e.g. Finance Ministry Concludes Tripartite Deliberations"
                required
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3] font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Update Body / Dispatch *
              </label>
              <textarea
                rows={4}
                value={updateContent}
                onChange={(e) => setUpdateContent(e.target.value)}
                placeholder="Detailed text from the floor, quotes, immediate developments..."
                required
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3] leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Accompanying Photo URL
              </label>
              <input
                type="text"
                value={updateImage}
                onChange={(e) => setUpdateImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="key-event-check"
                checked={isKeyEvent}
                onChange={(e) => setIsKeyEvent(e.target.checked)}
                className="rounded border-[#DCE7F2] text-[#079FE3] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="key-event-check" className="font-semibold text-[#174A7E] dark:text-[#F4F7FB] cursor-pointer">
                Highlight as "Key Event" on reader timelines
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold uppercase tracking-wider text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Update to Readers</span>
            </button>
          </form>
        </div>

        {/* Create Live Blog Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131F32] p-6 border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#DCE7F2] dark:border-[#27364B] pb-3">
            <PlusCircle className="w-4 h-4 text-[#079FE3]" />
            <h3 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
              Initialize New Live Event Blog
            </h3>
          </div>

          <form onSubmit={handleCreateBlog} className="space-y-4">
            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                value={newBlogTitle}
                onChange={(e) => setNewBlogTitle(e.target.value)}
                placeholder="e.g. Budget 2026: Live Parliamentary Coverage"
                required
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3] font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Section Desk
              </label>
              <select
                value={newBlogCategory}
                onChange={(e) => setNewBlogCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3] cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Lead Anchor / Desk Lead
              </label>
              <select
                value={newBlogReporter}
                onChange={(e) => setNewBlogReporter(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3] cursor-pointer"
              >
                {reporters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Summary / Overview *
              </label>
              <textarea
                rows={3}
                value={newBlogSummary}
                onChange={(e) => setNewBlogSummary(e.target.value)}
                placeholder="Background and scope of this real-time coverage..."
                required
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold uppercase tracking-wider text-xs rounded-lg transition shadow-xs cursor-pointer"
            >
              Start Live Coverage
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
