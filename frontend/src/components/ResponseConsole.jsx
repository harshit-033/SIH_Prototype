import React from 'react';

export default function ResponseConsole({ consoleState, onClearConsole }) {
  const { status, statusText, latency, output } = consoleState;

  const getStatusBadgeClass = () => {
    if (status === 200) return 'http-badge status-200';
    if (status === 400) return 'http-badge status-400';
    if (status === 401) return 'http-badge status-401';
    if (status === 403) return 'http-badge status-403';
    return 'http-badge status-init';
  };

  return (
    <section className="card console-card">
      <div className="console-header">
        <div className="console-title-group">
          <span className="console-dot green"></span>
          <span className="console-dot yellow"></span>
          <span className="console-dot red"></span>
          <h3 className="console-title">Live HTTP Response Inspector</h3>
        </div>
        <div className="console-meta">
          <span className={getStatusBadgeClass()}>
            {status ? `${status} ${statusText}` : statusText || 'IDLE'}
          </span>
          <span className="latency-badge">{latency} ms</span>
          <button className="btn-ghost btn-sm" onClick={onClearConsole}>
            Clear
          </button>
        </div>
      </div>
      <div className="console-body">
        <pre className="console-output">
          {output || '// Awaiting HTTP request... Click any demo card or submit credentials to view response payload.'}
        </pre>
      </div>
    </section>
  );
}
