import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldAlert, Key, ArrowRight } from 'lucide-react';
import PasswordStrength, { validatePasswordRequirements } from '../components/PasswordStrength';
import { getOTPSession, resetPasswordApi } from '../utils/otpMock';
import nitLogo from '../assets/nit-logo.jpg';
import loginBg from '../assets/login-bg.jpg';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const session = getOTPSession();
    if (!session || !session.isVerified) {
      // Direct access guard: redirect if OTP has not been verified
      navigate('/forgot-password');
    }
  }, [navigate]);

  const reqs = validatePasswordRequirements(newPassword);
  const allReqsMet = Object.values(reqs).every(Boolean);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!allReqsMet) {
      setError('Please meet all password requirements before continuing.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await resetPasswordApi(newPassword);
      setSubmitting(false);

      if (res.success) {
        setIsSuccess(true);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setSubmitting(false);
      setError('Failed to update password. Please try again.');
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
        
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden bg-white shadow-md border border-slate-100 dark:border-slate-800">
            <img src={nitLogo} alt="NIT Logo" className="h-full w-full object-contain p-1" />
          </div>

          {!isSuccess ? (
            <>
              <div className="flex items-center gap-2 text-primary dark:text-primary-light bg-primary/10 dark:bg-primary-light/10 px-3 py-1 rounded-full text-xs font-bold mt-1">
                <Key className="h-3.5 w-3.5" />
                Step 3 of 3: New Password
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white text-center">
                Create New Password
              </h2>
              <p className="text-center text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                Please create a strong new password for your college account.
              </p>
            </>
          ) : null}
        </div>

        {/* SUCCESS VIEW (Step 6) */}
        {isSuccess ? (
          <div className="mt-4 flex flex-col items-center text-center space-y-4 py-4 fade-in-page">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-inner">
              <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">
              Password Reset Successfully
            </h3>

            <p className="text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              Your password has been updated successfully. You can now log in using your new password.
            </p>

            <Link
              to="/login"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-[0.98]"
            >
              <span>Back to Login</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* FORM VIEW (Step 5) */
          <>
            {error && (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold leading-relaxed text-rose-600 dark:border-rose-900/35 dark:bg-rose-950/20 dark:text-rose-400 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4.5">
              {/* New Password */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  New Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 py-3.5 pr-12 pl-11 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Checklist Component */}
              <PasswordStrength password={newPassword} />

              {/* Confirm New Password */}
              <div className="pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Confirm New Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`w-full rounded-2xl border py-3.5 pr-12 pl-11 text-sm bg-transparent outline-none transition-all ${
                      confirmPassword.length > 0
                        ? passwordsMatch
                          ? 'border-emerald-500 focus:ring-emerald-500/20'
                          : 'border-rose-400 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-primary focus:ring-primary/10 dark:border-slate-800'
                    } dark:text-white`}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>

                {/* Match indicator note */}
                {confirmPassword.length > 0 && (
                  <p
                    className={`mt-1.5 text-[11px] font-semibold ${
                      passwordsMatch
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-500 dark:text-rose-400'
                    }`}
                  >
                    {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !allReqsMet || !passwordsMatch}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-[0.98] disabled:scale-100 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
