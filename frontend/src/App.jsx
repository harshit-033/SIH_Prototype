import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import RoleCard from './components/RoleCard';
import LoginForm from './components/LoginForm';
import SessionInspector from './components/SessionInspector';
import ResponseConsole from './components/ResponseConsole';
import SqlReference from './components/SqlReference';
import AlertBanner from './components/AlertBanner';

const API_BASE_URL = 'http://localhost:8080';

const DEMO_ROLES = [
  {
    id: 1,
    title: 'System Administrator',
    email: 'admin@sih.gov.in',
    role: 'ADMIN',
    status: 'ACTIVE',
    badgeClass: 'badge-admin',
    isBlocked: false
  },
  {
    id: 2,
    title: 'Expert Visit Inspector',
    email: 'inspector@sih.gov.in',
    role: 'INSPECTOR',
    status: 'ACTIVE',
    badgeClass: 'badge-inspector',
    isBlocked: false
  },
  {
    id: 3,
    title: 'Institute Representative',
    email: 'institute@sih.gov.in',
    role: 'INSTITUTE',
    status: 'ACTIVE',
    badgeClass: 'badge-institute',
    isBlocked: false
  },
  {
    id: 4,
    title: 'Deactivated Account',
    email: 'disabled@sih.gov.in',
    role: 'INSTITUTE',
    status: 'DISABLED',
    badgeClass: 'badge-disabled-role',
    isBlocked: true
  }
];

