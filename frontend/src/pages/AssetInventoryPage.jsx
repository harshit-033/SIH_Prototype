import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { MOCK_ASSETS } from '../data/mockData';

export default function AssetInventoryPage({ assets = MOCK_ASSETS }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = assets.filter(a => {
    const matchSearch = a.hostname.toLowerCase().includes(search.toLowerCase()) || 
                        a.ip.toLowerCase().includes(search.toLowerCase()) ||
                        a.location.toLowerCase().includes(search.toLowerCase()) ||
                        a.id.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'ALL' || a.type === typeFilter;
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              LAN &amp; Device Registry
            </span>
            <span className="text-xs text-slate-400 font-mono">Discovered Equipment</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-outfit mt-1">
            Institutional Technical Asset Inventory
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Full physical and network assets discovered across laboratory subnets with hardware configurations and operating statuses.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search hostname, IP, MAC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="PC">PC</option>
            <option value="Server">Server</option>
            <option value="Switch">Switch</option>
            <option value="Access Point">Access Point</option>
            <option value="Printer">Printer</option>
            <option value="Laboratory Equipment">Lab Equipment</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden p-5 space-y-3">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="font-bold text-slate-800 text-sm font-outfit">Hardware Inventory &amp; Network Nodes</h3>
          <span className="text-xs text-slate-500 font-mono">Showing {filtered.length} of {assets.length} assets</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                <th className="p-3.5">Asset ID &amp; Type</th>
                <th className="p-3.5">Hostname &amp; IP</th>
                <th className="p-3.5">MAC Address</th>
                <th className="p-3.5">Physical Location</th>
                <th className="p-3.5">OS &amp; Processor</th>
                <th className="p-3.5">RAM &amp; GPU</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ast) => (
                <tr key={ast.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-800 font-mono">{ast.id}</p>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold border border-slate-200">
                      {ast.type}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <p className="font-bold text-slate-800">{ast.hostname}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{ast.ip}</p>
                  </td>

                  <td className="p-3.5 font-mono text-slate-600 text-[11px]">
                    {ast.mac}
                  </td>

                  <td className="p-3.5 text-slate-700">
                    {ast.location}
                  </td>

                  <td className="p-3.5">
                    <p className="font-medium text-slate-800">{ast.os}</p>
                    <p className="text-[10px] text-slate-400">{ast.cpu}</p>
                  </td>

                  <td className="p-3.5">
                    <p className="text-slate-800 font-semibold">{ast.ram}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{ast.gpu}</p>
                  </td>

                  <td className="p-3.5">
                    <StatusBadge status={ast.status} size="xs" />
                  </td>

                  <td className="p-3.5 text-right text-slate-500 font-mono text-[11px]">
                    {ast.lastSeen}
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
