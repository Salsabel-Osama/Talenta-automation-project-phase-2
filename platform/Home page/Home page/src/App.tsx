import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PlatformSection } from './components/PlatformSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { AboutSection } from './components/AboutSection';
import { WorkspaceSection } from './components/WorkspaceSection';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { HRPage } from './pages/hr/HRPage';
import { ManagerPage } from './pages/manager/ManagerPage';
import { WorkspaceRole } from './types';

export default function App() {
  const [authenticatedRole, setAuthenticatedRole] = useState<WorkspaceRole | null>(() => {
    return (localStorage.getItem('talenta_auth_role') as WorkspaceRole) || null;
  });
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(() => {
    return localStorage.getItem('talenta_auth_user') || null;
  });

  const [currentView, setCurrentView] = useState<'landing' | 'hr_page' | 'manager_page'>('landing');
  const [loginModalState, setLoginModalState] = useState<{
    isOpen: boolean;
    initialRole: WorkspaceRole;
  }>({
    isOpen: false,
    initialRole: 'hr',
  });

  const handleOpenLogin = (role: WorkspaceRole = 'hr') => {
    setLoginModalState({
      isOpen: true,
      initialRole: role,
    });
  };

  const handleCloseLogin = () => {
    setLoginModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleLoginSuccess = (role: WorkspaceRole, username: string) => {
    setAuthenticatedRole(role);
    setAuthenticatedUser(username);
    localStorage.setItem('talenta_auth_role', role);
    localStorage.setItem('talenta_auth_user', username);
    setLoginModalState({ isOpen: false, initialRole: role });

    if (role === 'manager') {
      setCurrentView('manager_page');
    } else {
      setCurrentView('hr_page');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setAuthenticatedRole(null);
    setAuthenticatedUser(null);
    localStorage.removeItem('talenta_auth_role');
    localStorage.removeItem('talenta_auth_user');
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnterWorkspace = (role: WorkspaceRole) => {
    if (role === 'manager') {
      setCurrentView('manager_page');
    } else {
      setCurrentView('hr_page');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToWorkspaces = () => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById('workspaces');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const el = document.getElementById('workspaces');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPlatform = () => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById('platform');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const el = document.getElementById('platform');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1a0110] text-[#fdf4f8] antialiased selection:bg-[#FA1E71] selection:text-white">
      {/* Top Fixed Connected Navbar */}
      <Navbar
        authenticatedRole={authenticatedRole}
        authenticatedUser={authenticatedUser}
        onOpenLogin={(role) => handleOpenLogin(role || 'hr')}
        onGoToWorkspace={handleEnterWorkspace}
        onLogout={handleLogout}
        isViewingWorkspacePage={currentView !== 'landing'}
        onBackToHome={handleBackToHome}
      />

      {/* Main Content: Either HR Page, Manager Page, or Full Landing Overview */}
      <main className="flex-grow">
        {currentView === 'hr_page' && (
          <HRPage
            currentUser={authenticatedUser || 'trio'}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'manager_page' && (
          <ManagerPage
            currentUser={authenticatedUser || 'the triple s'}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'landing' && (
          <>
            {/* 1. Hero Section with 3D ThreeJS Interactive Matrix */}
            <HeroSection
              onExploreWorkspaces={scrollToWorkspaces}
              onExplorePlatform={scrollToPlatform}
            />

            {/* 2. The Talent Ecosystem & Platform Capabilities */}
            <PlatformSection />

            {/* 3. Deterministic How It Works Pipeline */}
            <HowItWorksSection />

            {/* 4. About & Guiding Ethical AI Philosophy */}
            <AboutSection />

            {/* 5. Role-Based Workspaces (Choose Section with Protected Login) */}
            <WorkspaceSection
              authenticatedRole={authenticatedRole}
              authenticatedUser={authenticatedUser}
              onRequestLogin={(role) => handleOpenLogin(role)}
              onEnterWorkspace={handleEnterWorkspace}
              onLogout={handleLogout}
            />
          </>
        )}
      </main>

      {/* Login Modal with Authentication Form */}
      <LoginModal
        isOpen={loginModalState.isOpen}
        initialRole={loginModalState.initialRole}
        onClose={handleCloseLogin}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Narrative-based Footer */}
      <Footer />
    </div>
  );
}
