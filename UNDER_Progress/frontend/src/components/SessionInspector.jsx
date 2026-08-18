import React from 'react';

export default function SessionInspector({
  activeSession,
  onTestProtectedMe,
  onTestTamperedToken,
  onLogout,
  onCopyToken,
  isTestingProtected
}) {
  const { token, user, claims, expiryTimeFormatted, remainingMinutes } = activeSession || {};

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'badge-admin';
      case 'INSPECTOR': return 'badge-inspector';
      case 'INSTITUTE': return 'badge-institute';
      default: return 'badge-admin';
    }
  };

  return (
    <section className="card glass-panel">
      <div className="panel-header">
        <h3 className="panel-title">🛡️ Active JWT Session & Claims</h3>
        <div className="jwt-status-indicator">
          <span className={`status-dot ${token ? 'online' : 'inactive'}`}></span>
          <span>{token ? 'Token Active (Valid)' : 'No Token Active'}</span>
        </div>
      </div>

      <div className="session-body">
        {!token ? (
          <div className="empty-state">
            <span className="empty-icon">🔒</span>
            <p>
              No active JWT token stored. Authenticate via the login form to inspect claims and test protected endpoints.
            </p>
          </div>
        ) : (
          <div className="session-active-view">
            <div className="user-profile-header">
              <div className="avatar">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h4 className="profile-email">{user?.email}</h4>
                <div className="badges-row">
                  <span className={`role-badge ${getRoleBadgeClass(user?.role)}`}>
                    {user?.role}
                  </span>
                  <span className={`status-badge ${user?.status === 'ACTIVE' ? 'badge-active' : 'badge-disabled'}`}>
                    {user?.status}
                  </span>
                  <span className="user-id-tag">ID: #{user?.userId}</span>
                </div>
              </div>
            </div>

            {/* Token Box */}
            <div className="token-box">
              <div className="token-header">
                <span className="token-label">Bearer Access Token (HMAC-SHA256)</span>
                <button className="btn-copy" onClick={onCopyToken} title="Copy raw token">
                  📋 Copy
                </button>
              </div>
              <div className="token-string">{token}</div>
            </div>

            {/* Decoded Claims JSON */}
            <div className="claims-box">
              <div className="claims-header">
                <span className="claims-label">Decoded Payload Claims</span>
                <span className="claims-expiry">
                  {expiryTimeFormatted ? `Expires: ${expiryTimeFormatted} (${remainingMinutes}m left)` : 'Active'}
                </span>
              </div>
              <pre className="code-block">
                {JSON.stringify(claims, null, 2)}
              </pre>
            </div>

            {/* Protected Endpoint Actions */}
            <div className="protected-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onTestProtectedMe(token, false)}
                disabled={isTestingProtected}
              >
                {isTestingProtected ? <span className="spinner"></span> : '⚡ Test GET /api/auth/me (Valid Token)'}
              </button>
              <button
                className="btn btn-warning btn-sm"
                onClick={() => onTestTamperedToken(token)}
                disabled={isTestingProtected}
              >
                💥 Test with Tampered Token (401)
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={onLogout}
              >
                🚪 Logout / Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