export default function App() {
  const [serverStatus, setServerStatus] = useState({
    status: 'pinging',
    message: 'Checking Backend (8080)...'
  });

  const [email, setEmail] = useState('inspector@sih.gov.in');
  const [password, setPassword] = useState('Password@123');

  const [activeSession, setActiveSession] = useState(null);
  const [consoleState, setConsoleState] = useState({
    status: 0,
    statusText: 'IDLE',
    latency: 0,
    output: '// Awaiting HTTP request... Click any demo card or submit credentials to view response payload.'
  });

  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isTestingProtected, setIsTestingProtected] = useState(false);

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 6000);
  };

  // Check Backend Health
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/actuator/health`, { method: 'GET' });
      if (res.ok) {
        setServerStatus({ status: 'online', message: 'Backend Online (Port 8080)' });
      } else {
        setServerStatus({ status: 'pinging', message: `Backend HTTP ${res.status}` });
      }
    } catch {
      setServerStatus({ status: 'offline', message: 'Backend Offline (Start ./mvnw spring-boot:run)' });
    }
  }, []);

  // Parse JWT token claims
  const parseJwt = (token) => {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const expDate = payload.exp ? new Date(payload.exp * 1000) : null;
        const remainingMinutes = expDate ? Math.max(0, Math.round((expDate - new Date()) / 60000)) : 0;
        return {
          payload,
          expiryTimeFormatted: expDate ? expDate.toLocaleTimeString() : null,
          remainingMinutes
        };
      }
    } catch {
      return { payload: { error: 'Invalid JWT structure' }, expiryTimeFormatted: null, remainingMinutes: 0 };
    }
    return null;
  };

  // Restore stored session
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);

    const savedToken = localStorage.getItem('sih_auth_token');
    if (savedToken) {
      const parsed = parseJwt(savedToken);
      if (parsed && parsed.payload.exp && parsed.payload.exp * 1000 > Date.now()) {
        setActiveSession({
          token: savedToken,
          user: {
            userId: parsed.payload.userId || 1,
            email: parsed.payload.sub || 'user@sih.gov.in',
            role: parsed.payload.role || 'ADMIN',
            status: parsed.payload.status || 'ACTIVE'
          },
          claims: parsed.payload,
          expiryTimeFormatted: parsed.expiryTimeFormatted,
          remainingMinutes: parsed.remainingMinutes
        });
      } else {
        localStorage.removeItem('sih_auth_token');
      }
    }

    return () => clearInterval(interval);
  }, [checkHealth]);

  // Handle Login Request
  const handleLogin = async (loginEmail, loginPassword) => {
    setIsSubmitting(true);
    const startTime = performance.now();

    const requestLog = `>>> POST /api/auth/login\n>>> Payload:\n${JSON.stringify({ email: loginEmail, password: '••••••••' }, null, 2)}`;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const latency = Math.round(performance.now() - startTime);
      const data = await res.json();

      setConsoleState({
        status: res.status,
        statusText: res.statusText || (res.ok ? 'OK' : 'ERROR'),
        latency,
        output: `${requestLog}\n\n<<< HTTP/1.1 ${res.status} ${res.statusText}\n<<< Latency: ${latency} ms\n<<< Body:\n${JSON.stringify(data, null, 2)}`
      });

      if (res.ok && data.success && data.data?.token) {
        const loginData = data.data;
        const parsed = parseJwt(loginData.token);
        localStorage.setItem('sih_auth_token', loginData.token);

        setActiveSession({
          token: loginData.token,
          user: loginData,
          claims: parsed ? parsed.payload : {},
          expiryTimeFormatted: parsed ? parsed.expiryTimeFormatted : null,
          remainingMinutes: parsed ? parsed.remainingMinutes : 0
        });

        showAlert(`Authentication successful for ${loginData.email}!`, 'success');
      } else {
        if (res.status === 403) {
          showAlert(`Access Rejected: ${data.message || 'Account disabled'}`, 'warning');
        } else if (res.status === 401) {
          showAlert(`Authentication Failed: ${data.message || 'Invalid credentials'}`, 'danger');
        } else if (res.status === 400) {
          showAlert(`Validation Failed: ${data.errors ? data.errors[0]?.message : data.message}`, 'warning');
        }
      }
    } catch (err) {
      const latency = Math.round(performance.now() - startTime);
      setConsoleState({
        status: 0,
        statusText: 'CONNECTION REFUSED',
        latency,
        output: `${requestLog}\n\n<<< Network Error: Failed to reach backend at ${API_BASE_URL}\n<<< Make sure the Spring Boot backend is running on port 8080.\n<<< Error: ${err.message}`
      });
      showAlert('Could not connect to backend. Verify Spring Boot is running on port 8080.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Seed Database
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/seed`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();

      setConsoleState({
        status: res.status,
        statusText: res.statusText || 'OK',
        latency: 0,
        output: `>>> POST /api/auth/seed\n<<< HTTP/1.1 ${res.status}\n${JSON.stringify(data, null, 2)}`
      });

      if (res.ok) {
        showAlert('All 5 demo users seeded into PostgreSQL database!', 'success');
      } else {
        showAlert(`Seeding failed: ${data.message}`, 'warning');
      }
    } catch {
      showAlert('Failed to connect to backend for database seeding.', 'danger');
    } finally {
      setIsSeeding(false);
    }
  };

  // Test Protected /api/auth/me
  const handleTestProtected = async (tokenToUse, isTampered = false) => {
    setIsTestingProtected(true);
    const startTime = performance.now();
    const requestLog = `>>> GET /api/auth/me\n>>> Header: Authorization: Bearer ${tokenToUse.substring(0, 15)}...${isTampered ? ' [TAMPERED TOKEN]' : ''}`;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
          'Accept': 'application/json'
        }
      });

      const latency = Math.round(performance.now() - startTime);
      const data = await res.json();

      setConsoleState({
        status: res.status,
        statusText: res.statusText || (res.ok ? 'OK' : 'UNAUTHORIZED'),
        latency,
        output: `${requestLog}\n\n<<< HTTP/1.1 ${res.status} ${res.statusText}\n<<< Latency: ${latency} ms\n<<< Body:\n${JSON.stringify(data, null, 2)}`
      });

      if (res.ok) {
        showAlert(`Protected endpoint verified: Authenticated as ${data.data?.email}`, 'success');
      } else {
        showAlert(`Protected Endpoint: ${res.status} Unauthorized (${data.message || 'Token Rejected'})`, 'warning');
      }
    } catch {
      showAlert('Error executing protected request to backend.', 'danger');
    } finally {
      setIsTestingProtected(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('sih_auth_token');
    setActiveSession(null);
    showAlert('Logged out and cleared active token.', 'info');
  };

  // Copy helpers
  const handleCopyToken = () => {
    if (activeSession?.token) {
      navigator.clipboard.writeText(activeSession.token);
      showAlert('JWT Token copied to clipboard!', 'success');
    }
  };

  const handleCopySql = (sqlText) => {
    navigator.clipboard.writeText(sqlText);
    showAlert('All SQL Seed Statements copied to clipboard!', 'success');
  };

  const handleApplyPreset = (presetEmail, presetPassword, label) => {
    setEmail(presetEmail);
    setPassword(presetPassword);
    showAlert(`Applied preset: ${label}`, 'info');
    handleLogin(presetEmail, presetPassword);
  };

  const handleFillForm = (fillEmail, fillPassword) => {
    setEmail(fillEmail);
    setPassword(fillPassword);
    showAlert(`Filled credentials for ${fillEmail}`, 'info');
  };

  return (
    <>
      {/* Background Glow FX */}
      <div className="glow-sphere sphere-1"></div>
      <div className="glow-sphere sphere-2"></div>

      {/* Navbar */}
      <Navbar
        serverStatus={serverStatus}
        onSeedDatabase={handleSeedDatabase}
        isSeeding={isSeeding}
      />

      <main className="container">
        {/* Toast Alert */}
        <AlertBanner alert={alert} onClose={() => setAlert(null)} />

        {/* Quick Role Cards */}
        <section>
          <div className="section-header">
            <div>
              <h2 className="section-title">Pre-Configured Demo Accounts</h2>
              <p className="section-desc">
                Click any card to instantly test authentication or fill the login form with realistic roles.
              </p>
            </div>
          </div>

          <div className="role-cards-grid">
            {DEMO_ROLES.map((roleInfo) => (
              <RoleCard
                key={roleInfo.id}
                roleInfo={roleInfo}
                onQuickLogin={handleLogin}
                onFillForm={handleFillForm}
                isSubmitting={isSubmitting}
              />
            ))}
          </div>
        </section>

        {/* Form + Session Grid */}
        <div className="two-col-grid">
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={handleLogin}
            isSubmitting={isSubmitting}
            onApplyPreset={handleApplyPreset}
          />

          <SessionInspector
            activeSession={activeSession}
            onTestProtectedMe={(token) => handleTestProtected(token, false)}
            onTestTamperedToken={(token) => handleTestProtected(token.slice(0, -5) + 'fakeX', true)}
            onLogout={handleLogout}
            onCopyToken={handleCopyToken}
            isTestingProtected={isTestingProtected}
          />
        </div>

        {/* Response Console */}
        <ResponseConsole
          consoleState={consoleState}
          onClearConsole={() =>
            setConsoleState({
              status: 0,
              statusText: 'CLEARED',
              latency: 0,
              output: '// Console cleared.'
            })
          }
        />

        {/* PostgreSQL Command Reference */}
        <SqlReference onCopySql={handleCopySql} />
      </main>

      <footer className="footer">
        <p>
          SIH Institute Inspection & Expert Visit Committee Management System • Spring Boot 4 + React + Spring Security 7 + JWT
        </p>
      </footer>
    </>
  );
}
