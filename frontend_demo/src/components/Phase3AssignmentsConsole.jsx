import React, { useState } from 'react';
import { api } from '../services/apiClient';

export default function Phase3AssignmentsConsole({
  activeSession,
  onShowAlert
}) {
  const { user, token } = activeSession || {};
  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const isInspector = role === 'INSPECTOR';

  const [assignments, setAssignments] = useState([]);
  const [inspectorId, setInspectorId] = useState('2');
  const [instituteId, setInstituteId] = useState('1');
  const [queryInstituteId, setQueryInstituteId] = useState('1');
  const [loading, setLoading] = useState(false);

  // Admin: List All Assignments
  const handleListAllAssignments = async () => {
    setLoading(true);
    const res = await api.listAssignments(null, token);
    setLoading(false);

    if (res.ok && res.data?.data) {
      setAssignments(res.data.data);
      onShowAlert(`Retrieved ${res.data.data.length} assignments from database!`, 'success');
    } else {
      onShowAlert(`GET /api/inspector-assignments returned HTTP ${res.status}: ${res.data?.message || 'Unauthorized/Forbidden'}`, res.status === 403 ? 'warning' : 'danger');
    }
  };

  // Inspector: List My Assignments
  const handleListMyAssignments = async () => {
    setLoading(true);
    const res = await api.getMyAssignments(token);
    setLoading(false);

    if (res.ok && res.data?.data) {
      setAssignments(res.data.data);
      onShowAlert(`Retrieved ${res.data.data.length} active assignments for inspector!`, 'success');
    } else {
      onShowAlert(`GET /api/inspector-assignments/my returned HTTP ${res.status}: ${res.data?.message}`, 'danger');
    }
  };

  // Admin: Create Assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!inspectorId || !instituteId) return;

    setLoading(true);
    const res = await api.createAssignment(inspectorId, instituteId, token);
    setLoading(false);

    if (res.ok) {
      onShowAlert(`Assigned Inspector #${inspectorId} to Institute #${instituteId} successfully!`, 'success');
      handleListAllAssignments();
    } else {
      onShowAlert(`POST /api/inspector-assignments returned HTTP ${res.status}: ${res.data?.message}`, res.status === 409 ? 'warning' : 'danger');
    }
  };

  // Admin: Deactivate Assignment
  const handleDeactivate = async (id) => {
    setLoading(true);
    const res = await api.deactivateAssignment(id, token);
    setLoading(false);

    if (res.ok) {
      onShowAlert(`Assignment #${id} deactivated successfully!`, 'success');
      handleListAllAssignments();
    } else {
      onShowAlert(`DELETE /api/inspector-assignments/${id} returned HTTP ${res.status}: ${res.data?.message}`, 'danger');
    }
  };

  // View Institute Inspector
  const handleGetInstituteInspector = async () => {
    if (!queryInstituteId) return;
    setLoading(true);
    const res = await api.getInstituteInspector(queryInstituteId, token);
    setLoading(false);

    if (res.ok && res.data?.data) {
      onShowAlert(`Active Inspector for Institute #${queryInstituteId}: ${res.data.data.email} (ID: #${res.data.data.id})`, 'success');
    } else {
      onShowAlert(`Institute #${queryInstituteId} has no active inspector or returned HTTP ${res.status}`, 'info');
    }
  };

  return (
    <section className="card phase-console-card">
      <div className="card-header">
        <div className="card-title-row">
          <span className="card-icon">🤝</span>
          <h2 className="card-title">Phase 3 — Inspector ↔ Institute Assignment Console</h2>
        </div>
        <div className="role-access-tags">
          <span className={`badge ${isAdmin ? 'badge-online' : 'badge-disabled'}`}>ADMIN: Full Management</span>
          <span className={`badge ${isInspector ? 'badge-online' : 'badge-disabled'}`}>INSPECTOR: My Assignments</span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="action-toolbar">
        {isAdmin && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleListAllAssignments}
            disabled={loading || !token}
          >
            📋 LIST ALL ASSIGNMENTS (GET /api/inspector-assignments)
          </button>
        )}

        {isInspector && (
          <button
            className="btn btn-inspector btn-sm"
            onClick={handleListMyAssignments}
            disabled={loading || !token}
          >
            🕵️ MY ASSIGNED INSTITUTES (GET /api/inspector-assignments/my)
          </button>
        )}

        <div className="inline-input-group">
          <input
            type="number"
            className="form-control form-control-sm font-mono"
            style={{ width: '80px' }}
            value={queryInstituteId}
            onChange={(e) => setQueryInstituteId(e.target.value)}
            placeholder="Inst ID"
          />
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleGetInstituteInspector}
            disabled={loading || !token || !queryInstituteId}
          >
            🔍 VIEW INSTITUTE'S INSPECTOR
          </button>
        </div>
      </div>

      {/* Assignment Table */}
      {assignments.length > 0 && (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Inspector</th>
                <th>Institute</th>
                <th>Status</th>
                <th>Assigned At</th>
                <th>Deactivated At</th>
                {isAdmin && <th className="text-center">Action</th>}
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td><code>#{a.id}</code></td>
                  <td>
                    <strong>{a.inspectorEmail || a.inspector?.email || `User #${a.inspectorId}`}</strong>
                  </td>
                  <td>
                    <span>{a.instituteName || a.institute?.name}</span>
                    <span className="font-mono text-xs text-muted"> ({a.instituteCode || a.institute?.code})</span>
                  </td>
                  <td>
                    <span className={`badge ${a.status === 'ACTIVE' ? 'badge-active' : 'badge-disabled'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td><span className="text-xs font-mono">{a.assignedAt ? new Date(a.assignedAt).toLocaleString() : '—'}</span></td>
                  <td><span className="text-xs font-mono">{a.deactivatedAt ? new Date(a.deactivatedAt).toLocaleString() : '—'}</span></td>
                  {isAdmin && (
                    <td className="text-center">
                      {a.status === 'ACTIVE' ? (
                        <button
                          className="btn btn-danger btn-xs"
                          onClick={() => handleDeactivate(a.id)}
                          disabled={loading}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <span className="text-muted text-xs">Inactive</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Assignment Creation Form */}
      {isAdmin ? (
        <form onSubmit={handleCreateAssignment} className="sub-form-box">
          <h4 className="form-heading">🔗 Assign Inspector to Institute (Single-Active Rule Enforced)</h4>
          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Inspector User ID</label>
              <input
                type="number"
                className="form-control form-control-sm font-mono"
                value={inspectorId}
                onChange={(e) => setInspectorId(e.target.value)}
                placeholder="e.g. 2"
                required
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Institute ID</label>
              <input
                type="number"
                className="form-control form-control-sm font-mono"
                value={instituteId}
                onChange={(e) => setInstituteId(e.target.value)}
                placeholder="e.g. 1"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? <span className="spinner"></span> : '➕ ASSIGN (POST /api/inspector-assignments)'}
          </button>
        </form>
      ) : (
        <div className="role-restriction-notice">
          <span>🔒 Inspector assignment creation and deactivation are restricted to <code>ROLE_ADMIN</code> (403 Expected for write operations).</span>
        </div>
      )}
    </section>
  );
}
