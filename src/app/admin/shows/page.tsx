'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Film, Plus, Trash2, CheckCircle2, AlertCircle, ExternalLink, Calendar, User } from 'lucide-react';
import { Show } from '@/lib/types';
import Link from 'next/link';

export default function AdminShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [hostName, setHostName] = useState('');
  const [scheduleInfo, setScheduleInfo] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadShows();
  }, []);

  async function loadShows() {
    setLoading(true);
    try {
      const res = await fetch('/api/shows');
      const data = await res.json();
      if (data.shows) setShows(data.shows);
    } catch (_) {
      //
    } finally {
      setLoading(false);
    }
  }

  async function handleAddShow(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description) return;

    try {
      const res = await fetch('/api/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          cover_image: coverImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
          banner_image: bannerImage,
          host_name: hostName,
          schedule_info: scheduleInfo,
          order_index: orderIndex
        }),
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: `Show "${title}" registered successfully.` });
        setTitle('');
        setDescription('');
        setCoverImage('');
        setBannerImage('');
        setHostName('');
        setScheduleInfo('');
        loadShows();
      } else {
        const d = await res.json();
        setFeedback({ type: 'error', text: d.error || 'Failed to create program.' });
      }
    } catch (_) {
      setFeedback({ type: 'error', text: 'Network error creating program.' });
    }
  }

  async function handleDeleteShow(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? Associated videos will be unlinked.`)) return;

    try {
      const res = await fetch(`/api/shows?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ type: 'success', text: `Show "${name}" removed.` });
        loadShows();
      }
    } catch (_) {
      setFeedback({ type: 'error', text: 'Failed to delete show.' });
    }
  }

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Shows & Programs Management"
        subtitle="Configure editorial broadcasts, investigative series, prime time lineups, and programmatic slots."
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
        {/* Shows List (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#DCE7F2] dark:border-[#27364B] flex items-center justify-between bg-[#F0F6FC] dark:bg-[#0D1626]/50">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#079FE3]" />
              <h3 className="font-bold text-sm text-[#174A7E] dark:text-[#F4F7FB]">
                Current Broadcast Lineup
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E3F0FC] text-[#1261A6] dark:bg-[#1A2942] dark:text-[#079FE3]">
              {shows.length} Programs
            </span>
          </div>

          <div className="divide-y divide-[#E5EDF5] dark:divide-[#27364B] max-h-[720px] overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center text-[#7890A8] italic">Loading broadcast lineup...</div>
            ) : shows.length === 0 ? (
              <div className="p-12 text-center text-[#7890A8] italic">No shows configured. Register one on the right.</div>
            ) : (
              shows.map((show) => (
                <div
                  key={show.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#F3F8FE] dark:hover:bg-[#1A2942]/30 transition"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-[#DCE7F2] dark:border-[#27364B] bg-[#0B1220]">
                      <img
                        src={show.cover_image}
                        alt={show.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#174A7E] dark:text-[#F4F7FB] truncate">
                          {show.title}
                        </h4>
                        <span className="text-[10px] font-mono text-[#7890A8] px-1.5 py-0.2 rounded bg-[#E3F0FC] dark:bg-[#1A2942]">
                          #{show.order_index}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#496784] dark:text-[#B6C3D4] line-clamp-1 mt-0.5">
                        {show.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-[#7890A8] font-mono mt-1">
                        {show.host_name && <span>Anchor: {show.host_name}</span>}
                        {show.schedule_info && <span>• {show.schedule_info}</span>}
                        <span>• {show.episode_count || 0} Episodes</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/shows/${show.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg border border-[#DCE7F2] dark:border-[#27364B] text-[#079FE3] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] transition"
                      title="View Public Page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteShow(show.id, show.title)}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-[#D71920] hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                      title="Delete Show"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Register Show Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131F32] p-6 border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#DCE7F2] dark:border-[#27364B] pb-3">
            <Plus className="w-4 h-4 text-[#079FE3]" />
            <h3 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
              Register Broadcast Series
            </h3>
          </div>

          <form onSubmit={handleAddShow} className="space-y-4">
            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Program Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ground Truth: India Investigations"
                required
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3] font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Lead Anchor / Host
              </label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="e.g. Ayesha Sen"
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Air Schedule Info
              </label>
              <input
                type="text"
                value={scheduleInfo}
                onChange={(e) => setScheduleInfo(e.target.value)}
                placeholder="e.g. Fridays 9:00 PM IST"
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                  Cover Photo URL
                </label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Editorial Description *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Synopsis of this broadcast series, investigatory mandate, format..."
                required
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold uppercase tracking-wider text-xs rounded-lg transition shadow-xs cursor-pointer"
            >
              Register Program
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
