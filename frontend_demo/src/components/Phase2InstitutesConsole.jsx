import React, { useState } from 'react';
import { api } from '../services/apiClient';

export default function Phase2InstitutesConsole({
  activeSession,
  onShowAlert
}) {
  const { user, token } = activeSession || {};
  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const isInspector = role === 'INSPECTOR';
  const isInstitute = role === 'INSTITUTE';

  const [institutes, setInstitutes] = useState([]);
  const [selectedId, setSelectedId] = useState('1');
  const [loading, setLoading] = useState(false);

  // Form states for create/update
  const [form, setForm] = useState({
    name: 'National Institute of Technology',
    code: 'NIT001',
    address: 'Sector 62',
    region: 'North',
    city: 'Noida',
    state: 'Uttar Pradesh',
    contactEmail: 'contact@nit.edu',
    contactPhone: '9876543210',
    status: 'ACTIVE'
  });

  const handleListInstitutes = async () => {
    setLoading(true);
    const res = await api.listInstitutes(token);
    setLoading(false);

    if (res.ok && res.data?.data) {
      setInstitutes(res.data.data);
      onShowAlert(`Retrieved ${res.data.data.length} institutes from database!`, 'success');
    } else {
      onShowAlert(`GET /api/institutes returned HTTP ${res.status}: ${res.data?.message || 'Unauthorized/Forbidden'}`, res.status === 403 ? 'warning' : 'danger');
    }
  };

  const handleGetById = async () => {
    if (!selectedId) return;
    setLoading(true);
    const res = await api.getInstitute(selectedId, token);
    setLoading(false);

    if (res.ok && res.data?.data) {
      onShowAlert(`Retrieved institute: ${res.data.data.name} (${res.data.data.code})`, 'success');
    } else {
      onShowAlert(`GET /api/institutes/${selectedId} returned HTTP ${res.status}: ${res.data?.message || 'Error'}`, 'warning');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await api.createInstitute(form, token);
    setLoading(false);

    if (res.ok) {
      onShowAlert(`Institute created successfully: ${res.data?.data?.name}`, 'success');
      handleListInstitutes();
    } else {
      onShowAlert(`POST /api/institutes returned HTTP ${res.status}: ${res.data?.message || 'Failed to create'}`, res.status === 409 ? 'warning' : 'danger');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    setLoading(true);
    const res = await api.updateInstitute(selectedId, form, token);
    setLoading(false);

    if (res.ok) {
      onShowAlert(`Institute #${selectedId} updated successfully!`, 'success');
      handleListInstitutes();
    } else {
      onShowAlert(`PUT /api/institutes/${selectedId} returned HTTP ${res.status}: ${res.data?.message || 'Failed to update'}`, 'danger');
    }
  };

  return (
    <section className="card phase-console-card">
      <div className="card-header">
        <div className="card-title-row">
          <span className="card-icon">🏛️</span>
          <h2 className="card-title">Phase 2 — Institute Management Console</h2>
        </div>
        <div className="role-access-tags">
          <span className={`badge ${isAdmin ? 'badge-online' : 'badge-disabled'}`}>ADMIN: Full CRUD</span>
          <span className={`badge ${isInspector ? 'badge-online' : 'badge-disabled'}`}>INSPECTOR: Read Only</span>
          <span className={`badge ${isInstitute ? 'badge-offline' : 'badge-disabled'}`}>INSTITUTE: Forbidden (403)</span>
        </div>
      </div>

      {/* Query Bar */}
      <div className="action-toolbar">
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleListInstitutes}
          disabled={loading || !token}
        >
          📋 LIST ALL INSTITUTES (GET /api/institutes)
        </button>

        <div className="inline-input-group">
          <input
            type="number"
            className="form-control form-control-sm font-mono"
            style={{ width: '80px' }}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            placeholder="ID"
          />
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleGetById}
            disabled={loading || !token || !selectedId}
          >
            🔍 GET BY ID
          </button>
        </div>
      </div>

      {/* Institutes Table View */}
      {institutes.length > 0 && (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Name</th>
                <th>City / State</th>
                <th>Region</th>
                <th>Contact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {institutes.map((inst) => (
                <tr key={inst.id}>
                  <td><code>#{inst.id}</code></td>
                  <td><strong>{inst.code}</strong></td>
                  <td>{inst.name}</td>
                  <td>{inst.city}, {inst.state}</td>
                  <td>{inst.region}</td>
                  <td><span className="font-mono text-xs">{inst.contactEmail}</span></td>
                  <td><span className={`badge ${inst.status === 'ACTIVE' ? 'badge-active' : 'badge-disabled'}`}>{inst.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Create/Update Form */}
      {isAdmin ? (
        <form className="sub-form-box">
          <h4 className="form-heading">✍️ Create / Update Institute (ADMIN Only)</h4>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Institute Name</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Code (Unique)</label>
              <input
                type="text"
                className="form-control form-control-sm font-mono"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control form-control-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Region</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Email (Unique)</label>
              <input
                type="email"
                className="form-control form-control-sm"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-btn-row">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCreate}
              disabled={loading}
            >
              ➕ CREATE INSTITUTE (POST /api/institutes)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleUpdate}
              disabled={loading || !selectedId}
            >
              ✏️ UPDATE INSTITUTE #{selectedId} (PUT /api/institutes/{selectedId})
            </button>
          </div>
        </form>
      ) : (
        <div className="role-restriction-notice">
          <span>🔒 Institute creation and modification are restricted to <code>ROLE_ADMIN</code>. Current role: <strong>{role || 'ANONYMOUS'}</strong> (403 Expected for write operations).</span>
        </div>
      )}
    </section>
  );
}
