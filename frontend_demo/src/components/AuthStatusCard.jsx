import React, { useState, useEffect } from 'react';
import { formatRemainingTime } from '../utils/jwtUtils';

export default function AuthStatusCard({ activeSession, onLogout, onCopyToken }) {
  const { user, token, claims, parsedJwt } = activeSession || {};
  const [countdown, setCountdown] = useState('N/A');

  useEffect(() => {
    if (!parsedJwt?.expiresAt) {
      setCountdown('N/A');
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const remainingSec = Math.max(0, Math.floor((parsedJwt.expiresAt.getTime() - now) / 1000));
      const isExpired = remainingSec <= 0;
      setCountdown(formatRemainingTime(remainingSec, isExpired));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [parsedJwt]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return <span className="badge badge-admin">ROLE_ADMIN</span>;
      case 'INSPECTOR': return <span className="badge badge-inspector">ROLE_INSPECTOR</span>;
      case 'INSTITUTE': return <span className="badge badge-institute">ROLE_INSTITUTE</span>;
      default: return <span className="badge badge-anonymous">ANONYMOUS</span>;
    }
  };

  const getJwtStatusBadge = () => {
    if (!token) return <span className="badge badge-offline">NO TOKEN</span>;
    if (parsedJwt?.isExpired) return <span className="badge badge-danger">EXPIRED</span>;
    return <span className="badge badge-online">VALID</span>;
  };

  return (
    <section className="card auth-status-card">
      <div className="card-header">
        <div className="card-title-row">
          <span className="card-icon">👤</span>
          <h2 className="card-title">Authentication & Identity State</h2>
        </div>
        <div className="header-badges">
          <span className={`status-pill ${token ? 'pill-online' : 'pill-offline'}`}>
            {token ? 'AUTHENTICATED' : 'UNAUTHENTICATED'}
          </span>
          {getJwtStatusBadge()}
        </div>
      </div>

      <div className="auth-grid">
        <div className="auth-stat-box">
          <span className="stat-label">User Email</span>
          <span className="stat-val bold">{user?.email || 'Anonymous Guest'}</span>
        </div>

        <div className="auth-stat-box">
          <span className="stat-label">User ID</span>
          <span className="stat-val font-mono">{user?.userId ? `#${user.userId}` : '—'}</span>
        </div>

        <div className="auth-stat-box">
          <span className="stat-label">Assigned Role</span>
          <span className="stat-val">{getRoleBadge(user?.role)}</span>
        </div>

        <div className="auth-stat-box">
          <span className="stat-label">Account Status</span>
          <span className={`badge ${user?.status === 'ACTIVE' ? 'badge-active' : 'badge-disabled'}`}>
            {user?.status || 'N/A'}
          </span>
        </div>

        <div className="auth-stat-box">
          <span className="stat-label">JWT Token State</span>
          <span className="stat-val font-mono">{token ? 'Bearer Access Token' : 'None'}</span>
        </div>

        <div className="auth-stat-box">
          <span className="stat-label">Expiration Timer</span>
          <span className={`stat-val font-mono bold ${parsedJwt?.isExpired ? 'text-danger' : 'text-success'}`}>
            ⏱️ {countdown}
          </span>
        </div>
      </div>

      {token && (
        <div className="auth-actions-bar">
          <button className="btn btn-secondary btn-sm" onClick={onCopyToken}>
            📋 Copy JWT Token
          </button>
          <button className="btn btn-danger btn-sm" onClick={onLogout}>
            🚪 Logout & Clear Session
          </button>
        </div>
      )}
    </section>
  );
}
