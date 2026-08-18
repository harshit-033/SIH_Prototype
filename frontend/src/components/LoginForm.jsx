import React, { useState } from 'react';

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  isSubmitting,
  onApplyPreset
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email.trim(), password);
  };

  return (
    <section className="card glass-panel">
      <div className="panel-header">
        <h3 className="panel-title">🔑 Authentication Endpoint Tester</h3>
        <span className="endpoint-pill">POST /api/auth/login</span>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="emailInput" className="form-label">
            Email Address
          </label>
          <input
            type="text"
            id="emailInput"
            className="form-control"
            placeholder="user@sih.gov.in"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="passwordInput" className="form-label">
            Password
          </label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="passwordInput"
              className="form-control"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        {/* Quick Test Presets */}
        <div className="form-group">
          <label className="form-label">Quick Negative Test Presets</label>
          <div className="presets-row">
            <button
              type="button"
              className="btn-preset"
              onClick={() => onApplyPreset('admin@sih.gov.in', 'WrongPassword!', 'Wrong Password (401)')}
            >
              ❌ Wrong Password (401)
            </button>
            <button
              type="button"
              className="btn-preset"
              onClick={() => onApplyPreset('unknown_user@sih.gov.in', 'Password@123', 'Unknown User (401)')}
            >
              ❓ Unknown User (401)
            </button>
            <button
              type="button"
              className="btn-preset"
              onClick={() => onApplyPreset('invalid-email-format', 'Password@123', 'Invalid Email Format (400)')}
            >
              ⚠️ Invalid Email (400)
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span> Sending Request...
              </>
            ) : (
              'Send Login Request'
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
