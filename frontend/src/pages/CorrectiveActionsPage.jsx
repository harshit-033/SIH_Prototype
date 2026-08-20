import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { MOCK_CORRECTIVE_ACTIONS } from '../data/mockData';

export default function CorrectiveActionsPage({ actions = MOCK_CORRECTIVE_ACTIONS }) {
  const [actionList, setActionList] = useState(actions);
  const [selectedAction, setSelectedAction] = useState(null);
  const [evidenceFileName, setEvidenceFileName] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  const handleSubmitProof = (e) => {
    e.preventDefault();
    if (!selectedAction || !evidenceFileName) return;

    const updated = actionList.map(a => a.id === selectedAction.id ? {
      ...a,
      submittedEvidence: evidenceFileName,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Submitted',
      inspectorNotes: submissionNotes ? `College Notes: ${submissionNotes}` : a.inspectorNotes
    } : a);

    setActionList(updated);
    setSelectedAction(null);
    setEvidenceFileName('');
    setSubmissionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Remediation Loop
            </span>
            <span className="text-xs text-slate-400 font-mono">CAPA Regulatory Tracking</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-outfit mt-1">
            Corrective Action &amp; Remediation Workflow
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Submit evidentiary documentation to rectify inspector-confirmed deficiencies and track regulatory re-verification.
          </p>
        </div>
      </div>

      {/* Workflow Diagram Banner */}
      <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">Deficiency Remediation Lifecycle</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <p className="font-bold text-rose-400">1. Finding Flagged</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Inspector confirms deficiency</p>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <p className="font-bold text-amber-400">2. Action Required</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Notice issued with deadline</p>
          </div>
          <div className="bg-indigo-900/60 p-3 rounded-xl border border-indigo-700/80 ring-1 ring-indigo-500">
            <p className="font-bold text-indigo-300">3. College Submits</p>
            <p className="text-[10px] text-slate-300 mt-0.5">Evidence / NOC uploaded</p>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <p className="font-bold text-blue-400">4. Re-verification</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Inspector reviews proof</p>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <p className="font-bold text-emerald-400">5. Case Resolved</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Compliance sealed in report</p>
          </div>
        </div>
      </div>

      {/* Corrective Actions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden p-5 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-slate-800 text-sm font-outfit">Active Institutional Corrective Directives</h3>
          <span className="text-xs text-slate-500 font-mono">{actionList.length} Active Directives</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                <th className="p-3.5">CAPA ID &amp; Ref</th>
                <th className="p-3.5">Action Title &amp; Description</th>
                <th className="p-3.5">Deadline</th>
                <th className="p-3.5">Submitted Proof</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Inspector Review</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {actionList.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-800 font-mono">{act.id}</p>
                    <span className="text-[10px] text-indigo-600 font-semibold">{act.findingId}</span>
                  </td>

                  <td className="p-3.5 max-w-xs">
                    <p className="font-bold text-slate-800 text-xs">{act.title}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{act.description}</p>
                  </td>

                  <td className="p-3.5 font-mono text-slate-700 font-semibold">
                    {act.deadline}
                  </td>

                  <td className="p-3.5">
                    {act.submittedEvidence ? (
                      <div>
                        <p className="font-medium text-indigo-700 flex items-center gap-1 truncate max-w-[160px]">
                          <i className="fa-solid fa-file-arrow-up text-[10px]"></i>
                          <span>{act.submittedEvidence}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">{act.submittedAt}</p>
                      </div>
                    ) : (
                      <span className="text-rose-500 italic font-semibold">Evidence Pending</span>
                    )}
                  </td>

                  <td className="p-3.5">
                    <StatusBadge status={act.status} size="xs" />
                  </td>

                  <td className="p-3.5 text-slate-600 text-[11px] max-w-[180px]">
                    {act.inspectorNotes || '--'}
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedAction(act)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition shadow-sm whitespace-nowrap"
                    >
                      {act.submittedEvidence ? 'Re-upload Proof' : 'Submit Proof'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Submission Modal */}
      {selectedAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{selectedAction.title}</h3>
                <p className="text-xs text-slate-500">Directive: {selectedAction.id} • Ref: {selectedAction.findingId}</p>
              </div>
              <button onClick={() => setSelectedAction(null)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-700">Directive Requirement:</p>
                <p className="text-slate-600 text-[11px] mt-0.5">{selectedAction.description}</p>
                <p className="text-rose-600 font-mono text-[10px] mt-2"><strong>Deadline:</strong> {selectedAction.deadline}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document File Name / Reference *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fire_NOC_Renewal_Challan_UP_Gov.pdf"
                  value={evidenceFileName}
                  onChange={(e) => setEvidenceFileName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Institutional Remarks &amp; Submission Notes</label>
                <textarea
                  rows={3}
                  placeholder="Provide context on corrective actions taken..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAction(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Dispatch Evidence to Inspector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
