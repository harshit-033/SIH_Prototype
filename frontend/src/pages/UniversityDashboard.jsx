import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function UniversityDashboard({ institutions = [], onSelectInstitution, onNavigate }) {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');

  const filtered = institutions.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.location.toLowerCase().includes(search.toLowerCase());
    const matchRegion = regionFilter === 'ALL' || i.region === regionFilter;
    return matchSearch && matchRegion;
  });

  const totalCount = institutions.length;
  const compliantCount = institutions.filter(i => i.complianceScore >= 80).length;
  const actionRequiredCount = institutions.filter(i => i.status === 'Action Required').length;
  const avgCompliance = Math.round(institutions.reduce((acc, curr) => acc + curr.complianceScore, 0) / (totalCount || 1));

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Regulatory Overview
            </span>
            <span className="text-xs text-slate-400 font-mono">Academic Year 2026-27</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-outfit mt-1">
            University Inspection &amp; Regulatory Dashboard
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Centralized compliance monitoring, institutional audit rosters, and high-risk deficiency oversight.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate && onNavigate('reports')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition"
          >
            <i className="fa-solid fa-file-pdf"></i>
            <span>Executive Report</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Institutions"
          value={totalCount}
          subtext="Affiliated engineering & tech colleges"
          icon="fa-building-columns"
          color="indigo"
          badge={{ label: "Active Audit Roster", value: "100% Monitored" }}
        />
        <StatCard
          title="Active Inspections"
          value="3 Active"
          subtext="In-field or telemetry scanning stage"
          icon="fa-clipboard-check"
          color="blue"
          badge={{ label: "Lead Inspector", value: "Assigned" }}
        />
        <StatCard
          title="Overall Compliance"
          value={`${avgCompliance}%`}
          subtext={`${compliantCount} of ${totalCount} institutions compliant`}
          icon="fa-circle-check"
          color="emerald"
          badge={{ label: "Benchmark", value: "≥ 75.0% Required" }}
        />
        <StatCard
          title="High-Risk Findings"
          value={actionRequiredCount}
          subtext="Deficiencies requiring regulatory notice"
          icon="fa-triangle-exclamation"
          color="rose"
          badge={{ label: "Immediate Action", value: "Review Pending", color: "text-rose-600" }}
        />
      </div>

      {/* Compliance Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm font-outfit border-b pb-2">Institutional Compliance Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Compliant (Score ≥ 80%)</span>
                <span className="text-emerald-700 font-bold">{Math.round((compliantCount / totalCount) * 100)}% ({compliantCount})</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(compliantCount / totalCount) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Needs Verification (60% - 79%)</span>
                <span className="text-amber-700 font-bold">25% (1)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `25%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">High Risk / Deficient (&lt; 60%)</span>
                <span className="text-rose-700 font-bold">25% (1)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `25%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-slate-800 text-sm font-outfit">Regulatory Inspection Alerts</h3>
            <span className="text-[11px] text-slate-400 font-mono">Live Sync: Today</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-xl flex items-start gap-3">
              <i className="fa-solid fa-triangle-exclamation text-rose-600 mt-0.5 text-sm"></i>
              <div className="flex-1">
                <p className="font-bold text-slate-800">XYZ University Institute of Science &amp; Tech</p>
                <p className="text-slate-600 text-[11px]">8 Open Deficiencies: Lapsed Fire NOC and 35 missing laboratory workstations. Regulatory show-cause recommended.</p>
              </div>
              <StatusBadge status="Action Required" size="xs" />
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-start gap-3">
              <i className="fa-solid fa-clock text-amber-600 mt-0.5 text-sm"></i>
              <div className="flex-1">
                <p className="font-bold text-slate-800">GL Bajaj Institute of Technology &amp; Management</p>
                <p className="text-slate-600 text-[11px]">Active Inspection in progress (68% Complete). 5 Discrepancies pending inspector human sanction.</p>
              </div>
              <StatusBadge status="Needs Verification" size="xs" />
            </div>
          </div>
        </div>
      </div>

      {/* Institutions Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden space-y-3 p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 font-outfit">Affiliated Institutions Directory</h3>
            <p className="text-xs text-slate-500">Select any college to inspect its live evidence stream, lab scans, and compliance scorecard.</p>
          </div>

          {/* Search & Region Filter */}
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
              <input
                type="text"
                placeholder="Search college, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Regions</option>
              <option value="Northern Region">Northern Region</option>
              <option value="Southern Region">Southern Region</option>
              <option value="Western Region">Western Region</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Institution &amp; Code</th>
                <th className="p-3.5">Location &amp; Region</th>
                <th className="p-3.5">Active Inspection</th>
                <th className="p-3.5 text-center">Score</th>
                <th className="p-3.5 text-center">Findings</th>
                <th className="p-3.5">Risk Level</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-800 text-xs">{inst.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">AISHE: {inst.aishe} • Code: {inst.code}</p>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <p>{inst.location}</p>
                    <span className="text-[10px] text-slate-400">{inst.region}</span>
                  </td>
                  <td className="p-3.5">
                    <p className="font-medium text-indigo-900">{inst.activeInspection}</p>
                    <p className="text-[10px] text-slate-500">{inst.inspectorName}</p>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`font-extrabold text-sm ${
                      inst.complianceScore >= 80 ? 'text-emerald-700' : inst.complianceScore >= 65 ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {inst.complianceScore}%
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="font-bold text-slate-700">{inst.findingsCount}</span>
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      inst.risk === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      inst.risk === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {inst.risk}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={inst.status} size="xs" />
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        onSelectInstitution(inst);
                        onNavigate('inspector_workspace');
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-sm transition inline-flex items-center gap-1.5"
                    >
                      <span>Open Workspace</span>
                      <i className="fa-solid fa-arrow-right text-[10px]"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
