import React from 'react';
import { Check, X } from 'lucide-react';

export const validatePasswordRequirements = (password) => {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

const PasswordStrength = ({ password }) => {
  const reqs = validatePasswordRequirements(password);
  const passedCount = Object.values(reqs).filter(Boolean).length;

  let strengthLabel = 'Weak';
  let strengthColor = 'bg-rose-500';
  let widthClass = 'w-1/4';

  if (passedCount === 5) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
    widthClass = 'w-full';
  } else if (passedCount >= 3) {
    strengthLabel = 'Good';
    strengthColor = 'bg-amber-500';
    widthClass = 'w-3/4';
  } else if (passedCount >= 2) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-orange-500';
    widthClass = 'w-1/2';
  } else if (password.length > 0) {
    strengthLabel = 'Weak';
    strengthColor = 'bg-rose-500';
    widthClass = 'w-1/4';
  } else {
    strengthLabel = '';
    widthClass = 'w-0';
  }

  const items = [
    { key: 'minLength', label: 'Minimum 8 characters' },
    { key: 'hasUpper', label: 'At least one uppercase letter (A-Z)' },
    { key: 'hasLower', label: 'At least one lowercase letter (a-z)' },
    { key: 'hasNumber', label: 'At least one number (0-9)' },
    { key: 'hasSpecial', label: 'At least one special character (!@#$%...)' },
  ];

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bar */}
      {password.length > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span>Password Strength</span>
            <span className={passedCount === 5 ? 'text-emerald-500' : 'text-slate-500'}>
              {strengthLabel}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full transition-all duration-300 ${strengthColor} ${widthClass}`} />
          </div>
        </div>
      )}

      {/* Checklist */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800/60 dark:bg-slate-900/40">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2">
          Password Requirements
        </p>
        <ul className="space-y-1.5 text-xs font-medium">
          {items.map((item) => {
            const isMet = reqs[item.key];
            return (
              <li
                key={item.key}
                className={`flex items-center gap-2 transition-colors ${
                  isMet
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-400'
                }`}
              >
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                    isMet
                      ? 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {isMet ? <Check className="h-3 w-3 stroke-[3]" /> : <X className="h-3 w-3" />}
                </div>
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PasswordStrength;
