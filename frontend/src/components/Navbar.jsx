import React from 'react';

export default function Navbar({ serverStatus, onSeedDatabase, isSeeding }) {
  const getDotClass = () => {
    if (serverStatus.status === 'online') return 'status-dot online';
    if (serverStatus.status === 'offline') return 'status-dot offline';
    return 'status-dot pinging';
  };

  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-logo">
          <span className="logo-icon">🏛️</span>
        </div>
        <div>
          <h1 className="brand-title">SIH Inspection System</h1>
          <span className="brand-subtitle">React Auth & Security Verification Console</span>
        </div>
      </div>
      <div className="nav-actions">
        <div className="server-status-pill">
          <span className={getDotClass()}></span>
          <span>{serverStatus.message}</span>
        </div>
        <button
          className="btn btn-secondary"
          onClick={onSeedDatabase}
          disabled={isSeeding}
          title="Seed all 5 demo accounts into PostgreSQL"
        >
          {isSeeding ? (
            <>
              <span className="spinner"></span> Seeding...
            </>
          ) : (
            <>
              <span>⚡</span> Auto-Seed Demo Users
            </>
          )}
        </button>
      </div>
    </header>
  );
}
