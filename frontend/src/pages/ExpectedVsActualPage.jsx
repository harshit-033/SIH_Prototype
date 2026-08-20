import React from 'react';
import StatusBadge from '../components/StatusBadge';
import { MOCK_RECONCILIATION_CARDS } from '../data/mockData';

export default function ExpectedVsActualPage({ cards = MOCK_RECONCILIATION_CARDS, onNavigate }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Core Reconciler
            </span>
            <span className="text-xs text-slate-400 font-mono">Multi-Stream Cross-Verification</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-outfit mt-1">
            Expected vs. Actual Discrepancy Analysis
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Automated comparison between declared institutional baselines and real-time sensory/document discoveries.
          </p>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('findings')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition"
        >
          <i className="fa-solid fa-signature"></i>
          <span>Proceed to Verification</span>
        </button>
      </div>

      {/* Philosophy banner */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <i className="fa-solid fa-circle-info text-amber-600 text-base mt-0.5"></i>
        <div>
          <p className="font-bold">Human-in-the-Loop Discrepancy Policy</p>
          <p className="text-amber-800/90 text-[11px] mt-0.5">
            Identified variances are flagged as <strong>"Requires Inspector Verification"</strong> rather than an automated regulatory failure. Real-world physical obstructions, offline testing cycles, or document renewal delays are resolved during inspector adjudication.
          </p>
        </div>
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
            
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2 border-b pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">{card.id} • {card.category}</span>
                  <h3 className="text-sm font-bold text-slate-800 font-outfit leading-snug mt-0.5">{card.title}</h3>
                </div>
                <StatusBadge status={card.status} size="xs" />
              </div>

              {/* Side-by-Side Comparison Box */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Institutional Declared</p>
                  <p className="font-bold text-slate-800 text-sm font-outfit">{card.expected}</p>
                </div>
                <div className="space-y-1 pl-3 border-l border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">System Discovered Actual</p>
                  <p className="font-bold text-indigo-700 text-sm font-outfit">{card.actual}</p>
                </div>
              </div>

              {/* AI Reasoning & Discrepancy Note */}
              <div className="bg-indigo-50/50 border border-indigo-100/80 p-3 rounded-xl text-xs space-y-1">
                <p className="font-bold text-indigo-900 text-[11px] flex items-center gap-1.5">
                  <i className="fa-solid fa-microchip text-indigo-600"></i>
                  <span>AI Cross-Correlation Reasoning:</span>
                </p>
                <p className="text-slate-700 text-[11px] leading-relaxed">{card.aiReasoning}</p>
              </div>

              {/* Evidentiary Links */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Linked Evidence Sources:</p>
                <div className="flex flex-wrap gap-1.5">
                  {card.evidenceSources.map((ev, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-slate-200">
                      <i className="fa-solid fa-paperclip mr-1 text-[9px] text-slate-400"></i>{ev}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-[11px] text-slate-500">
                Severity: <strong className={card.severity === 'High' ? 'text-rose-600' : card.severity === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}>{card.severity}</strong>
              </span>

              <button
                onClick={() => onNavigate && onNavigate('findings')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs transition flex items-center gap-1.5"
              >
                <span>Adjudicate Finding</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
