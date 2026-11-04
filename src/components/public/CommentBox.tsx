'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { CommentItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface CommentBoxProps {
  articleId: string;
  initialComments: CommentItem[];
}

export default function CommentBox({ articleId, initialComments }: CommentBoxProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      setStatus('error');
      setMessage('Name and comment text are required.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article_id: articleId,
          author_name: name,
          author_email: email || 'reader@newsight.media',
          content,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('Your perspective has been submitted and published.');
        if (data.comment) {
          setComments([data.comment, ...comments]);
        }
        setContent('');
        setName('');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to submit comment.');
      }
    } catch (_) {
      setStatus('error');
      setMessage('Network error submitting response.');
    }
  }

  return (
    <section className="mt-8 pt-6 border-t border-[#252D39]">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-[#075DEB]" />
        <h3 className="text-lg font-bold text-white">
          Reader Discussion & Commentary ({comments.length})
        </h3>
      </div>

      {/* Submission Form */}
      <div className="bg-[#0E131C] border border-[#252D39] p-5 rounded-xl mb-8">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#A4ADBB] mb-1">
          Join the Public Interest Discussion
        </h4>
        <p className="text-xs text-[#707B8B] mb-4">
          All contributions are reviewed under our journalistic standards to maintain substantive discourse.
        </p>

        {status === 'success' && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="px-3 py-2 text-xs bg-[#121925] border border-[#252D39] rounded-lg text-white placeholder-[#707B8B] focus:outline-none focus:border-[#075DEB]"
            />
            <input
              type="email"
              placeholder="Email Address (kept private)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 text-xs bg-[#121925] border border-[#252D39] rounded-lg text-white placeholder-[#707B8B] focus:outline-none focus:border-[#075DEB]"
            />
          </div>
          <textarea
            rows={3}
            placeholder="Share your perspective or analysis on this report *"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs bg-[#121925] border border-[#252D39] rounded-lg text-white placeholder-[#707B8B] focus:outline-none focus:border-[#075DEB]"
          />
          <div className="flex justify-between items-center">
            {status === 'error' && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{message}</span>
              </span>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#075DEB] hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>{status === 'loading' ? 'Submitting...' : 'Post Contribution'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Published Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-4 bg-[#121925] border border-[#252D39] rounded-xl space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">{comment.author_name}</span>
              <span className="text-[#707B8B] text-[11px] font-mono">
                {formatDate(comment.created_at)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#A4ADBB] leading-relaxed">
              {comment.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
