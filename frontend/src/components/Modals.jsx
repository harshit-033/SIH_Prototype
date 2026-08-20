import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

export function ConfirmFindingModal({ finding, onClose, onConfirm }) {
  const [remarks, setRemarks] = useState('');
  const [severity, setSeverity] = useState(finding?.severity || 'Medium');

  if (!finding) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <i className="fa-solid fa-signature"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm font-outfit">Confirm Regulatory Finding</h3>
              <p className="text-xs text-slate-500">{finding.id} • {finding.category}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-200/60 flex items-center justify-center">
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <p className="font-semibold text-slate-700 mb-1">Finding Description:</p>
            <p className="text-slate-600 leading-relaxed">{finding.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-slate-500">AI Confidence:</span>
              <span className="font-bold text-indigo-600">{(finding.aiConfidence * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Inspector Confirmed Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="High">High Severity (Mandatory 15-Day Correction Notice)</option>
              <option value="Medium">Medium Severity (Deficiency to be Remedied)</option>
              <option value="Low">Low Severity (Informational Observation)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Inspector Verification Remarks</label>
            <textarea
              rows={3}
              required
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Physically verified during spot audit. Count discrepancy confirmed. Issued compliance notice to institution."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 text-xs font-semibold">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100">
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(finding.id, { severity, remarks: remarks || 'Confirmed by Inspector during live audit.' });
              onClose();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
          >
            Confirm Finding
          </button>
        </div>
      </div>
    </div>
  );
}

export function RejectFindingModal({ finding, onClose, onReject }) {
  const [reason, setReason] = useState('');

  if (!finding) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
              <i className="fa-solid fa-ban"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm font-outfit">Dismiss / Reject AI Flag</h3>
              <p className="text-xs text-slate-500">{finding.id} • {finding.category}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-200/60 flex items-center justify-center">
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-600">
            You are overriding an automated AI finding. Please state the justification for dismissing this item.
          </p>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Dismissal</label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Blind spot confirmed in CCTV camera angle; equipment physically accounted for during manual walkthrough."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 text-xs font-semibold">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100">
            Cancel
          </button>
          <button
            onClick={() => {
              onReject(finding.id, reason || 'Dismissed by Inspector after manual verification.');
              onClose();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
          >
            Dismiss Finding
          </button>
        </div>
      </div>
    </div>
  );
}

export function RequestEvidenceModal({ finding, onClose, onRequest }) {
  const [evidenceRequirements, setEvidenceRequirements] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('7');

  if (!finding) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm font-outfit">Request Additional Evidence</h3>
              <p className="text-xs text-slate-500">{finding.id} • {finding.category}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-200/60 flex items-center justify-center">
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-600">
            Specify the precise evidentiary documents or photo proofs the institution must upload to substantiate compliance.
          </p>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Required Evidence Description</label>
            <textarea
              rows={3}
              value={evidenceRequirements}
              onChange={(e) => setEvidenceRequirements(e.target.value)}
              placeholder="e.g. Upload asset relocation challan, updated Fire NOC deposit challan, or original degree certificates."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Submission Deadline</label>
            <select
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="3">3 Days (Urgent)</option>
              <option value="7">7 Days (Standard)</option>
              <option value="15">15 Days (Formal Rectification Period)</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 text-xs font-semibold">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100">
            Cancel
          </button>
          <button
            onClick={() => {
              onRequest(finding.id, { requirements: evidenceRequirements || 'Provide official documentation supporting compliance.', deadlineDays });
              onClose();
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
          >
            Dispatch Evidence Notice
          </button>
        </div>
      </div>
    </div>
  );
}

export function PcDetailsModal({ pc, onClose }) {
  if (!pc) return null;
  const si = pc.system_info || {};

  const disks = si.disks && si.disks.length ? si.disks.map((disk, idx) => (
    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-slate-800 font-mono">{disk.mountpoint} ({disk.device})</span>
        <span className="text-slate-500">{disk.percent} used • {disk.fstype}</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${parseFloat(disk.percent) >= 80 ? 'bg-amber-500' : 'bg-indigo-600'}`} 
          style={{ width: `${parseFloat(disk.percent) || 0}%` }}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1 font-mono">
        <span>Total: <strong>{disk.total}</strong></span>
        <span>Used: <strong>{disk.used}</strong></span>
        <span>Free: <strong>{disk.free}</strong></span>
      </div>
    </div>
  )) : <p className="text-xs text-slate-500">No disk partition information available.</p>;

  const networks = si.networks && Object.keys(si.networks).length ? Object.entries(si.networks).map(([name, addrs], idx) => {
    const ip = addrs.find(a => a.IP)?.IP || '--';
    const mac = addrs.find(a => a.MAC)?.MAC || '--';
    return (
      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
        <p className="font-bold text-slate-800 font-mono">{name}</p>
        <p className="text-slate-600">IP: <strong className="font-mono text-slate-800">{ip}</strong></p>
        <p className="text-slate-600">MAC: <strong className="font-mono text-slate-800">{mac}</strong></p>
      </div>
    );
  }) : <p className="text-xs text-slate-500">No network interface data available.</p>;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn my-8">
        <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-base font-outfit">{pc.hostname || 'PC Terminal'}</h3>
              <StatusBadge status={pc.is_online ? 'Online' : 'Offline'} size="xs" />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{pc.ip || '--'} • First seen: {pc.first_seen || 'N/A'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-200/60 flex items-center justify-center">
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Live Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5">
              <p className="text-[10px] font-bold text-indigo-500 uppercase">Live CPU Usage</p>
              <p className="text-xl font-extrabold text-indigo-700 font-mono mt-0.5">{pc.is_online && pc.cpu !== '--' ? `${pc.cpu}%` : '--'}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5">
              <p className="text-[10px] font-bold text-indigo-500 uppercase">Live RAM Usage</p>
              <p className="text-xl font-extrabold text-indigo-700 font-mono mt-0.5">{pc.is_online && pc.ram !== '--' ? `${pc.ram}%` : '--'}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5">
              <p className="text-[10px] font-bold text-indigo-500 uppercase">Cumulative Network I/O</p>
              <p className="text-xs font-semibold text-slate-700 font-mono mt-1">↑ {pc.net_sent || '--'} | ↓ {pc.net_recv || '--'}</p>
            </div>
          </div>

          {/* System & Hardware */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-800 border-b pb-2 text-xs uppercase tracking-wider text-slate-500">Operating System &amp; Build</h4>
              <p><strong className="text-slate-700">OS:</strong> {si.os || '--'}</p>
              <p><strong className="text-slate-700">Architecture:</strong> {si.machine || '--'}</p>
              <p><strong className="text-slate-700">Processor:</strong> {si.processor || '--'}</p>
              <p><strong className="text-slate-700">Boot Time:</strong> {si.boot_time || '--'}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-800 border-b pb-2 text-xs uppercase tracking-wider text-slate-500">CPU Cores &amp; Memory</h4>
              <p><strong className="text-slate-700">Total Installed RAM:</strong> {si.total_ram || '--'}</p>
              <p><strong className="text-slate-700">Logical CPU Cores:</strong> {si.cpu_cores_total || '--'}</p>
              <p><strong className="text-slate-700">Physical CPU Cores:</strong> {si.cpu_cores_physical || '--'}</p>
              <p><strong className="text-slate-700">Max Frequency:</strong> {si.cpu_max_freq || '--'}</p>
            </div>
          </div>

          {/* Storage */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider text-slate-500">Storage Partitions</h4>
            <div className="space-y-2.5">{disks}</div>
          </div>

          {/* Networks */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider text-slate-500">Network Adapters &amp; Hardware MACs</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{networks}</div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
