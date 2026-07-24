import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ targetTimestamp, onExpire, label = 'Expires in' }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = Math.max(0, Math.ceil((targetTimestamp - now) / 1000));
      return difference;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (timeLeft <= 0) {
    return (
      <span className="text-xs font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" />
        Expired
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      <Clock className="h-3.5 w-3.5 text-primary dark:text-primary-light" />
      <span>
        {label}: <span className="font-mono text-primary dark:text-primary-light">{formattedTime}</span>
      </span>
    </div>
  );
};

export default CountdownTimer;
