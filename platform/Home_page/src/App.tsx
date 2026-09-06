import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PlatformSection } from './components/PlatformSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { AboutSection } from './components/AboutSection';
import { WorkspaceSection } from './components/WorkspaceSection';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { WorkspaceRole } from './types';

export default function App() {
  const [authenticatedRole, setAuthenticatedRole] =
    useState<WorkspaceRole | null>(() => {
      return (localStorage.getItem('talenta_auth_role') as WorkspaceRole) || null;
    });

  const [authenticatedUser, setAuthenticatedUser] =
    useState<string | null>(() => {
      return localStorage.getItem('talenta_auth_user') || null;
    });

  const [currentView, setCurrentView] = useState<'landing'>('landing');

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
    setLoginModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  const handleLoginSuccess = (
    role: WorkspaceRole,
    username: string
  ) => {
    setAuthenticatedRole(role);
    setAuthenticatedUser(username);

    localStorage.setItem('talenta_auth_role', role);
    localStorage.setItem('talenta_auth_user', username);

    setLoginModalState({
      isOpen: false,
      initialRole: role,
    });

    if (role === 'manager') {
      window.location.href = 'http://localhost:3002';
    } else {
      window.location.href = 'http://localhost:3001';
    }
  };

  const handleLogout = () => {
    setAuthenticatedRole(null);
    setAuthenticatedUser(null);

    localStorage.removeItem('talenta_auth_role');
    localStorage.removeItem('talenta_auth_user');

    setCurrentView('landing');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleEnterWorkspace = (role: WorkspaceRole) => {
    if (role === 'manager') {
      window.location.href = 'http://localhost:3002';
    } else {
      window.location.href = 'http://localhost:3001';
    }
  };

  const handleBackToHome = () => {
    setCurrentView('landing');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToWorkspaces = () => {
    const el = document.getElementById('workspaces');

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  const scrollToPlatform = () => {
    const el = document.getElementById('platform');

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1a0110] text-[#fdf4f8] antialiased selection:bg-[#FA1E71] selection:text-white">

      <Navbar
        authenticatedRole={authenticatedRole}
        authenticatedUser={authenticatedUser}
        onOpenLogin={(role) => handleOpenLogin(role || 'hr')}
        onGoToWorkspace={handleEnterWorkspace}
        onLogout={handleLogout}
        isViewingWorkspacePage={false}
        onBackToHome={handleBackToHome}
      />

      <main className="flex-grow">

        <HeroSection
          onExploreWorkspaces={scrollToWorkspaces}
          onExplorePlatform={scrollToPlatform}
        />

        <PlatformSection />

        <HowItWorksSection />

        <AboutSection />

        <WorkspaceSection
          authenticatedRole={authenticatedRole}
          authenticatedUser={authenticatedUser}
          onRequestLogin={(role) => handleOpenLogin(role)}
          onEnterWorkspace={handleEnterWorkspace}
          onLogout={handleLogout}
        />

      </main>

      <LoginModal
        isOpen={loginModalState.isOpen}
        initialRole={loginModalState.initialRole}
        onClose={handleCloseLogin}
        onLoginSuccess={handleLoginSuccess}
      />

      <Footer />

    </div>
  );
}