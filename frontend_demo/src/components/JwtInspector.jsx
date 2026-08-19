import React, { useState } from 'react';

export default function JwtInspector({ activeSession, onCopyToken, onLogout }) {
  const { token, parsedJwt } = activeSession || {};
  const [showFullToken, setShowFullToken] = useState(false);

  return (
    <section className="card jwt-inspector-card">
      <div className="card-header">
        <div className="card-title-row">
          <span className="card-icon">🔍</span>
          <h2 className="card-title">JWT Claims & Storage Inspector</h2>
        </div>
        <span className="notice-pill">Frontend Decoding (Backend is Authoritative)</span>
      </div>

      {!token ? (
        <div className="empty-state">
          <p>No active JWT token stored in <code>localStorage</code>. Log in to inspect header, payload claims, and signature structure.</p>
        </div>
      ) : (
        <div className="jwt-grid">
          {/* Storage Box */}
          <div className="storage-info-box">
            <h4 className="box-title">📦 Client-Side Token Storage</h4>
            <div className="storage-details">
              <div><span className="label">Storage:</span> <code>localStorage</code></div>
              <div><span className="label">Storage Key:</span> <code>sih_auth_token</code></div>
              <div><span className="label">Token Exists:</span> <span className="text-success bold">YES</span></div>
              <div><span className="label">Token Length:</span> <span>{token.length} characters</span></div>
              <div><span className="label">Expires At:</span> <span>{parsedJwt?.expiresAt ? parsedJwt.expiresAt.toLocaleString() : 'N/A'}</span></div>
            </div>

            <div className="token-actions">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowFullToken(!showFullToken)}
              >
                {showFullToken ? 'Hide Raw Token' : 'Show Full Token'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={onCopyToken}>
                Copy Token
              </button>
              <button className="btn btn-danger btn-sm" onClick={onLogout}>
                Clear Token
              </button>
            </div>

            {showFullToken && (
              <div className="raw-token-box">
                <span className="dev-tag">DEV DEBUG DATA (RAW BEARER TOKEN)</span>
                <pre className="token-text">{token}</pre>
              </div>
            )}
          </div>

          {/* Claims Viewer */}
          <div className="claims-view-box">
            <h4 className="box-title">📜 Decoded Header & Payload Claims</h4>
            
            <div className="claims-section">
              <span className="claims-subheading">Header</span>
              <pre className="code-block font-mono">
                {JSON.stringify(parsedJwt?.header || {}, null, 2)}
              </pre>
            </div>

            <div className="claims-section">
              <span className="claims-subheading">Payload</span>
              <pre className="code-block font-mono">
                {JSON.stringify(parsedJwt?.payload || {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
