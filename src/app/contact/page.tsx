'use client';

import React, { useState } from 'react';
import NewsightHeader from '@/components/public/NewsightHeader';
import NewsightFooter from '@/components/public/NewsightFooter';
import { 
  Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, ShieldAlert, ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Editorial');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMsg, setResponseMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) {
      setStatus('error');
      setResponseMsg('Please fill in all required fields.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, department, subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setResponseMsg('Your message has been securely dispatched to the selected desk editor.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setStatus('error');
        setResponseMsg(data.error || 'Failed to submit dispatch.');
      }
    } catch (_) {
      setStatus('error');
      setResponseMsg('Network error. Please try again.');
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#080B11] text-[#F5F7FA]">
      <NewsightHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-8">
        
        {/* Masthead */}
        <div className="border-b border-[#252D39] pb-5">
          <span className="text-xs font-black uppercase tracking-widest text-[#075DEB] block mb-1">
            COMMUNICATIONS & EDITORIAL BUREAU
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Contact NEWSIGHT
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#A4ADBB] max-w-2xl leading-relaxed">
            Direct communication channels for press releases, investigative tip-offs, corrections, advertising inquiries, and technical support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Contact Details & Bureaus (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 rounded-2xl bg-[#0E131C] border border-[#252D39] space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Bureau Contacts
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#075DEB] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">General Editorial Desk</strong>
                    <span className="text-[#A4ADBB]">editorial@newsight.media</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Whistleblower & Leaks</strong>
                    <span className="text-[#A4ADBB]">secure.tips@newsight.media</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Advertising & Brand Partnerships</strong>
                    <span className="text-[#A4ADBB]">advertising@newsight.media</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#075DEB] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Newsroom Switchboard</strong>
                    <span className="text-[#A4ADBB]">+91 11 4980 7700</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#075DEB] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Newsroom Headquarters</strong>
                    <span className="text-[#A4ADBB]">
                      NEWSIGHT Media Tower, 14 Cyber Boulevard, New Delhi 110001, India
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Whistleblower Security Callout */}
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-xs space-y-1.5">
              <h4 className="font-bold text-red-400 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>Source Protection Commitment</span>
              </h4>
              <p className="text-[#A4ADBB] leading-relaxed">
                We protect confidential sources under supreme journalistic privilege. For classified submissions, we recommend using encrypted ProtonMail or Signal communications.
              </p>
            </div>
          </div>

          {/* Contact Dispatch Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0E131C] border border-[#252D39] space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Dispatch Message to Desk
                </h3>
                <p className="text-xs text-[#707B8B] mt-0.5">
                  Direct message delivered immediately to the duty editor.
                </p>
              </div>

              {status === 'success' && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{responseMsg}</span>
                </div>
              )}

              {status === 'error' && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{responseMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-[#A4ADBB] uppercase tracking-wider block mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Radhika Menon"
                      className="w-full px-3 py-2 bg-[#121925] border border-[#252D39] rounded-lg text-xs text-white placeholder-[#707B8B] focus:outline-none focus:border-[#075DEB]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#A4ADBB] uppercase tracking-wider block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@organization.com"
                      className="w-full px-3 py-2 bg-[#121925] border border-[#252D39] rounded-lg text-xs text-white placeholder-[#707B8B] focus:outline-none focus:border-[#075DEB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-[#A4ADBB] uppercase tracking-wider block mb-1">
                      Target Bureau *
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-[#121925] border border-[#252D39] rounded-lg text-xs text-white focus:outline-none focus:border-[#075DEB]"
                    >
                      <option value="Editorial">Editorial & News Desk</option>
                      <option value="Investigations">Special Investigations Unit</option>
                      <option value="Whistleblower">Confidential Tip-off</option>
                      <option value="Advertising">Advertising & Sponsorships</option>
                      <option value="Corrections">Factual Correction Request</option>
                      <option value="Technical">Website / Stream Technical Issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#A4ADBB] uppercase tracking-wider block mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief topic summary"
                      className="w-full px-3 py-2 bg-[#121925] border border-[#252D39] rounded-lg text-xs text-white placeholder-[#707B8B] focus:outline-none focus:border-[#075DEB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#A4ADBB] uppercase tracking-wider block mb-1">
                    Your Message / Dispatch *
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Provide detailed information, citations, or inquiries..."
                    className="w-full px-3 py-2 bg-[#121925] border border-[#252D39] rounded-lg text-xs text-white placeholder-[#707B8B] focus:outline-none focus:border-[#075DEB]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-2.5 bg-[#075DEB] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{status === 'loading' ? 'Transmitting Dispatch...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>

        </div>

      </main>

      <NewsightFooter />
    </div>
  );
}
