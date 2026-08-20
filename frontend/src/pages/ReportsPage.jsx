import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { ACTIVE_INSPECTION_DETAIL, MOCK_FINDINGS } from '../data/mockData';

export default function ReportsPage({ 
  inspection = ACTIVE_INSPECTION_DETAIL, 
  findings = MOCK_FINDINGS 
}) {
  const [downloading, setDownloading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(true);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      window.print();
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Official Regulatory Dossier
            </span>
            <span className="text-xs text-slate-400 font-mono">Formal Audit Report</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-outfit mt-1">
            Inspection Dossier &amp; Compliance Synthesis
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Cryptographically sealed inspection synthesis combining computer vision telemetry, OCR verification, and human inspector sanction.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition"
          >
            <i className={`fa-solid ${downloading ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
            <span>{downloading ? 'Preparing Document...' : 'Download Official PDF'}</span>
          </button>
        </div>
      </div>

      {/* Official Printable Report Card */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-8 max-w-4xl mx-auto space-y-8 print:p-0 print:border-none print:shadow-none">
        
        {/* Document Header Seal */}
        <div className="border-b-2 border-slate-800 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-2xl font-bold shadow-sm">
              <i className="fa-solid fa-building-shield"></i>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-700">Government Regulatory Accreditation Commission</p>
              <h1 className="text-xl font-extrabold text-slate-900 font-outfit">INSTITUTIONAL INSPECTION REPORT</h1>
              <p className="text-xs text-slate-500 font-mono">Reference ID: INSP-2026-GLB-01 • Series SIH1730</p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="inline-block bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold px-3 py-1 rounded-lg">
              Overall Score: 84% (COMPLIANT)
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">Sealed: 20 Aug 2026</p>
          </div>
        </div>

        {/* Audit Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Inspected Institution</span>
            <p className="font-bold text-slate-800 mt-0.5">{inspection.institution}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Lead Inspector</span>
            <p className="font-bold text-slate-800 mt-0.5">{inspection.inspector}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Inspection Window</span>
            <p className="font-bold text-slate-800 mt-0.5">{inspection.dateScheduled}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Inspection Status</span>
            <p className="font-bold text-emerald-700 mt-0.5">Stage 6 Verified</p>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-1 font-outfit">
            1. Executive Audit Summary
          </h3>
          <p>
            The formal institutional audit of <strong>{inspection.institution}</strong> was conducted utilizing multi-modal automated surveillance (YOLOv8s &amp; YOLO11s-Seg CCTV recognition), LAN subnet telemetry agents (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">client.py</code>), and LayoutLM OCR document verification, adjudicated by an empaneled regulatory inspector.
          </p>
          <p>
            The institution scored <strong>84.0%</strong> across infrastructure, laboratory environments, and faculty credentials. 5 total observations were flagged by the AI engine, of which 1 high-severity deficiency was confirmed regarding expired fire safety clearance.
          </p>
        </div>

        {/* Section 2: Laboratory & Technical Reconciliation */}
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-1 font-outfit">
            2. Laboratory Technical Infrastructure
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Laboratory Name</th>
                  <th className="p-2.5 text-center">Declared</th>
                  <th className="p-2.5 text-center">CCTV Count</th>
                  <th className="p-2.5 text-center">Discovered</th>
                  <th className="p-2.5">Reconciliation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-semibold">AI &amp; ML Supercomputing Lab</td>
                  <td className="p-2.5 text-center">30</td>
                  <td className="p-2.5 text-center">28</td>
                  <td className="p-2.5 text-center font-bold text-indigo-700">29</td>
                  <td className="p-2.5"><StatusBadge status="Needs Verification" size="xs" /></td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Computer Networks &amp; Security Lab</td>
                  <td className="p-2.5 text-center">35</td>
                  <td className="p-2.5 text-center">35</td>
                  <td className="p-2.5 text-center font-bold text-emerald-700">35</td>
                  <td className="p-2.5"><StatusBadge status="Compliant" size="xs" /></td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">IoT &amp; Embedded Systems Lab</td>
                  <td className="p-2.5 text-center">25</td>
                  <td className="p-2.5 text-center">23</td>
                  <td className="p-2.5 text-center font-bold text-amber-700">23</td>
                  <td className="p-2.5"><StatusBadge status="Deficiency" size="xs" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Adjudicated Findings */}
        <div className="space-y-2 text-xs text-slate-700">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-1 font-outfit">
            3. Summary of Findings &amp; Regulatory Sanctions
          </h3>
          <div className="space-y-2">
            {findings.map((f) => (
              <div key={f.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] font-bold text-slate-500">{f.id} • {f.category}</span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{f.description}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Decision: <strong>{f.decision || 'Under Adjudication'}</strong></p>
                </div>
                <StatusBadge status={f.severity} size="xs" />
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Sign-off & Cryptographic Seal */}
        <div className="pt-6 border-t-2 border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-xs">
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-slate-400">HASH: SHA256:e04eb7d68a991f24cc881029ba31c19ecf</p>
            <p className="text-slate-600">Issued by: <strong>National Academic Inspection Authority (SIH1730)</strong></p>
          </div>

          <div className="text-right">
            <div className="w-32 h-10 border-b border-slate-800 mb-1 flex items-end justify-end">
              <span className="font-serif italic text-base text-indigo-900">K. S. Ramanujan</span>
            </div>
            <p className="font-bold text-slate-800 text-xs">Dr. K. S. Ramanujan</p>
            <p className="text-[10px] text-slate-500">Lead Quality &amp; Compliance Inspector</p>
          </div>
        </div>

      </div>
    </div>
  );
}
