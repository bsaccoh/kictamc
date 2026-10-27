import React from 'react';

interface OfficialSealProps {
  size?: number;
  type?: 'admission' | 'bursary';
  topText?: string;
  centerText?: string;
  bottomText?: string;
  sessionYear?: string;
  className?: string;
}

export const OfficialSeal: React.FC<OfficialSealProps> = ({
  size = 110,
  type = 'admission',
  topText,
  centerText,
  bottomText,
  sessionYear = '2026/2027',
  className = '',
}) => {
  const isAdmission = type === 'admission';
  const defaultTop = isAdmission
    ? '★ KENEMA ICT & MANAGEMENT COLLEGE ★'
    : '★ OFFICE OF THE BURSAR • KICTAMC ★';
  const defaultCenter = isAdmission ? 'OFFICIALLY SEALED' : 'FEES CLEARED';
  const defaultBottom = isAdmission
    ? 'OFFICE OF THE REGISTRAR • SIERRA LEONE'
    : 'BURSARY DIVISION • OFFICIAL FISCAL INSTRUMENT';

  const arcTop = topText || defaultTop;
  const arcBottom = bottomText || defaultBottom;
  const mainCenter = centerText || defaultCenter;

  const primaryColor = isAdmission ? '#0F223D' : '#064E3B'; // Navy or Forest
  const accentColor = '#B45309'; // Rich Amber/Gold

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none rotate-[-3.5deg] ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Circular paths for curved text */}
          {/* Top arc (clockwise) */}
          <path
            id="seal-top-path"
            d="M 28 100 A 72 72 0 1 1 172 100"
            fill="none"
          />
          {/* Bottom arc (clockwise from bottom) */}
          <path
            id="seal-bottom-path"
            d="M 172 100 A 72 72 0 0 1 28 100"
            fill="none"
          />

          <linearGradient id="sealGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
        </defs>

        {/* 1. Outer Scalloped / Serrated Ring (Authentic Wax/Foil Stamp Edge) */}
        <circle
          cx="100"
          cy="100"
          r="97"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeDasharray="2 3"
          opacity="0.8"
        />
        <circle
          cx="100"
          cy="100"
          r="94"
          fill="#FAF9F6"
          stroke={primaryColor}
          strokeWidth="2.5"
        />

        {/* 2. Middle Concentric Decorative Ring */}
        <circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.2"
        />

        {/* 3. Text on Paths */}
        <text
          fill={primaryColor}
          fontSize="9.5"
          fontWeight="800"
          letterSpacing="1.8"
          fontFamily="serif"
        >
          <textPath href="#seal-top-path" startOffset="50%" textAnchor="middle">
            {arcTop}
          </textPath>
        </text>

        <text
          fill={primaryColor}
          fontSize="8.5"
          fontWeight="700"
          letterSpacing="1.2"
          fontFamily="serif"
        >
          <textPath href="#seal-bottom-path" startOffset="50%" textAnchor="middle">
            {arcBottom}
          </textPath>
        </text>

        {/* 4. Inner Ring with Star Accents */}
        <circle
          cx="100"
          cy="100"
          r="58"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.2"
          strokeDasharray="4 2"
        />
        <circle
          cx="100"
          cy="100"
          r="54"
          fill="none"
          stroke={primaryColor}
          strokeWidth="2"
        />

        {/* Center Shield / Crest Background */}
        <circle cx="100" cy="100" r="51" fill="#FFFFFF" />

        {/* Center Emblem Graphic */}
        {/* Heraldic Laurel / Shield Icon */}
        <g transform="translate(84, 58) scale(0.65)">
          <path
            d="M24.5 2 L43 8 V22 C43 35.5 35 47 24.5 50 C14 47 6 35.5 6 22 V8 Z"
            fill="none"
            stroke={primaryColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path
            d="M17 24 L22 29 L32 17"
            fill="none"
            stroke={accentColor}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Center Text */}
        <text
          x="100"
          y="108"
          textAnchor="middle"
          fill={primaryColor}
          fontSize="8.5"
          fontWeight="900"
          fontFamily="sans-serif"
          letterSpacing="0.8"
        >
          {mainCenter}
        </text>

        <text
          x="100"
          y="120"
          textAnchor="middle"
          fill={accentColor}
          fontSize="8"
          fontWeight="800"
          fontFamily="monospace"
        >
          {sessionYear}
        </text>

        {/* Subtle Authenticity Watermark Line */}
        <text
          x="100"
          y="131"
          textAnchor="middle"
          fill={primaryColor}
          fontSize="6"
          fontWeight="800"
          letterSpacing="1"
          opacity="0.85"
        >
          ACADEMIC REGISTRY
        </text>

        {/* Tiny stars at 9 o'clock and 3 o'clock */}
        <circle cx="36" cy="100" r="2.5" fill={accentColor} />
        <circle cx="164" cy="100" r="2.5" fill={accentColor} />
      </svg>
    </div>
  );
};
