import React from 'react';

export default function StatusBadge({ status, type, size = 'sm' }) {
  let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
  let icon = null;

  const normalized = (status || type || '').toLowerCase();

  if (normalized.includes('verified') || normalized.includes('compliant') || normalized.includes('resolved') || normalized.includes('active') || normalized.includes('online')) {
    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
    icon = "fa-check-circle";
  } else if (normalized.includes('needs verification') || normalized.includes('needs review') || normalized.includes('pending') || normalized.includes('under review') || normalized.includes('in progress') || normalized.includes('maintenance')) {
    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
    icon = "fa-clock";
  } else if (normalized.includes('flagged') || normalized.includes('ai detected') || normalized.includes('ai generated')) {
    badgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-200";
    icon = "fa-brain";
  } else if (normalized.includes('deficiency') || normalized.includes('action required') || normalized.includes('high') || normalized.includes('expired') || normalized.includes('offline') || normalized.includes('rejected')) {
    badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
    icon = "fa-circle-exclamation";
  } else if (normalized.includes('confirmed')) {
    badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
    icon = "fa-signature";
  }

  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-sm ${sizeClass} ${badgeStyle}`}>
      {icon && <i className={`fa-solid ${icon} text-[10px]`}></i>}
      <span>{status || type}</span>
    </span>
  );
}
