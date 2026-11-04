'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  Users, Plus, CheckCircle2, AlertCircle, Mail, 
  ExternalLink, UserPlus, Briefcase, Globe
} from 'lucide-react';
import { Reporter } from '@/lib/types';
import Link from 'next/link';

export default function AdminReportersPage() {
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [beat, setBeat] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadReporters();
  }, []);

  async function loadReporters() {
    setLoading(true);
    try {
      const res = await fetch('/api/reporters');
      const data = await res.json();
      if (data.reporters) setReporters(data.reporters);
    } catch (e) {
      //
    } finally {
      setLoading(false);
    }
  }

  async function handleAddReporter(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !title || !beat) return;

    try {
      const res = await fetch('/api/reporters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          title,
          beat,
          bio,
          avatar_url: avatarUrl,
          email,
          twitter,
          linkedin,
        }),
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: `Journalist "${name}" successfully registered to newsroom roster.` });
        setName('');
        setTitle('');
        setBeat('');
        setBio('');
        setAvatarUrl('');
        setEmail('');
        setTwitter('');
        setLinkedin('');
        setShowAddForm(false);
        await loadReporters();
      } else {
        const d = await res.json();
        setFeedback({ type: 'error', text: d.error || 'Failed to add reporter.' });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Network communication error.' });
    }
  }

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Reporters & Staff Management"
        subtitle="Manage correspondent bylines, beats, editorial profiles, and journalistic accreditation."
        actions={
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#079FE3] hover:bg-[#1261A6] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-xs cursor-pointer"
          >
            {showAddForm ? <Users className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{showAddForm ? 'View Roster' : 'Register Journalist'}</span>
          </button>
        }
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

      {/* Add Reporter Form Accordion / Card */}
      {showAddForm && (
        <div className="bg-white dark:bg-[#131F32] p-6 border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#DCE7F2] dark:border-[#27364B] pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#079FE3]" />
              <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
                Register New Staff Journalist / Bureau Correspondent
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#7890A8] hover:text-[#174A7E] dark:hover:text-white"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleAddReporter} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                  Full Byline Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rohini Swamy"
                  required
                  className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3] font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                  Editorial Designation *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Political Correspondent"
                  required
                  className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                  Assigned Beat Desk *
                </label>
                <input
                  type="text"
                  value={beat}
                  onChange={(e) => setBeat(e.target.value)}
                  placeholder="e.g. Governance & Policy"
                  required
                  className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                  Official Staff Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="journalist@newsight.media"
                  className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                  Profile Photograph URL
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                  X / Twitter Handle
                </label>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@handle"
                  className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Professional Bio & Accreditation
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Experience, past beats, awards, and areas of reporting specialization..."
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-[#DCE7F2] dark:border-[#27364B] text-[#496784] dark:text-[#B6C3D4] rounded-lg hover:bg-[#F3F8FE] dark:hover:bg-[#1A2942]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold uppercase tracking-wider text-xs rounded-lg transition shadow-xs cursor-pointer"
              >
                Save Journalist Roster
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 8. Professional Roster Table */}
      <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#DCE7F2] dark:border-[#27364B] flex items-center justify-between bg-[#F0F6FC] dark:bg-[#0D1626]/50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#079FE3]" />
            <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
              Active Newsroom Correspondents & Staff
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E3F0FC] text-[#1261A6] dark:bg-[#1A2942] dark:text-[#079FE3]">
            {reporters.length} Accredited
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans min-w-[750px]">
            <thead className="bg-white dark:bg-[#0D1626] text-[#496784] dark:text-[#B6C3D4] font-bold uppercase tracking-wider border-b border-[#DCE7F2] dark:border-[#27364B]">
              <tr>
                <th className="px-5 py-3.5">Journalist</th>
                <th className="px-5 py-3.5">Editorial Beat</th>
                <th className="px-5 py-3.5">Designation</th>
                <th className="px-5 py-3.5">Contact / Social</th>
                <th className="px-5 py-3.5 text-right">Bylines Archive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EDF5] dark:divide-[#27364B]">
              {reporters.map((rep) => (
                <tr key={rep.id} className="hover:bg-[#F3F8FE] dark:hover:bg-[#1A2942]/30 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {rep.avatar_url ? (
                        <img
                          src={rep.avatar_url}
                          alt={rep.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#DCE7F2] dark:border-[#27364B] shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#1261A6] text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {rep.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-sm text-[#174A7E] dark:text-[#F4F7FB] leading-tight">
                          {rep.name}
                        </h3>
                        {rep.email && (
                          <span className="text-[11px] text-[#7890A8] font-mono block mt-0.5">
                            {rep.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 text-[10.5px] font-bold uppercase rounded-md bg-[#E3F0FC] text-[#1261A6] border border-[#DCE7F2] dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900 inline-block font-mono">
                      {rep.beat}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-[#496784] dark:text-[#B6C3D4] font-medium">
                    {rep.title}
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-[#7890A8]">
                      {rep.twitter && (
                        <span className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 text-[#079FE3] font-mono text-[10px]">
                          {rep.twitter}
                        </span>
                      )}
                      {!rep.twitter && <span className="text-[#7890A8]">—</span>}
                    </div>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <Link
                      href={`/reporters/${rep.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#0D1626] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] text-[#079FE3] font-bold text-xs rounded-lg border border-[#DCE7F2] dark:border-[#27364B] transition"
                    >
                      <span>Public Byline</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
