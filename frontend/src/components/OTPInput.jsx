import React, { useRef, useEffect } from 'react';

const OTPInput = ({ otp, setOtp, disabled, isError }) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];

    // Handle single digit input
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move back if current box is empty
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (disabled) return;

    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split('');
    const newOtp = [...otp];

    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });

    setOtp(newOtp);

    // Focus on the input after the last pasted digit or the last box
    const focusIndex = Math.min(digits.length, 5);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={`h-12 w-11 sm:h-14 sm:w-12 rounded-2xl border text-center text-xl font-bold transition-all outline-none bg-slate-50 dark:bg-slate-900/60 ${
            isError
              ? 'border-rose-400 text-rose-600 dark:border-rose-800 dark:text-rose-400 focus:ring-2 focus:ring-rose-500/20 animate-shake'
              : digit
              ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light bg-primary/5 dark:bg-primary-light/5 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:border-primary-light'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : ''}`}
        />
      ))}
    </div>
  );
};

export default OTPInput;
