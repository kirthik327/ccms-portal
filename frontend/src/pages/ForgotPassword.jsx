import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, Mail, Lock, KeyRound } from 'lucide-react';
import nitLogo from '../assets/nit-logo.jpg';
import loginBg from '../assets/login-bg.jpg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState(''); // Roll number or Employee ID
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stage, setStage] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Reset Password
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !identifier) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await axios.post('/api/auth/forgot-password/send-otp', {
        email,
        identifier,
      });

      if (res.data.success) {
        setSuccess('OTP is sent to your email');
        setStage(2);
        setResendTimer(30);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    setSuccess('');
    setResendTimer(30);

    try {
      const res = await axios.post('/api/auth/forgot-password/send-otp', {
        email,
        identifier,
      });

      if (res.data.success) {
        setSuccess('OTP is sent to your email');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
      setResendTimer(0);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the verification code.');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await axios.post('/api/auth/forgot-password/verify-otp', {
        email,
        identifier,
        otp,
      });

      if (res.data.success) {
        setSuccess('OTP verified successfully!');
        setStage(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await axios.post('/api/auth/forgot-password/reset', {
        email,
        identifier,
        otp,
        newPassword,
      });

      if (res.data.success) {
        setSuccess(res.data.message);
        setEmail('');
        setIdentifier('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setStage(1);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setSubmitting(false);
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
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-md p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/95 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden bg-white shadow-md border border-slate-100 dark:border-slate-800">
            <img src={nitLogo} alt="NIT Logo" className="h-full w-full object-contain p-1" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            Reset Password
          </h2>
          <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            {stage === 1 && 'Verify academic identity to send verification OTP'}
            {stage === 2 && 'Enter the verification OTP code sent to your email'}
            {stage === 3 && 'Set a strong new password for your account'}
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold leading-relaxed text-emerald-600 dark:border-emerald-900/35 dark:bg-emerald-950/20 dark:text-emerald-400">
            {success}
          </div>
        )}


        {/* Error Alert */}
        {error && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold leading-relaxed text-rose-600 dark:border-rose-900/35 dark:bg-rose-950/20 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* STAGE 1: REQUEST OTP FORM */}
        {stage === 1 && (
          <form onSubmit={handleSendOtp} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Registered Email ID
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@gmail.com"
                  className="w-full rounded-2xl border border-slate-200 py-3.5 pr-4 pl-11 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Register Number / Employee ID
              </label>
              <div className="relative mt-1.5">
                <KeyRound className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="721021104001 or EMP-001"
                  className="w-full rounded-2xl border border-slate-200 py-3.5 pr-4 pl-11 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                  disabled={submitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-[0.98] disabled:scale-100 disabled:opacity-60"
            >
              {submitting ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* STAGE 2: VERIFY OTP FORM */}
        {stage === 2 && (
          <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Enter 6-Digit OTP Code
              </label>
              <div className="relative mt-1.5">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-2xl border border-slate-200 py-3.5 pr-4 pl-11 text-center font-mono tracking-[0.5em] text-lg bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStage(1)}
                className="flex-1 rounded-2xl border border-slate-200 py-4 text-sm font-bold text-slate-500 transition-all hover:bg-slate-50 active:scale-[0.98] dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-950"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-[0.98] disabled:scale-100 disabled:opacity-60"
              >
                {submitting ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>

            {/* Resend OTP Link */}
            <div className="mt-4 text-center">
              <button
                type="button"
                disabled={resendTimer > 0}
                onClick={handleResendOtp}
                className="text-xs font-bold text-primary hover:text-primary-hover disabled:text-slate-400 disabled:cursor-not-allowed transition-all dark:text-primary-light"
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        {/* STAGE 3: NEW PASSWORD FORM */}
        {stage === 3 && (
          <form onSubmit={handleResetPassword} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                New Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 py-3.5 pr-4 pl-11 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Confirm New Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 py-3.5 pr-4 pl-11 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                  disabled={submitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-[0.98] disabled:scale-100 disabled:opacity-60"
            >
              {submitting ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Remembered your password?{' '}
          <Link
            to="/login"
            className="font-bold text-primary hover:underline dark:text-primary-light"
          >
            Sign In Instead
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
