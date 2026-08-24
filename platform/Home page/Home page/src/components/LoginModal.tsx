import React, { useState, useEffect } from 'react';
import { WorkspaceRole } from '../types';
import { X, Lock, User, KeyRound, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  initialRole?: WorkspaceRole | null;
  onClose: () => void;
  onLoginSuccess: (role: WorkspaceRole, username: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  initialRole = 'hr',
  onClose,
  onLoginSuccess,
}) => {
  const [selectedRole, setSelectedRole] = useState<WorkspaceRole>('hr');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
    setErrorMessage(null);
    setUsername('');
    setPassword('');
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const handleRoleTabChange = (role: WorkspaceRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    setTimeout(() => {
      setIsLoading(false);

      // Check for Manager credentials
      const isManagerMatch =
        (cleanUser === 'the triple s' || cleanUser === 'thetriples') && cleanPass === '111';

      // Check for HR credentials
      const isHRMatch =
        cleanUser === 'trio' && cleanPass === '222';

      if (isManagerMatch) {
        onLoginSuccess('manager', 'the triple s');
      } else if (isHRMatch) {
        onLoginSuccess('hr', 'trio');
      } else {
        if (selectedRole === 'manager') {
          setErrorMessage(
            'Invalid credentials for Manager Console. Please check your username and password.'
          );
        } else {
          setErrorMessage(
            'Invalid credentials for HR Console. Please check your username and password.'
          );
        }
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md ecosystem-card rounded-3xl p-6 sm:p-8 border border-[#FA1E71]/40 shadow-[0_0_50px_rgba(250,30,113,0.35)] bg-gradient-to-b from-[#300823] to-[#1a0110] z-10">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-[#d9c6d1] hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#FA1E71]/15 border border-[#FA1E71]/30 flex items-center justify-center mx-auto mb-3 text-[#FA1E71] shadow-[0_0_20px_rgba(250,30,113,0.3)]">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Sign In to Workspace
          </h3>
          <p className="text-xs text-[#d9c6d1] mt-1">
            Authenticate to access your role-specific Talenta Partners workspace
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#110009]/80 border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => handleRoleTabChange('hr')}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedRole === 'hr'
                ? 'bg-[#FA1E71] text-white shadow-[0_0_15px_rgba(250,30,113,0.4)]'
                : 'text-[#d9c6d1] hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-base">admin_panel_settings</span>
            <span>HR Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('manager')}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedRole === 'manager'
                ? 'bg-[#FA1E71] text-white shadow-[0_0_15px_rgba(250,30,113,0.4)]'
                : 'text-[#d9c6d1] hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-base">groups</span>
            <span>Manager Room</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-200">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-[#d9c6d1] mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#d9c6d1]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter your username"
                className="w-full pl-10 pr-4 py-3 bg-[#110009] border border-white/15 focus:border-[#FA1E71] focus:ring-1 focus:ring-[#FA1E71] rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-[#d9c6d1] mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#d9c6d1]">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-3 bg-[#110009] border border-white/15 focus:border-[#FA1E71] focus:ring-1 focus:ring-[#FA1E71] rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#d9c6d1] hover:text-white cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#FA1E71] hover:bg-[#ff4d94] disabled:opacity-50 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-[0_0_25px_rgba(250,30,113,0.4)] hover:shadow-[0_0_35px_rgba(250,30,113,0.7)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {selectedRole === 'manager'
                    ? 'Enter Manager Decision Room'
                    : 'Enter HR Operations Console'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
