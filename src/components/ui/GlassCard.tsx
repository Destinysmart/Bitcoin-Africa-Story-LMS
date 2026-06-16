import * as React from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

export const GlassCard = React.forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn("glass-panel p-6 md:p-8", className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = 'GlassCard';

export const Logo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-3 select-none", className)}>
    {/* SVG of Bitcoin Africa Story Icon (Tilted yellow rounded card with white B) */}
    <div className="relative shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 100 130" className="w-[34px] h-[44.2px] drop-shadow-[0_0_12px_rgba(253,184,19,0.25)] transition-transform duration-300 hover:scale-110">
        <g transform="rotate(14 50 65)">
          {/* Yellow rounded rectangle representing logo background (tilted) */}
          <rect x="20" y="10" width="60" height="110" rx="14" fill="#FDB813" />
          
          {/* Left vertical stem of the B */}
          <rect x="32" y="30" width="8" height="70" fill="#ffffff" />
          
          {/* Top-left and bottom-left serifs */}
          <rect x="25" y="30" width="8" height="8" fill="#ffffff" />
          <rect x="25" y="92" width="8" height="8" fill="#ffffff" />
          
          {/* Double vertical stripes going from y=10 to y=120 */}
          <rect x="40" y="10" width="6" height="110" fill="#ffffff" />
          <rect x="50" y="10" width="6" height="110" fill="#ffffff" />
          
          {/* Outer upper loop */}
          <path d="M50 30 h12 c7 0 13 7 13 17 s-6 17 -13 17 h-12 z" fill="#ffffff" />
          {/* Inner upper loop cutout (colored yellow) */}
          <path d="M50 38 h9 c3 0 5.5 3 5.5 9 s-2.5 9 -5.5 9 h-9 z" fill="#FDB813" />
          
          {/* Outer lower loop */}
          <path d="M50 64 h14 c8 0 15 8 15 18 s-7 18 -15 18 h-14 z" fill="#ffffff" />
          {/* Inner lower loop cutout (colored yellow) */}
          <path d="M50 72 h10 c4 0 7.5 4 7.5 10 s-3.5 10 -7.5 10 h-10 z" fill="#FDB813" />
        </g>
      </svg>
    </div>
    
    {/* Optimized Responsive Text for both Light and Dark mode view */}
    <div className="flex flex-col text-left leading-none font-sans">
      <span className="text-white font-extrabold text-[20px] tracking-tight transition-colors duration-200">
        bitcoin
      </span>
      <span className="text-brand-gold font-bold text-[8.5px] tracking-[0.22em] uppercase mt-0.5 transition-colors duration-200">
        Africa Story
      </span>
    </div>
  </div>
);
