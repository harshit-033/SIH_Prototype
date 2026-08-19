import React, { useState, useEffect } from 'react';
import { subscribeToLogs, clearRequestHistory } from '../services/apiClient';

export default function RequestHistoryConsole() {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToLogs((updatedLogs) => {
      setLogs(updatedLogs);
      if (updatedLogs.length > 0 && !selectedLog) {
        setSelectedLog(updatedLogs[0]);
      }
    });
    return unsubscribe;
  }, [selectedLog]);

  const getStatusBadge = (status) => {
    if (status >= 200 && status < 300) return 'status-badge-200';
    if (status === 400) return 'status-badge-400';
    if (status === 401) return 'status-badge-401';
    if (status === 403) return 'status-badge-403';
    if (status === 404) return 'status-badge-404';
    if (status === 409) return 'status-badge-409';
    return 'status-badge-err';
  };

  const getMethodBadge = (method) => {
    switch (method) {
      case 'GET': return 'method-get';
      case 'POST': return 'method-post';
      case 'PUT': return 'method-put';
      case 'DELETE': return 'method-delete';
      default: return 'method-get';
    }
  };

  return (
    <section className="card request-history-card">
      <div className="card-header">
        <div className="card-title-row">
          <span className="card-icon">📡</span>
          <h2 className="card-title">Live API Request & Response Debug Console</h2>
        </div>
        <div className="header-actions">
          <span className="count-pill">{logs.length} Requests Logged</span>
          <button className="btn btn-ghost btn-sm" onClick={clearRequestHistory}>
            Clear History
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <p>// Awaiting HTTP traffic... Click any Phase 1, Phase 2, or Phase 3 action to capture live wire traffic.</p>
        </div>
      ) : (
        <div className="console-split-grid">
          {/* History Sidebar */}
          <div className="history-list-box">
            <span className="history-sublabel">Execution History (Latest 50):</span>
            <div className="history-scroll-list">
              {logs.map((entry) => (
                <div
                  key={entry.id}
                  className={`history-item ${selectedLog?.id === entry.id ? 'active' : ''}`}
                  onClick={() => setSelectedLog(entry)}
                >
                  <div className="item-top-row">
                    <span className={`method-badge ${getMethodBadge(entry.method)}`}>{entry.method}</span>
                    <span className={`status-badge-pill ${getStatusBadge(entry.status)}`}>
                      {entry.status || 'ERR'}
                    </span>
                    <span className="latency-text">{entry.latency} ms</span>
                  </div>
                  <div className="item-bottom-row">
                    <span className="path-text font-mono">{entry.path}</span>
                    <span className="time-text">{entry.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Inspector View */}
          <div className="detail-view-box">
            {selectedLog ? (
              <>
                <div className="detail-header-row">
                  <span className={`method-badge ${getMethodBadge(selectedLog.method)}`}>
                    {selectedLog.method}
                  </span>
                  <span className="detail-url font-mono">{selectedLog.url}</span>
                  <span className={`status-badge-pill ${getStatusBadge(selectedLog.status)}`}>
                    HTTP {selectedLog.status} {selectedLog.statusText}
                  </span>
                  <span className="latency-text">⏱️ {selectedLog.latency} ms</span>
                </div>

                <div className="wire-section">
                  <h4 className="wire-heading">📤 HTTP REQUEST HEADERS & BODY</h4>
                  <pre className="code-block font-mono">
                    {`Authorization: ${selectedLog.headers['Authorization'] || 'None (Unauthenticated)'}\nContent-Type: ${selectedLog.headers['Content-Type'] || 'application/json'}\nAccept: ${selectedLog.headers['Accept'] || 'application/json'}${selectedLog.body ? `\n\n[Request Payload Body]:\n${selectedLog.body}` : ''}`}
                  </pre>
                </div>

                <div className="wire-section">
                  <h4 className="wire-heading">📥 HTTP RESPONSE BODY (SPRING BOOT JSON)</h4>
                  <pre className="code-block font-mono">
                    {JSON.stringify(selectedLog.responseBody, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>Select a request from the left column to inspect raw headers, payload, and response.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
