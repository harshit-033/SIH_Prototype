import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { ConfirmFindingModal, RejectFindingModal, RequestEvidenceModal } from '../components/Modals';

export default function FindingsPage({ findings = [], onUpdateFindings, onNavigate }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const [activeConfirmFinding, setActiveConfirmFinding] = useState(null);
  const [activeRejectFinding, setActiveRejectFinding] = useState(null);
  const [activeRequestFinding, setActiveRequestFinding] = useState(null);

  const handleConfirm = (id, payload) => {
    const updated = findings.map(f => f.id === id ? {
      ...f,
      status: 'Confirmed',
      severity: payload.severity,
      decision: 'Inspector Confirmed Deficiency',
      comments: payload.remarks
    } : f);
    onUpdateFindings(updated);
  };

  const handleReject = (id, reason) => {
    const updated = findings.map(f => f.id === id ? {
      ...f,
      status: 'Rejected',
      decision: 'Inspector Dismissed',
      comments: reason
    } : f);
    onUpdateFindings(updated);
  };

  const handleRequestEvidence = (id, payload) => {
    const updated = findings.map(f => f.id === id ? {
      ...f,
      status: 'Needs Verification',
      decision: 'Evidence Requested from Institution',
      comments: `Required by ${payload.deadlineDays} days: ${payload.requirements}`
    } : f);
    onUpdateFindings(updated);
  };

  const filtered = findings.filter(f => {
    const matchStatus = filterStatus === 'ALL' || f.status === filterStatus;
    const matchSeverity = filterSeverity === 'ALL' || f.severity === filterSeverity;
    return matchStatus && matchSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Adjudication Desk
            </span>
            <span className="text-xs text-slate-400 font-mono">Inspector Decision Engine</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-outfit mt-1">
            Findings &amp; Verification Adjudication
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Affirmatively verify, modify, or reject AI-flagged discrepancies to sanction official regulatory corrective notices.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="AI Flagged">AI Flagged</option>
            <option value="Needs Verification">Needs Verification</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden p-5 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-slate-800 text-sm font-outfit">Regulatory Deficiencies &amp; Audit Log</h3>
          <span className="text-xs text-slate-500 font-mono">Showing {filtered.length} Findings</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                <th className="p-3.5">ID &amp; Category</th>
                <th className="p-3.5">Description &amp; Suggested Remedy</th>
                <th className="p-3.5">Evidence Ref</th>
                <th className="p-3.5 text-center">Severity</th>
                <th className="p-3.5 text-center">AI Confidence</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5">Inspector Decision</th>
                <th className="p-3.5 text-right">Adjudication Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-800 font-mono">{f.id}</p>
                    <p className="text-[10px] text-slate-500">{f.category}</p>
                  </td>

                  <td className="p-3.5 max-w-xs">
                    <p className="font-semibold text-slate-800 leading-snug">{f.description}</p>
                    <p className="text-[10px] text-indigo-600 mt-1 italic">Remedy: {f.suggestedRemedy}</p>
                    {f.comments && (
                      <p className="text-[10px] text-slate-500 bg-slate-100 p-1.5 rounded mt-1">
                        <strong>Decision Note:</strong> {f.comments}
                      </p>
                    )}
                  </td>

                  <td className="p-3.5">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-mono border border-slate-200">
                      {f.evidenceRef}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.severity === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      f.severity === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {f.severity}
                    </span>
                  </td>

                  <td className="p-3.5 text-center font-bold text-indigo-700 font-mono">
                    {(f.aiConfidence * 100).toFixed(0)}%
                  </td>

                  <td className="p-3.5">
                    <StatusBadge status={f.status} size="xs" />
                  </td>

                  <td className="p-3.5">
                    <span className="text-[11px] font-semibold text-slate-700">
                      {f.decision || 'Awaiting Inspector'}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <button
                        onClick={() => setActiveConfirmFinding(f)}
                        title="Confirm as official deficiency"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setActiveRejectFinding(f)}
                        title="Dismiss AI detection"
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-semibold transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => setActiveRequestFinding(f)}
                        title="Request proof from college"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold transition"
                      >
                        More Info
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmFindingModal
        finding={activeConfirmFinding}
        onClose={() => setActiveConfirmFinding(null)}
        onConfirm={handleConfirm}
      />
      <RejectFindingModal
        finding={activeRejectFinding}
        onClose={() => setActiveRejectFinding(null)}
        onReject={handleReject}
      />
      <RequestEvidenceModal
        finding={activeRequestFinding}
        onClose={() => setActiveRequestFinding(null)}
        onRequest={handleRequestEvidence}
      />
    </div>
  );
}
