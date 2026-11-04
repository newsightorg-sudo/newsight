'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import NewsightLogo from '@/components/public/NewsightLogo';
import ThemeToggle from '@/components/public/ThemeToggle';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Invalid newsroom credentials.');
      }
    } catch (_) {
      setError('Network connection error.');
    } finally {
      setLoading(false);
    }
  }

  function prefillCredentials(role: 'admin' | 'reporter') {
    if (role === 'admin') {
      setEmail('editor@dailysignal.com');
      setPassword('Newsroom2026!');
    } else {
      setEmail('ayesha.sen@dailysignal.com');
      setPassword('Reporter2026!');
    }
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#080B11] text-[#174A7E] dark:text-[#F5F7FA] flex flex-col justify-center items-center px-4 py-12 font-sans transition-colors">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      {/* Brand Header */}
      <div className="text-center mb-8 space-y-2">
        <NewsightLogo size="lg" />
        <h2 className="text-xs font-bold text-[#496784] dark:text-[#B6C3D4] uppercase tracking-widest block pt-2 font-mono">
          EDITORIAL CMS & NEWSROOM PORTAL
        </h2>
        <p className="text-xs text-[#7890A8] max-w-sm mx-auto">
          Authorized newsroom access for editors, desk staff, broadcast anchors, and correspondents.
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#0E131C] border border-[#DCE7F2] dark:border-[#27364B] p-8 rounded-2xl shadow-xl space-y-6">
        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-[#D71920] dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-[#174A7E] dark:text-[#F5F7FA] mb-1.5 uppercase tracking-wider font-mono text-[10.5px]">
              Newsroom Staff Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#7890A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@newsight.media"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-[#121925] border border-[#DCE7F2] dark:border-[#252D39] text-[#174A7E] dark:text-[#F5F7FA] placeholder-[#7890A8] rounded-xl focus:outline-none focus:border-[#079FE3] text-xs transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#174A7E] dark:text-[#F5F7FA] mb-1.5 uppercase tracking-wider font-mono text-[10.5px]">
              Security Key / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#7890A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-[#121925] border border-[#DCE7F2] dark:border-[#252D39] text-[#174A7E] dark:text-[#F5F7FA] placeholder-[#7890A8] rounded-xl focus:outline-none focus:border-[#079FE3] text-xs transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Newsroom'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Fill */}
        <div className="pt-4 border-t border-[#DCE7F2] dark:border-[#252D39] space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7890A8] block text-center font-mono">
            Demo Credentials Quick-Fill
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => prefillCredentials('admin')}
              className="py-2 px-2.5 bg-[#E3F0FC] hover:bg-[#079FE3] text-[#1261A6] hover:text-white dark:bg-[#1A2942] dark:text-[#079FE3] rounded-lg border border-[#DCE7F2] dark:border-[#27364B] transition text-center font-bold cursor-pointer"
            >
              Editor / Admin
            </button>
            <button
              type="button"
              onClick={() => prefillCredentials('reporter')}
              className="py-2 px-2.5 bg-white hover:bg-[#E3F0FC] dark:bg-[#121925] dark:hover:bg-[#1A2942] text-[#496784] dark:text-[#B6C3D4] rounded-lg border border-[#DCE7F2] dark:border-[#27364B] transition text-center font-bold cursor-pointer"
            >
              Field Reporter
            </button>
          </div>
        </div>
      </div>

      {/* Return to Public Site */}
      <div className="mt-8 text-center text-xs">
        <Link
          href="/"
          className="text-[#7890A8] hover:text-[#079FE3] transition flex items-center justify-center gap-1.5 font-medium"
        >
          <span>← Return to Public Live Edition</span>
        </Link>
      </div>
    </div>
  );
}
