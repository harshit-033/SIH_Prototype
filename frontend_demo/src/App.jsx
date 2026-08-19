import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import DevConsoleHeader from './components/DevConsoleHeader';
import AuthStatusCard from './components/AuthStatusCard';
import JwtInspector from './components/JwtInspector';
import RoleAuthorizationVisualizer from './components/RoleAuthorizationVisualizer';
import SecurityFlowDiagram from './components/SecurityFlowDiagram';
import Phase1AuthConsole from './components/Phase1AuthConsole';
import Phase2InstitutesConsole from './components/Phase2InstitutesConsole';
import Phase3AssignmentsConsole from './components/Phase3AssignmentsConsole';
import RequestHistoryConsole from './components/RequestHistoryConsole';
import ErrorExplainer from './components/ErrorExplainer';
import AlertBanner from './components/AlertBanner';
import SqlReference from './components/SqlReference';
import { api } from './services/apiClient';
import { parseJwt } from './utils/jwtUtils';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const FRONTEND_URL = window.location.origin || 'http://localhost:5173';

export default function App() {
  const [serverStatus, setServerStatus] = useState({
    status: 'pinging',
    latency: 0
  });

  const [activeSession, setActiveSession] = useState(null);
  const [alert, setAlert] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 6000);
  };

  // Check Backend Health
  const checkHealth = useCallback(async () => {
    try {
      const res = await api.checkHealth();
      if (res.ok) {
        setServerStatus({ status: 'online', latency: res.latency });
      } else {
        setServerStatus({ status: 'offline', latency: res.latency });
      }
    } catch {
      setServerStatus({ status: 'offline', latency: 0 });
    }
  }, []);

  // Restore stored session on mount
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);

    const savedToken = localStorage.getItem('sih_auth_token');
    if (savedToken) {
      const parsed = parseJwt(savedToken);
      if (parsed && parsed.isValid && !parsed.isExpired) {
        setActiveSession({
          token: savedToken,
          user: {
            userId: parsed.payload.userId || null,
            email: parsed.payload.sub || 'user@sih.gov.in',
            role: parsed.payload.role || 'ADMIN',
            status: parsed.payload.status || 'ACTIVE'
          },
          parsedJwt: parsed
        });
      } else {
        localStorage.removeItem('sih_auth_token');
      }
    }

    return () => clearInterval(interval);
  }, [checkHealth]);

  // Handle Login Success
  const handleLoginSuccess = (loginData) => {
    const parsed = parseJwt(loginData.token);
    localStorage.setItem('sih_auth_token', loginData.token);

    setActiveSession({
      token: loginData.token,
      user: {
        userId: loginData.userId,
        email: loginData.email,
        role: loginData.role,
        status: loginData.status
      },
      parsedJwt: parsed
    });
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('sih_auth_token');
    setActiveSession(null);
    showAlert('Logged out and cleared active token from localStorage.', 'info');
  };

  // Seed Database
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    const res = await api.seedUsers();
    setIsSeeding(false);

    if (res.ok) {
      showAlert('All demo accounts seeded into PostgreSQL database!', 'success');
    } else {
      showAlert(`Seeding failed: ${res.data?.message || 'Error'}`, 'warning');
    }
  };

  const handleCopyToken = () => {
    if (activeSession?.token) {
      navigator.clipboard.writeText(activeSession.token);
      showAlert('JWT Token copied to clipboard!', 'success');
    }
  };

  const handleCopySql = (sqlText) => {
    navigator.clipboard.writeText(sqlText);
    showAlert('SQL reference copied to clipboard!', 'success');
  };

  return (
    <div className="app-wrapper">
      {/* Background Visual Effects */}
      <div className="glow-sphere sphere-1"></div>
      <div className="glow-sphere sphere-2"></div>

      {/* Development Console Header */}
      <DevConsoleHeader
        serverStatus={serverStatus}
        backendUrl={BACKEND_URL}
        frontendUrl={FRONTEND_URL}
        onSeedDatabase={handleSeedDatabase}
        isSeeding={isSeeding}
      />

      <main className="main-container">
        {/* Toast Alert */}
        <AlertBanner alert={alert} onClose={() => setAlert(null)} />

        {/* 1. Main Authentication & Identity Status */}
        <AuthStatusCard
          activeSession={activeSession}
          onLogout={handleLogout}
          onCopyToken={handleCopyToken}
        />

        {/* 2. Live Request History & Raw Wire Inspector */}
        <RequestHistoryConsole />

        {/* 3. Phase 1 — Auth & Security Console */}
        <Phase1AuthConsole
          activeSession={activeSession}
          onLoginSuccess={handleLoginSuccess}
          onShowAlert={showAlert}
        />

        {/* 4. Phase 2 — Institutes Console */}
        <Phase2InstitutesConsole
          activeSession={activeSession}
          onShowAlert={showAlert}
        />

        {/* 5. Phase 3 — Assignments Console */}
        <Phase3AssignmentsConsole
          activeSession={activeSession}
          onShowAlert={showAlert}
        />

        {/* 6. JWT Claims & Storage Inspector */}
        <JwtInspector
          activeSession={activeSession}
          onCopyToken={handleCopyToken}
          onLogout={handleLogout}
        />

        {/* 7. RBAC Permission Matrix */}
        <RoleAuthorizationVisualizer activeRole={activeSession?.user?.role} />

        {/* 8. Security Architecture Flow */}
        <SecurityFlowDiagram />

        {/* 9. HTTP Response Status Codes Explainer */}
        <ErrorExplainer />

        {/* 10. PostgreSQL Reference */}
        <SqlReference onCopySql={handleCopySql} />
      </main>

      <footer className="dev-footer">
        <p>
          SIH Institute Inspection System • Development Console (Spring Boot 4 + React 19 + PostgreSQL 18 + Spring Security 7)
        </p>
      </footer>
    </div>
  );
}
