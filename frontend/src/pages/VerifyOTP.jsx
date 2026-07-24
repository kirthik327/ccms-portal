import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import OTPInput from '../components/OTPInput';
import CountdownTimer from '../components/CountdownTimer';
import {
  getResetEmail,
  verifyOTPApi,
  resendOTPApi,
  maskEmail,
} from '../services/authService';
import nitLogo from '../assets/nit-logo.jpg';
import loginBg from '../assets/login-bg.jpg';

const VerifyOTP = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [resendAvailableAt, setResendAvailableAt] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const currentEmail = getResetEmail();
    if (!currentEmail) {
      navigate('/forgot-password');
      return;
    }
    setEmail(currentEmail);
    const now = Date.now();
    setExpiresAt(now + 5 * 60 * 1000);
    setResendAvailableAt(now + 60 * 1000);
  }, [navigate]);

  if (!email) return null;

  const fullOtpString = otp.join('');
  const isComplete = fullOtpString.length === 6;
  const isDisabled = verifying || isExpired || !!successMessage;

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!isComplete || isDisabled) return;

    setError('');
    setVerifying(true);

    try {
      const res = await verifyOTPApi(fullOtpString);
      setVerifying(false);

      if (res.success && res.resetToken) {
        setSuccessMessage('Email Verified Successfully! Redirecting...');
        setTimeout(() => {
          navigate('/reset-password');
        }, 1000);
      } else {
        setError(res.message);
        setOtp(['', '', '', '', '', '']);

        if (res.reason === 'EXPIRED') {
          setIsExpired(true);
        }
      }
    } catch (err) {
      setVerifying(false);
      setError('Verification failed. Please check the code and try again.');
    }
  };

  const handleResend = async () => {
    if (resending) return;

    const now = Date.now();
    if (resendAvailableAt && now < resendAvailableAt) {
      return;
    }

    setError('');
    setSuccessMessage('');
    setResending(true);

    try {
      const res = await resendOTPApi();
      setResending(false);

      if (res.success) {
        setOtp(['', '', '', '', '', '']);
        setIsExpired(false);
        setExpiresAt(now + 5 * 60 * 1000);
        setResendAvailableAt(now + 60 * 1000);
        setSuccessMessage(res.message || 'A new verification code has been sent to your email.');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setResending(false);
      setError('Failed to resend verification code. Please try again.');
    }
  };

  const handleExpire = () => {
    setIsExpired(true);
    setError('This OTP has expired. Please generate a new OTP.');
  };

  const canResendNow = resendAvailableAt && Date.now() >= resendAvailableAt;

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
          to="/forgot-password"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Change Email Address
        </Link>

        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden bg-white shadow-md border border-slate-100 dark:border-slate-800">
            <img src={nitLogo} alt="NIT Logo" className="h-full w-full object-contain p-1" />
          </div>
          <div className="flex items-center gap-2 text-primary dark:text-primary-light bg-primary/10 dark:bg-primary-light/10 px-3 py-1 rounded-full text-xs font-bold mt-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Step 2 of 3: OTP Verification
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white text-center">
            Verify Your Email
          </h2>
          <p className="text-center text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            We've sent a 6-digit verification code to{' '}
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {maskEmail(email)}
            </span>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold leading-relaxed text-rose-600 dark:border-rose-900/35 dark:bg-rose-950/20 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold leading-relaxed text-emerald-600 dark:border-emerald-900/35 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleVerify} className="mt-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                6-Digit Verification Code
              </label>
              {expiresAt && !isExpired && (
                <CountdownTimer
                  targetTimestamp={expiresAt}
                  onExpire={handleExpire}
                  label="Expires in"
                />
              )}
            </div>

            <OTPInput
              otp={otp}
              setOtp={setOtp}
              disabled={isDisabled}
              isError={!!error}
            />
          </div>

          {/* Submit Verification Button */}
          <button
            type="submit"
            disabled={!isComplete || isDisabled}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-[0.98] disabled:scale-100 disabled:opacity-50"
          >
            {verifying ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Verifying OTP...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>
        </form>

        {/* Resend OTP Section */}
        <div className="mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-5 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Didn't receive the verification code?
          </p>

          {!canResendNow && resendAvailableAt ? (
            <div className="inline-flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Resend code available in:</span>
              <CountdownTimer
                targetTimestamp={resendAvailableAt}
                label="Cooldown"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline dark:text-primary-light disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
              {resending ? 'Sending new code...' : 'Resend OTP'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default VerifyOTP;
