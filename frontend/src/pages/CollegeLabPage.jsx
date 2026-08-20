import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { MOCK_LABS } from '../data/mockData';

export default function CollegeLabPage() {
  const [labs, setLabs] = useState(MOCK_LABS);
  const [editIndex, setEditIndex] = useState(-1);
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    room: '',
    declaredPCs: 30,
    osSummary: '',
    hardwareSpecs: '',
    cameraRef: ''
  });

  const handleEdit = (index) => {
    const l = labs[index];
    setEditIndex(index);
    setFormData({
      name: l.name,
      building: l.building,
      room: l.room,
      declaredPCs: l.declaredPCs,
      osSummary: l.osSummary,
      hardwareSpecs: l.hardwareSpecs,
      cameraRef: l.cameraRef
    });
  };

  const handleReset = () => {
    setEditIndex(-1);
    setFormData({
      name: '',
      building: '',
      room: '',
      declaredPCs: 30,
      osSummary: '',
      hardwareSpecs: '',
      cameraRef: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editIndex >= 0) {
      const updated = [...labs];
      updated[editIndex] = {
        ...updated[editIndex],
        ...formData
      };
      setLabs(updated);
    } else {
      setLabs([
        ...labs,
        {
          id: `LAB-0${labs.length + 1}`,
          ...formData,
          detectedCctvPCs: 0,
          discoveredScannerPCs: 0,
          onlinePCs: 0,
          complianceStatus: 'Pending Verification',
          discrepancyNote: 'Newly registered lab awaiting automated discovery sweep.',
          lastScan: 'Pending Initial Sweep',
          switchIp: '152.20.50.1',
          gpuCount: 0
        }
      ]);
    }
    handleReset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Lab &amp; Equipment Registration
            </span>
            <span className="text-xs text-slate-400 font-mono">Institutional Baseline</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-outfit mt-1">
            Laboratory Baseline &amp; Discrepancy Manager
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Register and update official lab declarations. The AI engine cross-references these with live CCTV and network telemetry.
          </p>
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-slate-800 text-sm font-outfit">
            {editIndex >= 0 ? `Update Laboratory: ${formData.name}` : 'Register New Laboratory Baseline'}
          </h3>
          {editIndex >= 0 && (
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 font-bold">
              Editing Lab Baseline
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Laboratory Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. High Performance Computing Lab"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Building / Complex *</label>
            <input
              type="text"
              required
              placeholder="e.g. APJ Abdul Kalam Block"
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Room / Floor *</label>
            <input
              type="text"
              required
              placeholder="e.g. Lab 304, 3rd Floor"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Total Declared Workstations *</label>
            <input
              type="number"
              required
              min="1"
              max="200"
              value={formData.declaredPCs}
              onChange={(e) => setFormData({ ...formData, declaredPCs: parseInt(e.target.value) || 0 })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Operating System &amp; Build</label>
            <input
              type="text"
              placeholder="e.g. Ubuntu 22.04 LTS / Windows 11"
              value={formData.osSummary}
              onChange={(e) => setFormData({ ...formData, osSummary: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Assigned CCTV Camera ID</label>
            <input
              type="text"
              placeholder="e.g. LAB-CAM-05"
              value={formData.cameraRef}
              onChange={(e) => setFormData({ ...formData, cameraRef: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block font-bold text-slate-700 mb-1">Hardware &amp; Toolchain Specifications</label>
            <input
              type="text"
              placeholder="e.g. Intel i7 13th Gen, 32GB RAM, RTX 4080, 1TB NVMe SSD"
              value={formData.hardwareSpecs}
              onChange={(e) => setFormData({ ...formData, hardwareSpecs: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm transition"
            >
              {editIndex >= 0 ? 'Update Lab Details' : 'Register Lab'}
            </button>
          </div>
        </form>
      </div>

      {/* Declared vs System Discovered Reconciliation Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm font-outfit">Declared vs. System Discovered Assets</h3>
            <p className="text-xs text-slate-500">Live reconciliation between institutional self-reported numbers and automated telemetry</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {labs.map((lab, idx) => (
            <div key={lab.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{lab.name}</h4>
                  <p className="text-[11px] text-slate-500">{lab.building} • {lab.room}</p>
                </div>
                <button
                  onClick={() => handleEdit(idx)}
                  className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-[11px] font-semibold text-indigo-600 transition"
                >
                  Edit
                </button>
              </div>

              {/* Multi-source comparative row */}
              <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-slate-200/80 text-center text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Declared</span>
                  <p className="font-extrabold text-slate-800 text-base">{lab.declaredPCs}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-500">CCTV Detected</span>
                  <p className="font-extrabold text-indigo-700 text-base">{lab.detectedCctvPCs}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-500">System Discovered</span>
                  <p className="font-extrabold text-emerald-700 text-base">{lab.discoveredScannerPCs}</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 space-y-1">
                <p><strong>Hardware:</strong> {lab.hardwareSpecs}</p>
                <p><strong>OS:</strong> {lab.osSummary}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Status:</span>
                  <StatusBadge status={lab.complianceStatus} size="xs" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
