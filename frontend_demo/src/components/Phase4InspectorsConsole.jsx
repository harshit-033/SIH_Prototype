import React, { useState } from 'react';
import { api } from '../services/apiClient';

export default function Phase4InspectorsConsole({
  activeSession,
  onShowAlert
}) {
  const { user, token } = activeSession || {};
  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const isInspector = role === 'INSPECTOR';
  const isInstitute = role === 'INSTITUTE';

  const [inspectors, setInspectors] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [inspectorDetails, setInspectorDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Create Inspector Modal & Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [createErrors, setCreateErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assign Institute Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedInspectorForAssign, setSelectedInspectorForAssign] = useState(null);
  const [assignInstituteId, setAssignInstituteId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch list of inspectors (Admin action or post-create refresh)
  const handleListInspectors = async () => {
    if (!token) {
      onShowAlert('No active token. Please log in first.', 'warning');
      return;
    }
    setLoading(true);
    const res = await api.listInspectors(token);
    setLoading(false);

    if (res.ok && res.data?.data) {
      setInspectors(res.data.data);
      onShowAlert(`Retrieved ${res.data.data.length} inspector accounts from database!`, 'success');
    } else {
      const msg = res.data?.message || (res.status === 403 ? 'You do not have permission to view inspectors.' : 'Failed to retrieve inspectors');
      onShowAlert(`GET /api/v1/inspectors returned HTTP ${res.status}: ${msg}`, res.status === 403 ? 'warning' : 'danger');
    }
  };

  // Fetch list of institutes for assignment selector
  const fetchInstitutes = async () => {
    if (!token) return;
    const res = await api.listInstitutes(token);
    if (res.ok && res.data?.data) {
      setInstitutes(res.data.data);
      if (res.data.data.length > 0) {
        setAssignInstituteId(String(res.data.data[0].id));
      }
    }
  };

  // Fetch inspector by ID
  const handleGetById = async () => {
    if (!selectedId) return;
    setLoading(true);
    const res = await api.getInspector(selectedId, token);
    setLoading(false);

    if (res.ok && res.data?.data) {
      setInspectorDetails(res.data.data);
      onShowAlert(`Retrieved inspector: ${res.data.data.email} (ID: #${res.data.data.id})`, 'success');
    } else {
      setInspectorDetails(null);
      const msg = res.data?.message || 'Inspector not found';
      onShowAlert(`GET /api/v1/inspectors/${selectedId} returned HTTP ${res.status}: ${msg}`, 'warning');
    }
  };

  // Form Validation
  const validateCreateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!createForm.email.trim()) {
      errors.email = 'Inspector email is required';
    } else if (!emailRegex.test(createForm.email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. inspector@sih.gov.in)';
    }

    if (!createForm.password) {
      errors.password = 'Temporary password is required';
    } else if (createForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Create Inspector Modal
  const handleOpenCreateModal = () => {
    setCreateForm({
      email: '',
      password: ''
    });
    setCreateErrors({});
    setShowPassword(false);
    setShowCreateModal(true);
  };

  // Close Create Inspector Modal
  const handleCloseCreateModal = () => {
    // Zero out password field immediately
    setCreateForm({ email: '', password: '' });
    setCreateErrors({});
    setShowCreateModal(false);
  };

  // Handle Create Inspector Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    setIsSubmitting(true);
    // Payload strictly contains only email and password - NO role or status
    const res = await api.createInspector({
      email: createForm.email.trim(),
      password: createForm.password
    }, token);
    setIsSubmitting(false);

    if (res.ok && res.status === 201) {
      onShowAlert(`Inspector created successfully: ${res.data?.data?.email || createForm.email}`, 'success');
      handleCloseCreateModal();
      handleListInspectors();
    } else {
      if (res.status === 409) {
        onShowAlert('An inspector account with this email already exists.', 'warning');
        setCreateErrors({ email: 'An account with this email already exists' });
      } else if (res.status === 403) {
        onShowAlert('You do not have permission to create inspectors.', 'danger');
      } else if (res.status === 400) {
        const msg = res.data?.message || 'Please check the entered information.';
        onShowAlert(`Validation Error (HTTP 400): ${msg}`, 'warning');
      } else {
        onShowAlert(`Unable to create inspector. ${res.data?.message || 'Please try again.'}`, 'danger');
      }
    }
  };

  // Open Assign Modal for an inspector
  const handleOpenAssignModal = (inspector) => {
    setSelectedInspectorForAssign(inspector);
    fetchInstitutes();
    setShowAssignModal(true);
  };

  // Handle Assign Inspector Submit
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInspectorForAssign || !assignInstituteId) return;

    setIsAssigning(true);
    const res = await api.createAssignment(
      selectedInspectorForAssign.id,
      assignInstituteId,
      token
    );
    setIsAssigning(false);

    if (res.ok && (res.status === 201 || res.status === 200)) {
      onShowAlert(`Inspector ${selectedInspectorForAssign.email} assigned to institute #${assignInstituteId} successfully!`, 'success');
      setShowAssignModal(false);
      setSelectedInspectorForAssign(null);
    } else {
      if (res.status === 409) {
        onShowAlert('This institute already has an active inspector assigned. Deactivate existing assignment before reassigning.', 'warning');
      } else if (res.status === 403) {
        onShowAlert('You do not have permission to assign inspectors.', 'danger');
      } else {
        onShowAlert(`Assignment failed (HTTP ${res.status}): ${res.data?.message || 'Error'}`, 'danger');
      }
    }
  };

  // Test Non-Admin Negative Request (for verification)
  const handleNegativeTest = async () => {
    setLoading(true);
    const res = await api.listInspectors(token);
    setLoading(false);
    if (res.status === 403) {
      onShowAlert(`Verified Security RBAC: Received expected HTTP 403 Forbidden for non-admin role (${role || 'Anonymous'})!`, 'success');
    } else {
      onShowAlert(`Unexpected response status ${res.status}`, 'warning');
    }
  };

  return (
    <section className="card phase-console-card">
      <div className="card-header">
        <div className="card-title-row">
          <span className="card-icon">👮</span>
          <div>
            <h2 className="card-title">Phase 4.1 — Admin Inspector Management Console</h2>
            <p className="card-subtitle" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
              Manage inspection personnel and their institute assignments.
            </p>
          </div>
        </div>
        <div className="role-access-tags">
          <span className={`badge ${isAdmin ? 'badge-online' : 'badge-disabled'}`}>
            ADMIN: Full Management
          </span>
          <span className={`badge ${isInspector ? 'badge-offline' : 'badge-disabled'}`}>
            INSPECTOR: Forbidden (403)
          </span>
          <span className={`badge ${isInstitute ? 'badge-offline' : 'badge-disabled'}`}>
            INSTITUTE: Forbidden (403)
          </span>
        </div>
      </div>

      {/* Access Gate: ADMIN vs Non-Admin */}
      {!isAdmin ? (
        <div className="role-restriction-notice" style={{ margin: '1rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <strong>🔒 Protected Admin Feature:</strong> Inspector provisioning and management is strictly restricted to System Administrators (<code>ROLE_ADMIN</code>).
              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                Current role: <strong>{role || 'ANONYMOUS'}</strong>. Authenticate as <code>admin@sih.gov.in</code> to create and manage inspectors.
              </div>
            </div>
            {token && (
              <button
                type="button"
                className="btn btn-warning btn-sm"
                onClick={handleNegativeTest}
                disabled={loading}
              >
                {loading ? <span className="spinner"></span> : '🧪 Test Access (Expect 403)'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Admin Action Toolbar */}
          <div className="action-toolbar">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenCreateModal}
              disabled={loading || !token}
            >
              <span>➕</span> Create Inspector
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleListInspectors}
              disabled={loading || !token}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Fetching...
                </>
              ) : (
                '📋 Refresh Inspectors (GET /api/v1/inspectors)'
              )}
            </button>

            <div className="inline-input-group">
              <input
                type="number"
                className="form-control form-control-sm font-mono"
                style={{ width: '90px' }}
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                placeholder="ID"
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleGetById}
                disabled={loading || !token || !selectedId}
              >
                🔍 Get Details
              </button>
            </div>
          </div>

          {/* Inspector Details View (if fetched by ID) */}
          {inspectorDetails && (
            <div className="sub-form-box" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 className="form-heading">🔍 Inspector Details (ID #{inspectorDetails.id})</h4>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setInspectorDetails(null)}
                >
                  ✕ Close
                </button>
              </div>
              <div className="form-grid-3">
                <div>
                  <span className="stat-label">Email</span>
                  <p className="stat-val font-mono">{inspectorDetails.email}</p>
                </div>
                <div>
                  <span className="stat-label">Role</span>
                  <p><span className="badge badge-inspector">{inspectorDetails.role}</span></p>
                </div>
                <div>
                  <span className="stat-label">Status</span>
                  <p><span className={`badge ${inspectorDetails.status === 'ACTIVE' ? 'badge-active' : 'badge-disabled'}`}>{inspectorDetails.status}</span></p>
                </div>
              </div>
              <div className="form-btn-row">
                <button
                  type="button"
                  className="btn btn-inspector btn-sm"
                  onClick={() => handleOpenAssignModal(inspectorDetails)}
                >
                  🤝 Assign To Institute
                </button>
              </div>
            </div>
          )}

          {/* Inspectors Table View */}
          {inspectors.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inspectors.map((insp) => (
                    <tr key={insp.id}>
                      <td><code>#{insp.id}</code></td>
                      <td><strong>{insp.email}</strong></td>
                      <td>
                        <span className="badge badge-inspector">{insp.role || 'INSPECTOR'}</span>
                      </td>
                      <td>
                        <span className={`badge ${insp.status === 'ACTIVE' ? 'badge-active' : 'badge-disabled'}`}>
                          {insp.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                          {insp.createdAt ? new Date(insp.createdAt).toLocaleString() : '—'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                            onClick={() => handleOpenAssignModal(insp)}
                            title="Assign to an institute via POST /api/inspector-assignments"
                          >
                            🤝 Assign Institute
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                            onClick={() => {
                              setSelectedId(String(insp.id));
                              api.getInspector(insp.id, token).then((res) => {
                                if (res.ok && res.data?.data) {
                                  setInspectorDetails(res.data.data);
                                }
                              });
                            }}
                          >
                            🔍 Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state-box">
              <span className="empty-state-icon">👥</span>
              <h3 className="empty-state-title">No inspectors found</h3>
              <p className="empty-state-desc">
                No inspector user accounts have been created yet. Provision your first inspector account below.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleOpenCreateModal}
              >
                <span>➕</span> Create First Inspector
              </button>
            </div>
          )}
        </>
      )}

      {/* MODAL 1: Create Inspector Dialog */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseCreateModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">➕ Create Inspector Account</h3>
                <p className="modal-subtitle">
                  Provision an inspector account for field audits. The backend strictly enforces <code>Role.INSPECTOR</code>.
                </p>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={handleCloseCreateModal}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Field 1: Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="inspectorEmailInput">
                  Inspector Email <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="inspectorEmailInput"
                  type="email"
                  className={`form-control ${createErrors.email ? 'border-danger' : ''}`}
                  placeholder="e.g. inspector01@sih.gov.in"
                  value={createForm.email}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, email: e.target.value });
                    if (createErrors.email) setCreateErrors({ ...createErrors, email: null });
                  }}
                  autoFocus
                  required
                />
                {createErrors.email && (
                  <span className="form-field-error">{createErrors.email}</span>
                )}
              </div>

              {/* Field 2: Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="inspectorPasswordInput">
                  Temporary Password <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <div className="password-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    id="inspectorPasswordInput"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ${createErrors.password ? 'border-danger' : ''}`}
                    placeholder="Min 8 characters (e.g. InspectorPass@123)"
                    value={createForm.password}
                    onChange={(e) => {
                      setCreateForm({ ...createForm, password: e.target.value });
                      if (createErrors.password) setCreateErrors({ ...createErrors, password: null });
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="btn-toggle-pw"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {createErrors.password && (
                  <span className="form-field-error">{createErrors.password}</span>
                )}
              </div>

              {/* Security Invariant Callout */}
              <div style={{
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                🛡️ <strong>Security Enforced:</strong> Role is set to <code>ROLE_INSPECTOR</code> and status to <code>ACTIVE</code> by the backend. Client payload contains only email and credentials.
              </div>

              {/* Modal Actions */}
              <div className="form-btn-row" style={{ justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCloseCreateModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || !createForm.email || !createForm.password}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span> Creating...
                    </>
                  ) : (
                    'Create Inspector'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Assign Inspector to Institute Dialog */}
      {showAssignModal && selectedInspectorForAssign && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">🤝 Assign Inspector to Institute</h3>
                <p className="modal-subtitle">
                  Assign <strong>{selectedInspectorForAssign.email}</strong> (ID #{selectedInspectorForAssign.id}) to an active institute.
                </p>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowAssignModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="instituteSelect">
                  Select Institute <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                {institutes.length > 0 ? (
                  <select
                    id="instituteSelect"
                    className="form-control"
                    value={assignInstituteId}
                    onChange={(e) => setAssignInstituteId(e.target.value)}
                    required
                  >
                    {institutes.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.code}) — {inst.city}, {inst.state}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-warning)' }}>
                    No institutes loaded yet. Please ensure institutes exist in Phase 2.
                  </p>
                )}
              </div>

              <div style={{
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                ℹ️ Calls <code>POST /api/inspector-assignments</code> with <code>{`{ inspectorId: ${selectedInspectorForAssign.id}, instituteId: ${assignInstituteId || '...'} }`}</code>.
              </div>

              <div className="form-btn-row" style={{ justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowAssignModal(false)}
                  disabled={isAssigning}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isAssigning || !assignInstituteId || institutes.length === 0}
                >
                  {isAssigning ? (
                    <>
                      <span className="spinner"></span> Assigning...
                    </>
                  ) : (
                    'Assign Inspector'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
