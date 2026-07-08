import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, User, Menu, ShieldAlert } from 'lucide-react';
import nitLogo from '../assets/nit-logo.jpg';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/35';
      case 'admin':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/35';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/35';
    }
  };

  const getRoleName = (role) => {
    if (role === 'superadmin') return 'Super Admin';
    if (role === 'admin') return 'Warden/Staff Admin';
    return 'Student';
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/40 bg-white/20 px-3 md:px-6 shadow-sm backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-900/20">
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-white shadow-md border border-slate-100 dark:border-slate-800">
            <img src={nitLogo} alt="NIT Logo" className="h-full w-full object-contain p-0.5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-primary dark:text-white">CCMS</h1>
            <p className="hidden text-[10px] font-medium text-slate-500 md:block dark:text-slate-400">
              Campus Complaint Management System
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User Info Dropdown Trigger */}
        {user && (
          <div className="flex items-center gap-2 md:gap-3 border-l border-slate-200 pl-2 md:pl-4 dark:border-slate-800">
            <Link 
              to="/profile" 
              className="flex items-center gap-2 md:gap-3 hover:opacity-85 transition-opacity"
              title="View Profile Settings"
            >
              <div className="hidden flex-col items-end md:flex">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getRoleBadge(user.role)}`}>
                  {getRoleName(user.role)}
                </span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary-light/10 dark:hover:text-primary-light transition-colors">
                <User className="h-5 w-5" />
              </div>
            </Link>

            <button
              onClick={logout}
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition-all hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40"
              title="Logout"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
