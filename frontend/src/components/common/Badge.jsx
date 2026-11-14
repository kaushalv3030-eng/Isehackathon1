import React from 'react';

const Badge = ({ status, className = '' }) => {
  const getStyle = (st) => {
    switch (st?.toLowerCase()) {
      case 'pending':
      case 'claim pending':
        return 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/50';
      case 'in progress':
        return 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/50';
      case 'resolved':
      case 'approved':
      case 'present':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50';
      case 'handed over':
      case 'claimed':
        return 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/50';
      case 'rejected':
      case 'absent':
        return 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/50';
      case 'open':
        return 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/50';
      case 'closed':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-dark-800 dark:text-slate-400 dark:border-dark-700';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-dark-800 dark:text-slate-400 dark:border-dark-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-tight ${getStyle(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status || 'Unknown'}
    </span>
  );
};

export default Badge;
