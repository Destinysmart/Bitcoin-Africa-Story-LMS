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
    {/* SVG of Bitcoin Africa Story Icon (Upright yellow rounded card with white B) */}
    <div className="relative shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 100 130" className="w-[34px] h-[44.2px] drop-shadow-[0_0_12px_rgba(253,184,19,0.35)] transition-transform duration-300 hover:scale-110">
        {/* Yellow rounded rectangle representing logo background (perfectly vertical) */}
        <rect x="18" y="10" width="64" height="110" rx="14" fill="#FDB813" />
        
        {/* Left vertical shape (Stripe 1) - runs from y=10 to y=120 */}
        <rect x="31" y="10" width="7.5" height="110" fill="#ffffff" />
        
        {/* Right vertical prongs (Stripe 2) - only visible at top and bottom to make the hollow loops yellow */}
        <rect x="44.5" y="10" width="7.5" height="20" fill="#ffffff" />
        <rect x="44.5" y="100" width="7.5" height="20" fill="#ffffff" />
        
        {/* Letter 'B' Outer Loops */}
        <path d="M 38.5,30 H 60 C 69,30 73,37 73,47.5 C 73,58 69,65 60,65 H 38.5 Z" fill="#ffffff" />
        <path d="M 38.5,65 H 63 C 73,65 78,72 78,82.5 C 78,93 73,100 63,100 H 38.5 Z" fill="#ffffff" />
        
        {/* Left Serifs */}
        <rect x="23" y="30" width="8" height="8" fill="#ffffff" />
        <rect x="23" y="92" width="8" height="8" fill="#ffffff" />
        
        {/* Yellow Inner Cutouts of the 'B' Loops (to create the hollow effect) */}
        <path d="M 38.5,38.5 H 52 C 57,38.5 59.5,41.5 59.5,47.5 C 59.5,53.5 57,56.5 52,56.5 H 38.5 Z" fill="#FDB813" />
        <path d="M 38.5,73.5 H 54 C 59,73.5 62,76.5 62,82.5 C 62,88.5 59,91.5 54,91.5 H 38.5 Z" fill="#FDB813" />
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
