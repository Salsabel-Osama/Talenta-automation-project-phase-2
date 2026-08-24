import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, User, LogOut, ShieldCheck } from 'lucide-react';
import { NavItem, WorkspaceRole } from '../types';
import talentaLogo from '../assets/images/talenta_exact_logo_1787547708095.jpg';

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'platform', label: 'Platform', href: '#platform' },
  { id: 'how-it-works', label: 'How It Works', href: '#how-it-works' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'workspaces', label: 'Workspaces', href: '#workspaces' },
];

interface NavbarProps {
  authenticatedRole: WorkspaceRole | null;
  authenticatedUser: string | null;
  onOpenLogin: (role?: WorkspaceRole) => void;
  onGoToWorkspace: (role: WorkspaceRole) => void;
  onLogout: () => void;
  isViewingWorkspacePage: boolean;
  onBackToHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  authenticatedRole,
  authenticatedUser,
  onOpenLogin,
  onGoToWorkspace,
  onLogout,
  isViewingWorkspacePage,
  onBackToHome,
}) => {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      // Smart navbar: hide when scrolling down past 120px, reveal when scrolling up or at top
      if (currentScrollY <= 100) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setVisible(true);
      }
      lastScrollY = currentScrollY;

      if (!isViewingWorkspacePage) {
        const sectionElements = NAV_ITEMS.map((item) => ({
          id: item.id,
          el: document.getElementById(item.id),
        }));

        const scrollPosition = currentScrollY + 200;

        for (let i = sectionElements.length - 1; i >= 0; i--) {
          const item = sectionElements[i];
          if (item.el) {
            const top = item.el.offsetTop;
            if (scrollPosition >= top) {
              setActiveSection(item.id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isViewingWorkspacePage]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (isViewingWorkspacePage) {
      onBackToHome();
      setTimeout(() => {
        const targetId = href.replace('#', '');
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveSection(targetId);
    }
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      } ${
        scrolled || isViewingWorkspacePage ? 'glass-nav py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo & Brand Name */}
          <a
            href="#home"
            onClick={(e) => scrollToSection(e, '#home')}
            className="flex-shrink-0 flex items-center gap-3 cursor-pointer group"
          >
            <img
              src={talentaLogo}
              alt="Talenta Partners Logo"
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-xl drop-shadow-[0_0_15px_rgba(250,30,113,0.6)] group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <span className="font-bold text-2xl tracking-tight text-[#fdf4f8] group-hover:text-[#FA1E71] transition-colors">
              Talenta Partners
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-surface-bright/40 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
            {isViewingWorkspacePage ? (
              <button
                type="button"
                onClick={onBackToHome}
                className="px-4 py-1.5 rounded-full text-sm font-medium text-[#d9c6d1] hover:text-[#fdf4f8] hover:bg-white/5 cursor-pointer"
              >
                ← Back to Overview
              </button>
            ) : (
              NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => scrollToSection(e, item.href)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#FA1E71] text-white shadow-[0_0_15px_rgba(250,30,113,0.4)]'
                        : 'text-[#d9c6d1] hover:text-[#fdf4f8] hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })
            )}
          </nav>

          {/* Actions / Auth Status */}
          <div className="hidden md:flex items-center space-x-3">
            {authenticatedRole ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onGoToWorkspace(authenticatedRole)}
                  className="inline-flex items-center gap-2 bg-[#FA1E71] hover:bg-[#ff4d94] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-[0_0_18px_rgba(250,30,113,0.4)] cursor-pointer"
                >
                  <span>
                    {authenticatedRole === 'manager' ? 'Manager Room' : 'HR Console'} ({authenticatedUser})
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#d9c6d1] hover:text-white transition-colors cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenLogin('hr')}
                  className="inline-flex items-center gap-1.5 bg-surface-bright/60 hover:bg-surface-bright text-[#d9c6d1] hover:text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-white/10 transition-all cursor-pointer"
                >
                  <span>HR Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenLogin('manager')}
                  className="inline-flex items-center gap-2 bg-[#FA1E71] hover:bg-[#ff4d94] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-[0_0_18px_rgba(250,30,113,0.35)] cursor-pointer"
                >
                  <span>Manager Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#d9c6d1] hover:text-white p-2 rounded-lg bg-surface-bright/50 border border-white/10"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-nav border-t border-white/10 px-4 pt-4 pb-6 space-y-3 mt-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2">
            {isViewingWorkspacePage ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBackToHome();
                }}
                className="text-left px-4 py-2.5 rounded-xl text-base font-medium text-white hover:bg-white/5"
              >
                ← Back to Overview
              </button>
            ) : (
              NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => scrollToSection(e, item.href)}
                    className={`px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-[#FA1E71] text-white font-semibold'
                        : 'text-[#d9c6d1] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            {authenticatedRole ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onGoToWorkspace(authenticatedRole);
                  }}
                  className="w-full text-center bg-[#FA1E71] hover:bg-[#ff4d94] text-white font-semibold py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(250,30,113,0.4)]"
                >
                  Open {authenticatedRole === 'manager' ? 'Manager Room' : 'HR Console'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-center bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-4 rounded-xl"
                >
                  Log Out ({authenticatedUser})
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin('hr');
                  }}
                  className="w-full text-center bg-surface-bright hover:bg-surface-bright/80 text-white font-semibold py-3 px-4 rounded-xl border border-white/10"
                >
                  Login as HR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin('manager');
                  }}
                  className="w-full text-center bg-[#FA1E71] hover:bg-[#ff4d94] text-white font-semibold py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(250,30,113,0.4)]"
                >
                  Login as Manager
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
