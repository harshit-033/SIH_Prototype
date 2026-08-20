import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import UnifiedWorkflow from './components/UnifiedWorkflow';
import LoginModal from './components/LoginModal';

// Pages
import UniversityDashboard from './pages/UniversityDashboard';
import InspectorDashboard from './pages/InspectorDashboard';
import EvidenceReviewPage from './pages/EvidenceReviewPage';
import ExpectedVsActualPage from './pages/ExpectedVsActualPage';
import FindingsPage from './pages/FindingsPage';
import LabsPage from './pages/LabsPage';
import AssetInventoryPage from './pages/AssetInventoryPage';
import LiveTelemetryPage from './pages/LiveTelemetryPage';
import DocumentsPage from './pages/DocumentsPage';
import CollegeDashboard from './pages/CollegeDashboard';
import CollegeFacultyPage from './pages/CollegeFacultyPage';
import CollegeLabPage from './pages/CollegeLabPage';
import CorrectiveActionsPage from './pages/CorrectiveActionsPage';
import ReportsPage from './pages/ReportsPage';

// Data & Services
import { 
  MOCK_INSTITUTIONS, 
  ACTIVE_INSPECTION_DETAIL, 
  MOCK_FINDINGS, 
  MOCK_CORRECTIVE_ACTIONS,
  MOCK_ASSETS,
  MOCK_LABS
} from './data/mockData';
import { fetchServerStatus } from './services/scannerService';
import { checkBackendHealth } from './services/apiClient';
import { getStoredAuth, logoutUser } from './services/authService';

export default function App() {
  const [currentRole, setCurrentRole] = useState('inspector'); // 'university' | 'inspector' | 'college'
  const [activePage, setActivePage] = useState('inspector_workspace');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = getStoredAuth();
    return stored ? stored.user : {
      id: 2,
      email: 'inspector@sih.gov.in',
      role: 'ROLE_INSPECTOR',
      status: 'ACTIVE'
    };
  });

  // Services health state
  const [scannerStatus, setScannerStatus] = useState({ online: false, clients: 0 });
  const [backendStatus, setBackendStatus] = useState({ online: false, status: 'OFFLINE' });

  // Data State
  const [institutions, setInstitutions] = useState(MOCK_INSTITUTIONS);
  const [activeInstitution, setActiveInstitution] = useState(MOCK_INSTITUTIONS[0]);
  const [findings, setFindings] = useState(MOCK_FINDINGS);
  const [correctiveActions, setCorrectiveActions] = useState(MOCK_CORRECTIVE_ACTIONS);

  // Poll Scanner and Spring Boot Backend Health
  useEffect(() => {
    const checkServices = async () => {
      const [scanner, backend] = await Promise.all([
        fetchServerStatus(),
        checkBackendHealth()
      ]);
      setScannerStatus(scanner);
      setBackendStatus(backend);
    };

    checkServices();
    const interval = setInterval(checkServices, 4000);
    return () => clearInterval(interval);
  }, []);

  // When role changes manually from UI
  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    if (newRole === 'university') {
      setActivePage('university_dashboard');
      setCurrentUser(prev => ({ ...prev, role: 'ROLE_ADMIN', email: 'admin@sih.gov.in' }));
    } else if (newRole === 'inspector') {
      setActivePage('inspector_workspace');
      setCurrentUser(prev => ({ ...prev, role: 'ROLE_INSPECTOR', email: 'inspector@sih.gov.in' }));
    } else if (newRole === 'college') {
      setActivePage('college_dashboard');
      setCurrentUser(prev => ({ ...prev, role: 'ROLE_INSTITUTE', email: 'institute@sih.gov.in' }));
    }
  };

  // When user signs in via LoginModal
  const handleLoginSuccess = (loginResult) => {
    const user = loginResult.user;
    setCurrentUser(user);

    if (user.role === 'ROLE_ADMIN') {
      setCurrentRole('university');
      setActivePage('university_dashboard');
    } else if (user.role === 'ROLE_INSTITUTE') {
      setCurrentRole('college');
      setActivePage('college_dashboard');
    } else {
      setCurrentRole('inspector');
      setActivePage('inspector_workspace');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        scannerStatus={scannerStatus}
        backendStatus={backendStatus}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        activeInstitution={activeInstitution}
        onInstitutionChange={setActiveInstitution}
        institutions={institutions}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentRole={currentRole}
          activePage={activePage}
          onNavigate={(page) => setActivePage(page)}
          findingCount={findings.length}
          actionCount={correctiveActions.length}
        />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* UNIVERSITY ROLE PAGES */}
          {activePage === 'university_dashboard' && (
            <UniversityDashboard
              institutions={institutions}
              onSelectInstitution={setActiveInstitution}
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {activePage === 'institutions' && (
            <UniversityDashboard
              institutions={institutions}
              onSelectInstitution={setActiveInstitution}
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {activePage === 'inspections' && (
            <InspectorDashboard
              inspection={ACTIVE_INSPECTION_DETAIL}
              findings={findings}
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {activePage === 'analytics' && (
            <UniversityDashboard
              institutions={institutions}
              onSelectInstitution={setActiveInstitution}
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {/* INSPECTOR ROLE PAGES */}
          {activePage === 'inspector_workspace' && (
            <InspectorDashboard
              inspection={ACTIVE_INSPECTION_DETAIL}
              findings={findings}
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {activePage === 'workflow' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-outfit">
                  Unified Inspection Pipeline &amp; Stage Flow
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interactive representation of sensory detection, automated reconciliation, human adjudications, and remediation loops.
                </p>
              </div>
              <UnifiedWorkflow onNavigateStep={(page) => setActivePage(page)} />
            </div>
          )}

          {activePage === 'evidence' && (
            <EvidenceReviewPage />
          )}

          {activePage === 'reconciliation' && (
            <ExpectedVsActualPage
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {activePage === 'findings' && (
            <FindingsPage
              findings={findings}
              onUpdateFindings={setFindings}
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {activePage === 'laboratories' && (
            <LabsPage
              labs={MOCK_LABS}
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {activePage === 'telemetry' && (
            <LiveTelemetryPage />
          )}

          {/* COLLEGE ROLE PAGES */}
          {activePage === 'college_dashboard' && (
            <CollegeDashboard
              institution={activeInstitution}
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {activePage === 'college_faculty' && (
            <CollegeFacultyPage />
          )}

          {activePage === 'college_labs' && (
            <CollegeLabPage />
          )}

          {activePage === 'assets' && (
            <AssetInventoryPage
              assets={MOCK_ASSETS}
            />
          )}

          {activePage === 'documents' && (
            <DocumentsPage />
          )}

          {activePage === 'corrective_actions' && (
            <CorrectiveActionsPage
              actions={correctiveActions}
            />
          )}

          {/* REPORTS (SHARED) */}
          {activePage === 'reports' && (
            <ReportsPage
              inspection={ACTIVE_INSPECTION_DETAIL}
              findings={findings}
            />
          )}

        </main>
      </div>

      {/* Login & Role Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        backendOnline={backendStatus.online}
      />
    </div>
  );
}
