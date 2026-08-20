import React from 'react';

export default function Header({ 
  currentRole, 
  onRoleChange, 
  scannerStatus, 
  backendStatus,
  currentUser,
  onOpenLoginModal,
  onLogout,
  activeInstitution, 
  onInstitutionChange,
  institutions = []
}) {
  const roleDisplayNames = {
    ROLE_ADMIN: { label: 'University Admin', tag: 'ADMIN', color: 'bg-purple-900/60 text-purple-200 border-purple-700/60' },
    ROLE_INSPECTOR: { label: 'Lead Inspector', tag: 'INSPECTOR', color: 'bg-indigo-900/60 text-indigo-200 border-indigo-700/60' },
    ROLE_INSTITUTE: { label: 'College Rep', tag: 'INSTITUTE', color: 'bg-emerald-900/60 text-emerald-200 border-emerald-700/60' }
  };

  const activeRoleBadge = roleDisplayNames[currentUser?.role] || roleDisplayNames.ROLE_INSPECTOR;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="px-4 lg:px-6 py-2.5 flex flex-col md:flex-row justify-between items-center gap-3">
        
        {/* Left: Branding & Regulatory Seal */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-lg shadow-inner font-bold">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-sm md:text-base tracking-wide font-outfit text-slate-100">
                  AI-Assisted Institutional Inspection
                </h1>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-500/30">
                  SIH1730
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                National Accreditation &amp; Verification Portal
              </p>
            </div>
          </div>
        </div>

        {/* Center: Context & Service Health Badges */}
        <div className="flex items-center space-x-2.5 flex-wrap justify-center text-xs">
          
          {/* Active Context Selector */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-300">
            <span className="text-slate-400 mr-1.5 flex items-center gap-1 text-[11px]">
              <i className="fa-solid fa-landmark text-[10px] text-indigo-400"></i> Context:
            </span>
            <select
              value={activeInstitution?.id || ''}
              onChange={(e) => {
                const found = institutions.find(i => i.id === e.target.value);
                if (found) onInstitutionChange(found);
              }}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id} className="bg-slate-900 text-white">
                  {inst.name.length > 28 ? inst.name.substring(0, 28) + '…' : inst.name}
                </option>
              ))}
            </select>
          </div>

          {/* Spring Boot Health Pill */}
          <div 
            title={backendStatus?.online ? "Connected to Spring Boot API on port 8080" : "Spring Boot offline. Running with resilient client security fallback."}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
              backendStatus?.online 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${backendStatus?.online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
            <span className="hidden sm:inline">Backend:</span>
            <span>{backendStatus?.online ? 'Spring Boot Online' : 'Backend (Demo)'}</span>
          </div>

          {/* FastAPI Scanner Telemetry Badge */}
          <div 
            title={scannerStatus?.online ? `FastAPI scanner online on port 8000 (${scannerStatus.clients || 0} clients streaming)` : "FastAPI scanner offline. Standalone telemetry fallback."}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
              scannerStatus?.online 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${scannerStatus?.online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
            <span className="hidden sm:inline">Scanner:</span>
            <span>{scannerStatus?.online ? `${scannerStatus.clients || 0} PCs Online` : 'Scanner (Demo)'}</span>
          </div>
        </div>

        {/* Right: Role Switcher & Auth Pill */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end">
          
          {/* Role Switcher */}
          <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => onRoleChange('university')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all text-[11px] ${
                currentRole === 'university'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Univ
            </button>
            <button
              onClick={() => onRoleChange('inspector')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all text-[11px] ${
                currentRole === 'inspector'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Inspector
            </button>
            <button
              onClick={() => onRoleChange('college')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all text-[11px] ${
                currentRole === 'college'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              College
            </button>
          </div>

          {/* User Auth Pill & Login Trigger */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <button
              onClick={onOpenLoginModal}
              title="Click to switch JWT account or login"
              className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-lg text-xs transition"
            >
              <i className="fa-solid fa-key text-[10px] text-indigo-400"></i>
              <span className="font-semibold text-slate-200 text-[11px] truncate max-w-[110px]">
                {currentUser?.email ? currentUser.email.split('@')[0] : 'Sign In'}
              </span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${activeRoleBadge.color}`}>
                {activeRoleBadge.tag}
              </span>
            </button>

            {currentUser && (
              <button
                onClick={onLogout}
                title="Sign out session"
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-slate-800 flex items-center justify-center transition text-xs"
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
              </button>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
