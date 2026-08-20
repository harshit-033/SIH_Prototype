import React from 'react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function CollegeDashboard({ institution, onNavigate }) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Institution Self-Service Portal
            </span>
            <span className="text-xs text-slate-400 font-mono">AISHE: {institution?.aishe || 'U-0512'}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-outfit mt-1">
            {institution?.name || 'GL Bajaj Institute of Technology'} — Institutional Dashboard
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Manage faculty records, register laboratory hardware baselines, and upload evidence for regulatory audit compliance.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('corrective_actions')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition"
          >
            <i className="fa-solid fa-wrench text-[11px]"></i>
            <span>Corrective Actions (3)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Compliance Score"
          value={`${institution?.complianceScore || 84}%`}
          subtext="Calculated from verified evidence"
          icon="fa-shield-halved"
          color="emerald"
          badge={{ label: "Status", value: "Audit In Progress" }}
        />
        <StatCard
          title="Registered Faculty"
          value={institution?.totalFaculty || 168}
          subtext="Full-time teaching faculty"
          icon="fa-user-graduate"
          color="indigo"
          badge={{ label: "Ph.D. Ratio", value: "36.9% Verified" }}
        />
        <StatCard
          title="Laboratories"
          value={institution?.totalLabs || 14}
          subtext="420 declared systems"
          icon="fa-flask"
          color="blue"
          badge={{ label: "Scanner Swept", value: "408 LAN Discovered" }}
        />
        <StatCard
          title="Open Deficiencies"
          value="3 Notices"
          subtext="Requires evidence submission"
          icon="fa-triangle-exclamation"
          color="rose"
          badge={{ label: "Action Deadline", value: "7 - 15 Days", color: "text-rose-600" }}
        />
      </div>

      {/* Institutional Action Plan & Subsections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Action Required & Readiness */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-slate-800 text-sm font-outfit">Active Regulatory Directives &amp; Tasks</h3>
            <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
              3 Pending Action
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded-xl flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">Upload Renewed Building Fire Safety NOC</span>
                  <StatusBadge status="Deficiency" size="xs" />
                </div>
                <p className="text-slate-600 text-[11px]">Previous NOC expired on 15 May 2026. Submit renewal application receipt or issued certificate.</p>
                <p className="text-[10px] text-slate-400 font-mono">Deadline: 05 Sep 2026 (15 Days Remaining)</p>
              </div>
              <button
                onClick={() => onNavigate('corrective_actions')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition shadow-sm whitespace-nowrap"
              >
                Upload Proof
              </button>
            </div>

            <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-xl flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">AI Lab Workstations Python Runtime Upgrade</span>
                  <StatusBadge status="Needs Verification" size="xs" />
                </div>
                <p className="text-slate-600 text-[11px]">Workstations AIML-WS-11 through 16 require Python 3.11+ virtual environment configured.</p>
                <p className="text-[10px] text-slate-400 font-mono">Deadline: 25 Aug 2026 (5 Days Remaining)</p>
              </div>
              <button
                onClick={() => onNavigate('corrective_actions')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs transition shadow-sm whitespace-nowrap"
              >
                Submit Log
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Links */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm font-outfit border-b pb-2">Institutional Management Hub</h3>
          <div className="space-y-2 text-xs">
            <button
              onClick={() => onNavigate('college_faculty')}
              className="w-full p-3 rounded-xl border border-slate-200 hover:bg-indigo-50/60 hover:border-indigo-200 text-left transition flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <i className="fa-solid fa-user-graduate"></i>
                </div>
                <div>
                  <p className="font-bold text-slate-800 group-hover:text-indigo-700">Faculty Management</p>
                  <p className="text-[10px] text-slate-400">Register degrees &amp; service records</p>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right text-slate-400 text-xs group-hover:translate-x-0.5 transition-transform"></i>
            </button>

            <button
              onClick={() => onNavigate('college_labs')}
              className="w-full p-3 rounded-xl border border-slate-200 hover:bg-indigo-50/60 hover:border-indigo-200 text-left transition flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <i className="fa-solid fa-laptop-code"></i>
                </div>
                <div>
                  <p className="font-bold text-slate-800 group-hover:text-indigo-700">Lab &amp; System Registration</p>
                  <p className="text-[10px] text-slate-400">Register rooms, PCs &amp; software</p>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right text-slate-400 text-xs group-hover:translate-x-0.5 transition-transform"></i>
            </button>

            <button
              onClick={() => onNavigate('assets')}
              className="w-full p-3 rounded-xl border border-slate-200 hover:bg-indigo-50/60 hover:border-indigo-200 text-left transition flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <i className="fa-solid fa-boxes-stacked"></i>
                </div>
                <div>
                  <p className="font-bold text-slate-800 group-hover:text-indigo-700">Asset Discovery Inventory</p>
                  <p className="text-[10px] text-slate-400">View discovered network nodes</p>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right text-slate-400 text-xs group-hover:translate-x-0.5 transition-transform"></i>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
