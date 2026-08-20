import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { MOCK_LABS } from '../data/mockData';

export default function LabsPage({ labs = MOCK_LABS, onNavigate }) {
  const [selectedLab, setSelectedLab] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Facility Audit
            </span>
            <span className="text-xs text-slate-400 font-mono">Real-Time Sensor &amp; LAN Reconciliation</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-outfit mt-1">
            Laboratory Infrastructure &amp; CCTV Feeds
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Physical laboratory environments verified through CCTV monitor recognition, hardware switch sweeping, and live OS agents.
          </p>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('telemetry')}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition"
        >
          <i className="fa-solid fa-desktop text-indigo-400"></i>
          <span>Open Live PC Scanner</span>
        </button>
      </div>

      {/* Labs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {labs.map((lab) => (
          <div
            key={lab.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden p-6 space-y-4 flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div className="space-y-3.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-base border border-indigo-100">
                    <i className="fa-solid fa-flask"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base font-outfit">{lab.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{lab.building} • {lab.room}</p>
                  </div>
                </div>
                <StatusBadge status={lab.complianceStatus} size="xs" />
              </div>

              {/* Hardware Counts Grid */}
              <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Declared</p>
                  <p className="text-lg font-bold text-slate-800 font-outfit">{lab.declaredPCs}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-indigo-500">CCTV Found</p>
                  <p className="text-lg font-bold text-indigo-700 font-outfit">{lab.detectedCctvPCs}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-500">Discovered</p>
                  <p className="text-lg font-bold text-emerald-700 font-outfit">{lab.discoveredScannerPCs}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Online</p>
                  <p className="text-lg font-bold text-slate-700 font-outfit">{lab.onlinePCs}</p>
                </div>
              </div>

              {/* Specs & Discrepancy Note */}
              <div className="space-y-1.5 text-xs">
                <p className="text-slate-700">
                  <strong className="text-slate-800">Hardware Spec:</strong> {lab.hardwareSpecs}
                </p>
                <p className="text-slate-700">
                  <strong className="text-slate-800">OS Environment:</strong> {lab.osSummary}
                </p>
                <div className="p-2.5 bg-slate-100/80 rounded-lg text-[11px] text-slate-600 border border-slate-200/60">
                  <span className="font-bold text-slate-700">Reconciliation Note:</span> {lab.discrepancyNote}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-[11px] text-slate-400 font-mono">Camera: {lab.cameraRef}</span>
              <button
                onClick={() => setSelectedLab(lab)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <i className="fa-solid fa-eye text-[10px]"></i>
                <span>Lab Overview &amp; CCTV</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lab Overview Modal */}
      {selectedLab && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base font-outfit">{selectedLab.name} — Detailed Audit</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedLab.building} • {selectedLab.room}</p>
              </div>
              <button onClick={() => setSelectedLab(null)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* CCTV Feed Simulation */}
              <div className="relative bg-slate-950 aspect-video rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80"
                  alt="CCTV"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 px-2.5 py-1 rounded text-white font-mono text-[10px]">
                  FEED: {selectedLab.cameraRef} (ACTIVE)
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 text-white p-2.5 rounded-lg text-[11px] flex justify-between">
                  <span>YOLO Detection: {selectedLab.detectedCctvPCs} Monitors Visible</span>
                  <span className="text-emerald-400 font-bold">Conf: 94.2%</span>
                </div>
              </div>

              {/* Hardware Specs Sheet */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-800">Laboratory Specification Sheet</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <p><span className="text-slate-500">Core OS:</span> <strong>{selectedLab.osSummary}</strong></p>
                  <p><span className="text-slate-500">Switch IP:</span> <strong className="font-mono">{selectedLab.switchIp}</strong></p>
                  <p><span className="text-slate-500">GPU Workstations:</span> <strong>{selectedLab.gpuCount} Units</strong></p>
                  <p><span className="text-slate-500">Last Telemetry Scan:</span> <strong>{selectedLab.lastScan}</strong></p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLab(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900"
              >
                Close Lab Overview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
