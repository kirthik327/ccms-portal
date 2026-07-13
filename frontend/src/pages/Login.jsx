import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Mail, Lock, Eye, EyeOff, User, GraduationCap } from 'lucide-react';
import nitLogo from '../assets/nit-logo.jpg';
import loginBg from '../assets/login-bg.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loginRole, setLoginRole] = useState('student');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (loginRole === 'student') {
      const isRegisterNumber = email.startsWith('7210') && /^\d+$/.test(email);
      const isEmail = email.includes('@');
      if (!isRegisterNumber && !isEmail) {
        setError('Login with a register number starting with 7210 or your registered Email ID');
        return;
      }
    }

    setError('');
    setSubmitting(true);

    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
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
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden bg-white shadow-md border border-slate-100 dark:border-slate-800">
            <img src={nitLogo} alt="NIT Logo" className="h-full w-full object-contain p-1" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            CCMS Portal Login
          </h2>
          <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            Campus Complaint Management System
          </p>
        </div>

        {/* Form Error Banner */}
        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold leading-relaxed text-rose-600 dark:border-rose-900/35 dark:bg-rose-950/20 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Role Toggle Tabs */}
        <div className="mt-6 flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => {
              setLoginRole('student');
              setError('');
              setEmail('');
              setPassword('');
            }}
            className={`flex-1 rounded-xl py-2 text-center text-xs font-bold transition-all duration-200 ${
              loginRole === 'student'
                ? 'bg-white text-primary shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            Student Login
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginRole('admin');
              setError('');
              setEmail('');
              setPassword('');
            }}
            className={`flex-1 rounded-xl py-2 text-center text-xs font-bold transition-all duration-200 ${
              loginRole === 'admin'
                ? 'bg-white text-primary shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            Admin / Staff Login
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4.5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {loginRole === 'student' ? 'Register Number or Email' : 'Username'}
            </label>
            <div className="relative mt-1.5">
              {loginRole === 'student' ? (
                <GraduationCap className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
              ) : (
                <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
              )}
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={loginRole === 'student' ? '721021104001' : ''}
                autoComplete="off"
                className="w-full rounded-2xl border border-slate-200 py-3.5 pr-4 pl-11 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                disabled={submitting}
              />
            </div>
            {loginRole === 'student' && (
              <span className="text-[10px] text-slate-400 mt-1.5 block">
                Login with register number that starts with 7210
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Password
              </label>
            </div>
            <div className="relative mt-1.5">
              <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={loginRole === 'student' ? '••••••••' : ''}
                autoComplete="new-password"
                className="w-full rounded-2xl border border-slate-200 py-3.5 pr-12 pl-11 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
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
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>


        {/* Register Footer */}
        {loginRole === 'student' && (
          <>
            <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
              First time submitting a grievance?{' '}
              <Link
                to="/register"
                className="font-bold text-primary hover:underline dark:text-primary-light"
              >
                Create an Account
              </Link>
            </div>
            
            {/* Confidential Portal Info */}
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/40 dark:bg-slate-900/50 flex items-start gap-3 shadow-inner">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <h4 className="text-[11px] font-bold tracking-wide uppercase text-slate-700 dark:text-slate-250">Confidential Portal</h4>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                  All submissions are encrypted and strictly visible only to the particular student and authorized college admin staff.
                </p>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Login;
