import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import { PcDetailsModal } from '../components/Modals';
import { fetchServerStatus, fetchLiveClients, fetchInventory } from '../services/scannerService';

export default function LiveTelemetryPage() {
  const [serverOnline, setServerOnline] = useState(false);
  const [liveClients, setLiveClients] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedPc, setSelectedPc] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fallback high-fidelity sample data if scanner is not running
  const fallbackInventory = [
    {
      hostname: "DESKTOP-4QH73VD",
      ip: "152.20.21.164",
      is_online: true,
      cpu: 18.4,
      ram: 54.2,
      net_sent: "24.5MB",
      net_recv: "182.1MB",
      disk_read: "450.2MB",
      disk_write: "120.4MB",
      first_seen: "2026-08-19T01:10:00",
      last_seen: new Date().toISOString(),
      system_info: {
        os: "Windows 11 Pro (Build 22631)",
        machine: "AMD64",
        processor: "13th Gen Intel(R) Core(TM) i7-13700H",
        boot_time: "2026/08/19 08:30:12",
        total_ram: "31.78GB",
        cpu_cores_physical: 14,
        cpu_cores_total: 20,
        cpu_max_freq: "5000.00Mhz",
        disks: [
          { device: "C:\\", mountpoint: "C:\\", fstype: "NTFS", total: "476.12GB", used: "245.80GB", free: "230.32GB", percent: "51.6%" }
        ],
        networks: {
          "Wi-Fi": [{ IP: "152.20.21.164" }, { MAC: "34-6F-24-AA-11-BC" }],
          "Ethernet 2": [{ MAC: "00-FF-88-21-99-01" }]
        }
      }
    },
    {
      hostname: "kali",
      ip: "152.20.21.212",
      is_online: true,
      cpu: 4.2,
      ram: 32.1,
      net_sent: "12.1MB",
      net_recv: "95.6MB",
      disk_read: "210.0MB",
      disk_write: "45.2MB",
      first_seen: "2026-08-19T01:05:00",
      last_seen: new Date().toISOString(),
      system_info: {
        os: "Linux 6.6.15-kali1-amd64",
        machine: "x86_64",
        processor: "Intel Core Processor (Broadwell)",
        boot_time: "2026/08/19 09:12:00",
        total_ram: "15.62GB",
        cpu_cores_physical: 4,
        cpu_cores_total: 8,
        cpu_max_freq: "2400.00Mhz",
        disks: [
          { device: "/dev/sda1", mountpoint: "/", fstype: "ext4", total: "78.50GB", used: "28.10GB", free: "50.40GB", percent: "35.8%" }
        ],
        networks: {
          "eth0": [{ IP: "152.20.21.212" }, { MAC: "08:00:27:fc:19:a2" }]
        }
      }
    },
    {
      hostname: "archlinux",
      ip: "152.20.23.66",
      is_online: false,
      cpu: "--",
      ram: "--",
      net_sent: "--",
      net_recv: "--",
      disk_read: "--",
      disk_write: "--",
      first_seen: "2026-08-18T20:26:40",
      last_seen: "2026-08-19T20:37:04",
      system_info: {
        os: "Linux 6.8.9-arch1-1",
        machine: "x86_64",
        processor: "AMD Ryzen 7 5800X",
        boot_time: "2026/08/18 19:40:00",
        total_ram: "31.90GB",
        cpu_cores_physical: 8,
        cpu_cores_total: 16,
        cpu_max_freq: "4700.00Mhz",
        disks: [
          { device: "/dev/nvme0n1p2", mountpoint: "/", fstype: "btrfs", total: "953.00GB", used: "410.00GB", free: "543.00GB", percent: "43.0%" }
        ],
        networks: {
          "enp5s0": [{ IP: "152.20.23.66" }, { MAC: "d4:5d:64:88:e1:52" }]
        }
      }
    }
  ];

  const updateTelemetry = async () => {
    const status = await fetchServerStatus();
    setServerOnline(status.online);

    if (status.online) {
      const [clientsData, invData] = await Promise.all([
        fetchLiveClients(),
        fetchInventory()
      ]);

      if (invData && Array.isArray(invData)) {
        setInventory(invData);
      }
      if (clientsData && Array.isArray(clientsData)) {
        setLiveClients(clientsData);
      }
    } else {
      setInventory(fallbackInventory);
      setLiveClients(fallbackInventory.filter(pc => pc.is_online));
    }
    setLoading(false);
  };

  useEffect(() => {
    updateTelemetry();
    const interval = setInterval(updateTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const onlineCount = inventory.filter(pc => pc.is_online).length;
  const offlineCount = inventory.length - onlineCount;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              serverOnline 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              <i className="fa-solid fa-circle text-[7px] mr-1"></i>
              {serverOnline ? 'FastAPI Scanner Connected (Port 8000)' : 'Scanner Standalone Mode'}
            </span>
            <span className="text-xs text-slate-400 font-mono">Agent v2.4 WebSocket Sweeper</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-outfit mt-1">
            Real-Time Lab PC Telemetry &amp; Hardware Scanner
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Streaming live CPU, RAM, Disk I/O, Network I/O, and hardware partition profiles from <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">client.py</code> agents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={updateTelemetry}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition"
          >
            <i className="fa-solid fa-arrows-rotate"></i>
            <span>Refresh Scan</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Online Terminals</p>
          <p className="text-2xl font-extrabold text-emerald-700 font-outfit mt-1">{onlineCount} Active</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Live WebSocket stream</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Offline / Stale</p>
          <p className="text-2xl font-extrabold text-amber-700 font-outfit mt-1">{offlineCount} Machines</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Retained in persistent inventory</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Inventory Records</p>
          <p className="text-2xl font-extrabold text-indigo-700 font-outfit mt-1">{inventory.length} PCs</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Ever-connected hardware profiles</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">FastAPI Server URL</p>
          <p className="text-base font-bold text-slate-800 font-mono mt-1">127.0.0.1:8000</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Endpoint: /clients &amp; /inventory</p>
        </div>
      </div>

      {/* Live Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-3">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="font-bold text-slate-800 text-sm font-outfit">Active Laboratory Terminals &amp; System Stats</h3>
          <span className="text-xs text-slate-400 font-mono">Live Polling: 3s</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                <th className="p-3.5">PC / Hostname</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">CPU %</th>
                <th className="p-3.5">RAM %</th>
                <th className="p-3.5">Network I/O</th>
                <th className="p-3.5">Disk I/O</th>
                <th className="p-3.5">Last Seen</th>
                <th className="p-3.5 text-right">Detailed Specs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((pc, idx) => (
                <tr key={pc.ip || idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-800 text-xs">{pc.hostname || 'Unknown'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{pc.ip}</p>
                  </td>

                  <td className="p-3.5">
                    <StatusBadge status={pc.is_online ? 'Online' : 'Offline'} size="xs" />
                  </td>

                  <td className="p-3.5 font-mono text-indigo-700 font-bold">
                    {pc.is_online && pc.cpu !== '--' ? `${pc.cpu}%` : '--'}
                  </td>

                  <td className="p-3.5 font-mono text-indigo-700 font-bold">
                    {pc.is_online && pc.ram !== '--' ? `${pc.ram}%` : '--'}
                  </td>

                  <td className="p-3.5 text-[11px] text-slate-600 font-mono">
                    {pc.is_online && pc.net_sent !== '--' ? `↑ ${pc.net_sent} | ↓ ${pc.net_recv}` : '--'}
                  </td>

                  <td className="p-3.5 text-[11px] text-slate-600 font-mono">
                    {pc.is_online && pc.disk_read !== '--' ? `R: ${pc.disk_read} | W: ${pc.disk_write}` : '--'}
                  </td>

                  <td className="p-3.5 text-slate-500 font-mono text-[10px]">
                    {pc.last_seen ? new Date(pc.last_seen).toLocaleTimeString([], { hour12: false }) : '--'}
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedPc(pc)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition shadow-sm"
                    >
                      View Hardware
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PC Details Modal */}
      <PcDetailsModal pc={selectedPc} onClose={() => setSelectedPc(null)} />
    </div>
  );
}
