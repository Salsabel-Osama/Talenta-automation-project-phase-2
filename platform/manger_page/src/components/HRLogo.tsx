import React, { useState } from 'react';
import logoImg from '../assets/images/hr_app_logo_1787544268876.jpg';

interface HRLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
}

export const HRLogo: React.FC<HRLogoProps> = ({ 
  size = 'md', 
  className = '',
  showGlow = true
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}>
      {/* Ambient Glow */}
      {showGlow && (
        <div className="absolute inset-0 bg-[#FA1E71] rounded-2xl blur-md opacity-40 animate-pulse pointer-events-none" />
      )}

      {/* Main Logo Container */}
      <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#240018] border border-[#FA1E71]/40 flex items-center justify-center shadow-lg shadow-[#FA1E71]/25">
        {!imgError ? (
          <img
            src={logoImg}
            alt="HR Logo"
            className="w-full h-full object-cover rounded-xl"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          /* High-fidelity Vector Fallback */
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full p-1 text-[#FA1E71]"
          >
            <defs>
              <linearGradient id="hrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4d94" />
                <stop offset="50%" stopColor="#FA1E71" />
                <stop offset="100%" stopColor="#7a0035" />
              </linearGradient>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffb1c0" />
                <stop offset="100%" stopColor="#FA1E71" />
              </linearGradient>
            </defs>

            {/* Outer Orbital Ring */}
            <ellipse
              cx="50"
              cy="52"
              rx="42"
              ry="20"
              transform="rotate(-22 50 52)"
              stroke="url(#ringGrad)"
              strokeWidth="3.5"
              fill="none"
              strokeDasharray="95 15"
            />

            {/* Orbit Node Top */}
            <circle cx="50" cy="14" r="7" fill="#2b031d" stroke="#FA1E71" strokeWidth="2" />
            <text x="50" y="17.5" fill="#ffd8e9" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">S</text>

            {/* Orbit Node Right */}
            <circle cx="86" cy="44" r="6.5" fill="#2b031d" stroke="#FA1E71" strokeWidth="2" />
            <text x="86" y="47.5" fill="#ffd8e9" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">S</text>

            {/* Orbit Node Left */}
            <circle cx="16" cy="80" r="6.5" fill="#2b031d" stroke="#FA1E71" strokeWidth="2" />
            <text x="16" y="83.5" fill="#ffd8e9" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">S</text>

            {/* Heart Core */}
            <path
              d="M50 82C50 82 22 62 22 38C22 26 31 18 42 18C47 18 50 22 50 22C50 22 53 18 58 18C69 18 78 26 78 38C78 62 50 82 50 82Z"
              fill="url(#hrGrad)"
              stroke="#ffafd8"
              strokeWidth="2"
            />

            {/* Center Figure */}
            <circle cx="50" cy="45" r="4.5" fill="#ffd8e9" />
            <path d="M42 66C42 56 46 52 50 52C54 52 58 56 58 66" fill="#ffd8e9" />

            {/* Left Figure */}
            <circle cx="39" cy="52" r="3.5" fill="#ffafd8" />
            {/* Right Figure */}
            <circle cx="61" cy="52" r="3.5" fill="#ffafd8" />
          </svg>
        )}
      </div>
    </div>
  );
};
