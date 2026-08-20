import React from 'react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { ACTIVE_INSPECTION_DETAIL } from '../data/mockData';

export default function InspectorDashboard({ 
  inspection = ACTIVE_INSPECTION_DETAIL, 
  onNavigate, 
  findings = [] 
}) {
  const pendingVerificationCount = findings.filter(f => f.status === 'Needs Verification' || f.status === 'AI Flagged').length;
  const confirmedCount = findings.filter(f => f.status === 'Confirmed').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              Active Inspector Session
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {inspection.id}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 font-outfit mt-1">
            Inspection Workspace: {inspection.institution}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            {inspection.title} • Lead Inspector: <strong>{inspection.inspector}</strong> • Dates: {inspection.dateScheduled}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate('evidence')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition"
          >
            <i className="fa-solid fa-magnifying-glass"></i>
            <span>Review Evidence</span>
          </button>
          <button
            onClick={() => onNavigate('reconciliation')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition"
          >
            <i className="fa-solid fa-scale-balanced text-indigo-400"></i>
            <span>Expected vs Actual</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Inspections"
          value="4"
          subtext="1 in progress, 3 completed"
          icon="fa-clipboard-user"
          color="indigo"
          badge={{ label: "Target Institution", value: "GL Bajaj" }}
        />
        <StatCard
          title="Audit Completion"
          value={`${inspection.overallProgress}%`}
          subtext="68% verified by inspector"
          icon="fa-bars-progress"
          color="blue"
          badge={{ label: "Stage", value: "Inspector Verification" }}
        />
        <StatCard
          title="Pending Decisions"
          value={pendingVerificationCount}
          subtext="Findings awaiting human confirmation"
          icon="fa-clock"
          color="amber"
          badge={{ label: "Human-in-the-Loop", value: "Required", color: "text-amber-600" }}
        />
        <StatCard
          title="Confirmed Deficiencies"
          value={confirmedCount}
          subtext="Sanctioned for corrective action"
          icon="fa-triangle-exclamation"
          color="rose"
          badge={{ label: "Action Issued", value: `${confirmedCount} Notices` }}
        />
      </div>

      {/* 7-Step Regulatory Inspection Workflow Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <div>
            <h3 className="font-bold text-slate-800 text-sm font-outfit">7-Stage Regulatory Workflow Progress</h3>
            <p className="text-xs text-slate-500">Standard institutional audit lifecycle from baseline declaration to final sanction</p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 font-mono">
            Stage 6 of 7 Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
          {inspection.workflowSteps.map((step) => {
            const isCompleted = step.status === 'completed';
            const isActive = step.status === 'active';
            return (
              <div
                key={step.step}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  isActive
                    ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-slate-50/60 border-slate-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCompleted ? 'bg-emerald-600 text-white' : isActive ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}>
                      {isCompleted ? <i className="fa-solid fa-check text-[9px]"></i> : step.step}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isActive ? 'text-indigo-700' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 font-outfit">{step.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Sections Progress & Priority Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left (2 cols): Inspection Category Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-slate-800 text-sm font-outfit">Audit Scope &amp; Sections Breakdown</h3>
            <span className="text-xs text-slate-400">6 Domains Inspected</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {inspection.sections.map((sec, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">
                      <i className={`fa-solid ${sec.icon}`}></i>
                    </div>
                    <span className="font-bold text-slate-800 text-xs">{sec.name}</span>
                  </div>
                  <StatusBadge status={sec.status} size="xs" />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Verification Completeness</span>
                    <span className="font-mono">{sec.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${sec.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                      style={{ width: `${sec.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (1 col): High Priority Findings */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="font-bold text-slate-800 text-sm font-outfit">Flagged Findings Requiring Action</h3>
              <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-100">
                {findings.length} Flagged
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[290px] pr-1">
              {findings.map((f) => (
                <div key={f.id} className="p-3 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-white transition-colors space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-500">{f.id}</span>
                    <StatusBadge status={f.severity} size="xs" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">{f.description}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                    <span>AI Confidence: <strong className="text-indigo-600">{(f.aiConfidence * 100).toFixed(0)}%</strong></span>
                    <StatusBadge status={f.status} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('findings')}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2 mt-2"
          >
            <span>Open Decision Desk</span>
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </button>
        </div>

      </div>
    </div>
  );
}
