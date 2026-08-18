import React from 'react';

export default function RoleCard({ roleInfo, onQuickLogin, onFillForm, isSubmitting }) {
  const { title, email, role, status, badgeClass, isBlocked } = roleInfo;

  return (
    <div className={`card role-card ${isBlocked ? 'card-disabled-account' : ''}`}>
      <div className="card-top">
        <div className={`role-badge ${badgeClass}`}>{role}</div>
        <span className={`status-badge ${status === 'ACTIVE' ? 'badge-active' : 'badge-disabled'}`}>
          {status}
        </span>
      </div>
      <h3 className="role-name">{title}</h3>
      <p className="role-email">{email}</p>
      <p className="role-pass">
        Password: <code>Password@123</code>
      </p>
      <div className="card-footer">
        <button
          className={`btn btn-sm ${isBlocked ? 'btn-warning' : 'btn-primary'}`}
          onClick={() => onQuickLogin(email, 'Password@123')}
          disabled={isSubmitting}
        >
          {isBlocked ? '⚠️ Test 403 Block' : '🚀 Quick Login'}
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onFillForm(email, 'Password@123')}
        >
          Fill Form
        </button>
      </div>
    </div>
  );
}
