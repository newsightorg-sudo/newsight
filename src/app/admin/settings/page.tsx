'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  Settings, Save, CheckCircle2, AlertCircle, Radio, 
  Image as ImageIcon, Flame, Globe, Mail, Phone, Share2
} from 'lucide-react';
import { EditorialSettings } from '@/lib/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<EditorialSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch (_) {
      //
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publication_name: settings.publication_name,
          tagline: settings.tagline,
          logo_url: settings.logo_url || '',
          primary_color: settings.primary_color,
          accent_color: settings.accent_color,
          breaking_banner_active: settings.breaking_banner_active ? '1' : '0',
          breaking_headline: settings.breaking_headline,
          breaking_url: settings.breaking_url,
          breaking_time: settings.breaking_time,
          contact_email: settings.contact_email,
          contact_phone: settings.contact_phone,
          address: settings.address,
          twitter_url: settings.twitter_url,
          facebook_url: settings.facebook_url,
          instagram_url: settings.instagram_url,
          youtube_url: settings.youtube_url,
          linkedin_url: settings.linkedin_url || '',
          footer_text: settings.footer_text,
          ads_enabled: settings.ads_enabled ? '1' : '0',
          ad_active: settings.ad_active ? '1' : '0',
          ad_image_url: settings.ad_image_url || '',
          ad_target_url: settings.ad_target_url || '',
          ad_title: settings.ad_title || '',
          live_stream_url: settings.live_stream_url || '',
          live_stream_title: settings.live_stream_title || '',
          live_current_show: settings.live_current_show || '',
        }),
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: 'NEWSIGHT platform configuration updated and published across all editions.' });
      } else {
        const d = await res.json();
        setFeedback({ type: 'error', text: d.error || 'Failed to save settings.' });
      }
    } catch (_) {
      setFeedback({ type: 'error', text: 'Network error saving settings.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return (
      <div className="p-12 text-center text-xs text-[#7890A8] font-mono">
        Loading platform configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-xs">
      <AdminHeader
        title="NEWSIGHT Platform & Operational Settings"
        subtitle="Configure masthead identity, live broadcast endpoints, breaking news banner, and newsroom coordinates."
      />

      <div className="space-y-6 max-w-5xl">
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-2 animate-in fade-in duration-150 ${
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

        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. Brand Identity */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#DCE7F2] dark:border-[#27364B]">
              <Globe className="w-4 h-4 text-[#079FE3]" />
              <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB] uppercase tracking-wider font-mono">
                Brand Identity & Masthead
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] block mb-1.5">
                  Brand / Masthead Name *
                </label>
                <input
                  type="text"
                  value={settings.publication_name}
                  onChange={(e) => setSettings({ ...settings, publication_name: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg text-[#174A7E] dark:text-[#F4F7FB] font-bold focus:outline-none focus:border-[#079FE3]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] block mb-1.5">
                  Editorial Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg text-[#174A7E] dark:text-[#F4F7FB] focus:outline-none focus:border-[#079FE3]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] block mb-1.5">
                  Primary Brand Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.primary_color || '#079FE3'}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="w-9 h-9 p-0.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primary_color || '#079FE3'}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="w-32 px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg text-[#174A7E] dark:text-[#F4F7FB] font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] block mb-1.5">
                  Breaking News Red Token
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.accent_color || '#D71920'}
                    onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                    className="w-9 h-9 p-0.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.accent_color || '#D71920'}
                    onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                    className="w-32 px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg text-[#174A7E] dark:text-[#F4F7FB] font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Breaking News Strip Alert */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE7F2] dark:border-[#27364B]">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#D71920]" />
                <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB] uppercase tracking-wider font-mono">
                  Breaking News Broadcast Banner
                </h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.breaking_banner_active}
                  onChange={(e) => setSettings({ ...settings, breaking_banner_active: e.target.checked })}
                  className="rounded border-red-300 text-[#D71920] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-bold text-[#D71920]">Broadcast Alert Banner</span>
              </label>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] block mb-1.5">
                Breaking Headline Text
              </label>
              <input
                type="text"
                value={settings.breaking_headline}
                onChange={(e) => setSettings({ ...settings, breaking_headline: e.target.value })}
                placeholder="Alert text displayed at the top of digital editions..."
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] focus:outline-none focus:border-[#D71920]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] block mb-1.5">
                  Target Destination URL
                </label>
                <input
                  type="text"
                  value={settings.breaking_url}
                  onChange={(e) => setSettings({ ...settings, breaking_url: e.target.value })}
                  placeholder="/article/slug or /video/slug"
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] focus:outline-none focus:border-[#079FE3]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] block mb-1.5">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={settings.breaking_time}
                  onChange={(e) => setSettings({ ...settings, breaking_time: e.target.value })}
                  placeholder="LIVE UPDATE or BREAKING"
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] focus:outline-none focus:border-[#079FE3]"
                />
              </div>
            </div>
          </div>

          {/* 3. Live 24x7 Stream Settings */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#DCE7F2] dark:border-[#27364B]">
              <Radio className="w-4 h-4 text-[#079FE3]" />
              <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB] uppercase tracking-wider font-mono">
                24x7 Live Stream Broadcast Endpoint
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] block mb-1.5">
                  Live Stream Feed URL (HLS / MP4)
                </label>
                <input
                  type="url"
                  value={settings.live_stream_url || ''}
                  onChange={(e) => setSettings({ ...settings, live_stream_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] focus:outline-none focus:border-[#079FE3]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] block mb-1.5">
                  Currently Airing Program Title
                </label>
                <input
                  type="text"
                  value={settings.live_current_show || ''}
                  onChange={(e) => setSettings({ ...settings, live_current_show: e.target.value })}
                  placeholder="The Daily Brief with Siddharth Nair"
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] focus:outline-none focus:border-[#079FE3]"
                />
              </div>
            </div>
          </div>

          {/* 4. Newsroom Coordinates & Social Networks */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#DCE7F2] dark:border-[#27364B]">
              <Share2 className="w-4 h-4 text-[#079FE3]" />
              <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB] uppercase tracking-wider font-mono">
                Newsroom Contact & Social Channels
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] block mb-1.5">
                  Public Editorial Email
                </label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg text-[#174A7E] dark:text-[#F4F7FB] focus:outline-none focus:border-[#079FE3]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] block mb-1.5">
                  Newsroom Phone
                </label>
                <input
                  type="text"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg text-[#174A7E] dark:text-[#F4F7FB] focus:outline-none focus:border-[#079FE3]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] block mb-1.5">
                  Instagram Profile URL
                </label>
                <input
                  type="url"
                  value={settings.instagram_url}
                  onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                  placeholder="https://www.instagram.com/..."
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg text-[#174A7E] dark:text-[#F4F7FB] focus:outline-none focus:border-[#079FE3]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] block mb-1.5">
                  LinkedIn Company URL
                </label>
                <input
                  type="url"
                  value={settings.linkedin_url || ''}
                  onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                  placeholder="https://www.linkedin.com/company/..."
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg text-[#174A7E] dark:text-[#F4F7FB] focus:outline-none focus:border-[#079FE3]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] block mb-1.5">
                  X Profile URL
                </label>
                <input
                  type="url"
                  value={settings.twitter_url}
                  onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                  placeholder="https://x.com/..."
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg text-[#174A7E] dark:text-[#F4F7FB] focus:outline-none focus:border-[#079FE3]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] block mb-1.5">
                  Facebook Page URL
                </label>
                <input
                  type="url"
                  value={settings.facebook_url}
                  onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                  placeholder="https://www.facebook.com/..."
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg text-[#174A7E] dark:text-[#F4F7FB] focus:outline-none focus:border-[#079FE3]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] block mb-1.5">
                Footer Copyright Text
              </label>
              <input
                type="text"
                value={settings.footer_text}
                onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg text-[#174A7E] dark:text-[#F4F7FB] focus:outline-none focus:border-[#079FE3]"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Platform Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
