'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  Image as ImageIcon, Upload, Copy, Check, Search, CheckCircle2, 
  AlertCircle, Eye, X, Trash2, Calendar, FileText, Info
} from 'lucide-react';
import { MediaAsset } from '@/lib/types';

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [credit, setCredit] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    setLoading(true);
    try {
      const res = await fetch('/api/media/upload');
      const data = await res.json();
      if (data.assets) setAssets(data.assets);
    } catch (e) {
      //
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt_text', altText);
      formData.append('caption', caption);
      formData.append('credit', credit);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', text: `Media asset "${file.name}" uploaded successfully.` });
        setAltText('');
        setCaption('');
        setCredit('');
        await loadMedia();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Upload failed.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network communication error.' });
    } finally {
      setUploading(false);
    }
  }

  function copyToClipboard(url: string, id: string) {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return assets;
    const q = searchQuery.toLowerCase();
    return assets.filter(
      (a) =>
        a.filename.toLowerCase().includes(q) ||
        a.alt_text?.toLowerCase().includes(q) ||
        a.caption?.toLowerCase().includes(q) ||
        a.credit?.toLowerCase().includes(q)
    );
  }, [assets, searchQuery]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Media Asset Library"
        subtitle="Manage newsroom photographs, documentary stills, charts, and wire photography."
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

      {/* Upload Zone Card */}
      <div className="bg-white dark:bg-[#131F32] p-6 border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#DCE7F2] dark:border-[#27364B] pb-3">
          <Upload className="w-4 h-4 text-[#079FE3]" />
          <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
            Upload Photographic Asset to Newsroom Storage
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
              Accessibility Alt Text
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descriptive text for accessibility & screen readers..."
              className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
              Photographic Caption
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Contextual description of subject / scene..."
              className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
              Photo Credit / Attribution
            </label>
            <input
              type="text"
              value={credit}
              onChange={(e) => setCredit(e.target.value)}
              placeholder="e.g. NEWSIGHT / Tarun Anand / Reuters"
              className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <label className="px-5 py-2.5 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold uppercase tracking-wider text-xs rounded-lg cursor-pointer transition shadow-xs flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Processing Upload...' : 'Choose File to Upload'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <span className="text-[#7890A8] text-[11px] font-mono">
            Supported Formats: JPEG, PNG, WebP, AVIF (Max 10MB)
          </span>
        </div>
      </div>

      {/* Catalog Search & Grid */}
      <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE7F2] dark:border-[#27364B] pb-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#079FE3]" />
            <h3 className="font-bold text-sm text-[#174A7E] dark:text-[#F4F7FB]">
              Media Asset Catalog
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E3F0FC] text-[#1261A6] dark:bg-[#1A2942] dark:text-[#079FE3]">
              {filteredAssets.length} Assets
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7890A8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by filename or credit..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
            />
          </div>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="py-16 text-center text-[#7890A8] text-xs italic">
            No media assets found matching search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl p-3 flex flex-col justify-between group hover:border-[#079FE3] transition shadow-2xs"
              >
                <div>
                  <div
                    onClick={() => setPreviewAsset(asset)}
                    className="aspect-[16/10] bg-white dark:bg-[#131F32] rounded-lg overflow-hidden mb-2.5 cursor-pointer relative group/img"
                  >
                    <img
                      src={asset.url}
                      alt={asset.alt_text || asset.filename}
                      className="w-full h-full object-cover transition duration-200 group-hover/img:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>

                  <span
                    className="font-bold text-[#174A7E] dark:text-[#F4F7FB] truncate block text-[11px]"
                    title={asset.filename}
                  >
                    {asset.filename}
                  </span>

                  <div className="flex items-center justify-between text-[10px] text-[#7890A8] font-mono mt-1">
                    <span>{(asset.file_size / 1024).toFixed(1)} KB</span>
                    <span className="uppercase">{asset.file_type.split('/')[1]}</span>
                  </div>

                  {asset.credit && (
                    <span className="text-[10px] text-[#496784] dark:text-[#B6C3D4] truncate block mt-0.5">
                      © {asset.credit}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-[#DCE7F2]/60 dark:border-[#27364B]/60 mt-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(asset.url, asset.id)}
                    className="flex-1 py-1.5 px-2 bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg transition flex items-center justify-center gap-1 text-[11px] font-semibold cursor-pointer"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check className="w-3 h-3 text-[#16845B]" />
                        <span className="text-[#16845B] font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[#079FE3]" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewAsset(asset)}
                    className="p-1.5 rounded-lg border border-[#DCE7F2] dark:border-[#27364B] text-[#7890A8] hover:text-[#079FE3] hover:bg-white dark:hover:bg-[#131F32] transition cursor-pointer"
                    title="Inspect Asset"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DCE7F2] dark:border-[#27364B] pb-3">
              <h3 className="font-bold text-sm text-[#174A7E] dark:text-[#F4F7FB] truncate max-w-md">
                {previewAsset.filename}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="p-1 rounded-lg text-[#7890A8] hover:text-[#174A7E] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-[16/10] bg-[#0B1220] rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src={previewAsset.url}
                alt={previewAsset.alt_text}
                className="max-h-[380px] w-auto object-contain"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white dark:bg-[#0D1626] rounded-lg">
                <span className="text-[#7890A8] font-bold block text-[10px] uppercase">Photo Credit</span>
                <span className="font-semibold text-[#174A7E] dark:text-[#F4F7FB]">
                  {previewAsset.credit || 'None recorded'}
                </span>
              </div>
              <div className="p-2.5 bg-white dark:bg-[#0D1626] rounded-lg">
                <span className="text-[#7890A8] font-bold block text-[10px] uppercase">Alt Text</span>
                <span className="font-semibold text-[#174A7E] dark:text-[#F4F7FB]">
                  {previewAsset.alt_text || 'None specified'}
                </span>
              </div>
            </div>

            {previewAsset.caption && (
              <p className="text-xs text-[#496784] dark:text-[#B6C3D4] italic">
                "{previewAsset.caption}"
              </p>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] font-mono text-[#7890A8]">
                Size: {(previewAsset.file_size / 1024).toFixed(1)} KB
              </span>
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(previewAsset.url, previewAsset.id);
                  setPreviewAsset(null);
                }}
                className="px-4 py-2 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold rounded-lg text-xs cursor-pointer transition shadow-xs"
              >
                Copy URL & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
