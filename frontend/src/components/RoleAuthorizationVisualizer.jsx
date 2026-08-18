import React from 'react';

const PERMISSIONS_MATRIX = [
  {
    phase: 'Phase 1: Auth',
    action: 'View Current Profile',
    endpoint: 'GET /api/auth/me',
    admin: true,
    inspector: true,
    institute: true
  },
  {
    phase: 'Phase 2: Institutes',
    action: 'List All Institutes',
    endpoint: 'GET /api/institutes',
    admin: true,
    inspector: true,
    institute: false
  },
  {
    phase: 'Phase 2: Institutes',
    action: 'View Institute Details',
    endpoint: 'GET /api/institutes/{id}',
    admin: true,
    inspector: true,
    institute: false
  },
  {
    phase: 'Phase 2: Institutes',
    action: 'Create New Institute',
    endpoint: 'POST /api/institutes',
    admin: true,
    inspector: false,
    institute: false
  },
  {
    phase: 'Phase 2: Institutes',
    action: 'Update Institute Details',
    endpoint: 'PUT /api/institutes/{id}',
    admin: true,
    inspector: false,
    institute: false
  },
  {
    phase: 'Phase 3: Assignments',
    action: 'List All Assignments',
    endpoint: 'GET /api/inspector-assignments',
    admin: true,
    inspector: false,
    institute: false
  },
  {
    phase: 'Phase 3: Assignments',
    action: 'Create Inspector Assignment',
    endpoint: 'POST /api/inspector-assignments',
    admin: true,
    inspector: false,
    institute: false
  },
  {
    phase: 'Phase 3: Assignments',
    action: 'Deactivate Assignment',
    endpoint: 'DELETE /api/inspector-assignments/{id}',
    admin: true,
    inspector: false,
    institute: false
  },
  {
    phase: 'Phase 3: Assignments',
    action: 'View My Assigned Institutes',
    endpoint: 'GET /api/inspector-assignments/my',
    admin: false,
    inspector: true,
    institute: false
  },
  {
    phase: 'Phase 3: Assignments',
    action: 'View Institute Inspector',
    endpoint: 'GET /api/institutes/{id}/inspector',
    admin: true,
    inspector: true,
    institute: false
  }
];

export default function RoleAuthorizationVisualizer({ activeRole }) {
  const isAllowed = (item) => {
    if (activeRole === 'ADMIN') return item.admin;
    if (activeRole === 'INSPECTOR') return item.inspector;
    if (activeRole === 'INSTITUTE') return item.institute;
    return false;
  };

  return (
    <section className="card rbac-visualizer-card">
      <div className="card-header">
        <div className="card-title-row">
          <span className="card-icon">⚖️</span>
          <h2 className="card-title">Spring Security RBAC Permission Matrix</h2>
        </div>
        <span className="active-role-tag">
          Evaluating Role: <strong>{activeRole || 'ANONYMOUS'}</strong>
        </span>
      </div>

      <div className="table-responsive">
        <table className="rbac-table">
          <thead>
            <tr>
              <th>Domain Phase</th>
              <th>Operation</th>
              <th>Endpoint</th>
              <th className="text-center">ADMIN</th>
              <th className="text-center">INSPECTOR</th>
              <th className="text-center">INSTITUTE</th>
              <th className="text-center">Current User Permission</th>
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS_MATRIX.map((item, idx) => {
              const allowed = isAllowed(item);
              return (
                <tr key={idx} className={allowed ? 'row-allowed' : 'row-forbidden'}>
                  <td><span className="phase-tag">{item.phase}</span></td>
                  <td><strong>{item.action}</strong></td>
                  <td><code>{item.endpoint}</code></td>
                  <td className="text-center">{item.admin ? '✓' : '✗'}</td>
                  <td className="text-center">{item.inspector ? '✓' : '✗'}</td>
                  <td className="text-center">{item.institute ? '✓' : '✗'}</td>
                  <td className="text-center">
                    {allowed ? (
                      <span className="perm-badge perm-allowed">✓ ALLOWED (200/201)</span>
                    ) : (
                      <span className="perm-badge perm-denied">✗ FORBIDDEN (403/401)</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
