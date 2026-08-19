import React from 'react';

export default function DevConsoleHeader({
  serverStatus,
  backendUrl,
  frontendUrl,
  onSeedDatabase,
  isSeeding
}) {
  const getStatusBadge = () => {
    if (serverStatus.status === 'online') {
      return <span className="badge-online">● ONLINE ({serverStatus.latency}ms)</span>;
    }
    if (serverStatus.status === 'offline') {
      return <span className="badge-offline">● OFFLINE</span>;
    }
    return <span className="badge-pinging">● CHECKING...</span>;
  };

  return (
    <header className="dev-header">
      <div className="dev-header-left">
        <div className="console-logo">
          <span>🛠️</span>
        </div>
        <div>
          <h1 className="dev-title">SIH Inspection System</h1>
          <span className="dev-subtitle">Backend Development & API Inspection Console</span>
        </div>
      </div>

      <div className="dev-header-center">
        <div className="env-pill">
          <span className="env-label">Backend:</span>
          <code className="env-val">{backendUrl}</code>
          {getStatusBadge()}
        </div>
        <div className="env-pill">
          <span className="env-label">Frontend:</span>
          <code className="env-val">{frontendUrl}</code>
        </div>
      </div>

      <div className="dev-header-right">
        <button
          className="btn btn-secondary btn-sm"
          onClick={onSeedDatabase}
          disabled={isSeeding}
          title="Seed all 4 demo accounts into PostgreSQL"
        >
          {isSeeding ? (
            <>
              <span className="spinner"></span> Seeding...
            </>
          ) : (
            <>
              <span>⚡</span> Seed Demo Users
            </>
          )}
        </button>
      </div>
    </header>
  );
}
