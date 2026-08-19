import React from 'react';

const ERROR_CODES = [
  {
    code: '200 / 201',
    name: 'OK / Created',
    meaning: 'Request processed successfully. 201 indicates a new resource (e.g. Institute or Assignment) was persisted in PostgreSQL.',
    badgeClass: 'status-badge-200'
  },
  {
    code: '400',
    name: 'Bad Request',
    meaning: 'Request validation failed (e.g. missing required field, non-inspector role assigned, or invalid email format).',
    badgeClass: 'status-badge-400'
  },
  {
    code: '401',
    name: 'Unauthorized',
    meaning: 'Authentication failed. Missing, expired, or tampered JWT token in Authorization header, or invalid login credentials.',
    badgeClass: 'status-badge-401'
  },
  {
    code: '403',
    name: 'Forbidden',
    meaning: 'JWT is valid and user is authenticated, but the user\'s role lacks necessary @PreAuthorize authority for this endpoint.',
    badgeClass: 'status-badge-403'
  },
  {
    code: '404',
    name: 'Not Found',
    meaning: 'Requested resource (User, Institute, or Assignment ID) does not exist in PostgreSQL.',
    badgeClass: 'status-badge-404'
  },
  {
    code: '409',
    name: 'Conflict',
    meaning: 'Business invariant conflict. E.g. Target institute already has an active inspector assigned, or a second ADMIN creation was attempted.',
    badgeClass: 'status-badge-409'
  }
];

export default function ErrorExplainer() {
  return (
    <section className="card error-explainer-card">
      <div className="card-header">
        <div className="card-title-row">
          <span className="card-icon">📖</span>
          <h2 className="card-title">HTTP Response Status Codes & Security Semantics</h2>
        </div>
      </div>

      <div className="status-codes-grid">
        {ERROR_CODES.map((item, idx) => (
          <div key={idx} className="status-code-card">
            <div className="status-code-header">
              <span className={`status-badge-pill ${item.badgeClass}`}>{item.code}</span>
              <strong className="status-code-name">{item.name}</strong>
            </div>
            <p className="status-code-meaning">{item.meaning}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
