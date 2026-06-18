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
  <div className={cn("flex items-center gap-2.5 select-none", className)}>
    {/* Recreated Dynamic White Card Logo */}
    <div className="relative shrink-0 flex items-center justify-center">
      <svg
        viewBox="0 0 100 120"
        className="w-[34px] h-[40.8px] drop-shadow-[0_0_12px_rgba(255,255,255,0.1)] transition-transform duration-300 hover:scale-[1.06]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft backglow */}
        <defs>
          <filter id="logo-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer White Rounded Card Container */}
        <rect x="18" y="10" width="64" height="100" rx="14" fill="#ffffff" />

        {/* Left vertical shape (Stripe 1) - cuts all the way from top edge to bottom edge */}
        <rect x="31.5" y="10" width="7" height="100" fill="#000000" />

        {/* Right vertical prongs (Stripe 2) - only visible protruding from top and bottom */}
        <rect x="44.5" y="10" width="7" height="18" fill="#000000" />
        <rect x="44.5" y="92" width="7" height="18" fill="#000000" />

        {/* Outer loop of the 'B' Symbol */}
        <path
          d="M 38.5,28 H 58 C 67.5,28 72,34 72,44 C 72,54 67.5,60 58,60 H 38.5 Z"
          fill="#000000"
        />
        <path
          d="M 38.5,60 H 62 C 72,60 76.5,66 76.5,76 C 76.5,86 72,92 62,92 H 38.5 Z"
          fill="#000000"
        />

        {/* Left-side horizontal protruding serifs */}
        <rect x="23" y="28" width="9" height="8.5" fill="#000000" />
        <rect x="23" y="83.5" width="9" height="8.5" fill="#000000" />

        {/* White cutouts to hollow out the 'B' loops */}
        <path
          d="M 38.5,36.5 H 52 C 55,36.5 56.5,38.5 56.5,44 C 56.5,49.5 55,51.5 52,51.5 H 38.5 Z"
          fill="#ffffff"
        />
        <path
          d="M 38.5,68.5 H 54 C 57,68.5 59,70.5 59,76 C 59,81.5 57,83.5 54,83.5 H 38.5 Z"
          fill="#ffffff"
        />
      </svg>
    </div>
    
    {/* Premium Typography Set - 3 lines matching attached branding */}
    <div className="flex flex-col text-left leading-[0.85] font-sans antialiased transition-colors duration-200">
      <span className="text-white font-extrabold text-[12px] uppercase tracking-[0.06em]">
        Bitcoin
      </span>
      <span className="text-white font-extrabold text-[12px] uppercase tracking-[0.06em] mt-[3px]">
        Africa
      </span>
      <span className="text-white font-extrabold text-[12px] uppercase tracking-[0.06em] mt-[3px]">
        Story
      </span>
    </div>
  </div>
);
