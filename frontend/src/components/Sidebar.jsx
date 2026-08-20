import React from 'react';

export default function Sidebar({ currentRole, activePage, onNavigate, findingCount = 5, actionCount = 3 }) {
  
  const universityNav = [
    { id: 'university_dashboard', label: 'University Dashboard', icon: 'fa-chart-pie' },
    { id: 'institutions', label: 'Institutions Directory', icon: 'fa-building-columns' },
    { id: 'inspections', label: 'Inspection Rosters', icon: 'fa-clipboard-list' },
    { id: 'analytics', label: 'Compliance Analytics', icon: 'fa-chart-simple' },
    { id: 'reports', label: 'Inspection Reports', icon: 'fa-file-signature' },
  ];

  const inspectorNav = [
    { id: 'inspector_workspace', label: 'Inspection Workspace', icon: 'fa-briefcase', badge: 'Active' },
    { id: 'workflow', label: 'Inspection Flow Pipeline', icon: 'fa-diagram-project' },
    { id: 'evidence', label: 'Evidence Review (3 Sources)', icon: 'fa-magnifying-glass-chart' },
    { id: 'reconciliation', label: 'Expected vs Actual', icon: 'fa-scale-balanced', badge: 'Core' },
    { id: 'findings', label: 'Findings & Verification', icon: 'fa-triangle-exclamation', badgeCount: findingCount },
    { id: 'laboratories', label: 'Laboratories & CCTV', icon: 'fa-flask' },
    { id: 'telemetry', label: 'Live PC Telemetry Scanner', icon: 'fa-desktop' },
    { id: 'reports', label: 'Report Generation', icon: 'fa-file-pdf' }
  ];

  const collegeNav = [
    { id: 'college_dashboard', label: 'College Dashboard', icon: 'fa-gauge-high' },
    { id: 'college_faculty', label: 'Faculty Management', icon: 'fa-user-graduate' },
    { id: 'college_labs', label: 'Lab & System Registration', icon: 'fa-laptop-code' },
    { id: 'assets', label: 'Asset Inventory', icon: 'fa-boxes-stacked' },
    { id: 'documents', label: 'Institutional Documents', icon: 'fa-folder-open' },
    { id: 'corrective_actions', label: 'Corrective Actions', icon: 'fa-wrench', badgeCount: actionCount },
    { id: 'reports', label: 'Compliance Summary', icon: 'fa-file-lines' }
  ];

  let navItems = inspectorNav;
  let roleTitle = "Inspector Portal";
  let roleDesc = "Evidence & Verification Suite";

  if (currentRole === 'university') {
    navItems = universityNav;
    roleTitle = "Regulatory Authority";
    roleDesc = "State & University Oversight";
  } else if (currentRole === 'college') {
    navItems = collegeNav;
    roleTitle = "Institution Portal";
    roleDesc = "GL Bajaj Self-Reporting";
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col flex-shrink-0 min-h-[calc(100vh-61px)]">
      {/* Active Role Heading */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40">
        <p className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">Current Workspace</p>
        <h2 className="text-sm font-bold text-slate-100 font-outfit mt-0.5">{roleTitle}</h2>
        <p className="text-[11px] text-slate-400">{roleDesc}</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <i className={`fa-solid ${item.icon} w-4 text-center text-xs ${isActive ? 'text-white' : 'text-slate-400'}`}></i>
                <span>{item.label}</span>
              </div>
              
              {/* Optional badges */}
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-indigo-400 border border-indigo-900/50'
                }`}>
                  {item.badge}
                </span>
              )}
              {item.badgeCount !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-indigo-700 text-white' : 'bg-rose-900/60 text-rose-300 border border-rose-800/60'
                }`}>
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/20 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
          <span>AI Audit Engine</span>
          <span>v2.6.4-sih</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-snug">
          Human-in-the-loop regulatory enforcement architecture.
        </p>
      </div>
    </aside>
  );
}
