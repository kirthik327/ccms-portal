import React, { useState } from 'react';
import { useNavigate as useNav, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, User, Mail, Lock, BookOpen, GraduationCap, Calendar } from 'lucide-react';
import nitLogo from '../assets/nit-logo.jpg';
import loginBg from '../assets/login-bg.jpg';

const Register = () => {
  const [name, setName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('1st Year');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNav();

  const departments = [
    'Information Technology',
    'Computer Science and Engineering',
    'Aeronautical Engineering',
    'Food Technology',
    'Civil Engineering',
    'Agricultural Engineering',
    'Cyber Security',
    'Artificial Intelligence and Machine Learning',
    'Computer and Communication Engineering',
    'Science and Humanities(1st Year)',
    'Master of Business Administration(MBA)'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !registerNumber || !department || !year || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (!registerNumber.startsWith('7210') || !/^\d+$/.test(registerNumber)) {
      setError('Register number must start with 7210 and contain only numbers.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setSubmitting(true);

    const result = await register(
      name,
      email, // actual email ID
      password,
      department,
      year,
      registerNumber, // rollNumber
      '', // employeeId
      'student' // role
    );
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
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-md p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/95 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden bg-white shadow-md border border-slate-100 dark:border-slate-800">
            <img src={nitLogo} alt="NIT Logo" className="h-full w-full object-contain p-1" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            Create Student Account
          </h2>
          <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            Submit and track your grievances privately
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold leading-relaxed text-rose-600 dark:border-rose-900/35 dark:bg-rose-950/20 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Full Name
            </label>
            <div className="relative mt-1.5">
              <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-2xl border border-slate-200 py-3.5 pr-4 pl-11 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Register Number (Starts with 7210)
            </label>
            <div className="relative mt-1.5">
              <GraduationCap className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                placeholder="721021104001"
                className="w-full rounded-2xl border border-slate-200 py-3.5 pr-4 pl-11 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email Address
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Department
              </label>
              <div className="relative mt-1.5">
                <BookOpen className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 py-3.5 pr-4 pl-11 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                  disabled={submitting}
                >
                  <option value="" disabled className="dark:bg-slate-900">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept} className="dark:bg-slate-900">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Year of Study
              </label>
              <div className="relative mt-1.5">
                <Calendar className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 py-3.5 pr-4 pl-11 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                  disabled={submitting}
                >
                  <option value="1st Year" className="dark:bg-slate-900">1st Year</option>
                  <option value="2nd Year" className="dark:bg-slate-900">2nd Year</option>
                  <option value="3rd Year" className="dark:bg-slate-900">3rd Year</option>
                  <option value="4th Year" className="dark:bg-slate-900">4th Year</option>
                  <option value="N/A" className="dark:bg-slate-900">N/A</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 py-3.5 pr-4 pl-11 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Confirm Password
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
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-[0.98] disabled:scale-100 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Creating Account...
              </>
            ) : (
              'Create Student Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <RouterLink
            to="/login"
            className="font-bold text-primary hover:underline dark:text-primary-light"
          >
            Sign In Instead
          </RouterLink>
        </div>

      </div>
    </div>
  );
};

export default Register;
