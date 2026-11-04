'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  Video, Plus, CheckCircle2, AlertCircle, Play, ExternalLink, 
  Trash2, Film, Clock, User, Sparkles
} from 'lucide-react';
import { VideoItem, Reporter, Show } from '@/lib/types';
import Link from 'next/link';

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('08:30');
  const [category, setCategory] = useState('Ground Report');
  const [reporterId, setReporterId] = useState('');
  const [showId, setShowId] = useState('');
  const [videoType, setVideoType] = useState<'REPORT' | 'INTERVIEW' | 'DOCUMENTARY' | 'EXPLAINER' | 'CLASSIC'>('REPORT');
  const [isFeatured, setIsFeatured] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [resVids, resReps, resShows] = await Promise.all([
        fetch('/api/videos').then((r) => r.json()),
        fetch('/api/reporters').then((r) => r.json()),
        fetch('/api/shows').then((r) => r.json()),
      ]);

      if (resVids.videos) setVideos(resVids.videos);
      if (resReps.reporters) {
        setReporters(resReps.reporters);
        setReporterId(resReps.reporters[0]?.id || '');
      }
      if (resShows.shows) setShows(resShows.shows);
    } catch (_) {
      //
    } finally {
      setLoading(false);
    }
  }

  async function handleAddVideo(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !videoUrl) return;

    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
          duration,
          category,
          reporter_id: reporterId || null,
          show_id: showId || null,
          video_type: videoType,
          is_featured: isFeatured ? 1 : 0,
        }),
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: `Video report "${title}" published successfully.` });
        setTitle('');
        setSummary('');
        setVideoUrl('');
        setThumbnailUrl('');
        setIsFeatured(false);
        await loadData();
      } else {
        const d = await res.json();
        setFeedback({ type: 'error', text: d.error || 'Failed to publish video.' });
      }
    } catch (_) {
      setFeedback({ type: 'error', text: 'Network communication error.' });
    }
  }

  async function handleDeleteVideo(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete video "${name}"?`)) return;

    try {
      const res = await fetch(`/api/videos?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ type: 'success', text: `Video "${name}" removed.` });
        await loadData();
      }
    } catch (_) {
      setFeedback({ type: 'error', text: 'Failed to delete video.' });
    }
  }

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Video Journalism & Broadcast Desk"
        subtitle="Publish ground reports, documentary investigations, prime time shows, and configure video feeds."
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
        {/* Published Videos List (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#DCE7F2] dark:border-[#27364B] flex items-center justify-between bg-[#F0F6FC] dark:bg-[#0D1626]/50">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-[#079FE3]" />
              <h3 className="font-bold text-sm text-[#174A7E] dark:text-[#F4F7FB]">
                Published Video Library
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E3F0FC] text-[#1261A6] dark:bg-[#1A2942] dark:text-[#079FE3]">
              {videos.length} Dispatches
            </span>
          </div>

          <div className="divide-y divide-[#E5EDF5] dark:divide-[#27364B] max-h-[720px] overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center text-[#7890A8] italic">Loading video catalog...</div>
            ) : videos.length === 0 ? (
              <div className="p-12 text-center text-[#7890A8] italic">No video reports currently published.</div>
            ) : (
              videos.map((vid) => (
                <div
                  key={vid.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#F3F8FE] dark:hover:bg-[#1A2942]/30 transition"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="relative w-24 h-15 rounded-lg overflow-hidden bg-[#0B1220] shrink-0 border border-[#DCE7F2] dark:border-[#27364B]">
                      <img src={vid.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 py-0.2 rounded font-mono font-bold">
                        {vid.duration}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono mb-1">
                        <span className="px-1.5 py-0.2 rounded bg-[#E3F0FC] text-[#1261A6] font-bold uppercase">
                          {vid.category}
                        </span>
                        <span className="text-[#7890A8] uppercase">{vid.video_type}</span>
                        {vid.is_featured === 1 && (
                          <span className="px-1.5 py-0.2 rounded bg-sky-50 text-[#079FE3] font-bold">
                            FEATURED
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-[#174A7E] dark:text-[#F4F7FB] line-clamp-1">
                        {vid.title}
                      </h4>

                      {vid.summary && (
                        <p className="text-[11px] text-[#496784] dark:text-[#B6C3D4] line-clamp-1 mt-0.5">
                          {vid.summary}
                        </p>
                      )}

                      <span className="text-[10px] text-[#7890A8] font-mono block mt-1">
                        Correspondent: {vid.reporter_name || 'Desk'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/video/${vid.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg border border-[#DCE7F2] dark:border-[#27364B] text-[#079FE3] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] transition"
                      title="Watch Public Video"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(vid.id, vid.title)}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-[#D71920] hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                      title="Delete Video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Publish Video Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#131F32] p-6 border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#DCE7F2] dark:border-[#27364B] pb-3">
            <Plus className="w-4 h-4 text-[#079FE3]" />
            <h3 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
              Publish New Video Report
            </h3>
          </div>

          <form onSubmit={handleAddVideo} className="space-y-4">
            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Video Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ground Investigation: The Drying Wetlands of Vembanad"
                required
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3] font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Video Stream URL (YouTube, Vimeo, MP4, HLS) *
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Thumbnail Photograph URL
              </label>
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                  Duration (MM:SS)
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="08:30"
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                  Desk Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3] cursor-pointer"
                >
                  <option value="Ground Report">Ground Report</option>
                  <option value="Investigation">Investigation</option>
                  <option value="Politics">Politics & Governance</option>
                  <option value="Economy">Economy & Markets</option>
                  <option value="Climate">Climate & Ecology</option>
                  <option value="Culture">Culture & Cinema</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                  Reporter Byline
                </label>
                <select
                  value={reporterId}
                  onChange={(e) => setReporterId(e.target.value)}
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
                  Associate with Show
                </label>
                <select
                  value={showId}
                  onChange={(e) => setShowId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3] cursor-pointer"
                >
                  <option value="">Standalone Report (No Show)</option>
                  {shows.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Summary / Editorial Context
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Key takeaway, field dispatch summary..."
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="feat-vid-check"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-[#DCE7F2] text-[#079FE3] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="feat-vid-check" className="font-semibold text-[#174A7E] dark:text-[#F4F7FB] cursor-pointer">
                Feature in Top Video Hub Slots
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold uppercase tracking-wider text-xs rounded-lg transition shadow-xs cursor-pointer"
            >
              Publish Video Dispatch
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
