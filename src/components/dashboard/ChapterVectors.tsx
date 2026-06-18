import React from 'react';

interface VectorProps {
  chapterId: number;
  className?: string;
}

export const ChapterVector: React.FC<VectorProps> = ({ chapterId, className = "w-full h-full" }) => {
  // Preset list of professional color themes to rotate through dynamically
  // This ensures each card has a distinctive, beautiful accent color even if order changes,
  // while the core educational Bitcoin iconography remains absolute and universal.
  const gradientThemes = [
    {
      id: "amber",
      primary: "#FDB813",
      secondary: "#B37D00",
      glow: "rgba(253,184,19,0.15)",
      bgs: ["#FFF4D0", "#FBBC05", "#9C6200"]
    },
    {
      id: "azure",
      primary: "#38BDF8",
      secondary: "#0369A1",
      glow: "rgba(56,189,248,0.15)",
      bgs: ["#E0F2FE", "#0284C7", "#075985"]
    },
    {
      id: "emerald",
      primary: "#34D399",
      secondary: "#047857",
      glow: "rgba(52,211,153,0.15)",
      bgs: ["#D1FAE5", "#059669", "#065F46"]
    },
    {
      id: "indigo",
      primary: "#818CF8",
      secondary: "#4338CA",
      glow: "rgba(129,140,248,0.15)",
      bgs: ["#E0E7FF", "#4F46E5", "#3730A3"]
    },
    {
      id: "coral",
      primary: "#F87171",
      secondary: "#B91C1C",
      glow: "rgba(248,113,113,0.15)",
      bgs: ["#FEE2E2", "#DC2626", "#991B1B"]
    },
    {
      id: "purple",
      primary: "#C084FC",
      secondary: "#7E22CE",
      glow: "rgba(192,132,252,0.15)",
      bgs: ["#F3E8FF", "#9333EA", "#6B21A8"]
    },
    {
      id: "sunset",
      primary: "#FB923C",
      secondary: "#C2410C",
      glow: "rgba(251,146,60,0.15)",
      bgs: ["#FFEDD5", "#EA580C", "#9A3412"]
    },
    {
      id: "teal",
      primary: "#2DD4BF",
      secondary: "#0F766E",
      glow: "rgba(45,212,191,0.15)",
      bgs: ["#CCFBF1", "#0D9488", "#115E59"]
    }
  ];

  // Pick gradient using modulo of chapterId to safely cycle through themes
  const theme = gradientThemes[(chapterId - 1) % gradientThemes.length];

  return (
    <div className={`relative overflow-hidden w-full h-[125px] rounded-xl bg-black/40 border border-white/5 flex items-center justify-center ${className}`}>
      {/* Dynamic ambient background glow */}
      <div 
        className="absolute inset-0 transition-all duration-500 ease-out" 
        style={{
          background: `radial-gradient(circle at center, ${theme.glow}, transparent 65%)`
        }}
      />
      
      <svg
        viewBox="0 0 200 125"
        className="w-full h-full max-h-[125px] relative z-10 transition-all duration-500 group-hover:scale-[1.04]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Dynamic Gradient for the Study Crest */}
          <linearGradient id={`crest-grad-${chapterId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.bgs[0]} />
            <stop offset="50%" stopColor={theme.bgs[1]} />
            <stop offset="100%" stopColor={theme.bgs[2]} />
          </linearGradient>

          {/* Core neutral metallic back-plate */}
          <linearGradient id="metal-plate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.9" />
          </linearGradient>

          {/* Standard soft-glow shadow filter */}
          <filter id={`crest-glow-${chapterId}`} x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Global Distributed Ledger Network Background Grid */}
        <g stroke="#334155" strokeWidth="0.5" strokeOpacity="0.25">
          <circle cx="100" cy="62" r="48" strokeDasharray="2 3" />
          <line x1="100" y1="10" x2="100" y2="115" />
          <line x1="50" y1="62" x2="150" y2="62" />
          {/* Node intersections */}
          <circle cx="100" cy="14" r="1.5" fill="#475569" />
          <circle cx="52" cy="62" r="1.5" fill="#475569" />
          <circle cx="148" cy="62" r="1.5" fill="#475569" />
          <circle cx="100" cy="110" r="1.5" fill="#475569" />
        </g>

        {/* Outer Sovereign Crest Shield (Aesthetic Shield of Knowledge) */}
        <g filter={`url(#crest-glow-${chapterId})`}>
          <path
            d="M 100,26 L 132,32 V 68 C 132,84 118,97 100,103 C 82,97 68,84 68,68 V 32 Z"
            fill="url(#metal-plate)"
            stroke={`url(#crest-grad-${chapterId})`}
            strokeWidth="1.5"
          />
        </g>

        {/* Outer Crest Accent Border Ring */}
        <path
          d="M 100,32 L 126,37 V 68 C 126,81 115,92 100,97 C 85,92 74,81 74,68 V 37 Z"
          stroke={`url(#crest-grad-${chapterId})`}
          strokeWidth="0.75"
          strokeOpacity="0.4"
          strokeDasharray="4 2"
        />

        {/* CORE ICONOGRAPHY: Open Book of Knowledge + Graduation Cap + Gilded Bitcoin Emblem */}
        <g transform="translate(100, 64) scale(0.95)">
          
          {/* 1. Open Study Notebook Ledger at the base */}
          <g transform="translate(0, 10)">
            {/* Book Pages */}
            <path 
              d="M -22,0 C -12,-3 -2,-1 0,3 C 2,-1 12,-3 22,0 V 11 C 12,8 2,10 0,14 C -2,10 -12,8 -22,11 Z" 
              fill="#0F172A" 
              stroke={`url(#crest-grad-${chapterId})`} 
              strokeWidth="1.5" 
              strokeLinejoin="round" 
            />
            {/* Page Lines */}
            <line x1="-16" y1="3" x2="-6" y2="1.5" stroke="#FFFFFF" strokeWidth="0.75" strokeOpacity="0.25" />
            <line x1="-16" y1="6" x2="-6" y2="4.5" stroke="#FFFFFF" strokeWidth="0.75" strokeOpacity="0.25" />
            <line x1="6" y1="1.5" x2="16" y2="3" stroke="#FFFFFF" strokeWidth="0.75" strokeOpacity="0.25" />
            <line x1="6" y1="4.5" x2="16" y2="6" stroke="#FFFFFF" strokeWidth="0.75" strokeOpacity="0.25" />
          </g>

          {/* 2. Professional Graduation Mortarboard Cap Hovering gracefully */}
          <g transform="translate(0, -18)">
            {/* Golden Cap Diamond Top */}
            <polygon 
              points="0,-8 20,-1 -0,6 -20,-1" 
              fill="#0F172A" 
              stroke={`url(#crest-grad-${chapterId})`} 
              strokeWidth="1.75" 
            />
            {/* Under Cap base hoop */}
            <path 
              d="M -10,1 C -10,5 10,5 10,1" 
              fill="none" 
              stroke={`url(#crest-grad-${chapterId})`} 
              strokeWidth="1.75" 
              strokeLinecap="round" 
            />
            {/* Academic Tassel Hanging on the side */}
            <path 
              d="M 0,-1 L 11,4 L 12,11" 
              fill="none" 
              stroke={`url(#crest-grad-${chapterId})`} 
              strokeWidth="1" 
              strokeLinecap="round" 
            />
            {/* Small Tassel fringe */}
            <circle cx="12" cy="11" r="1.2" fill={theme.primary} />
          </g>

          {/* 3. Central Rising Bitcoin Sphere of Sovereignty */}
          <g transform="translate(0, -1)">
            {/* Soft inner core circle backing */}
            <circle cx="0" cy="0" r="11" fill="#0F172A" stroke={`url(#crest-grad-${chapterId})`} strokeWidth="1" />
            
            {/* Precision Bitcoin Sign (₿) */}
            <text 
              x="-4.5" 
              y="4.5" 
              fill={`url(#crest-grad-${chapterId})`} 
              fontSize="14px" 
              fontWeight="bold" 
              fontFamily="Verdana, sans-serif"
            >
              ₿
            </text>
          </g>

          {/* 4. Tiny Knowledge Sparkles */}
          <g stroke={theme.primary} strokeWidth="1" strokeLinecap="round">
            {/* Left spark */}
            <line x1="-18" y1="-8" x2="-15" y2="-6" />
            <line x1="-18" y1="-6" x2="-15" y2="-8" />
            {/* Right spark */}
            <line x1="18" y1="-8" x2="15" y2="-6" />
            <line x1="18" y1="-6" x2="15" y2="-8" />
          </g>
        </g>
      </svg>
    </div>
  );
};
