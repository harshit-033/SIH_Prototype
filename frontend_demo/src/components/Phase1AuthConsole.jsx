import React, { useState } from 'react';
import { api, executeApiRequest } from '../services/apiClient';

export default function Phase1AuthConsole({
  activeSession,
  onLoginSuccess,
  onShowAlert
}) {
  const [email, setEmail] = useState('admin@sih.gov.in');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const devAdminEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL || 'SUPER_ADMIN';
  const devAdminPassword = import.meta.env.VITE_DEV_ADMIN_PASSWORD || 'SUDO@123';
  const isDevMode = import.meta.env.DEV;

  const handleLoginSubmit = async (submitEmail, submitPassword) => {
    setLoading(true);
    const res = await api.login(submitEmail.trim(), submitPassword);
    setLoading(false);

    if (res.ok && res.data?.success && res.data?.data?.token) {
      onLoginSuccess(res.data.data);
      onShowAlert(`Successfully authenticated as ${res.data.data.email} (${res.data.data.role})`, 'success');
    } else {
      const msg = res.data?.message || (res.status === 401 ? 'Invalid email or password' : 'Login failed');
      onShowAlert(`Login Failed [HTTP ${res.status}]: ${msg}`, res.status === 403 ? 'warning' : 'danger');
    }
  };

  const handleQuickLogin = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    handleLoginSubmit(quickEmail, quickPassword);
  };

  // Phase 1 API Verification Tests
  const handleTestMe = async () => {
    if (!activeSession?.token) {
      onShowAlert('No active token. Please log in first.', 'warning');
      return;
    }
    setLoading(true);
    const res = await api.getMe(activeSession.token);
    setLoading(false);
    if (res.ok) {
      onShowAlert(`GET /api/auth/me verified: Authenticated as ${res.data?.data?.email}`, 'success');
    } else {
      onShowAlert(`GET /api/auth/me returned HTTP ${res.status}: ${res.data?.message}`, 'danger');
    }
  };

  const handleTestTamperedToken = async () => {
    setLoading(true);
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyYW5kb20ifQ.invalidSignature12345';
    const res = await executeApiRequest({
      method: 'GET',
      path: '/api/auth/me',
      token: fakeToken
    });
    setLoading(false);
    if (res.status === 401) {
      onShowAlert('Expected 401 Unauthorized received for tampered JWT!', 'success');
    } else {
      onShowAlert(`Unexpected status ${res.status} for tampered token`, 'warning');
    }
  };

  const handleTestNoToken = async () => {
    setLoading(true);
    const res = await executeApiRequest({
      method: 'GET',
      path: '/api/auth/me',
      token: null
    });
    setLoading(false);
    if (res.status === 401) {
      onShowAlert('Expected 401 Unauthorized received for missing Authorization header!', 'success');
    } else {
      onShowAlert(`Unexpected status ${res.status} for missing token`, 'warning');
    }
  };

  return (
    <section className="card phase-console-card">
      <div className="card-header">
        <div className="card-title-row">
          <span className="card-icon">🔑</span>
          <h2 className="card-title">Phase 1 — Authentication & Security Console</h2>
        </div>
        <span className="endpoint-pill">POST /api/auth/login</span>
      </div>

      {/* Quick Login Buttons */}
      <div className="quick-logins-section">
        <span className="section-sublabel">Pre-Configured Role Quick-Logins (Backend Seed Accounts):</span>
        <div className="quick-btn-grid">
          <button
            type="button"
            className="btn btn-admin btn-sm"
            onClick={() => handleQuickLogin('admin@sih.gov.in', 'Password@123')}
            disabled={loading}
          >
            🛡️ QUICK LOGIN — ADMIN
          </button>
          <button
            type="button"
            className="btn btn-inspector btn-sm"
            onClick={() => handleQuickLogin('inspector@sih.gov.in', 'Password@123')}
            disabled={loading}
          >
            🕵️ QUICK LOGIN — INSPECTOR
          </button>
          <button
            type="button"
            className="btn btn-institute btn-sm"
            onClick={() => handleQuickLogin('institute@sih.gov.in', 'Password@123')}
            disabled={loading}
          >
            🏛️ QUICK LOGIN — INSTITUTE
          </button>
          <button
            type="button"
            className="btn btn-disabled btn-sm"
            onClick={() => handleQuickLogin('disabled@sih.gov.in', 'Password@123')}
            disabled={loading}
          >
            ⛔ QUICK LOGIN — DISABLED (403 Test)
          </button>
        </div>

        {/* Development-Only Admin Quick Login */}
        {isDevMode && (
          <div className="dev-admin-box">
            <span className="dev-badge">DEV ONLY CONVENIENCE</span>
            <button
              type="button"
              className="btn btn-dev-admin btn-sm"
              onClick={() => handleQuickLogin(devAdminEmail, devAdminPassword)}
              disabled={loading}
              title="Dev-only convenience credentials (VITE_DEV_ADMIN_EMAIL)"
            >
              ⭐ DEV QUICK LOGIN — SUPER ADMIN ({devAdminEmail})
            </button>
            <span className="dev-hint">
              Sends <code>{devAdminEmail}</code> / <code>{devAdminPassword}</code> directly to backend.
            </span>
          </div>
        )}
      </div>

      {/* Manual Login Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLoginSubmit(email, password);
        }}
        className="login-form-box"
      >
        <div className="form-row">
          <div className="form-group flex-1">
            <label className="form-label">Email / Identifier</label>
            <input
              type="text"
              className="form-control font-mono"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sih.gov.in"
              required
            />
          </div>
          <div className="form-group flex-1">
            <label className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="btn-toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner"></span> : 'Send Authentication Request (POST /api/auth/login)'}
        </button>
      </form>

      {/* Phase 1 Security Test Suite */}
      <div className="security-test-actions">
        <span className="section-sublabel">Phase 1 Security & Token Integrity Verification:</span>
        <div className="test-btn-row">
          <button className="btn btn-secondary btn-sm" onClick={handleTestMe} disabled={loading}>
            ⚡ GET /api/auth/me (Valid JWT)
          </button>
          <button className="btn btn-warning btn-sm" onClick={handleTestTamperedToken} disabled={loading}>
            💥 Test Invalid / Tampered JWT (Expect 401)
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleTestNoToken} disabled={loading}>
            🚫 Test No Token (Expect 401)
          </button>
        </div>
      </div>
    </section>
  );
}
