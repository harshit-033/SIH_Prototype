import React from 'react';

export default function AlertBanner({ alert, onClose }) {
  if (!alert || !alert.message) return null;

  const getAlertClass = () => {
    if (alert.type === 'success') return 'alert-banner alert-success';
    if (alert.type === 'danger') return 'alert-banner alert-danger';
    if (alert.type === 'warning') return 'alert-banner alert-warning';
    return 'alert-banner';
  };

  const getAlertIcon = () => {
    if (alert.type === 'success') return '✅';
    if (alert.type === 'danger') return '❌';
    if (alert.type === 'warning') return '⚠️';
    return 'ℹ️';
  };

  return (
    <div className={getAlertClass()}>
      <div className="alert-content">
        <span>{getAlertIcon()}</span>
        <span>{alert.message}</span>
      </div>
      <button className="alert-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}
