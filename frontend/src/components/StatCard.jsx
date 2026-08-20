import React from 'react';

export default function StatCard({ title, value, subtext, icon, color = 'indigo', badge }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1 font-outfit">{value}</h3>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg border ${colorMap[color] || colorMap.indigo}`}>
          <i className={`fa-solid ${icon || 'fa-chart-simple'}`}></i>
        </div>
      </div>
      {badge && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">{badge.label}</span>
          <span className={`font-semibold ${badge.color || 'text-indigo-600'}`}>{badge.value}</span>
        </div>
      )}
    </div>
  );
}
