'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Article, Category, Reporter, UserRole } from '@/lib/types';
import RichEditor from './RichEditor';
import { 
  Save, Send, Trash2, Eye, CheckCircle2, AlertCircle, 
  Upload, ShieldAlert, ArrowLeft, ExternalLink, Sparkles, Image as ImageIcon
} from 'lucide-react';

interface ArticleFormProps {
  initialArticle?: Partial<Article>;
  categories: Category[];
  reporters: Reporter[];
  userRole?: UserRole;
  isEditing?: boolean;
}

export default function ArticleForm({
  initialArticle,
  categories,
  reporters,
  userRole,
  isEditing = false,
}: ArticleFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialArticle?.title || '');
  const [deck, setDeck] = useState(initialArticle?.deck || '');
  const [content, setContent] = useState(initialArticle?.body || '');
  const [categoryId, setCategoryId] = useState(initialArticle?.category_id || categories[0]?.id || '');
  const [reporterId, setReporterId] = useState(initialArticle?.reporter_id || reporters[0]?.id || '');
  const [articleType, setArticleType] = useState(initialArticle?.article_type || 'NEWS');
  const [featuredImage, setFeaturedImage] = useState(initialArticle?.featured_image || '');
  const [imageCaption, setImageCaption] = useState(initialArticle?.image_caption || '');
  const [imageCredit, setImageCredit] = useState(initialArticle?.image_credit || '');
  const [isBreaking, setIsBreaking] = useState(Boolean(initialArticle?.is_breaking));
  const [isLead, setIsLead] = useState(Boolean(initialArticle?.is_lead));
  const [isFeatured, setIsFeatured] = useState(Boolean(initialArticle?.is_featured));
  const [isOpinion, setIsOpinion] = useState(Boolean(initialArticle?.is_opinion));
  const [district, setDistrict] = useState(initialArticle?.district || '');
  const [sourceAttribution, setSourceAttribution] = useState(initialArticle?.source_attribution || '');
  const [correctionNotice, setCorrectionNotice] = useState(initialArticle?.correction_notice || '');

  const [status, setStatus] = useState(initialArticle?.status || 'DRAFT');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const canApproveAndPublish = userRole === 'SUPER_ADMIN' || userRole === 'EDITOR';

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caption', imageCaption);
      formData.append('credit', imageCredit);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.asset?.url) {
        setFeaturedImage(data.asset.url);
        setSuccess('Image uploaded and set as featured photograph.');
      } else {
        setError(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      setError('Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSave(targetStatus: string) {
    if (!title.trim() || !deck.trim() || !content.trim()) {
      setError('Please provide title, summary, and article body.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      title,
      deck,
      content,
      category_id: categoryId,
      reporter_id: reporterId,
      article_type: articleType,
      featured_image: featuredImage,
      image_caption: imageCaption,
      image_credit: imageCredit,
      is_breaking: isBreaking ? 1 : 0,
      is_lead: isLead ? 1 : 0,
      is_featured: isFeatured ? 1 : 0,
      is_opinion: isOpinion ? 1 : 0,
      district: district || null,
      source_attribution: sourceAttribution || null,
      correction_notice: correctionNotice || null,
      status: targetStatus,
    };

    try {
      const url = isEditing ? `/api/articles/${initialArticle?.id}` : '/api/articles';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`Story saved successfully as ${targetStatus}. Redirecting...`);
        setStatus(targetStatus as any);
        setTimeout(() => {
          router.push('/admin/articles');
          router.refresh();
        }, 1000);
      } else {
        setError(data.error || 'Failed to save story.');
      }
    } catch (err) {
      setError('Network communication error.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialArticle?.id) return;
    if (!confirm('PERMANENT DELETION: Are you sure you want to permanently delete this article?')) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/articles/${initialArticle.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/articles');
        router.refresh();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to delete article.');
      }
    } catch (e) {
      setError('Delete error.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans text-xs">
      {/* 7. Sticky Publishing Toolbar */}
      <div className="sticky top-16 z-20 bg-white/95 dark:bg-[#0D1626]/95 backdrop-blur-md border border-[#DCE7F2] dark:border-[#27364B] p-4 rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-1.5 rounded-lg text-[#174A7E] dark:text-[#B6C3D4] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] transition"
            title="Back to Articles"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-[#174A7E] dark:text-[#F4F7FB]">
                {isEditing ? 'Edit Dispatch' : 'New Dispatch Composer'}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                  status === 'PUBLISHED'
                    ? 'bg-emerald-50 text-[#16845B] border border-emerald-200'
                    : status === 'IN_REVIEW'
                    ? 'bg-amber-50 text-[#D99018] border border-amber-200'
                    : 'bg-[#EDF4FC] text-[#496784] border border-[#DCE7F2]'
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-[11px] text-[#7890A8] truncate max-w-md">
              {title || 'Untitled Story Draft'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Save Draft */}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('DRAFT')}
            className="px-3.5 py-2 bg-white dark:bg-[#131F32] hover:bg-[#F0F7FD] dark:hover:bg-[#1A2942] text-[#174A7E] dark:text-[#F4F7FB] font-bold text-xs rounded-lg transition border border-[#DCE7F2] dark:border-[#27364B] cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-[#079FE3]" />
            <span>Save Draft</span>
          </button>

          {/* Submit for Review */}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('IN_REVIEW')}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit for Review</span>
          </button>

          {/* Publish (if authorized) */}
          {canApproveAndPublish && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('PUBLISHED')}
              className="px-4 py-2 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Publish Now</span>
            </button>
          )}

          {/* Preview in New Tab (if editing) */}
          {initialArticle?.slug && (
            <Link
              href={`/article/${initialArticle.slug}`}
              target="_blank"
              className="p-2 text-[#174A7E] dark:text-[#B6C3D4] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] rounded-lg border border-[#DCE7F2] dark:border-[#27364B] transition"
              title="Preview on Public Site"
            >
              <ExternalLink className="w-4 h-4 text-[#079FE3]" />
            </Link>
          )}

          {/* Delete (if editing & authorized) */}
          {isEditing && canApproveAndPublish && (
            <button
              type="button"
              disabled={saving}
              onClick={handleDelete}
              className="p-2 text-[#D71920] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900 transition cursor-pointer"
              title="Delete Story Permanently"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-[#D71920] dark:text-red-300 rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[#16845B] dark:text-emerald-300 rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Headline, Deck, Body, Corrections, Attribution */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-[#131F32] p-6 border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs space-y-5">
            {/* Headline */}
            <div>
              <label className="block font-bold text-[#174A7E] dark:text-[#F4F7FB] uppercase tracking-wider text-[11px] mb-1.5">
                Article Headline *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. National Inter-State Water Treaty Re-negotiations Enter Critical Phase"
                className="w-full p-3 text-base sm:text-lg font-bold bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-xl focus:outline-none focus:border-[#079FE3] leading-snug"
              />
            </div>

            {/* Subheadline / Deck */}
            <div>
              <label className="block font-bold text-[#174A7E] dark:text-[#F4F7FB] uppercase tracking-wider text-[11px] mb-1.5">
                Subheadline / Deck (Editorial Summary) *
              </label>
              <textarea
                rows={3}
                value={deck}
                onChange={(e) => setDeck(e.target.value)}
                placeholder="Summary explaining critical context, key stakeholders, and immediate field implications..."
                className="w-full p-3 text-xs text-[#496784] dark:text-[#B6C3D4] bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] placeholder-[#7890A8] rounded-xl focus:outline-none focus:border-[#079FE3] leading-relaxed italic"
              />
            </div>

            {/* Article Body */}
            <div>
              <label className="block font-bold text-[#174A7E] dark:text-[#F4F7FB] uppercase tracking-wider text-[11px] mb-1.5">
                Full Journalistic Body *
              </label>
              <RichEditor value={content} onChange={setContent} />
            </div>

            {/* Material Correction Notice */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
              <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider text-[#D99018] text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Editorial Correction Notice (if amending published dispatch)</span>
              </div>
              <textarea
                rows={2}
                value={correctionNotice}
                onChange={(e) => setCorrectionNotice(e.target.value)}
                placeholder="e.g. Correction Note: An earlier draft incorrectly cited the barrage distance as 14km instead of 11.2km. Amended accordingly."
                className="w-full p-2.5 text-xs bg-white dark:bg-[#0D1626] border border-amber-200 dark:border-amber-800 text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Source Attribution */}
            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] uppercase tracking-wider text-[11px] mb-1.5">
                Official Source Attribution
              </label>
              <input
                type="text"
                value={sourceAttribution}
                onChange={(e) => setSourceAttribution(e.target.value)}
                placeholder="e.g. Supreme Court Registrar / Press Information Bureau / Reuters Dispatch"
                className="w-full p-2.5 text-xs bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
              />
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Desks, Bylines, Flags, Media */}
        <div className="lg:col-span-4 space-y-6">
          {/* Editorial Metadata Card */}
          <div className="bg-white dark:bg-[#131F32] p-5 border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#174A7E] dark:text-[#F4F7FB] border-b border-[#DCE7F2] dark:border-[#27364B] pb-2 font-mono">
              Editorial Classification
            </h3>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Section Desk *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3] cursor-pointer"
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
                Reporter Byline *
              </label>
              <select
                value={reporterId}
                onChange={(e) => setReporterId(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3] cursor-pointer"
              >
                {reporters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.beat})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                Story Format
              </label>
              <select
                value={articleType}
                onChange={(e) => setArticleType(e.target.value as any)}
                className="w-full p-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3] cursor-pointer"
              >
                <option value="NEWS">Reported News</option>
                <option value="ANALYSIS">Analysis & Deep Dive</option>
                <option value="OPINION">Opinion & Column</option>
                <option value="INVESTIGATION">Special Investigation</option>
                <option value="GROUND_REPORT">Ground Report</option>
                <option value="EXPLAINER">Explainer</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                District / Bureau Tag
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Wayanad, Kochi, Delhi Bureau"
                className="w-full p-2.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
              />
            </div>
          </div>

          {/* Placement Flags Card */}
          <div className="bg-white dark:bg-[#131F32] p-5 border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#174A7E] dark:text-[#F4F7FB] border-b border-[#DCE7F2] dark:border-[#27364B] pb-2 font-mono">
              Homepage Placement Flags
            </h3>

            <label className="flex items-center gap-2.5 text-[#174A7E] dark:text-[#F4F7FB] cursor-pointer py-1">
              <input
                type="checkbox"
                checked={isLead}
                onChange={(e) => setIsLead(e.target.checked)}
                className="rounded border-[#DCE7F2] text-[#079FE3] focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold text-xs">Hero Lead Story Position</span>
            </label>

            <label className="flex items-center gap-2.5 text-[#D71920] cursor-pointer py-1">
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="rounded border-red-300 text-[#D71920] focus:ring-0 cursor-pointer"
              />
              <span className="font-bold text-xs">Breaking News Alert (Banner)</span>
            </label>

            <label className="flex items-center gap-2.5 text-[#496784] dark:text-[#B6C3D4] cursor-pointer py-1">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-[#DCE7F2] text-[#079FE3] focus:ring-0 cursor-pointer"
              />
              <span className="font-medium text-xs">Featured in Desk Tops</span>
            </label>

            <label className="flex items-center gap-2.5 text-[#496784] dark:text-[#B6C3D4] cursor-pointer py-1">
              <input
                type="checkbox"
                checked={isOpinion}
                onChange={(e) => setIsOpinion(e.target.checked)}
                className="rounded border-[#DCE7F2] text-[#079FE3] focus:ring-0 cursor-pointer"
              />
              <span className="font-medium text-xs">Opinion & Editorial Column Flag</span>
            </label>
          </div>

          {/* Featured Photograph Card */}
          <div className="bg-white dark:bg-[#131F32] p-5 border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#174A7E] dark:text-[#F4F7FB] border-b border-[#DCE7F2] dark:border-[#27364B] pb-2 font-mono">
              Featured Photograph
            </h3>

            {featuredImage ? (
              <div className="aspect-[16/10] w-full overflow-hidden bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] rounded-lg mb-2">
                <img src={featuredImage} alt="Featured Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[16/10] w-full bg-white dark:bg-[#0D1626] border border-dashed border-[#DCE7F2] dark:border-[#27364B] rounded-lg flex flex-col items-center justify-center text-[#7890A8] gap-1">
                <ImageIcon className="w-6 h-6 text-[#7890A8]" />
                <span className="text-[10px]">No featured image set</span>
              </div>
            )}

            <div>
              <label className="block text-[#496784] dark:text-[#B6C3D4] mb-1 font-semibold text-xs">
                Image Web URL
              </label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://..."
                className="w-full p-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3] text-xs"
              />
            </div>

            <div>
              <label className="block text-[#496784] dark:text-[#B6C3D4] mb-1 font-semibold text-xs">
                Upload Image File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="w-full text-xs text-[#7890A8] file:mr-2 file:py-1 file:px-2.5 file:border-0 file:text-xs file:font-semibold file:bg-[#E3F0FC] file:text-[#079FE3] file:rounded-md hover:file:bg-[#079FE3] hover:file:text-white cursor-pointer"
              />
              {uploadingImage && (
                <span className="text-[10px] text-[#079FE3] mt-1 block font-mono">
                  Uploading to newsroom media library...
                </span>
              )}
            </div>

            <div>
              <label className="block text-[#496784] dark:text-[#B6C3D4] mb-1 font-semibold text-xs">
                Caption
              </label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Descriptive photographic caption..."
                className="w-full p-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3] text-xs"
              />
            </div>

            <div>
              <label className="block text-[#496784] dark:text-[#B6C3D4] mb-1 font-semibold text-xs">
                Photo Credit / Wire Service
              </label>
              <input
                type="text"
                value={imageCredit}
                onChange={(e) => setImageCredit(e.target.value)}
                placeholder="e.g. NEWSIGHT / Press Trust of India"
                className="w-full p-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3] text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

