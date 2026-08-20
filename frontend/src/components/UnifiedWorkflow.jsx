import React from 'react';

export default function UnifiedWorkflow({ onNavigateStep }) {
  const steps = [
    { id: 'step-1', icon: 'fa-video', title: '1. CCTV & Visual Streams', desc: 'Real-time lab feeds & snapshots', target: 'evidence' },
    { id: 'step-2', icon: 'fa-brain', title: '2. Computer Vision (YOLO)', desc: 'Monitor & defect segmentation', target: 'evidence' },
    { id: 'step-3', icon: 'fa-network-wired', title: '3. Technical Discovery', desc: 'Active subnet agent telemetry', target: 'telemetry' },
    { id: 'step-4', icon: 'fa-file-invoice', title: '4. Document OCR', desc: 'Degree & safety certificate extraction', target: 'documents' },
    { id: 'step-5', icon: 'fa-layer-group', title: '5. Unified Evidence Lake', desc: 'Multi-modal evidentiary fusion', target: 'evidence' },
    { id: 'step-6', icon: 'fa-scale-balanced', title: '6. Expected vs Actual', desc: 'Cross-source discrepancy engine', target: 'reconciliation', highlight: true },
    { id: 'step-7', icon: 'fa-shield-halved', title: '7. Compliance Scoring', desc: 'Regulatory scorecards & risk flags', target: 'inspector_workspace' },
    { id: 'step-8', icon: 'fa-user-check', title: '8. Inspector Verification', desc: 'Human decision (Confirm/Reject)', target: 'findings', highlight: true },
    { id: 'step-9', icon: 'fa-file-pdf', title: '9. Official Inspection Report', desc: 'Signed compliance document', target: 'reports' },
    { id: 'step-10', icon: 'fa-wrench', title: '10. Corrective Action & Re-audit', desc: 'Remediation tracking loop', target: 'corrective_actions' }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-outfit">
              AI-Assisted Institutional Inspection Pipeline
            </h2>
            <p className="text-xs text-slate-500">
              End-to-End Regulatory Verification Architecture from Raw Multi-Source Telemetry to Final Inspector Sanction
            </p>
          </div>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
            Automated &amp; Human-in-the-Loop
          </span>
        </div>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            onClick={() => onNavigateStep && onNavigateStep(step.target)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
              step.highlight
                ? 'bg-indigo-50/70 border-indigo-200 hover:border-indigo-400 hover:shadow-md'
                : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  step.highlight ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}>
                  <i className={`fa-solid ${step.icon}`}></i>
                </div>
                <span className="text-[10px] font-bold text-slate-400 font-mono">STEP {idx + 1}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 font-outfit leading-tight mb-1 group-hover:text-indigo-600">
                {step.title}
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                {step.desc}
              </p>
            </div>
            
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-indigo-600 font-semibold opacity-80 group-hover:opacity-100">
              <span>Inspect Stage</span>
              <i className="fa-solid fa-arrow-right text-[9px] transform group-hover:translate-x-0.5 transition-transform"></i>
            </div>
          </div>
        ))}
      </div>

      {/* Philosophy banner */}
      <div className="bg-slate-900 text-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm">
            <i className="fa-solid fa-scale-balanced"></i>
          </div>
          <div>
            <p className="font-semibold text-slate-100">Core Regulatory Principle: AI Assists, Humans Sanction</p>
            <p className="text-[11px] text-slate-400">All AI detections & discrepancies are tagged as 'Needs Verification' and require affirmative human inspector confirmation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
