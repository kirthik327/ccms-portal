import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, UserCircle, X, ShieldAlert, FileText, Lock } from 'lucide-react';
import nitLogo from '../assets/nit-logo.jpg';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const baseLinkClasses =
    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200';
  const activeLinkClasses =
    'bg-primary text-white shadow-md shadow-primary/20 dark:bg-primary-light';
  const inactiveLinkClasses =
    'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800';

  const studentLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/submit-complaint', label: 'Submit Complaint', icon: PlusCircle },
    { to: '/profile', label: 'My Profile', icon: UserCircle },
  ];

  const adminLinks = [
    { to: '/', label: 'Admin Desk', icon: LayoutDashboard },
    { to: '/profile', label: 'My Profile', icon: UserCircle },
  ];

  const links = user?.role === 'student' ? studentLinks : adminLinks;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/40 bg-white/20 backdrop-blur-md transition-transform duration-300 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0 dark:border-slate-800/40 dark:bg-slate-900/20 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6 md:hidden dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 bg-white shadow-sm flex items-center justify-center">
              <img src={nitLogo} alt="NIT Logo" className="h-full w-full object-contain" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white">CCMS Portal</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Links Section */}
        <nav className="flex-1 space-y-1.5 p-4">
          <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation Menu
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                }
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Brand Info */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 dark:border-primary-light/10 dark:bg-primary-light/5 flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-primary dark:text-primary-light shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">Confidential Portal</h4>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                All submissions are encrypted and visible strictly to the particular student and authorized college admin staff.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
