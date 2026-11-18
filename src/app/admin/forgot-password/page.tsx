'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import NewsightLogo from '@/components/public/NewsightLogo';
import ThemeToggle from '@/components/public/ThemeToggle';

type Step = 'EMAIL' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS';

export default function AdminForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // STEP 1: Request OTP
  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_otp',
          email: email.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep('OTP');
        setInfo(data.message || 'Verification code sent to your administrator email.');
        setResendCooldown(60);
      } else {
        setError(data.error || 'Failed to dispatch verification code.');
      }
    } catch (_) {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // STEP 2: Verify OTP
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_otp',
          email: email.trim(),
          otp: cleanOtp,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.reset_token) {
        setResetToken(data.reset_token);
        setStep('NEW_PASSWORD');
        setInfo(data.message || 'Code verified. Please set your new password.');
      } else {
        setError(data.error || 'Invalid or expired verification code.');
      }
    } catch (_) {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // STEP 3: Reset Password
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          email: email.trim(),
          reset_token: resetToken,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep('SUCCESS');
      } else {
        setError(data.error || 'Failed to reset administrator password.');
      }
    } catch (_) {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-[#079FE3] dark:text-[#38BDF8] text-[10px] font-bold tracking-widest uppercase font-mono mt-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ADMINISTRATOR IDENTITY RECOVERY</span>
        </div>
        <p className="text-xs text-[#7890A8] max-w-sm mx-auto">
          Secure email verification powered by MSG91 with template <code className="text-[#079FE3] font-mono">global_otp</code>.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#0E131C] border border-[#DCE7F2] dark:border-[#27364B] p-8 rounded-2xl shadow-xl space-y-6">
        
        {/* Step Indicator */}
        {step !== 'SUCCESS' && (
          <div className="flex items-center justify-between border-b border-[#DCE7F2] dark:border-[#252D39] pb-4 text-[11px] font-mono">
            <span className={step === 'EMAIL' ? 'text-[#079FE3] font-bold' : 'text-[#7890A8]'}>
              1. Email
            </span>
            <span className="text-[#7890A8]">→</span>
            <span className={step === 'OTP' ? 'text-[#079FE3] font-bold' : 'text-[#7890A8]'}>
              2. OTP Code
            </span>
            <span className="text-[#7890A8]">→</span>
            <span className={step === 'NEW_PASSWORD' ? 'text-[#079FE3] font-bold' : 'text-[#7890A8]'}>
              3. New Password
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-[#D71920] dark:text-red-300 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Info Alert */}
        {info && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[#079FE3] dark:text-[#38BDF8] text-xs rounded-xl flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{info}</span>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 'EMAIL' && (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-[#174A7E] dark:text-[#F5F7FA] mb-1.5 uppercase tracking-wider font-mono text-[10.5px]">
                Registered Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7890A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@newsight.media"
                  required
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-[#121925] border border-[#DCE7F2] dark:border-[#252D39] text-[#174A7E] dark:text-[#F5F7FA] placeholder-[#7890A8] rounded-xl focus:outline-none focus:border-[#079FE3] text-xs transition"
                />
              </div>
              <p className="text-[11px] text-[#7890A8] mt-2 leading-relaxed">
                Password recovery via email verification is restricted strictly to Administrator (<code className="font-mono text-[#079FE3]">SUPER_ADMIN</code>) accounts.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Dispatching Verification Code...' : 'Send Verification Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#174A7E] dark:text-[#F5F7FA] uppercase tracking-wider font-mono text-[10.5px]">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep('EMAIL');
                    setError('');
                  }}
                  className="text-[11px] text-[#7890A8] hover:text-[#079FE3] transition"
                >
                  Change Email
                </button>
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#7890A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-3 bg-white dark:bg-[#121925] border border-[#DCE7F2] dark:border-[#252D39] text-[#174A7E] dark:text-[#F5F7FA] placeholder-[#7890A8] rounded-xl focus:outline-none focus:border-[#079FE3] text-center font-mono text-lg tracking-[0.4em] font-bold transition"
                />
              </div>

              <div className="flex items-center justify-between mt-2.5 text-[11px]">
                <span className="text-[#7890A8]">Sent to: <strong className="text-[#174A7E] dark:text-[#F5F7FA]">{email}</strong></span>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleRequestOtp}
                  className="text-[#079FE3] hover:underline disabled:text-[#7890A8] disabled:no-underline font-medium flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.trim().length !== 6}
              className="w-full py-3 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Verifying Code...' : 'Verify Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 3: Enter New Password */}
        {step === 'NEW_PASSWORD' && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-[#174A7E] dark:text-[#F5F7FA] mb-1.5 uppercase tracking-wider font-mono text-[10.5px]">
                New Administrator Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7890A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-[#121925] border border-[#DCE7F2] dark:border-[#252D39] text-[#174A7E] dark:text-[#F5F7FA] placeholder-[#7890A8] rounded-xl focus:outline-none focus:border-[#079FE3] text-xs transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#174A7E] dark:text-[#F5F7FA] mb-1.5 uppercase tracking-wider font-mono text-[10.5px]">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7890A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-[#121925] border border-[#DCE7F2] dark:border-[#252D39] text-[#174A7E] dark:text-[#F5F7FA] placeholder-[#7890A8] rounded-xl focus:outline-none focus:border-[#079FE3] text-xs transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 4: Success Screen */}
        {step === 'SUCCESS' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#174A7E] dark:text-white">
                Password Reset Complete
              </h3>
              <p className="text-xs text-[#7890A8] max-w-xs mx-auto">
                Your administrator password has been updated securely. You can now log in with your new credentials.
              </p>
            </div>

            <button
              onClick={() => router.push('/admin/login')}
              className="w-full py-3 bg-[#079FE3] hover:bg-[#1261A6] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In to Newsroom</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Back to Login Link */}
      <div className="mt-8 text-center text-xs">
        <Link
          href="/admin/login"
          className="text-[#7890A8] hover:text-[#079FE3] transition flex items-center justify-center gap-1.5 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Newsroom Sign In</span>
        </Link>
      </div>
    </div>
  );
}
