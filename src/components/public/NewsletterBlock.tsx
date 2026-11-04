'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function NewsletterBlock() {
  const [email, setEmail] = useState('');
  const [edition, setEdition] = useState('National');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please provide a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, edition_preference: edition }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'You are subscribed to NEWSIGHT morning dispatches.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Subscription failed. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <section className="bg-[#121925] border border-[#252D39] rounded-xl p-8 my-8 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E50914]/15 text-[#E50914] mb-4 border border-[#E50914]/30">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
          NEWSIGHT Morning Dispatch
        </h3>
        <p className="mt-2 text-sm text-[#A4ADBB] max-w-lg mx-auto font-sans leading-relaxed">
          Delivering independent video journalism, investigative reports, and verified daily headlines straight to your inbox every morning at 06:00 IST.
        </p>

        {status === 'success' ? (
          <div className="mt-6 p-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-sm flex items-center justify-center space-x-2 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 max-w-lg mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-2.5 text-sm bg-[#0E131C] border border-[#252D39] text-[#F5F7FA] placeholder-[#707B8B] rounded-lg focus:outline-none focus:border-[#E50914]"
            />
            <select
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              className="px-3 py-2.5 text-sm bg-[#0E131C] border border-[#252D39] text-[#F5F7FA] rounded-lg focus:outline-none focus:border-[#E50914] cursor-pointer"
            >
              <option value="National">National Edition</option>
              <option value="Global">Global Desk</option>
              <option value="Business">Business Focus</option>
              <option value="Kerala">Kerala Desk</option>
            </select>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-2.5 text-sm font-bold uppercase tracking-wider bg-[#E50914] text-white hover:bg-[#b80710] rounded-lg transition shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {status === 'loading' ? 'Joining...' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <div className="mt-3 text-xs text-[#E50914] flex items-center justify-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{message}</span>
          </div>
        )}

        <p className="mt-4 text-xs text-[#707B8B]">
          No spam, ever. Unsubscribe anytime with one click. Read our{' '}
          <a href="/privacy" className="underline hover:text-[#F5F7FA]">
            Privacy Policy
          </a>.
        </p>
      </div>
    </section>
  );
}

