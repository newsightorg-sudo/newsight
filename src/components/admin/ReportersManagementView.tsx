'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, Plus, CheckCircle2, AlertCircle, Mail, ExternalLink, 
  UserPlus, Briefcase, Globe, Key, ShieldCheck, ShieldAlert,
  Edit3, Trash2, FileText, Lock, RefreshCw, X, Eye, EyeOff,
  Copy, Check, Search, ArrowRight, UserCheck, UserX
} from 'lucide-react';
import { Reporter, UserRole } from '@/lib/types';
import AdminHeader from '@/components/admin/AdminHeader';

interface ReportersManagementViewProps {
  initialReporters: Reporter[];
  currentUserRole?: UserRole;
}

export default function ReportersManagementView({
  initialReporters,
  currentUserRole,
}: ReportersManagementViewProps) {
  const [reporters, setReporters] = useState<Reporter[]>(initialReporters);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'CREDENTIALS'>('ALL');

  // Form state for creating reporter & credentials
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [beat, setBeat] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [createCredentials, setCreateCredentials] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [assignedRole, setAssignedRole] = useState<UserRole>('REPORTER');
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Edit Reporter Modal State
  const [editingReporter, setEditingReporter] = useState<Reporter | null>(null);
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editBeat, setEditBeat] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('REPORTER');
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Delete Reporter Modal State
  const [deletingReporter, setDeletingReporter] = useState<Reporter | null>(null);
  const [reassignToReporterId, setReassignToReporterId] = useState('');

  // Quick Reports Drawer State
  const [viewingReportsReporter, setViewingReportsReporter] = useState<Reporter | null>(null);
  const [reporterReports, setReporterReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Feedback State
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function generateRandomPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let res = '';
    for (let i = 0; i < 12; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  }

  function handleGeneratePassword() {
    const newPass = generateRandomPassword();
    setPassword(newPass);
    setShowPassword(true);
    navigator.clipboard?.writeText(newPass);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
  }

  function handleGenerateEditPassword() {
    const newPass = generateRandomPassword();
    setEditNewPassword(newPass);
    setShowEditPassword(true);
    navigator.clipboard?.writeText(newPass);
  }

  async function refreshReporters() {
    setLoading(true);
    try {
      const res = await fetch('/api/reporters');
      const data = await res.json();
      if (data.reporters) {
        setReporters(data.reporters);
      }
    } catch (e) {
      //
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateReporter(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !title || !beat) {
      setFeedback({ type: 'error', text: 'Name, title, and beat are required.' });
      return;
    }

    if (createCredentials && (!password || password.length < 6)) {
      setFeedback({ type: 'error', text: 'Password must be at least 6 characters to provision credentials.' });
      return;
    }

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
          create_credentials: createCredentials,
          password: createCredentials ? password : null,
          user_role: assignedRole,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: 'success',
          text: data.message || `Journalist "${name}" created successfully.`
        });
        setName('');
        setTitle('');
        setBeat('');
        setBio('');
        setAvatarUrl('');
        setEmail('');
        setTwitter('');
        setLinkedin('');
        setPassword('');
        setShowAddForm(false);
        await refreshReporters();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to create reporter.' });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', text: e.message || 'Network error while registering reporter.' });
    }
  }

  function openEditModal(rep: Reporter) {
    setEditingReporter(rep);
    setEditName(rep.name);
    setEditTitle(rep.title);
    setEditBeat(rep.beat);
    setEditBio(rep.bio || '');
    setEditAvatarUrl(rep.avatar_url || '');
    setEditEmail(rep.email || '');
    setEditTwitter(rep.twitter || '');
    setEditLinkedin(rep.linkedin || '');
    setEditIsActive(Boolean(rep.is_active));
    setEditNewPassword('');
    setEditRole(rep.user_role || 'REPORTER');
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingReporter) return;

    try {
      const res = await fetch(`/api/reporters/${editingReporter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          title: editTitle,
          beat: editBeat,
          bio: editBio,
          avatar_url: editAvatarUrl,
          email: editEmail,
          twitter: editTwitter,
          linkedin: editLinkedin,
          is_active: editIsActive,
          password: editNewPassword.trim() || undefined,
          user_role: editRole,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({ type: 'success', text: data.message || `Reporter "${editName}" updated successfully.` });
        setEditingReporter(null);
        await refreshReporters();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to update reporter.' });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', text: e.message || 'Network error while updating reporter.' });
    }
  }

  async function handleToggleActive(rep: Reporter) {
    try {
      const newStatus = rep.is_active ? 0 : 1;
      const res = await fetch(`/api/reporters/${rep.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus }),
      });

      if (res.ok) {
        setFeedback({
          type: 'success',
          text: `Reporter "${rep.name}" is now ${newStatus ? 'Active' : 'Inactive'}.`
        });
        await refreshReporters();
      }
    } catch (e) {
      //
    }
  }

  async function handleDeleteReporter() {
    if (!deletingReporter) return;

    try {
      const url = reassignToReporterId 
        ? `/api/reporters/${deletingReporter.id}?reassign_to=${reassignToReporterId}`
        : `/api/reporters/${deletingReporter.id}`;

      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: 'success',
          text: data.message || `Reporter "${deletingReporter.name}" deleted successfully.`
        });
        setDeletingReporter(null);
        setReassignToReporterId('');
        await refreshReporters();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to delete reporter.' });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', text: e.message || 'Error deleting reporter.' });
    }
  }

  async function openReportsDrawer(rep: Reporter) {
    setViewingReportsReporter(rep);
    setLoadingReports(true);
    try {
      const res = await fetch(`/api/reporters/${rep.id}/reports`);
      const data = await res.json();
      if (data.reports) {
        setReporterReports(data.reports);
      }
    } catch (e) {
      //
    } finally {
      setLoadingReports(false);
    }
  }

  // Filtered reporters
  const filteredReporters = useMemo(() => {
    return reporters.filter((rep) => {
      if (statusFilter === 'ACTIVE' && !rep.is_active) return false;
      if (statusFilter === 'INACTIVE' && rep.is_active) return false;
      if (statusFilter === 'CREDENTIALS' && !rep.has_credentials) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = rep.name?.toLowerCase().includes(q);
        const matchBeat = rep.beat?.toLowerCase().includes(q);
        const matchEmail = rep.email?.toLowerCase().includes(q);
        const matchTitle = rep.title?.toLowerCase().includes(q);
        if (!matchName && !matchBeat && !matchEmail && !matchTitle) return false;
      }

      return true;
    });
  }, [reporters, statusFilter, searchQuery]);

  // Total KPIs
  const totalReporters = reporters.length;
  const activeCount = reporters.filter(r => r.is_active).length;
  const withCredentialsCount = reporters.filter(r => r.has_credentials).length;
  const totalReportsCount = reporters.reduce((acc, r) => acc + (r.reports_count || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="Reporters & Staff Management"
        subtitle="Administrator controls to provision journalist credentials, manage beats, and oversee published dispatches."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#079FE3] hover:bg-[#1261A6] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-xs cursor-pointer"
            >
              {showAddForm ? <Users className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{showAddForm ? 'View Roster' : 'Register Journalist & Credentials'}</span>
            </button>
          </div>
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

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#131F32] p-4 rounded-xl border border-[#DCE7F2] dark:border-[#27364B] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#7890A8]">
            Total Journalists
          </div>
          <div className="text-2xl font-black text-[#174A7E] dark:text-[#F4F7FB] mt-1">
            {totalReporters}
          </div>
        </div>

        <div className="bg-white dark:bg-[#131F32] p-4 rounded-xl border border-[#DCE7F2] dark:border-[#27364B] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#7890A8]">
            Active Bylines
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {activeCount}
          </div>
        </div>

        <div className="bg-white dark:bg-[#131F32] p-4 rounded-xl border border-[#DCE7F2] dark:border-[#27364B] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#7890A8]">
            Login Credentials
          </div>
          <div className="text-2xl font-black text-[#079FE3] mt-1">
            {withCredentialsCount}
          </div>
        </div>

        <div className="bg-white dark:bg-[#131F32] p-4 rounded-xl border border-[#DCE7F2] dark:border-[#27364B] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#7890A8]">
            Total Reports Authored
          </div>
          <div className="text-2xl font-black text-[#1261A6] dark:text-[#079FE3] mt-1">
            {totalReportsCount}
          </div>
        </div>
      </div>

      {/* Add Reporter & Credentials Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-[#131F32] p-6 border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#DCE7F2] dark:border-[#27364B] pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#079FE3]" />
              <div>
                <h2 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
                  Register New Journalist & Newsroom Credentials
                </h2>
                <p className="text-[11px] text-[#7890A8]">
                  Administrator-only feature: Creates the journalist profile and provisions their secure portal credentials.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#7890A8] hover:text-[#174A7E] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateReporter} className="space-y-5 text-xs">
            {/* Byline Profile Section */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#079FE3] block mb-3">
                1. Editorial Byline & Profile Details
              </span>
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
                    Editorial Designation / Title *
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                    Official Staff Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="journalist@newsight.media"
                    required={createCredentials}
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

              <div className="mt-4">
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                  Professional Bio & Accreditation
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Experience, past beats, awards, and areas of reporting specialization..."
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] placeholder-[#7890A8] rounded-lg focus:outline-none focus:border-[#079FE3]"
                />
              </div>
            </div>

            {/* Credentials Section */}
            <div className="bg-[#F7FAFE] dark:bg-[#0D1626] p-4 rounded-xl border border-[#DCE7F2] dark:border-[#27364B] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#079FE3]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#174A7E] dark:text-[#F4F7FB]">
                    2. Portal Login Credentials (Admin Provisioning)
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createCredentials}
                    onChange={(e) => setCreateCredentials(e.target.checked)}
                    className="w-4 h-4 accent-[#079FE3] rounded"
                  />
                  <span className="font-bold text-[#496784] dark:text-[#B6C3D4]">
                    Enable Portal Access
                  </span>
                </label>
              </div>

              {createCredentials && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-bold text-[#496784] dark:text-[#B6C3D4]">
                          Initial Password *
                        </label>
                        <button
                          type="button"
                          onClick={handleGeneratePassword}
                          className="text-[10.5px] font-bold text-[#079FE3] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Generate Password</span>
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          required={createCredentials}
                          className="w-full px-3 py-2.5 pr-20 bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] font-mono rounded-lg focus:outline-none focus:border-[#079FE3]"
                        />
                        <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-[#7890A8] hover:text-[#174A7E] dark:hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {password && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(password);
                                setCopiedPassword(true);
                                setTimeout(() => setCopiedPassword(false), 2000);
                              }}
                              className="text-[#7890A8] hover:text-[#079FE3]"
                              title="Copy password"
                            >
                              {copiedPassword ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1.5">
                        Access Role
                      </label>
                      <select
                        value={assignedRole}
                        onChange={(e) => setAssignedRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3]"
                      >
                        <option value="REPORTER">REPORTER (Can write & draft reports)</option>
                        <option value="EDITOR">EDITOR (Can review, approve & publish reports)</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN (Full system access)</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#7890A8]">
                    This journalist will be able to log in to the newsroom desk at <code className="text-[#079FE3]">/admin/login</code> using the email and password above.
                  </p>
                </div>
              )}
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
                Create Journalist & Credentials
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roster Table Card */}
      <div className="bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] rounded-xl shadow-xs overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-4 border-b border-[#DCE7F2] dark:border-[#27364B] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F0F6FC] dark:bg-[#0D1626]/50">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#7890A8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, beat, or email..."
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-xs text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3]"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end overflow-x-auto text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-[#079FE3] text-white'
                  : 'bg-white dark:bg-[#0D1626] text-[#496784] dark:text-[#B6C3D4] border border-[#DCE7F2] dark:border-[#27364B]'
              }`}
            >
              All ({reporters.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-[#0D1626] text-[#496784] dark:text-[#B6C3D4] border border-[#DCE7F2] dark:border-[#27364B]'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('CREDENTIALS')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'CREDENTIALS'
                  ? 'bg-[#1261A6] text-white'
                  : 'bg-white dark:bg-[#0D1626] text-[#496784] dark:text-[#B6C3D4] border border-[#DCE7F2] dark:border-[#27364B]'
              }`}
            >
              Has Login ({withCredentialsCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'INACTIVE'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white dark:bg-[#0D1626] text-[#496784] dark:text-[#B6C3D4] border border-[#DCE7F2] dark:border-[#27364B]'
              }`}
            >
              Inactive ({totalReporters - activeCount})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans min-w-[850px]">
            <thead className="bg-white dark:bg-[#0D1626] text-[#496784] dark:text-[#B6C3D4] font-bold uppercase tracking-wider border-b border-[#DCE7F2] dark:border-[#27364B]">
              <tr>
                <th className="px-5 py-3.5">Journalist Byline</th>
                <th className="px-5 py-3.5">Editorial Beat</th>
                <th className="px-5 py-3.5">Portal Credentials</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Reports Authored</th>
                <th className="px-5 py-3.5 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EDF5] dark:divide-[#27364B]">
              {filteredReporters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#7890A8]">
                    No reporters found matching your query.
                  </td>
                </tr>
              ) : (
                filteredReporters.map((rep) => (
                  <tr key={rep.id} className="hover:bg-[#F3F8FE] dark:hover:bg-[#1A2942]/30 transition">
                    {/* Journalist Details */}
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
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-[#174A7E] dark:text-[#F4F7FB] leading-tight">
                              {rep.name}
                            </h3>
                            <Link
                              href={`/reporters/${rep.slug}`}
                              target="_blank"
                              title="View Public Profile"
                              className="text-[#7890A8] hover:text-[#079FE3]"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                          <span className="text-[11px] text-[#7890A8] font-mono block mt-0.5">
                            {rep.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Beat & Title */}
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 text-[10.5px] font-bold uppercase rounded-md bg-[#E3F0FC] text-[#1261A6] border border-[#DCE7F2] dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900 inline-block font-mono mb-1">
                        {rep.beat}
                      </span>
                      <div className="text-[11px] text-[#496784] dark:text-[#B6C3D4]">
                        {rep.title}
                      </div>
                    </td>

                    {/* Portal Credentials */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {rep.has_credentials ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Active Login</span>
                          </span>
                          <span className="block text-[10px] text-[#7890A8] font-mono">
                            Role: {rep.user_role || 'REPORTER'}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 mb-1">
                            <ShieldAlert className="w-3 h-3" />
                            <span>No Credentials</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => openEditModal(rep)}
                            className="block text-[10.5px] text-[#079FE3] hover:underline font-bold"
                          >
                            + Provision Access
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Active Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(rep)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold transition cursor-pointer ${
                          rep.is_active
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {rep.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        <span>{rep.is_active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Reports Written */}
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => openReportsDrawer(rep)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E3F0FC] hover:bg-[#D0E7FA] text-[#1261A6] font-bold font-mono text-[11px] border border-[#DCE7F2] transition cursor-pointer"
                        title="View reporter reports"
                      >
                        <FileText className="w-3 h-3 text-[#079FE3]" />
                        <span>{rep.reports_count || 0} Reports</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Click: View / Manage Reporter's Reports */}
                        <Link
                          href={`/admin/articles?author=${rep.id}`}
                          className="p-1.5 text-[#1261A6] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] rounded-lg transition"
                          title="Manage All Reports by this Reporter"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>

                        {/* 1-Click: Create New Report for this Reporter */}
                        <Link
                          href={`/admin/articles/create?reporterId=${rep.id}`}
                          className="p-1.5 text-[#079FE3] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] rounded-lg transition"
                          title="Create New Report for this Reporter"
                        >
                          <Plus className="w-4 h-4" />
                        </Link>

                        {/* Edit Reporter & Credentials */}
                        <button
                          type="button"
                          onClick={() => openEditModal(rep)}
                          className="p-1.5 text-[#496784] hover:text-[#174A7E] hover:bg-[#E3F0FC] dark:hover:bg-[#1A2942] rounded-lg transition cursor-pointer"
                          title="Edit Details & Credentials"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Reporter */}
                        <button
                          type="button"
                          onClick={() => setDeletingReporter(rep)}
                          className="p-1.5 text-[#D71920] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                          title="Delete Reporter"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Reporter & Credentials Modal */}
      {editingReporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#131F32] rounded-2xl border border-[#DCE7F2] dark:border-[#27364B] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#DCE7F2] dark:border-[#27364B] pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#079FE3]" />
                <div>
                  <h3 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
                    Edit Reporter & Manage Credentials
                  </h3>
                  <p className="text-[11px] text-[#7890A8]">
                    Update byline details, reset portal password, or modify access privileges.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingReporter(null)}
                className="text-[#7890A8] hover:text-[#174A7E] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1">
                    Byline Name *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1">
                    Editorial Title *
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1">
                    Assigned Beat Desk *
                  </label>
                  <input
                    type="text"
                    value={editBeat}
                    onChange={(e) => setEditBeat(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1">
                    Staff Email *
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1">
                    Profile Photo URL
                  </label>
                  <input
                    type="text"
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1">
                    X / Twitter Handle
                  </label>
                  <input
                    type="text"
                    value={editTwitter}
                    onChange={(e) => setEditTwitter(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1">
                  Professional Bio
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3]"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7FAFE] dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B]">
                <div>
                  <span className="font-bold text-[#174A7E] dark:text-[#F4F7FB] block">
                    Active Byline Status
                  </span>
                  <span className="text-[11px] text-[#7890A8]">
                    Inactive journalists cannot be assigned to new articles or dispatches.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#079FE3]"></div>
                </label>
              </div>

              {/* Credentials Section */}
              <div className="p-4 rounded-xl bg-[#F7FAFE] dark:bg-[#0D1626] border border-[#DCE7F2] dark:border-[#27364B] space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#079FE3]" />
                  <span className="font-bold text-[11px] uppercase tracking-wider text-[#174A7E] dark:text-[#F4F7FB]">
                    Portal Credentials (Password Reset)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-[#496784] dark:text-[#B6C3D4]">
                        Set New Password
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateEditPassword}
                        className="text-[10.5px] font-bold text-[#079FE3] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Generate</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        value={editNewPassword}
                        onChange={(e) => setEditNewPassword(e.target.value)}
                        placeholder="Leave blank to keep current"
                        className="w-full px-3 py-2 pr-10 bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] font-mono rounded-lg focus:outline-none focus:border-[#079FE3]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-2.5 top-2.5 text-[#7890A8] hover:text-[#174A7E] dark:hover:text-white"
                      >
                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#496784] dark:text-[#B6C3D4] mb-1">
                      User Role
                    </label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] text-[#174A7E] dark:text-[#F4F7FB] rounded-lg focus:outline-none focus:border-[#079FE3]"
                    >
                      <option value="REPORTER">REPORTER</option>
                      <option value="EDITOR">EDITOR</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE7F2] dark:border-[#27364B]">
                <button
                  type="button"
                  onClick={() => setEditingReporter(null)}
                  className="px-4 py-2 border border-[#DCE7F2] dark:border-[#27364B] text-[#496784] dark:text-[#B6C3D4] rounded-lg hover:bg-[#F3F8FE] dark:hover:bg-[#1A2942]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold uppercase tracking-wider text-xs rounded-lg transition shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Reporter Modal */}
      {deletingReporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#131F32] rounded-2xl border border-[#DCE7F2] dark:border-[#27364B] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#D71920]">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-[#D71920]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
                  Delete Reporter
                </h3>
                <p className="text-[11px] text-[#7890A8]">
                  Are you sure you want to delete {deletingReporter.name}?
                </p>
              </div>
            </div>

            <p className="text-xs text-[#496784] dark:text-[#B6C3D4]">
              This will permanently delete the reporter byline and their portal login credentials.
            </p>

            {(deletingReporter.reports_count || 0) > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Reporter has {deletingReporter.reports_count} authored articles</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#496784] dark:text-[#B6C3D4] mb-1">
                    Reassign articles to another reporter (recommended):
                  </label>
                  <select
                    value={reassignToReporterId}
                    onChange={(e) => setReassignToReporterId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#131F32] border border-[#DCE7F2] dark:border-[#27364B] text-xs rounded-lg"
                  >
                    <option value="">Do not reassign (Delete reports with reporter)</option>
                    {reporters
                      .filter((r) => r.id !== deletingReporter.id)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          Reassign to {r.name} ({r.beat})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeletingReporter(null);
                  setReassignToReporterId('');
                }}
                className="px-4 py-2 border border-[#DCE7F2] dark:border-[#27364B] text-[#496784] dark:text-[#B6C3D4] rounded-lg hover:bg-[#F3F8FE] dark:hover:bg-[#1A2942]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteReporter}
                className="px-5 py-2 bg-[#D71920] hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs rounded-lg transition shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports Drawer / Modal */}
      {viewingReportsReporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#131F32] rounded-2xl border border-[#DCE7F2] dark:border-[#27364B] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE7F2] dark:border-[#27364B] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#079FE3]" />
                <div>
                  <h3 className="text-sm font-bold text-[#174A7E] dark:text-[#F4F7FB]">
                    Authored Reports — {viewingReportsReporter.name}
                  </h3>
                  <p className="text-[11px] text-[#7890A8]">
                    Beat: {viewingReportsReporter.beat} • {reporterReports.length} Dispatches Found
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/articles?author=${viewingReportsReporter.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#079FE3] hover:bg-[#1261A6] text-white text-xs font-bold rounded-lg transition"
                >
                  <span>Open in Full Manager</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => setViewingReportsReporter(null)}
                  className="text-[#7890A8] hover:text-[#174A7E] dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingReports ? (
                <div className="text-center py-8 text-xs text-[#7890A8]">
                  Loading reports...
                </div>
              ) : reporterReports.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#7890A8]">
                  No reports authored by this journalist yet.
                  <div className="mt-3">
                    <Link
                      href={`/admin/articles/create?reporterId=${viewingReportsReporter.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#079FE3] text-white font-bold rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Write First Report</span>
                    </Link>
                  </div>
                </div>
              ) : (
                reporterReports.map((art) => (
                  <div
                    key={art.id}
                    className="p-3.5 rounded-xl border border-[#DCE7F2] dark:border-[#27364B] bg-white dark:bg-[#0D1626] hover:bg-[#F3F8FE] dark:hover:bg-[#1A2942]/40 transition flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          art.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : art.status === 'IN_REVIEW'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          {art.status}
                        </span>
                        {art.category_name && (
                          <span className="text-[10px] font-bold text-[#1261A6] dark:text-[#079FE3]">
                            {art.category_name}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-[#174A7E] dark:text-[#F4F7FB] truncate">
                        {art.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/admin/articles/${art.id}/edit`}
                        className="px-2.5 py-1 text-xs font-bold bg-[#E3F0FC] hover:bg-[#D0E7FA] text-[#1261A6] rounded-lg border border-[#DCE7F2] transition"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/article/${art.slug}`}
                        target="_blank"
                        className="p-1 text-[#7890A8] hover:text-[#079FE3]"
                        title="View Public Story"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

