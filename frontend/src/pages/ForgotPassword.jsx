import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Shield, ArrowLeft, KeyRound } from 'lucide-react';
import { sendOTPApi } from '../services/authService';
import nitLogo from '../assets/nit-logo.jpg';
import loginBg from '../assets/login-bg.jpg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (inputEmail) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(inputEmail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter a valid registered college email address.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid registered college email address.');
      return;
    }

    setError('');
    setInfoMessage('');
    setSubmitting(true);

    try {
      const res = await sendOTPApi(email);
      setSubmitting(false);

      if (res.success) {
        setInfoMessage(res.message);
        setTimeout(() => {
          navigate('/verify-otp');
        }, 1200);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setSubmitting(false);
      setError('Failed to send verification code. Please try again.');
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 dark:bg-slate-950"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.65)), url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-md p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/95 relative z-10 fade-in-page">
        
        {/* Top Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden bg-white shadow-md border border-slate-100 dark:border-slate-800">
            <img src={nitLogo} alt="NIT Logo" className="h-full w-full object-contain p-1" />
          </div>
          <div className="flex items-center gap-2 text-primary dark:text-primary-light bg-primary/10 dark:bg-primary-light/10 px-3 py-1 rounded-full text-xs font-bold mt-1">
            <KeyRound className="h-3.5 w-3.5" />
            Password Recovery
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white text-center">
            Forgot Your Password?
          </h2>
          <p className="text-center text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            Enter your registered college email address and we'll send you a verification code to reset your password.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold leading-relaxed text-rose-600 dark:border-rose-900/35 dark:bg-rose-950/20 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Info Alert */}
        {infoMessage && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold leading-relaxed text-emerald-600 dark:border-emerald-900/35 dark:bg-emerald-950/20 dark:text-emerald-400">
            {infoMessage}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4.5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Registered College Email
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                autoComplete="email"
                className="w-full rounded-2xl border border-slate-200 py-3.5 pr-4 pl-11 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                disabled={submitting}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1.5 block">
              We'll send a 6-digit verification code to this email
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-[0.98] disabled:scale-100 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </button>
        </form>

        {/* Security Info Card */}
        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/40 dark:bg-slate-900/50 flex items-start gap-3 shadow-inner">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light">
            <Shield className="h-4.5 w-4.5" />
          </div>
          <div className="text-left">
            <h4 className="text-[11px] font-bold tracking-wide uppercase text-slate-700 dark:text-slate-250">Secure Verification</h4>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
              The OTP is single-use, expires in 5 minutes, and will only be sent to your registered email address.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
